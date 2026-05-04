import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-83920fb2`;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${publicAnonKey}`,
};

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${res.status}: ${err}`);
  }
  return res.json();
}

export interface MLA {
  id: number;
  name: string;
  party: string;
  constituency: string;
  district: string;
  state: string;
  age: number;
  education: string;
  phone: string;
  email: string;
}

export interface MLAWithMetrics extends MLA {
  completed: number;
  inProgress: number;
  notStarted: number;
  budgetUtil: number;
  sentiment: number;
  score: number;
  rank?: number;
  promises?: Promise[];
  projects?: Project[];
  news?: NewsItem[];
}

export interface Promise {
  id: number;
  party: string;
  description: string;
  category: string;
  target_group: string;
  deadline: string;
  status?: string;
  progress_percent?: number;
}

export interface Project {
  id: number;
  name: string;
  constituency: string;
  district: string;
  mla_id: number;
  scheme: string;
  status: string;
  progress_percent: number;
  allocated_amount: number;
  spent_amount: number;
  latitude: number;
  longitude: number;
}

export interface Budget {
  id: number;
  department: string;
  scheme: string;
  allocated_amount: number;
  spent_amount: number;
  year: number;
  utilization_percent: number;
}

export interface NewsItem {
  id: number;
  title: string;
  constituency: string;
  district: string;
  mla_id: number;
  sentiment: string;
  created_at: string;
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  page?: number;
  totalPages?: number;
}

export interface DashboardStats {
  total_mlas: number;
  total_constituencies: number;
  total_promises: number;
  promises_completed: number;
  promises_inprogress: number;
  promises_notstarted: number;
  avg_budget_utilization: number;
  party_breakdown: Array<{ party: string; count: number; color: string }>;
  district_stats: Array<{ district: string; mla_count: number; avg_score: number }>;
  project_stats: { total: number; completed: number; inProgress: number; notStarted: number; delayed: number };
  recent_news: NewsItem[];
}

export interface SpeakUpIssue {
  id: number;
  title: string;
  description: string;
  constituency: string;
  category: string;
  author: string;
  upvotes: number;
  reactions: { agree: number; fire: number; heart: number; angry: number };
  comments: Array<{ id: number; author: string; text: string; created_at: string }>;
  created_at: string;
}

export interface CompareResult {
  a: MLAWithMetrics & {
    totalProjects: number; completedProjects: number;
    inProgressProjects: number; delayedProjects: number;
    totalBudget: number; totalSpent: number;
  };
  b: MLAWithMetrics & {
    totalProjects: number; completedProjects: number;
    inProgressProjects: number; delayedProjects: number;
    totalBudget: number; totalSpent: number;
  };
}

export const api = {
  // MLAs
  getMlas: (params?: {
    limit?: number; offset?: number; district?: string;
    party?: string; search?: string; sortBy?: string;
    sortOrder?: string; withMetrics?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    if (params?.district) q.set("district", params.district);
    if (params?.party) q.set("party", params.party);
    if (params?.search) q.set("search", params.search);
    if (params?.sortBy) q.set("sortBy", params.sortBy);
    if (params?.sortOrder) q.set("sortOrder", params.sortOrder);
    if (params?.withMetrics) q.set("withMetrics", "true");
    return fetchAPI<PaginatedResponse<MLA | MLAWithMetrics>>(`/mlas?${q}`);
  },

  getMlaById: (id: number) => fetchAPI<MLAWithMetrics>(`/mlas/${id}`),

  getMlaByConstituency: (constituency: string) =>
    fetchAPI<MLAWithMetrics>(`/mla?constituency=${encodeURIComponent(constituency)}`),

  getRankings: (params?: { limit?: number; offset?: number; district?: string; party?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    if (params?.district) q.set("district", params.district);
    if (params?.party) q.set("party", params.party);
    return fetchAPI<PaginatedResponse<MLAWithMetrics>>(`/mla/rankings?${q}`);
  },

  getDistricts: () => fetchAPI<{ data: Array<{ name: string; mla_count: number; coords: [number, number] }> }>("/districts"),

  getParties: () => fetchAPI<{ data: Array<{ name: string; full_name: string; mla_count: number; color: string }> }>("/parties"),

  getDashboardStats: () => fetchAPI<DashboardStats>("/dashboard/stats"),

  getPromises: (params?: { party?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.party) q.set("party", params.party);
    if (params?.category) q.set("category", params.category);
    return fetchAPI<{ data: Promise[]; total: number }>(`/promises?${q}`);
  },

  getBudgets: () => fetchAPI<{ data: Budget[]; total: number }>("/budgets"),

  getProjects: (params?: { constituency?: string; district?: string; status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.constituency) q.set("constituency", params.constituency);
    if (params?.district) q.set("district", params.district);
    if (params?.status) q.set("status", params.status);
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    return fetchAPI<PaginatedResponse<Project>>(`/projects?${q}`);
  },

  getNews: (params?: { constituency?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.constituency) q.set("constituency", params.constituency);
    if (params?.limit) q.set("limit", String(params.limit));
    return fetchAPI<{ data: NewsItem[]; total: number }>(`/news?${q}`);
  },

  submitReport: (data: { project_id?: number; description: string; constituency: string; reporter_name?: string }) =>
    fetchAPI("/reports", { method: "POST", body: JSON.stringify(data) }),

  getReports: () => fetchAPI<{ data: any[]; total: number }>("/reports"),

  // ── Compare ────────────────────────────────────────────────────────────────
  compareConstituencies: (a: string, b: string) =>
    fetchAPI<CompareResult>(`/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`),

  getConstituencies: () =>
    fetchAPI<{ data: Array<{ name: string; district: string; mla_id: number }> }>("/constituencies"),

  // ── Speak Up ───────────────────────────────────────────────────────────────
  getSpeakUpIssues: (params?: { category?: string; constituency?: string; sort?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.constituency) q.set("constituency", params.constituency);
    if (params?.sort) q.set("sort", params.sort);
    return fetchAPI<{ data: SpeakUpIssue[]; total: number }>(`/speak-up/issues?${q}`);
  },

  createSpeakUpIssue: (data: { title: string; description: string; constituency: string; category: string; author?: string }) =>
    fetchAPI<{ success: boolean; data: SpeakUpIssue }>("/speak-up/issues", { method: "POST", body: JSON.stringify(data) }),

  upvoteIssue: (id: number) =>
    fetchAPI<{ success: boolean; upvotes: number }>(`/speak-up/issues/${id}/upvote`, { method: "POST", body: JSON.stringify({}) }),

  reactToIssue: (id: number, type: "agree" | "fire" | "heart" | "angry") =>
    fetchAPI<{ success: boolean; reactions: any }>(`/speak-up/issues/${id}/react`, { method: "POST", body: JSON.stringify({ type }) }),

  commentOnIssue: (id: number, data: { text: string; author?: string }) =>
    fetchAPI<{ success: boolean; data: any }>(`/speak-up/issues/${id}/comment`, { method: "POST", body: JSON.stringify(data) }),

  // ── AI Chat ────────────────────────────────────────────────────────────────
  aiChat: (data: { message: string; constituency?: string; history?: Array<{ role: string; content: string }> }) =>
    fetchAPI<{ reply: string; constituency: string | null }>("/ai/chat", { method: "POST", body: JSON.stringify(data) }),

  // ── Tax in Your Area ───────────────────────────────────────────────────────
  getTaxArea: (constituency: string) =>
    fetchAPI<{
      mla: { id: number; name: string; party: string; constituency: string; district: string; score: number; rank: number };
      summary: { totalAllocated: number; totalSpent: number; unusedFunds: number; efficiency: number; completed: number; inProgress: number; delayed: number; notStarted: number; totalProjects: number };
      topProjects: Array<{ id: number; name: string; scheme: string; status: string; progress: number; allocated: number; spent: number; description: string }>;
      categories: Array<{ name: string; allocated: number; spent: number; count: number; utilization: number }>;
      aiInsight: string;
      alerts: Array<{ type: string; message: string }>;
    }>(`/tax-area?constituency=${encodeURIComponent(constituency)}`),
};

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export const PARTY_COLORS: Record<string, string> = {
  TDP: "#FFD700",
  JSP: "#FF6B35",
  BJP: "#FF9933",
  YSRCP: "#00BFFF",
};

export const PARTY_BG: Record<string, string> = {
  TDP: "bg-yellow-100 text-yellow-800 border-yellow-300",
  JSP: "bg-orange-100 text-orange-800 border-orange-300",
  BJP: "bg-amber-100 text-amber-800 border-amber-300",
  YSRCP: "bg-sky-100 text-sky-800 border-sky-300",
};

export const STATUS_COLORS: Record<string, string> = {
  "Completed": "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Not Started": "bg-gray-100 text-gray-600",
  "Delayed": "bg-red-100 text-red-800",
};