import { useEffect, useState } from "react";
import { api, MLAWithMetrics, PARTY_BG } from "../lib/api";
import { Link } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Trophy, Medal, Award, ChevronUp, ChevronDown, Filter, MapPin, Download, ArrowUpDown } from "lucide-react";
import { BadgeDisplay } from "../components/BadgeSystem";

const DISTRICTS = [
  "Srikakulam","Vizianagaram","Visakhapatnam","East Godavari",
  "West Godavari","Krishna","Guntur","Prakasam","SPSR Nellore",
  "Kurnool","YSR Kadapa","Anantapur","Chittoor"
];
const PARTIES = ["TDP","JSP","BJP","YSRCP"];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"><Trophy className="w-4 h-4 text-yellow-900" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center shadow-md"><Medal className="w-4 h-4 text-slate-600" /></div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center shadow-md"><Award className="w-4 h-4 text-amber-100" /></div>;
  return <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">#{rank}</div>;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min((score / 200) * 100, 100);
  // FIX 5: Green >= 140 (70%), Amber >= 100 (50%), Red < 100
  const color = pct >= 70 ? "from-green-400 to-green-600" : pct >= 50 ? "from-amber-400 to-amber-600" : "from-red-400 to-red-500";
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Rankings() {
  const [data, setData] = useState<MLAWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [district, setDistrict] = useState("");
  const [party, setParty] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showLowest, setShowLowest] = useState(false);
  const PAGE_SIZE = 30;
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    setError("");
    api.getRankings({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      district: district || undefined,
      party: party || undefined,
    })
      .then(res => { setData(res.data as MLAWithMetrics[]); setTotal(res.total); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, district, party]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const offset = (page - 1) * PAGE_SIZE;

  // Sorted display data (FIX: Hall of Shame = Lowest Performing toggle)
  const displayData = showLowest ? [...data].reverse() : data;

  // CSV Download
  const downloadCSV = () => {
    const headers = ["Rank","Name","Constituency","District","Party","Completed","Active","Budget%","Sentiment","Score"];
    const rows = data.map((m, i) => [
      showLowest ? total - offset - i : offset + i + 1,
      m.name, m.constituency, m.district, m.party,
      m.completed, m.inProgress, m.budgetUtil, m.sentiment, m.score
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ap-mla-rankings-${district || "all"}-${party || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> {t.rankings.title}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{t.rankings.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Lowest Performing toggle (IMPROVE) */}
          <button
            onClick={() => setShowLowest(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              showLowest
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            {showLowest ? "Lowest Performing" : "Highest Performing"}
          </button>
          {/* Download CSV (IMPROVE) */}
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Scoring Formula */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">Ranking Formula (Score /200)</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <span className="text-green-400 font-bold">Completed × 5</span>
          </div>
          <div className="text-slate-400 flex items-center">+</div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <span className="text-blue-400 font-bold">In Progress × 2</span>
          </div>
          <div className="text-slate-400 flex items-center">−</div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <span className="text-red-400 font-bold">Not Started × 3</span>
          </div>
          <div className="text-slate-400 flex items-center">+</div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <span className="text-amber-400 font-bold">Budget Util %</span>
          </div>
          <div className="text-slate-400 flex items-center">+</div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <span className="text-purple-400 font-bold">Sentiment</span>
          </div>
        </div>
        <div className="mt-3 flex gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> ≥140 Green</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> ≥100 Amber</span>
          <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &lt;100 Red</span>
        </div>
      </div>

      {/* Filters — District dropdown + Party pills (IMPROVE) */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <select value={district} onChange={e => { setDistrict(e.target.value); setPage(1); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">All Districts</option>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>{total} MLAs ranked</span>
          </div>
        </div>
        {/* Party filter pills (IMPROVE) */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setParty(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${!party ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
          >All Parties</button>
          {PARTIES.map(p => (
            <button
              key={p}
              onClick={() => { setParty(p === party ? "" : p); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                party === p
                  ? p === "TDP" ? "bg-yellow-400 text-yellow-900 border-yellow-400"
                    : p === "JSP" ? "bg-orange-400 text-white border-orange-400"
                    : p === "BJP" ? "bg-amber-500 text-white border-amber-500"
                    : "bg-sky-500 text-white border-sky-500"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >{p}</button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
      )}

      {/* Top 3 Podium */}
      {!loading && data.length >= 3 && page === 1 && !district && !party && !showLowest && (
        <div className="grid grid-cols-3 gap-3">
          {[data[1], data[0], data[2]].map((mla, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const bg = i === 1 ? "bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-300" :
              i === 0 ? "bg-gradient-to-b from-slate-50 to-slate-100 border-slate-300" :
              "bg-gradient-to-b from-amber-50 to-amber-100 border-amber-300";
            const initials = mla.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
            return (
              <Link key={mla.id} to={`/mlas/${mla.id}`}
                className={`${bg} border rounded-xl p-4 text-center hover:shadow-md transition-all`}>
                <RankBadge rank={rank} />
                <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-bold mx-auto mt-2 mb-1">
                  {initials}
                </div>
                <p className="text-xs font-bold text-slate-800 leading-tight truncate">{mla.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{mla.constituency}</p>
                <div className="mt-2 text-lg font-black text-amber-600">{mla.score}<span className="text-xs font-normal text-slate-400">/200</span></div>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${PARTY_BG[mla.party] || ""}`}>{mla.party}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-16">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">MLA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">District</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Party</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Badges</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Completed</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Budget%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Sentiment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="w-8 h-8 bg-slate-200 rounded-full" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-40" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-slate-200 rounded w-12" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-5 bg-slate-200 rounded w-24" /></td>
                    <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-8 ml-auto" /></td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell"><div className="h-4 bg-slate-200 rounded w-8 ml-auto" /></td>
                    <td className="px-4 py-3 text-right hidden md:table-cell"><div className="h-4 bg-slate-200 rounded w-10 ml-auto" /></td>
                    <td className="px-4 py-3 text-right hidden md:table-cell"><div className="h-4 bg-slate-200 rounded w-10 ml-auto" /></td>
                    <td className="px-4 py-3 text-right"><div className="h-5 bg-slate-200 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : displayData.map((mla, idx) => {
                const globalRank = showLowest ? total - offset - idx : offset + idx + 1;
                const pct = Math.min((mla.score / 200) * 100, 100);
                // FIX 5: Updated score color thresholds
                const scoreColor = pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-500";
                const initials = mla.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
                return (
                  <tr key={mla.id} className={`hover:bg-amber-50 transition-colors ${globalRank <= 3 && page === 1 && !district && !party && !showLowest ? "bg-amber-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <RankBadge rank={globalRank} />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/mlas/${mla.id}`} className="flex items-center gap-2 hover:text-amber-600 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{mla.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {mla.constituency}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell whitespace-nowrap">{mla.district}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded border ${PARTY_BG[mla.party] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {mla.party}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <BadgeDisplay mla={{ ...mla, rank: globalRank }} max={2} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{mla.completed}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 hidden sm:table-cell">{mla.inProgress}</td>
                    <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{mla.budgetUtil}%</td>
                    <td className="px-4 py-3 text-right text-purple-600 hidden md:table-cell">{mla.sentiment}</td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <span className={`text-base font-black ${scoreColor}`}>{mla.score}</span>
                        <span className="text-xs text-slate-400">/200</span>
                      </div>
                      <ScoreBar score={mla.score} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50">← Prev</button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}