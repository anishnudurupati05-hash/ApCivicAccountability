import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import {
  ALL_MLAS, ALL_PROMISES, ALL_BUDGETS, ALL_PROJECTS, DISTRICT_COORDS,
  type MLARecord, type PromiseRecord, type BudgetRecord, type ProjectRecord
} from "./mladata.tsx";
import * as kvStore from "./kv_store.tsx";

const app = new Hono();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

const BASE = "/make-server-83920fb2";

// ── News Generation ───────────────────────────────────────────────────────────
interface NewsItem {
  id: number;
  title: string;
  content: string;
  constituency: string;
  district: string;
  mla_id: number;
  related_project?: string;
  sentiment: string;
  created_at: string;
}

function buildAllNews(): NewsItem[] {
  const sentiments = ["positive", "neutral", "negative"];
  const templates = [
    (c: string, mla: MLARecord) => `Road development work accelerated in ${c} by MLA ${mla.name}`,
    (c: string, _: MLARecord) => `New primary health centre inaugurated in ${c}`,
    (c: string, _: MLARecord) => `Drinking water supply scheme completed in ${c}`,
    (c: string, mla: MLARecord) => `Farmers in ${c} receive crop insurance; MLA ${mla.name} assists`,
    (c: string, _: MLARecord) => `Digital literacy drive launched across villages in ${c}`,
    (c: string, _: MLARecord) => `Solar panels installed in all govt schools of ${c}`,
    (c: string, mla: MLARecord) => `MLA ${mla.name} visits flood-affected areas in ${c}`,
    (c: string, _: MLARecord) => `Opposition raises concerns over delayed projects in ${c}`,
    (c: string, mla: MLARecord) => `${mla.party} leaders praise development work done in ${c}`,
    (c: string, _: MLARecord) => `New SHG centre opens for women entrepreneurs in ${c}`,
    (c: string, _: MLARecord) => `Pipeline work for irrigation scheme starts in ${c}`,
    (c: string, _: MLARecord) => `Youth skill centre inaugurated in ${c} district`,
  ];
  const result: NewsItem[] = [];
  let id = 1;
  ALL_MLAS.forEach((mla, i) => {
    const count = 1 + (i % 3);
    for (let j = 0; j < count; j++) {
      const ti = (i * 2 + j) % templates.length;
      const si = (i + j * 7) % 3;
      const daysAgo = (i + j * 3) % 60;
      result.push({
        id: id++,
        title: templates[ti](mla.constituency, mla),
        content: `Update from ${mla.constituency}, ${mla.district} district. MLA ${mla.name} (${mla.party}) is actively overseeing constituency development. Progress continues on key schemes under state and central government funding.`,
        constituency: mla.constituency,
        district: mla.district,
        mla_id: mla.id,
        sentiment: sentiments[si],
        created_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      });
    }
  });
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

const ALL_NEWS = buildAllNews();

// ── In-memory reports store ───────────────────────────────────────────────────
const REPORTS: any[] = [];
let nextReportId = 1;

// ── Speak Up Seed Data ────────────────────────────────────────────────────────
const SEED_SPEAK_UP: any[] = [
  { id: 1, title: "NH-16 potholes causing daily accidents near Besant Road", description: "The stretch near Besant Road has major potholes. Three two-wheelers fell last week alone. Please repair before the monsoon.", constituency: "Vijayawada Central", category: "Roads", author: "Ravi Kumar", upvotes: 247, reactions: { agree: 89, fire: 156, heart: 23, angry: 112 }, comments: [{ id: 1, author: "Priya Devi", text: "My husband fell here last week. Needs immediate attention!", created_at: "2026-04-14T12:00:00Z" }, { id: 2, author: "Suresh B.", text: "I reported this 6 months ago. No action yet.", created_at: "2026-04-15T09:00:00Z" }], created_at: "2026-04-10T10:00:00Z" },
  { id: 2, title: "Drinking water supply irregular for 2 months in Guntur West", description: "Ward 12 and 15 are receiving water only twice a week. Summer is here and we are struggling. Children and elderly are suffering.", constituency: "Guntur West", category: "Water", author: "Lakshmi Prasad", upvotes: 312, reactions: { agree: 201, fire: 88, heart: 45, angry: 167 }, comments: [{ id: 1, author: "Asha Rani", text: "Same situation in ward 18. We are buying water at ₹50/pot.", created_at: "2026-04-12T14:00:00Z" }], created_at: "2026-04-08T08:00:00Z" },
  { id: 3, title: "Government school in Vizag East has no toilets for girls", description: "The ZP High School in sector 4 does not have a separate functional girls toilet. Girl students are forced to go outside. This is unacceptable.", constituency: "Visakhapatnam East", category: "Education", author: "Padma Latha", upvotes: 178, reactions: { agree: 145, fire: 67, heart: 89, angry: 201 }, comments: [{ id: 1, author: "N. Raghunath", text: "This is a basic right. Why is no one acting?", created_at: "2026-04-13T11:00:00Z" }], created_at: "2026-04-09T15:00:00Z" },
  { id: 4, title: "PHC at Nellore rural has no doctor for 3 months", description: "The Primary Health Centre at our village has been without a doctor since January 2026. Patients travel 30km to the nearest hospital. Lives are at risk.", constituency: "Nellore Rural", category: "Healthcare", author: "Dr. Murthy", upvotes: 423, reactions: { agree: 290, fire: 195, heart: 77, angry: 310 }, comments: [{ id: 1, author: "Gopal Rao", text: "My mother had a health emergency and we lost 2 hours just finding a doctor.", created_at: "2026-04-11T16:00:00Z" }, { id: 2, author: "Sunitha K.", text: "This has been going on for years. Nothing changes.", created_at: "2026-04-12T10:00:00Z" }], created_at: "2026-04-07T12:00:00Z" },
  { id: 5, title: "Street lights non-functional in Tirupati residential colony", description: "Over 40 street lights in Balaji Nagar colony have been out for 6 weeks. Women feel unsafe walking at night. Theft incidents have increased.", constituency: "Tirupati", category: "Safety", author: "Venkata Rao", upvotes: 156, reactions: { agree: 99, fire: 45, heart: 34, angry: 123 }, comments: [{ id: 1, author: "Meena S.", text: "I was almost mugged last week because of this darkness.", created_at: "2026-04-14T20:00:00Z" }], created_at: "2026-04-11T09:00:00Z" },
  { id: 6, title: "YSRCP promised housing scheme incomplete 2 years later", description: "The Navaratnalu housing scheme promised 500 homes in our constituency. Only 120 have been built. What happened to the remaining 380 families?", constituency: "Kurnool Urban", category: "Housing", author: "Krishnamurti P.", upvotes: 389, reactions: { agree: 267, fire: 134, heart: 45, angry: 298 }, comments: [], created_at: "2026-04-06T11:00:00Z" },
  { id: 7, title: "Garbage not collected for 10 days in Kakinada", description: "The municipal corporation has not collected garbage in our ward for 10 days. Disease outbreak feared. Children are falling sick from the stench.", constituency: "Kakinada Town", category: "Sanitation", author: "Anand T.", upvotes: 211, reactions: { agree: 156, fire: 78, heart: 12, angry: 245 }, comments: [{ id: 1, author: "Dr. Vasantha", text: "A dengue case was reported here yesterday. This garbage is breeding mosquitoes.", created_at: "2026-04-15T08:00:00Z" }], created_at: "2026-04-13T07:00:00Z" },
  { id: 8, title: "Irrigation canal broken since December — farmers losing crops", description: "The main irrigation canal in our mandal was damaged in December storms. Despite multiple requests, repair work hasn't started. Farmers are suffering losses.", constituency: "Eluru", category: "Agriculture", author: "Farmer Collective Eluru", upvotes: 334, reactions: { agree: 234, fire: 112, heart: 56, angry: 198 }, comments: [{ id: 1, author: "Satyam N.", text: "I lost 3 acres of paddy crop this season because of no water.", created_at: "2026-04-10T14:00:00Z" }], created_at: "2026-04-05T10:00:00Z" },
  { id: 9, title: "Flood-affected families still waiting for compensation in Prakasam", description: "The October 2025 floods destroyed 200 homes in our constituency. 6 months later, families are still living in temporary shelters. No compensation paid.", constituency: "Ongole", category: "Disaster Relief", author: "Rajesh Babu", upvotes: 567, reactions: { agree: 412, fire: 234, heart: 134, angry: 445 }, comments: [{ id: 1, author: "Geetha Kumari", text: "We lost everything and the government has forgotten us.", created_at: "2026-04-13T19:00:00Z" }, { id: 2, author: "MLA Watch AP", text: "This is being escalated to the Chief Minister's office.", created_at: "2026-04-14T09:00:00Z" }], created_at: "2026-04-04T09:00:00Z" },
  { id: 10, title: "Bus connectivity to tribal villages in Vizianagaram cut off", description: "APSRTC buses to 12 tribal villages in Parvathipuram area have been cancelled. Students walk 8km to school and patients can't reach hospitals.", constituency: "Parvathipuram", category: "Transport", author: "Tribal Welfare Group", upvotes: 198, reactions: { agree: 134, fire: 89, heart: 78, angry: 123 }, comments: [], created_at: "2026-04-08T13:00:00Z" },
  { id: 11, title: "Construction of bridge over Godavari stalled for 3 years", description: "The promised bridge connecting our village to Rajamahendravaram has been stalled. The contractor left and new one is not appointed. Daily crossing by boat is dangerous.", constituency: "Rajamahendravaram City", category: "Infrastructure", author: "Narasimha Rao", upvotes: 445, reactions: { agree: 312, fire: 189, heart: 67, angry: 378 }, comments: [{ id: 1, author: "Lakshmi Boats", text: "4 people have drowned here in the last 2 years.", created_at: "2026-04-09T11:00:00Z" }], created_at: "2026-04-03T14:00:00Z" },
  { id: 12, title: "Youth employment scheme in Anantapur not implemented properly", description: "The Yuva Nestam scheme promised ₹2500/month for unemployed youth. Many are still waiting for their payments after applying 18 months ago.", constituency: "Anantapur Urban", category: "Employment", author: "Youth Wing AP", upvotes: 289, reactions: { agree: 201, fire: 134, heart: 45, angry: 256 }, comments: [{ id: 1, author: "Ramesh K.", text: "I applied in October 2024. Still no payment.", created_at: "2026-04-11T15:00:00Z" }], created_at: "2026-04-07T10:00:00Z" },
];

let speakUpSeeded = false;

async function ensureSpeakUpSeeded() {
  if (speakUpSeeded) return;
  try {
    const existing = await kvStore.get("speak:counter");
    if (existing === null || existing === undefined) {
      for (const issue of SEED_SPEAK_UP) {
        await kvStore.set(`speak:issue:${issue.id}`, JSON.stringify(issue));
      }
      await kvStore.set("speak:counter", String(SEED_SPEAK_UP.length));
      console.log("[SpeakUp] Seeded initial issues");
    }
    speakUpSeeded = true;
  } catch (err) {
    console.log(`[SpeakUp] Seed error: ${err}`);
  }
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get(`${BASE}/health`, (c) => c.json({ status: "ok", mla_count: ALL_MLAS.length }));

// ── GET /mlas — ALL 175 with pagination, filter, search ──────────────────────
app.get(`${BASE}/mlas`, (c) => {
  try {
    const limit   = Math.min(parseInt(c.req.query("limit")  || "50"), 175);
    const offset  = parseInt(c.req.query("offset") || "0");
    const district = (c.req.query("district") || "").trim();
    const party    = (c.req.query("party")    || "").trim();
    const search   = (c.req.query("search")   || "").trim().toLowerCase();
    const sortBy   = c.req.query("sortBy")    || "id";
    const sortOrder = c.req.query("sortOrder") || "asc";
    const withMetrics = c.req.query("withMetrics") === "true";

    let results: MLARecord[] = [...ALL_MLAS];

    if (district) results = results.filter(m => m.district === district);
    if (party)    results = results.filter(m => m.party === party);
    if (search)   results = results.filter(m =>
      m.name.toLowerCase().includes(search) ||
      m.constituency.toLowerCase().includes(search) ||
      m.district.toLowerCase().includes(search) ||
      m.party.toLowerCase().includes(search)
    );

    // Sorting
    const allowedSorts = ["id", "name", "constituency", "district", "party", "score", "rank", "completed", "inProgress", "budgetUtil"];
    const validSort = allowedSorts.includes(sortBy) ? sortBy : "id";
    results.sort((a, b) => {
      const av: any = (a as any)[validSort];
      const bv: any = (b as any)[validSort];
      const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
      return sortOrder === "desc" ? -cmp : cmp;
    });

    const total = results.length;
    const pageData = results.slice(offset, offset + limit);

    console.log(`[GET /mlas] total=${total} limit=${limit} offset=${offset} returned=${pageData.length}`);

    return c.json({
      data: pageData,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / Math.max(limit, 1)),
    });
  } catch (err) {
    console.log(`[GET /mlas] Error: ${err}`);
    return c.json({ error: `Failed to fetch MLAs: ${err}` }, 500);
  }
});

// ── GET /mlas/:id — Single MLA with full details ──────────────────────────────
app.get(`${BASE}/mlas/:id`, (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid MLA id" }, 400);

    const mla = ALL_MLAS.find(m => m.id === id);
    if (!mla) return c.json({ error: `MLA with id ${id} not found` }, 404);

    const promises = ALL_PROMISES.filter(p => p.party === mla.party);
    const projects = ALL_PROJECTS.filter(p => p.mla_id === mla.id);
    const news     = ALL_NEWS.filter(n => n.mla_id === mla.id).slice(0, 5);

    return c.json({ ...mla, promises, projects, news });
  } catch (err) {
    console.log(`[GET /mlas/:id] Error: ${err}`);
    return c.json({ error: `Failed to fetch MLA: ${err}` }, 500);
  }
});

