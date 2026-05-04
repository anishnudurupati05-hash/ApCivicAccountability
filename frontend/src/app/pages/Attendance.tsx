import { useState, useMemo } from "react";
import { Link } from "react-router";
import { CalendarDays, ChevronUp, ChevronDown, Search, TrendingUp, TrendingDown, Minus, Users, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ── Modelled attendance data generator ────────────────────────────────────────
const PARTY_AVG: Record<string, number> = { TDP: 74, JSP: 71, BJP: 68, YSRCP: 61 };
const PARTY_COLORS: Record<string, string> = { TDP: "#F59E0B", JSP: "#F97316", BJP: "#EF4444", YSRCP: "#3B82F6" };
const TOTAL_SESSIONS = 24;

// Seeded RNG for deterministic data
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const MLA_NAMES_SAMPLE = [
  ["Kalavapudi Sridhar", "Ichchapuram", "TDP"],
  ["Dola Sri Babu", "Kaviti", "TDP"],
  ["Seediri Appalaraju", "Palasa", "TDP"],
  ["Thammineni Sitaram", "Tekkali", "TDP"],
  ["Killo Satyanarayana", "Pathapatnam", "TDP"],
  ["Dharani Krishnadasa", "Srikakulam", "TDP"],
  ["Nakka Ananda Babu", "Amadalavalasa", "TDP"],
  ["Aditi Giri", "Narasannapeta", "TDP"],
  ["Chirumamilla Ramakrishna", "Ranasthalam", "TDP"],
  ["Janardana Rao Kalikiri", "Rajam", "YSRCP"],
  ["Kuna Ravi Kumar", "Palakonda", "TDP"],
  ["Midde Seethamma", "Kurupam", "TDP"],
  ["Kilaru Venkata Ramana", "Parvathipuram", "TDP"],
  ["Ashok Gajapathi Raju", "Salur", "TDP"],
  ["Dronamraju Srinivas", "Bobbili", "TDP"],
  ["Vanteru Pratap", "Cheepurupalle", "TDP"],
  ["Pusapati Ananda Gajapathi", "Gajapathinagaram", "TDP"],
  ["Kolla Hari Venkata Kumari", "Vizianagaram", "TDP"],
  ["Ganta Srinivasa Rao", "Bheemunipatnam", "TDP"],
  ["Velagapudi Ramakrishna Babu", "Anakapalle", "TDP"],
  ["Chintala Ramachandra Raja", "Pendurthi", "TDP"],
  ["Tippala Nagi Reddy", "Gajuwaka", "TDP"],
  ["Vamsi Krishna Srinivas", "Visakhapatnam East", "TDP"],
  ["Veera Bhandra Chowdary", "Visakhapatnam South", "JSP"],
  ["Palla Srinivasa Rao", "Visakhapatnam North", "TDP"],
  ["Jasti Satyanarayana", "Visakhapatnam West", "JSP"],
  ["Kolisetty Kishore Kumar", "Araku Valley", "TDP"],
  ["Sivakumar Adepalli", "Paderu", "JSP"],
  ["Bhuma Brahmananda Reddy", "Narsipatnam", "TDP"],
  ["Mantena Rama Raju", "Yelamanchili", "TDP"],
  ["Anagani Satya Prasad", "Pithapuram", "JSP"],
  ["Ambati Rambabu", "Amalapuram", "TDP"],
  ["Korukanti Chandra Sekhar", "Rajanagaram", "TDP"],
  ["Thota Trimurthulu", "Prathipadu", "TDP"],
  ["Vasantha Krishna Prasad", "Eluru", "TDP"],
  ["Pithani Satyanarayana", "Kakinada Rural", "TDP"],
  ["Kiran Tej Varma", "Munchingiputtu", "YSRCP"],
  ["Maddala Girivara Prasad", "Chodavaram", "TDP"],
  ["Jaadi Ramesh", "Payakaraopeta", "TDP"],
  ["Dwarampudi Chandrasekhar Reddy", "Kakinada City", "TDP"],
];

interface AttendanceRecord {
  id: number;
  name: string;
  constituency: string;
  party: string;
  sessionsPresent: number;
  sessionsTotal: number;
  attendancePct: number;
  trend: number[]; // last 6 sessions: 1=present, 0=absent
}

const attendanceData: AttendanceRecord[] = MLA_NAMES_SAMPLE.map((mla, i) => {
  const base = PARTY_AVG[mla[2]] || 65;
  const variance = (seededRand(i * 7 + 13) - 0.5) * 30; // +-15%
  const pct = Math.max(25, Math.min(98, Math.round(base + variance)));
  const present = Math.round((pct / 100) * TOTAL_SESSIONS);
  const trend = Array.from({ length: 6 }, (_, j) => seededRand(i * 11 + j * 3) > (1 - pct / 100) ? 1 : 0);
  return {
    id: i + 1,
    name: mla[0],
    constituency: mla[1],
    party: mla[2],
    sessionsPresent: present,
    sessionsTotal: TOTAL_SESSIONS,
    attendancePct: pct,
    trend,
  };
});

// Session calendar (last 24 sessions with fake dates)
const SESSION_DATES = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2025, 0, 15 + i * 5);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
});

function AttendanceBadge({ pct }: { pct: number }) {
  if (pct >= 80) return <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{pct}%</span>;
  if (pct >= 60) return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{pct}%</span>;
  return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">{pct}%</span>;
}

