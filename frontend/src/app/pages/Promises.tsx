import { useEffect, useState } from "react";
import { api, PARTY_BG, STATUS_COLORS } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { ScrollText, CheckCircle2, Clock, AlertCircle, Filter, RefreshCw } from "lucide-react";

const PARTIES = ["TDP", "YSRCP", "JSP", "BJP"];
const CATEGORIES = ["Employment", "Energy", "Infrastructure", "Welfare", "Agriculture", "Healthcare", "Housing", "Education", "Digital", "Governance", "Industries", "Culture", "Food Security", "Women Empowerment"];
const STATUS_PIE_COLORS: Record<string, string> = {
  "Completed": "#10B981",
  "In Progress": "#3B82F6",
  "Not Started": "#94A3B8",
};

function ProgressBar({ value, color = "bg-amber-500" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Promises() {
  const [promises, setPromises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [party, setParty] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.getPromises({ party: party || undefined, category: category || undefined })
      .then(res => setPromises(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [party, category]);

  const completed = promises.filter(p => p.status === "Completed").length;
  const inProgress = promises.filter(p => p.status === "In Progress").length;
  const notStarted = promises.filter(p => p.status === "Not Started").length;

  const partyStats = PARTIES.map(p => ({
    party: p,
    total: promises.filter(x => x.party === p).length,
    completed: promises.filter(x => x.party === p && x.status === "Completed").length,
    inProgress: promises.filter(x => x.party === p && x.status === "In Progress").length,
  })).filter(p => p.total > 0);

  const pieData = [
    { name: "Completed", value: completed, fill: "#10B981" },
    { name: "In Progress", value: inProgress, fill: "#3B82F6" },
    { name: "Not Started", value: notStarted, fill: "#94A3B8" },
  ].filter(d => d.value > 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500">Loading promises...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        Error: {error}
        <button onClick={() => window.location.reload()} className="ml-3 underline">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-amber-500" /> Promise Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manifesto promises from all parties — TDP, YSRCP, JSP, BJP
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium">
          <ScrollText className="w-4 h-4 text-amber-400" />
          {promises.length} Promises Tracked
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-3xl font-black text-green-600">{completed}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Completed</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-black text-blue-600">{inProgress}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">In Progress</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-600">{notStarted}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Not Started</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Promise Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry, i) => <Cell key={`promises-pie-cell-${i}-${entry.fill}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Party comparison */}
        {partyStats.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Party-wise Promise Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={partyStats} margin={{ bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="party" tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[3, 3, 0, 0]} />
                <Bar dataKey="inProgress" fill="#3B82F6" name="In Progress" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <select
          value={party}
          onChange={e => setParty(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Parties</option>
          {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[160px]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(party || category) && (
          <button
            onClick={() => { setParty(""); setCategory(""); }}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
        <span className="text-sm text-slate-400 ml-auto">{promises.length} promises shown</span>
      </div>

      {/* Promises Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Promise</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Party</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden xl:table-cell">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promises.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-700 font-medium text-xs leading-snug">{p.description}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PARTY_BG[p.party] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{p.party}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell whitespace-nowrap">{p.target_group}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="flex-1">
                        <ProgressBar
                          value={p.progress_percent}
                          color={p.status === "Completed" ? "bg-green-500" : p.status === "In Progress" ? "bg-blue-500" : "bg-slate-300"}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">{p.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 hidden xl:table-cell whitespace-nowrap">{p.deadline}</td>
                </tr>
              ))}
              {promises.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <ScrollText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No promises found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Extraction Note */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white">
        <h3 className="font-semibold text-sm mb-2 text-amber-300">🤖 AI Manifesto Extraction (Module 5)</h3>
        <p className="text-slate-300 text-xs leading-relaxed">
          Promises are extracted from official party manifestos using PyMuPDF + OpenAI GPT-4. PDFs are uploaded,
          parsed, and structured with fields: promise, category, target_group, deadline. Extracted promises are
          stored in the promises table and mapped to MLAs via mla_promises with status tracking.
        </p>
        <div className="flex gap-2 mt-3">
          {["TDP Manifesto 2024", "YSRCP Manifesto 2024", "JSP Manifesto 2024", "BJP AP Manifesto"].map(m => (
            <span key={m} className="text-xs bg-white/10 rounded px-2 py-1">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}