// ── GET /mla?constituency= — By constituency name ────────────────────────────
app.get(`${BASE}/mla`, (c) => {
  try {
    const q = (c.req.query("constituency") || "").trim().toLowerCase();
    if (!q) return c.json({ error: "constituency query param required" }, 400);

    const mla = ALL_MLAS.find(m => m.constituency.toLowerCase() === q);
    if (!mla) return c.json({ error: `No MLA found for constituency: ${q}` }, 404);

    const promises = ALL_PROMISES.filter(p => p.party === mla.party);
    const projects = ALL_PROJECTS.filter(p => p.mla_id === mla.id);
    const news     = ALL_NEWS.filter(n => n.mla_id === mla.id).slice(0, 5);

    return c.json({ ...mla, promises, projects, news });
  } catch (err) {
    console.log(`[GET /mla] Error: ${err}`);
    return c.json({ error: `Failed to fetch MLA: ${err}` }, 500);
  }
});

// ── GET /mla/rankings — Ranked by performance score ──────────────────────────
app.get(`${BASE}/mla/rankings`, (c) => {
  try {
    const limit   = Math.min(parseInt(c.req.query("limit")  || "50"), 175);
    const offset  = parseInt(c.req.query("offset") || "0");
    const district = (c.req.query("district") || "").trim();
    const party    = (c.req.query("party")    || "").trim();

    let results = [...ALL_MLAS].sort((a, b) => b.score - a.score);

    if (district) results = results.filter(m => m.district === district);
    if (party)    results = results.filter(m => m.party === party);

    const total = results.length;
    const pageData = results.slice(offset, offset + limit);

    console.log(`[GET /mla/rankings] total=${total} returned=${pageData.length}`);

    return c.json({
      data: pageData,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / Math.max(limit, 1)),
    });
  } catch (err) {
    console.log(`[GET /mla/rankings] Error: ${err}`);
    return c.json({ error: `Failed to fetch rankings: ${err}` }, 500);
  }
});