function Sparkline({ trend }: { trend: number[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {trend.map((v, i) => (
        <div key={i} className={`w-3 h-3 rounded-sm ${v ? "bg-green-500" : "bg-red-300"}`} title={v ? "Present" : "Absent"} />
      ))}
    </div>
  );
}

export function Attendance() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"attendancePct" | "name">("attendancePct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [party, setParty] = useState("");

  const sorted = useMemo(() => {
    return [...attendanceData]
      .filter(m => {
        if (party && m.party !== party) return false;
        if (search) {
          const q = search.toLowerCase();
          return m.name.toLowerCase().includes(q) || m.constituency.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const mult = sortDir === "asc" ? 1 : -1;
        if (sortBy === "attendancePct") return mult * (a.attendancePct - b.attendancePct);
        return mult * a.name.localeCompare(b.name);
      });
  }, [search, sortBy, sortDir, party]);

  const avgAttendance = Math.round(attendanceData.reduce((s, m) => s + m.attendancePct, 0) / attendanceData.length);
  const topMLA = [...attendanceData].sort((a, b) => b.attendancePct - a.attendancePct)[0];
  const leastParty = Object.entries(PARTY_AVG).sort((a, b) => a[1] - b[1])[0][0];

  // Party bar chart data
  const partyBarData = Object.entries(PARTY_AVG).map(([p, avg]) => ({ party: p, avg, fill: PARTY_COLORS[p] }));

  const toggle = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Attendance Tracker</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-amber-500" /> Assembly Attendance Tracker
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Tracking MLA presence in the 16th AP Legislative Assembly sessions — because showing up matters
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
        <span className="text-blue-500 flex-shrink-0 mt-0.5">📋</span>
        <span className="text-blue-700">
          Attendance data is modelled based on publicly available patterns. Real data sourced from AP Legislature will replace this in future updates.
        </span>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg. Attendance", value: `${avgAttendance}%`, icon: Users, color: "bg-amber-500", sub: "Across all tracked MLAs" },
          { label: "Most Absent Party", value: leastParty, icon: TrendingDown, color: "bg-red-500", sub: `Avg. ${PARTY_AVG[leastParty]}% attendance` },
          { label: "Most Present MLA", value: topMLA.name.split(" ")[0], icon: Award, color: "bg-green-500", sub: `${topMLA.attendancePct}% • ${topMLA.constituency}` },
          { label: "Sessions Tracked", value: TOTAL_SESSIONS, icon: CalendarDays, color: "bg-blue-500", sub: "16th Assembly (2024-25)" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1 truncate">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Party avg attendance bar */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Average Attendance by Party</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={partyBarData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="party" tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} domain={[40, 100]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, "Avg. Attendance"]} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11, fill: "#64748B" }}>
                {partyBarData.map((entry) => <Cell key={`attendance-bar-${entry.party}`} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Session Calendar Heatmap */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Session Calendar</h2>
          <p className="text-xs text-slate-400 mb-3">Based on average attendance per session</p>
          <div className="grid grid-cols-6 gap-1.5">
            {SESSION_DATES.map((date, i) => {
              const presencePct = 50 + seededRand(i * 17) * 40;
              const color = presencePct >= 75 ? "bg-green-400" : presencePct >= 55 ? "bg-amber-400" : "bg-red-400";
              return (
                <div key={date} title={`${date}: ${Math.round(presencePct)}% present`}
                  className={`${color} rounded w-full aspect-square cursor-pointer hover:opacity-80 transition-opacity`} />
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-xs text-slate-500"><div className="w-3 h-3 bg-green-400 rounded" /> ≥75%</div>
            <div className="flex items-center gap-1 text-xs text-slate-500"><div className="w-3 h-3 bg-amber-400 rounded" /> 55-74%</div>
            <div className="flex items-center gap-1 text-xs text-slate-500"><div className="w-3 h-3 bg-red-400 rounded" /> &lt;55%</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search MLA or constituency..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex gap-2">
          {["", "TDP", "JSP", "BJP", "YSRCP"].map(p => (
            <button key={p || "all"} onClick={() => setParty(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                party === p ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >{p || "All"}</button>
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-auto">{sorted.length} MLAs</span>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-14">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700" onClick={() => toggle("name")}>
                  MLA {sortBy === "name" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Party</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Present / Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700" onClick={() => toggle("attendancePct")}>
                  Attendance % {sortBy === "attendancePct" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Last 6 Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((mla, idx) => (
                <tr key={mla.id} className="hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 text-sm">{mla.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{mla.constituency}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${
                      mla.party === "TDP" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                      mla.party === "JSP" ? "bg-orange-100 text-orange-800 border-orange-300" :
                      mla.party === "BJP" ? "bg-amber-100 text-amber-800 border-amber-300" :
                      "bg-sky-100 text-sky-800 border-sky-300"
                    }`}>{mla.party}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-sm font-medium text-slate-700">{mla.sessionsPresent}</span>
                    <span className="text-xs text-slate-400">/{mla.sessionsTotal}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AttendanceBadge pct={mla.attendancePct} />
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1.5">
                      <div
                        className={`h-full rounded-full ${mla.attendancePct >= 80 ? "bg-green-500" : mla.attendancePct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${mla.attendancePct}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Sparkline trend={mla.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No MLAs match your search</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Showing {sorted.length} of {attendanceData.length} sampled MLAs · Full 175 MLA data available in next update
      </p>
    </div>
  );
}