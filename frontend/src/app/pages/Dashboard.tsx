import { useEffect, useState } from "react";
import { api, DashboardStats, formatCurrency } from "../lib/api";
import { Link } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Users, Trophy, CheckCircle2, Clock, AlertCircle,
  TrendingUp, MapPin, Newspaper, ArrowRight, Building2,
  GitCompare, Megaphone, Flame, Crown, Database, RefreshCw, CheckSquare
} from "lucide-react";

const PARTY_COLORS: Record<string, string> = {
  TDP: "#F59E0B", JSP: "#F97316", BJP: "#EF4444", YSRCP: "#3B82F6",
};

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ s }: { s: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      s === "positive" ? "bg-green-100 text-green-700" :
      s === "negative" ? "bg-red-100 text-red-700" :
      "bg-gray-100 text-gray-600"
    }`}>{s}</span>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500">{t.dashboard.loading}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {t.dashboard.error}: {error}
      </div>
    </div>
  );

  if (!stats) return null;

  const promiseData = [
    { name: t.dashboard.fulfilledLabel, value: stats.promises_completed, fill: "#10B981" },
    { name: t.mlaDetail.active, value: stats.promises_inprogress, fill: "#3B82F6" },
    { name: t.dashboard.pendingLabel, value: stats.promises_notstarted, fill: "#94A3B8" },
  ];

  const projectData = [
    { name: t.mlaDetail.completed, value: stats.project_stats.completed, fill: "#10B981" },
    { name: t.mlaDetail.active, value: stats.project_stats.inProgress, fill: "#3B82F6" },
    { name: t.dashboard.failedLabel, value: stats.project_stats.delayed, fill: "#EF4444" },
    { name: t.dashboard.pendingLabel, value: stats.project_stats.notStarted, fill: "#94A3B8" },
  ];

  const topDistricts = [...stats.district_stats]
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 8);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Quick Facts Ticker (IMPROVE) */}
      <div className="bg-amber-500 text-white rounded-xl px-4 py-2 overflow-hidden">
        <div className="flex items-center gap-2 text-sm font-medium animate-none">
          <span className="flex-shrink-0 text-amber-100 text-xs font-bold uppercase tracking-wider">LIVE</span>
          <span className="flex-shrink-0">·</span>
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide whitespace-nowrap text-xs font-semibold">
            <span>175 MLAs tracked</span>
            <span className="text-amber-200">•</span>
            <span>13 Districts</span>
            <span className="text-amber-200">•</span>
            <span>4 Parties</span>
            <span className="text-amber-200">•</span>
            <span>{stats.project_stats.inProgress + stats.project_stats.completed} Active &amp; Completed Projects</span>
            <span className="text-amber-200">•</span>
            <span>Last updated: April 2026</span>
            <span className="text-amber-200">•</span>
            <Link to="/data-sources" className="underline hover:text-white text-amber-100">View Data Sources</Link>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.dashboard.title}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>175 {t.mlaList.constituency.split(" ")[0]}s</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.dashboard.totalMLAs} value={175} icon={Users} color="bg-slate-700" sub={t.legislativeAssembly} />
        <StatCard label={t.dashboard.promisesFulfilled} value={stats.promises_completed} icon={CheckCircle2} color="bg-green-500" sub="Across all parties" />
        <StatCard label={t.dashboard.pendingPromises} value={stats.promises_inprogress} icon={Clock} color="bg-blue-500" sub="Being implemented" />
        <StatCard label={`${t.budget.utilization}`} value={`${stats.avg_budget_utilization}%`} icon={TrendingUp} color="bg-amber-500" sub="Of total allocation" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Party Breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" /> {t.dashboard.partyWiseSplit}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.party_breakdown} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="party" label={({ party, count }) => `${party}: ${count}`} labelLine={false}>
                {stats.party_breakdown.map((entry) => (
                  <Cell key={`party-cell-${entry.party}`} fill={PARTY_COLORS[entry.party] || "#94A3B8"} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {stats.party_breakdown.map(p => (
              <div key={p.party} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PARTY_COLORS[p.party] }} />
                <span className="text-slate-600">{p.party}: {p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promise Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> {t.nav.promises}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={promiseData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {promiseData.map((entry, i) => (
                  <Cell key={`promise-cell-${i}-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {promiseData.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
                  <span className="text-slate-600">{p.name}</span>
                </div>
                <span className="font-medium text-slate-700">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" /> {t.nav.projectsMap}
          </h2>
          <div className="space-y-3">
            {projectData.map(p => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{p.name}</span>
                  <span className="font-medium" style={{ color: p.fill }}>{p.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(p.value / stats.project_stats.total) * 100}%`, backgroundColor: p.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-sm font-semibold text-slate-700">Total: {stats.project_stats.total} {t.nav.projectsMap.split(" ")[0]}s</div>
          </div>
        </div>
      </div>

      {/* District Performance */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" /> {t.dashboard.performanceOverview}
          </h2>
          <Link to="/rankings" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
            {t.rankings.title} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topDistricts} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="district" tick={{ fontSize: 11, fill: "#64748B" }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
            <Tooltip />
            <Bar dataKey="avg_score" fill="#F59E0B" radius={[4, 4, 0, 0]} name={t.dashboard.avgRating} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent News */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-500" /> {t.dashboard.recentNews}
          </h2>
        </div>
        <div className="space-y-3">
          {stats.recent_news.map(n => (
            <div key={n.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium leading-snug">{n.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{n.constituency}</span>
                  <span className="text-slate-300">·</span>
                  <SentimentBadge s={n.sentiment} />
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
          ⚠️ News articles are AI-generated for demonstration purposes
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/mlas", label: t.nav.mlaDirectory, icon: Users, color: "bg-slate-800 hover:bg-slate-700" },
          { to: "/rankings", label: t.nav.rankings, icon: Trophy, color: "bg-amber-500 hover:bg-amber-600" },
          { to: "/compare", label: t.nav.compareAreas, icon: GitCompare, color: "bg-blue-600 hover:bg-blue-700" },
          { to: "/speak-up", label: t.nav.speakUp, icon: Megaphone, color: "bg-rose-500 hover:bg-rose-600" },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-2 px-4 py-3 ${color} text-white rounded-xl text-sm font-medium transition-colors`}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>

      {/* Gamification Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-white">🏆 AP Leaderboard &amp; Streaks</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 flex items-start gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-bold text-sm">On Fire!</div>
              <div className="text-orange-100 text-xs">Top 10 MLAs completed 12+ projects this month</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 flex items-start gap-3">
            <span className="text-3xl">📈</span>
            <div>
              <div className="font-bold text-sm">Trending Up!</div>
              <div className="text-green-100 text-xs">23 constituencies improved their sentiment score</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 flex items-start gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <div className="font-bold text-sm">People's Voice</div>
              <div className="text-purple-100 text-xs">1,200+ civic issues raised by citizens this week</div>
            </div>
          </div>
        </div>

        {/* Badge Legend */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Badge Guide</div>
          <div className="flex flex-wrap gap-2">
            {[
              { emoji: "🏆", label: "Top Performer", sub: "Score ≥ 145" },
              { emoji: "⭐", label: "Elite MLA", sub: "Top 10 Rank" },
              { emoji: "🔥", label: "Promise Keeper", sub: "12+ Done" },
              { emoji: "💰", label: "Budget Champ", sub: "80%+ Used" },
              { emoji: "❤️", label: "People's Choice", sub: "Sentiment 72+" },
              { emoji: "⚠️", label: "Delayed Zone", sub: "10+ Stalled" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
                <span className="text-sm">{b.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{b.label}</div>
                  <div className="text-xs text-slate-400 leading-tight">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link to="/rankings" className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-2 rounded-lg font-bold transition-colors">
            <Trophy className="w-3.5 h-3.5" /> View Rankings
          </Link>
          <Link to="/speak-up" className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg font-medium transition-colors">
            <Megaphone className="w-3.5 h-3.5" /> Raise an Issue
          </Link>
          <Link to="/compare" className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg font-medium transition-colors">
            <GitCompare className="w-3.5 h-3.5" /> Compare Areas
          </Link>
        </div>
      </div>

      {/* Data Health Widget (IMPROVE) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" /> Data Health
          </h2>
          <Link to="/data-sources" className="text-xs text-amber-600 hover:underline flex items-center gap-1">
            View all sources <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-black text-green-700">350/350</div>
              <div className="text-xs text-slate-500">Verified data points</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-black text-amber-700">~4,200</div>
              <div className="text-xs text-slate-500">Modelled data points</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1.5">Data verified vs modelled</div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500 rounded-l-full" style={{ width: "7.7%" }} />
              <div className="h-full bg-amber-400" style={{ width: "92.3%" }} />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-green-600 font-medium">7.7% Verified</span>
              <span className="text-amber-600 font-medium">92.3% Modelled</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Last data refresh: April 2026</span>
          <button className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors">
            Request Data Update
          </button>
        </div>
      </div>
    </div>
  );
}