// ── GET /districts ────────────────────────────────────────────────────────────
app.get(`${BASE}/districts`, (c) => {
  try {
    const districts = Object.entries(DISTRICT_COORDS).map(([name, coords]) => ({
      name,
      mla_count: ALL_MLAS.filter(m => m.district === name).length,
      coords,
      avg_score: Math.round(
        ALL_MLAS.filter(m => m.district === name).reduce((s, m) => s + m.score, 0) /
        Math.max(ALL_MLAS.filter(m => m.district === name).length, 1)
      ),
    }));
    return c.json({ data: districts });
  } catch (err) {
    return c.json({ error: `Failed to fetch districts: ${err}` }, 500);
  }
});

// ── GET /parties ──────────────────────────────────────────────────────────────
app.get(`${BASE}/parties`, (c) => {
  const partyDefs = [
    { name: "TDP",   full_name: "Telugu Desam Party",       color: "#FFD700" },
    { name: "JSP",   full_name: "Jana Sena Party",           color: "#FF6B35" },
    { name: "BJP",   full_name: "Bharatiya Janata Party",    color: "#FF9933" },
    { name: "YSRCP", full_name: "YSR Congress Party",        color: "#00BFFF" },
  ];
  const parties = partyDefs.map(p => ({
    ...p,
    mla_count: ALL_MLAS.filter(m => m.party === p.name).length,
    avg_score: Math.round(
      ALL_MLAS.filter(m => m.party === p.name).reduce((s, m) => s + m.score, 0) /
      Math.max(ALL_MLAS.filter(m => m.party === p.name).length, 1)
    ),
  }));
  return c.json({ data: parties });
});

