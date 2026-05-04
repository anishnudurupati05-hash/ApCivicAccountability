import { useEffect, useState } from "react";
import { api, CompareResult, formatCurrency, PARTY_BG } from "../lib/api";
import { Link } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from "recharts";
import {
  GitCompare, Trophy, Crown, TrendingUp, Building2,
  MapPin, Zap, ChevronRight, RotateCcw, Search
} from "lucide-react";
import { getBadges, BadgeDisplay } from "../components/BadgeSystem";

const TRENDING_PAIRS = [
  ["Vijayawada Central", "Guntur West"],
  ["Visakhapatnam East", "Visakhapatnam South"],
  ["Tirupati", "Nellore City"],
  ["Kurnool Urban", "Anantapur Urban"],
  ["Rajamahendravaram City", "Eluru"],
];

function WinnerBanner({ result }: { result: CompareResult }) {
  const { a, b } = result;
  const aWins = a.score > b.score;
  const tied = a.score === b.score;
  const winner = aWins ? a : b;

  if (tied) {
    return (
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-5 text-white text-center">
        <div className="text-3xl mb-2">🤝</div>
        <div className="text-xl font-bold">It's a Tie!</div>
        <div className="text-slate-300 text-sm mt-1">Both constituencies scored {a.score} points</div>
      </div>
    );
  }

  const initials = winner.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
  return (
    <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-5 text-white text-center shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Crown className="w-6 h-6" />
        <span className="text-sm font-bold uppercase tracking-widest">Winner</span>
        <Crown className="w-6 h-6" />
      </div>
      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-black mx-auto mb-2">
        {initials}
      </div>
      <div className="text-xl font-black">{winner.name}</div>
      <div className="text-amber-100 text-sm">{winner.constituency}</div>
      <div className="mt-2 text-3xl font-black">{winner.score} pts</div>
      <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded border font-bold ${PARTY_BG[winner.party] || "bg-white/20"}`}>
        {winner.party}
      </span>
    </div>
  );
}

interface MLASide {
  data: CompareResult["a"];
  color: string;
  label: string;
}

function MLACard({ mla, color, isWinner }: { mla: CompareResult["a"]; color: string; isWinner: boolean }) {
  const initials = mla.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
  const scoreColor = mla.score >= 140 ? "text-green-600" : mla.score >= 100 ? "text-amber-600" : "text-red-500";

  return (
    <div className={`bg-white rounded-2xl p-5 border-2 shadow-sm ${isWinner ? "border-amber-400 shadow-amber-100" : "border-slate-200"} relative`}>
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" /> Leading
        </div>
      )}
      <div className="text-center mb-4">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-black text-white mx-auto mb-2 ${color}`}>
          {initials}
        </div>
        <h3 className="font-bold text-slate-800 text-base leading-tight">{mla.name}</h3>
        <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mt-1">
          <MapPin className="w-3 h-3" /> {mla.constituency}
        </div>
        <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded border font-bold ${PARTY_BG[mla.party] || ""}`}>
          {mla.party}
        </span>
      </div>

      {/* Score */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-black ${scoreColor}`}>{mla.score}</div>
        <div className="text-xs text-slate-400">Overall Score</div>
        <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all bg-gradient-to-r ${mla.score >= 140 ? "from-green-400 to-green-600" : mla.score >= 100 ? "from-amber-400 to-amber-600" : "from-red-400 to-red-500"}`}
            style={{ width: `${Math.min((mla.score / 200) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="font-bold text-green-700">{mla.completed}</div>
          <div className="text-xs text-green-600">Completed</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="font-bold text-blue-700">{mla.inProgress}</div>
          <div className="text-xs text-blue-600">Active</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 text-center">
          <div className="font-bold text-amber-700">{mla.budgetUtil}%</div>
          <div className="text-xs text-amber-600">Budget Used</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <div className="font-bold text-purple-700">{mla.sentiment}</div>
          <div className="text-xs text-purple-600">Sentiment</div>
        </div>
      </div>

      {/* Projects */}
      <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">Total Projects</span>
          <span className="font-bold text-slate-700">{mla.totalProjects}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Delayed</span>
          <span className={`font-bold ${mla.delayedProjects > 3 ? "text-red-600" : "text-slate-700"}`}>{mla.delayedProjects}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Budget</span>
          <span className="font-bold text-slate-700">{formatCurrency(mla.totalBudget)}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3">
        <BadgeDisplay mla={mla as any} max={3} size="sm" />
      </div>

      <Link
        to={`/mlas/${mla.id}`}
        className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium py-2 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
      >
        View Full Profile <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function MetricRow({ label, a, b, formatVal }: {
  label: string;
  a: number; b: number;
  formatVal?: (v: number) => string;
}) {
  const aWins = a > b;
  const tied = a === b;
  const fmt = formatVal || ((v: number) => String(v));
  const maxVal = Math.max(a, b, 1);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className={`font-semibold ${!tied && aWins ? "text-amber-600" : ""}`}>{fmt(a)}</span>
        <span className="text-slate-600 font-medium">{label}</span>
        <span className={`font-semibold ${!tied && !aWins ? "text-amber-600" : ""}`}>{fmt(b)}</span>
      </div>
      <div className="flex gap-1 items-center h-3">
        <div className="flex-1 flex justify-end">
          <div
            className={`h-3 rounded-full transition-all ${aWins ? "bg-amber-400" : tied ? "bg-slate-300" : "bg-slate-200"}`}
            style={{ width: `${(a / maxVal) * 100}%` }}
          />
        </div>
        <div className="w-px h-3 bg-slate-300 flex-shrink-0" />
        <div className="flex-1">
          <div
            className={`h-3 rounded-full transition-all ${!aWins && !tied ? "bg-amber-400" : tied ? "bg-slate-300" : "bg-slate-200"}`}
            style={{ width: `${(b / maxVal) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function Compare() {
  const { t } = useLanguage();
  const [constituencies, setConstituencies] = useState<Array<{ name: string; district: string }>>([]);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  useEffect(() => {
    api.getConstituencies().then(r => setConstituencies(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedA || !selectedB || selectedA === selectedB) return;
    setLoading(true);
    setError("");
    api.compareConstituencies(selectedA, selectedB)
      .then(setResult)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedA, selectedB]);

  const filteredA = constituencies.filter(c =>
    c.name.toLowerCase().includes(searchA.toLowerCase()) ||
    c.district.toLowerCase().includes(searchA.toLowerCase())
  );
  const filteredB = constituencies.filter(c =>
    c.name.toLowerCase().includes(searchB.toLowerCase()) ||
    c.district.toLowerCase().includes(searchB.toLowerCase())
  );

  const radarData = result ? [
    { metric: "Score", A: Math.round((result.a.score / 200) * 100), B: Math.round((result.b.score / 200) * 100) },
    { metric: "Projects", A: Math.min(result.a.completed * 7, 100), B: Math.min(result.b.completed * 7, 100) },
    { metric: "Budget%", A: result.a.budgetUtil, B: result.b.budgetUtil },
    { metric: "Sentiment", A: result.a.sentiment, B: result.b.sentiment },
    { metric: "Active", A: Math.min(result.a.inProgress * 10, 100), B: Math.min(result.b.inProgress * 10, 100) },
  ] : [];

  const aConstShort = selectedA.split(" ").slice(0, 2).join(" ");
  const bConstShort = selectedB.split(" ").slice(0, 2).join(" ");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-amber-500" /> {t.compare.title}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">{t.compare.subtitle}</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Constituency A */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t.compare.selectA}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={searchA}
              onChange={e => setSearchA(e.target.value)}
              placeholder="Search constituency..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>
          <select
            value={selectedA}
            onChange={e => setSelectedA(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
            size={5}
          >
            <option value="">-- Select --</option>
            {filteredA.map(c => (
              <option key={c.name} value={c.name}>{c.name} ({c.district})</option>
            ))}
          </select>
          {selectedA && (
            <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {selectedA}
            </div>
          )}
        </div>

        {/* VS badge */}
        <div className="flex items-center justify-center mt-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
            VS
          </div>
        </div>

        {/* Constituency B */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t.compare.selectB}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={searchB}
              onChange={e => setSearchB(e.target.value)}
              placeholder="Search constituency..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>
          <select
            value={selectedB}
            onChange={e => setSelectedB(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
            size={5}
          >
            <option value="">-- Select --</option>
            {filteredB.map(c => (
              <option key={c.name} value={c.name}>{c.name} ({c.district})</option>
            ))}
          </select>
          {selectedB && (
            <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {selectedB}
            </div>
          )}
        </div>
      </div>

      {/* Trending Comparisons */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-700 mb-3">{t.compare.trending}</h3>
        <div className="flex flex-wrap gap-2">
          {TRENDING_PAIRS.map(([a, b], i) => (
            <button
              key={i}
              onClick={() => { setSelectedA(a); setSelectedB(b); setSearchA(""); setSearchB(""); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 hover:border-amber-300 rounded-full transition-colors font-medium"
            >
              <span className="text-slate-600">{a.split(" ")[0]}</span>
              <span className="text-slate-400">vs</span>
              <span className="text-slate-600">{b.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">{t.compare.loading}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* No selection prompt */}
      {!loading && !result && !error && (!selectedA || !selectedB) && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-10 text-center border border-slate-200">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{t.compare.pickBoth}</p>
          <p className="text-slate-400 text-sm mt-1">Select constituencies from the dropdowns above</p>
        </div>
      )}

      {/* Same constituency warning */}
      {selectedA && selectedB && selectedA === selectedB && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm text-center">
          Please select two <strong>different</strong> constituencies to compare.
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <WinnerBanner result={result} />

          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MLACard
              mla={result.a}
              color="bg-amber-600"
              isWinner={result.a.score > result.b.score}
            />
            <MLACard
              mla={result.b}
              color="bg-blue-600"
              isWinner={result.b.score > result.a.score}
            />
          </div>

          {/* Head-to-Head Metrics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" /> {t.compare.metrics}
            </h3>
            {/* Column headers */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-amber-700 truncate">{aConstShort}</div>
              <div className="text-xs text-slate-400 font-medium px-3">METRIC</div>
              <div className="text-sm font-bold text-blue-700 truncate text-right">{bConstShort}</div>
            </div>
            <div className="space-y-4">
              <MetricRow label="Overall Score" a={result.a.score} b={result.b.score} />
              <MetricRow label="Projects Done" a={result.a.completed} b={result.b.completed} />
              <MetricRow label="Active Projects" a={result.a.inProgress} b={result.b.inProgress} />
              <MetricRow label="Budget Util %" a={result.a.budgetUtil} b={result.b.budgetUtil} formatVal={v => `${v}%`} />
              <MetricRow label="Sentiment Score" a={result.a.sentiment} b={result.b.sentiment} />
              <MetricRow label="Total Projects" a={result.a.totalProjects} b={result.b.totalProjects} />
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Performance Radar
            </h3>
            <div className="flex flex-wrap gap-4 justify-center mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-slate-600 font-medium">{aConstShort}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-slate-600 font-medium">{bConstShort}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
                <Radar name={aConstShort} dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.25} />
                <Radar name={bConstShort} dataKey="B" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" /> Project Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: "Completed", A: result.a.completed, B: result.b.completed },
                  { name: "Active", A: result.a.inProgress, B: result.b.inProgress },
                  { name: "Not Started", A: result.a.notStarted, B: result.b.notStarted },
                  { name: "Delayed", A: result.a.delayedProjects, B: result.b.delayedProjects },
                ]}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend formatter={(v) => v === "A" ? aConstShort : bConstShort} />
                <Bar dataKey="A" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="B" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Reset */}
          <div className="text-center">
            <button
              onClick={() => { setSelectedA(""); setSelectedB(""); setResult(null); setSearchA(""); setSearchB(""); }}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Compare a different pair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