// ── GET /dashboard/stats ──────────────────────────────────────────────────────
app.get(`${BASE}/dashboard/stats`, (c) => {
  try {
    const completed  = ALL_PROMISES.filter(p => p.status === "Completed").length;
    const inProgress = ALL_PROMISES.filter(p => p.status === "In Progress").length;
    const notStarted = ALL_PROMISES.filter(p => p.status === "Not Started").length;

    const avgBudgetUtil = Math.round(
      ALL_BUDGETS.reduce((s, b) => s + b.utilization_percent, 0) / ALL_BUDGETS.length
    );

    const partyColorMap: Record<string, string> = {
      TDP: "#F59E0B", JSP: "#F97316", BJP: "#EF4444", YSRCP: "#3B82F6",
    };
    const partyBreakdown = ["TDP", "JSP", "BJP", "YSRCP"].map(p => ({
      party: p,
      count: ALL_MLAS.filter(m => m.party === p).length,
      color: partyColorMap[p],
    })).filter(p => p.count > 0);

    const districtNames = [...new Set(ALL_MLAS.map(m => m.district))];
    const districtStats = districtNames.map(d => {
      const mlas = ALL_MLAS.filter(m => m.district === d);
      return {
        district: d,
        mla_count: mlas.length,
        avg_score: Math.round(mlas.reduce((s, m) => s + m.score, 0) / mlas.length),
      };
    });

    const projectStats = {
      total:      ALL_PROJECTS.length,
      completed:  ALL_PROJECTS.filter(p => p.status === "Completed").length,
      inProgress: ALL_PROJECTS.filter(p => p.status === "In Progress").length,
      notStarted: ALL_PROJECTS.filter(p => p.status === "Not Started").length,
      delayed:    ALL_PROJECTS.filter(p => p.status === "Delayed").length,
    };

    const recentNews = ALL_NEWS.slice(0, 10);

    return c.json({
      total_mlas: ALL_MLAS.length,
      total_constituencies: ALL_MLAS.length,
      total_promises: ALL_PROMISES.length,
      promises_completed: completed,
      promises_inprogress: inProgress,
      promises_notstarted: notStarted,
      avg_budget_utilization: avgBudgetUtil,
      party_breakdown: partyBreakdown,
      district_stats: districtStats,
      project_stats: projectStats,
      recent_news: recentNews,
    });
  } catch (err) {
    console.log(`[GET /dashboard/stats] Error: ${err}`);
    return c.json({ error: `Failed to fetch dashboard stats: ${err}` }, 500);
  }
});

// ── GET /promises ─────────────────────────────────────────────────────────────
app.get(`${BASE}/promises`, (c) => {
  try {
    const party    = (c.req.query("party")    || "").trim();
    const category = (c.req.query("category") || "").trim();

    let results: PromiseRecord[] = [...ALL_PROMISES];
    if (party)    results = results.filter(p => p.party === party);
    if (category) results = results.filter(p => p.category === category);

    return c.json({ data: results, total: results.length });
  } catch (err) {
    return c.json({ error: `Failed to fetch promises: ${err}` }, 500);
  }
});

// ── GET /budgets ──────────────────────────────────────────────────────────────
app.get(`${BASE}/budgets`, (c) => {
  return c.json({ data: ALL_BUDGETS, total: ALL_BUDGETS.length });
});

// ── GET /projects ─────────────────────────────────────────────────────────────
app.get(`${BASE}/projects`, (c) => {
  try {
    const constituency = (c.req.query("constituency") || "").trim();
    const district     = (c.req.query("district")     || "").trim();
    const status       = (c.req.query("status")       || "").trim();
    const mla_id       = parseInt(c.req.query("mla_id") || "0");
    const limit  = Math.min(parseInt(c.req.query("limit")  || "100"), 500);
    const offset = parseInt(c.req.query("offset") || "0");

    let results: ProjectRecord[] = [...ALL_PROJECTS];
    if (constituency) results = results.filter(p => p.constituency === constituency);
    if (district)     results = results.filter(p => p.district === district);
    if (status)       results = results.filter(p => p.status === status);
    if (mla_id)       results = results.filter(p => p.mla_id === mla_id);

    const total = results.length;
    const pageData = results.slice(offset, offset + limit);

    return c.json({
      data: pageData,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (err) {
    return c.json({ error: `Failed to fetch projects: ${err}` }, 500);
  }
});

// ── GET /news ─────────────────────────────────────────────────────────────────
app.get(`${BASE}/news`, (c) => {
  try {
    const constituency = (c.req.query("constituency") || "").trim();
    const district     = (c.req.query("district")     || "").trim();
    const sentiment    = (c.req.query("sentiment")    || "").trim();
    const limit = parseInt(c.req.query("limit") || "30");

    let results = [...ALL_NEWS];
    if (constituency) results = results.filter(n => n.constituency === constituency);
    if (district)     results = results.filter(n => n.district === district);
    if (sentiment)    results = results.filter(n => n.sentiment === sentiment);
    results = results.slice(0, limit);

    return c.json({ data: results, total: results.length });
  } catch (err) {
    return c.json({ error: `Failed to fetch news: ${err}` }, 500);
  }
});

// ── POST /reports ─────────────────────────────────────────────────────────────
app.post(`${BASE}/reports`, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.description || !body.constituency) {
      return c.json({ error: "description and constituency are required" }, 400);
    }
    const report = {
      id: nextReportId++,
      project_id: body.project_id || null,
      description: body.description,
      constituency: body.constituency,
      reporter_name: body.reporter_name || "Anonymous",
      image_url: body.image_url || null,
      status: "Pending Review",
      created_at: new Date().toISOString(),
    };
    REPORTS.unshift(report);
    console.log(`[POST /reports] New report id=${report.id} constituency=${report.constituency}`);
    return c.json({ success: true, data: report }, 201);
  } catch (err) {
    return c.json({ error: `Failed to submit report: ${err}` }, 500);
  }
});

// ── GET /reports ──────────────────────────────────────────────────────────────
app.get(`${BASE}/reports`, (c) => {
  const constituency = (c.req.query("constituency") || "").trim();
  let results = [...REPORTS];
  if (constituency) results = results.filter(r => r.constituency === constituency);
  return c.json({ data: results, total: results.length });
});

// ── GET /compare ──────────────────────────────────────────────────────────────
app.get(`${BASE}/compare`, (c) => {
  try {
    const aName = (c.req.query("a") || "").trim().toLowerCase();
    const bName = (c.req.query("b") || "").trim().toLowerCase();
    if (!aName || !bName) return c.json({ error: "Query params a and b (constituency names) are required" }, 400);

    const mlaA = ALL_MLAS.find(m => m.constituency.toLowerCase() === aName);
    const mlaB = ALL_MLAS.find(m => m.constituency.toLowerCase() === bName);

    if (!mlaA) return c.json({ error: `Constituency not found: ${aName}` }, 404);
    if (!mlaB) return c.json({ error: `Constituency not found: ${bName}` }, 404);

    const projectsA = ALL_PROJECTS.filter(p => p.mla_id === mlaA.id);
    const projectsB = ALL_PROJECTS.filter(p => p.mla_id === mlaB.id);

    const enrichMLA = (mla: MLARecord, projects: any[]) => ({
      ...mla,
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === "Completed").length,
      inProgressProjects: projects.filter(p => p.status === "In Progress").length,
      delayedProjects: projects.filter(p => p.status === "Delayed").length,
      totalBudget: projects.reduce((s, p) => s + p.allocated_amount, 0),
      totalSpent: projects.reduce((s, p) => s + p.spent_amount, 0),
    });

    return c.json({ a: enrichMLA(mlaA, projectsA), b: enrichMLA(mlaB, projectsB) });
  } catch (err) {
    console.log(`[GET /compare] Error: ${err}`);
    return c.json({ error: `Failed to compare constituencies: ${err}` }, 500);
  }
});

// ── GET /constituencies — list all constituency names ─────────────────────────
app.get(`${BASE}/constituencies`, (c) => {
  const list = ALL_MLAS.map(m => ({ name: m.constituency, district: m.district, mla_id: m.id }));
  return c.json({ data: list });
});

// ── GET /speak-up/issues ──────────────────────────────────────────────────────
app.get(`${BASE}/speak-up/issues`, async (c) => {
  try {
    await ensureSpeakUpSeeded();
    const category = (c.req.query("category") || "").trim();
    const constituency = (c.req.query("constituency") || "").trim().toLowerCase();
    const sort = c.req.query("sort") || "hot"; // hot | recent | upvotes

    const raw = await kvStore.getByPrefix("speak:issue:");
    let issues: any[] = raw
      .map((v: any) => {
        try { return typeof v === "string" ? JSON.parse(v) : v; }
        catch { return null; }
      })
      .filter(Boolean);

    if (category) issues = issues.filter((i: any) => i.category === category);
    if (constituency) issues = issues.filter((i: any) => (i.constituency || "").toLowerCase().includes(constituency));

    // Sort
    if (sort === "hot") {
      issues.sort((a: any, b: any) => {
        const scoreA = a.upvotes * 2 + (a.reactions?.fire || 0) + (a.comments?.length || 0) * 3;
        const scoreB = b.upvotes * 2 + (b.reactions?.fire || 0) + (b.comments?.length || 0) * 3;
        return scoreB - scoreA;
      });
    } else if (sort === "recent") {
      issues.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === "upvotes") {
      issues.sort((a: any, b: any) => b.upvotes - a.upvotes);
    }

    console.log(`[GET /speak-up/issues] count=${issues.length}`);
    return c.json({ data: issues, total: issues.length });
  } catch (err) {
    console.log(`[GET /speak-up/issues] Error: ${err}`);
    return c.json({ error: `Failed to fetch issues: ${err}` }, 500);
  }
});

// ── POST /speak-up/issues ─────────────────────────────────────────────────────
app.post(`${BASE}/speak-up/issues`, async (c) => {
  try {
    await ensureSpeakUpSeeded();
    const body = await c.req.json();
    if (!body.title || !body.constituency || !body.category) {
      return c.json({ error: "title, constituency, and category are required" }, 400);
    }
    const counterRaw = await kvStore.get("speak:counter");
    const nextId = (parseInt(String(counterRaw || "0")) || 0) + 1;

    const issue = {
      id: nextId,
      title: body.title.slice(0, 200),
      description: (body.description || "").slice(0, 1000),
      constituency: body.constituency,
      category: body.category,
      author: (body.author || "Anonymous Citizen").slice(0, 60),
      upvotes: 0,
      reactions: { agree: 0, fire: 0, heart: 0, angry: 0 },
      comments: [],
      created_at: new Date().toISOString(),
    };

    await kvStore.set(`speak:issue:${nextId}`, JSON.stringify(issue));
    await kvStore.set("speak:counter", String(nextId));

    console.log(`[POST /speak-up/issues] New issue id=${nextId} constituency=${issue.constituency}`);
    return c.json({ success: true, data: issue }, 201);
  } catch (err) {
    console.log(`[POST /speak-up/issues] Error: ${err}`);
    return c.json({ error: `Failed to create issue: ${err}` }, 500);
  }
});

// ── POST /speak-up/issues/:id/upvote ─────────────────────────────────────────
app.post(`${BASE}/speak-up/issues/:id/upvote`, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const raw = await kvStore.get(`speak:issue:${id}`);
    if (!raw) return c.json({ error: "Issue not found" }, 404);
    const issue = typeof raw === "string" ? JSON.parse(raw) : raw;
    issue.upvotes = (issue.upvotes || 0) + 1;
    await kvStore.set(`speak:issue:${id}`, JSON.stringify(issue));
    return c.json({ success: true, upvotes: issue.upvotes });
  } catch (err) {
    return c.json({ error: `Failed to upvote: ${err}` }, 500);
  }
});

// ── POST /speak-up/issues/:id/react ──────────────────────────────────────────
app.post(`${BASE}/speak-up/issues/:id/react`, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const type = body.type; // agree | fire | heart | angry
    if (!["agree", "fire", "heart", "angry"].includes(type)) {
      return c.json({ error: "Invalid reaction type" }, 400);
    }
    const raw = await kvStore.get(`speak:issue:${id}`);
    if (!raw) return c.json({ error: "Issue not found" }, 404);
    const issue = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!issue.reactions) issue.reactions = { agree: 0, fire: 0, heart: 0, angry: 0 };
    issue.reactions[type] = (issue.reactions[type] || 0) + 1;
    await kvStore.set(`speak:issue:${id}`, JSON.stringify(issue));
    return c.json({ success: true, reactions: issue.reactions });
  } catch (err) {
    return c.json({ error: `Failed to react: ${err}` }, 500);
  }
});

// ── POST /speak-up/issues/:id/comment ────────────────────────────────────────
app.post(`${BASE}/speak-up/issues/:id/comment`, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    if (!body.text) return c.json({ error: "text is required" }, 400);

    const raw = await kvStore.get(`speak:issue:${id}`);
    if (!raw) return c.json({ error: "Issue not found" }, 404);
    const issue = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!issue.comments) issue.comments = [];

    const comment = {
      id: (issue.comments.length || 0) + 1,
      author: (body.author || "Anonymous").slice(0, 60),
      text: body.text.slice(0, 500),
      created_at: new Date().toISOString(),
    };
    issue.comments.push(comment);
    await kvStore.set(`speak:issue:${id}`, JSON.stringify(issue));

    console.log(`[POST /speak-up/issues/${id}/comment] New comment by ${comment.author}`);
    return c.json({ success: true, data: comment }, 201);
  } catch (err) {
    return c.json({ error: `Failed to add comment: ${err}` }, 500);
  }
});

// ── Deno.serve ────────────────────────────────────────────────────────────────

// ── AI Helper ─────────────────────────────────────────────────────────────────
async function callOpenAI(messages: Array<{ role: string; content: string }>, model = "gpt-4o-mini"): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // 25s server-side timeout

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: 600, temperature: 0.7 }),
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") throw new Error("OpenAI request timed out after 25 seconds");
    throw err;
  }
}

// ── POST /ai/chat — Conversational AI about constituency ──────────────────────
app.post(`${BASE}/ai/chat`, async (c) => {
  try {
    const body = await c.req.json();
    const { message, constituency, history = [] } = body;
    if (!message) return c.json({ error: "message is required" }, 400);

    const constName = (constituency || "").trim();
    const mla = constName ? ALL_MLAS.find(m => m.constituency.toLowerCase() === constName.toLowerCase()) : null;
    const projects = mla ? ALL_PROJECTS.filter(p => p.mla_id === mla.id) : [];
    const news = ALL_NEWS.filter(n => !constName || n.constituency.toLowerCase() === constName.toLowerCase()).slice(0, 5);
    const promises = mla ? ALL_PROMISES.filter(p => p.party === mla.party).slice(0, 8) : [];

    const totalBudget = projects.reduce((s, p) => s + p.allocated_amount, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent_amount, 0);
    const completed = projects.filter(p => p.status === "Completed").length;
    const delayed = projects.filter(p => p.status === "Delayed").length;
    const efficiency = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const context = mla ? `
You are an AI assistant for AP Civic Tracker, a civic accountability platform for Andhra Pradesh, India.

CONSTITUENCY CONTEXT — ${mla.constituency}:
- MLA: ${mla.name} (${mla.party}), ${mla.district} District
- Total Projects: ${projects.length} (${completed} completed, ${delayed} delayed)
- Budget Allocated: ₹${(totalBudget / 10000000).toFixed(1)} Cr | Spent: ₹${(totalSpent / 10000000).toFixed(1)} Cr | Efficiency: ${efficiency}%
- Score: ${mla.score}/100 | Rank: ${mla.rank}/175

Recent News Headlines: ${news.map(n => `"${n.title}" (${n.sentiment})`).join("; ")}

Party Promises (${mla.party}): ${promises.slice(0, 5).map(p => `${p.description} [${p.status || "Pending"}]`).join("; ")}

Project Examples: ${projects.slice(0, 5).map(p => `${p.name} — ${p.status} (${Math.round(p.spent_amount / p.allocated_amount * 100)}% spent)`).join("; ")}

Answer questions about this constituency clearly and helpfully. If asked about roads, water, health, education — connect it to the actual data above. Be conversational, empathetic, and fact-based. Use ₹ for currency. Keep answers under 150 words.
` : `
You are an AI assistant for AP Civic Tracker covering all 175 constituencies in Andhra Pradesh, India. You help citizens understand civic accountability, government schemes, MLA performance, and public spending. Be helpful, concise and data-aware. Keep answers under 150 words.
`;

    const openAIMessages = [
      { role: "system", content: context },
      ...history.slice(-6).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const reply = await callOpenAI(openAIMessages);
    console.log(`[POST /ai/chat] constituency=${constName || "none"} message="${message.slice(0, 50)}"`);
    return c.json({ reply, constituency: mla?.constituency || null });
  } catch (err) {
    console.log(`[POST /ai/chat] Error: ${err}`);
    return c.json({ error: `AI chat error: ${err}` }, 500);
  }
});

// ── GET /tax-area — Constituency tax/budget breakdown with AI insight ──────────
app.get(`${BASE}/tax-area`, async (c) => {
  try {
    const constName = (c.req.query("constituency") || "").trim();
    if (!constName) return c.json({ error: "constituency query param is required" }, 400);

    const mla = ALL_MLAS.find(m => m.constituency.toLowerCase() === constName.toLowerCase());
    if (!mla) return c.json({ error: `Constituency not found: ${constName}` }, 404);

    const projects = ALL_PROJECTS.filter(p => p.mla_id === mla.id);
    const totalAllocated = projects.reduce((s, p) => s + p.allocated_amount, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent_amount, 0);
    const completed = projects.filter(p => p.status === "Completed").length;
    const inProgress = projects.filter(p => p.status === "In Progress").length;
    const delayed = projects.filter(p => p.status === "Delayed").length;
    const notStarted = projects.filter(p => p.status === "Not Started").length;
    const unusedFunds = totalAllocated - totalSpent;
    const efficiency = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

    // Spending categories from scheme names
    const categoryMap: Record<string, { allocated: number; spent: number; count: number }> = {};
    for (const p of projects) {
      const cat = p.scheme || "General";
      if (!categoryMap[cat]) categoryMap[cat] = { allocated: 0, spent: 0, count: 0 };
      categoryMap[cat].allocated += p.allocated_amount;
      categoryMap[cat].spent += p.spent_amount;
      categoryMap[cat].count += 1;
    }
    const categories = Object.entries(categoryMap)
      .map(([name, v]) => ({ name, allocated: v.allocated, spent: v.spent, count: v.count, utilization: v.allocated > 0 ? Math.round(v.spent / v.allocated * 100) : 0 }))
      .sort((a, b) => b.allocated - a.allocated)
      .slice(0, 6);

    // Generate AI insight
    let aiInsight = "";
    try {
      const prompt = `You are summarizing constituency budget data for ${mla.constituency}, AP, India.
MLA: ${mla.name} (${mla.party})
Total Projects: ${projects.length} | Completed: ${completed} | Delayed: ${delayed} | Not Started: ${notStarted}
Budget: ₹${(totalAllocated / 10000000).toFixed(1)} Cr allocated, ₹${(totalSpent / 10000000).toFixed(1)} Cr spent (${efficiency}% efficiency)
Unused Funds: ₹${(unusedFunds / 10000000).toFixed(1)} Cr

Write a 2-sentence citizen-friendly insight about how their tax money is being used in this constituency. Mention key positives and concerns. Be factual and neutral.`;

      aiInsight = await callOpenAI([
        { role: "system", content: "You are a civic data analyst writing brief summaries for citizens." },
        { role: "user", content: prompt },
      ]);
    } catch (e) {
      aiInsight = `${efficiency}% of funds are utilized in ${mla.constituency}. ${delayed > 0 ? `${delayed} project(s) are delayed, requiring attention.` : "Project delivery is on track."} ${completed} project(s) have been completed so far.`;
    }

    // Top 5 projects by budget
    const topProjects = projects
      .sort((a, b) => b.allocated_amount - a.allocated_amount)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        scheme: p.scheme,
        status: p.status,
        progress: p.progress_percent,
        allocated: p.allocated_amount,
        spent: p.spent_amount,
        description: `${p.scheme} project in ${p.constituency}`,
      }));

    const alerts = [];
    if (unusedFunds > 5000000) alerts.push({ type: "warning", message: `₹${(unusedFunds / 10000000).toFixed(1)} Cr funds unused` });
    if (delayed > 0) alerts.push({ type: "delay", message: `${delayed} project${delayed > 1 ? "s" : ""} delayed` });
    if (notStarted > 0) alerts.push({ type: "info", message: `${notStarted} project${notStarted > 1 ? "s" : ""} not yet started` });
    if (efficiency >= 80) alerts.push({ type: "success", message: `High efficiency: ${efficiency}% funds utilized` });

    console.log(`[GET /tax-area] constituency=${mla.constituency} efficiency=${efficiency}%`);
    return c.json({
      mla: { id: mla.id, name: mla.name, party: mla.party, constituency: mla.constituency, district: mla.district, score: mla.score, rank: mla.rank },
      summary: { totalAllocated, totalSpent, unusedFunds, efficiency, completed, inProgress, delayed, notStarted, totalProjects: projects.length },
      topProjects,
      categories,
      aiInsight,
      alerts,
    });
  } catch (err) {
    console.log(`[GET /tax-area] Error: ${err}`);
    return c.json({ error: `Failed to fetch tax area data: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);