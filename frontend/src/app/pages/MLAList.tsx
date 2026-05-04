import { useEffect, useState, useCallback, useRef } from "react";
import { api, MLA, PARTY_BG } from "../lib/api";
import { Link, useSearchParams } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Search, Filter, ChevronLeft, ChevronRight,
  Users, X, SlidersHorizontal, MapPin, GraduationCap
} from "lucide-react";

const DISTRICTS = [
  "Srikakulam", "Vizianagaram", "Visakhapatnam", "East Godavari",
  "West Godavari", "Krishna", "Guntur", "Prakasam", "SPSR Nellore",
  "Kurnool", "YSR Kadapa", "Anantapur", "Chittoor"
];
const PARTIES = ["TDP", "JSP", "BJP", "YSRCP"];
const PAGE_SIZE = 25;

function PartyBadge({ party }: { party: string }) {
  const cls = PARTY_BG[party] || "bg-gray-100 text-gray-700 border-gray-300";
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${cls}`}>{party}</span>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 16, c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const color = value >= 70 ? "#10B981" : value >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <svg width="44" height="44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" />
      <text x="22" y="22" textAnchor="middle" dominantBaseline="middle"
        className="rotate-90 origin-center" style={{ fontSize: 9, fill: "#374151", transform: "rotate(90deg)", transformOrigin: "22px 22px" }}>
        {value}%
      </text>
    </svg>
  );
}

function MLACard({ mla, metrics }: { mla: any; metrics?: any }) {
  const initials = mla.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
  const budgetUtil = metrics?.budgetUtil || 0;

  return (
    <Link to={`/mlas/${mla.id}`}
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all group cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:from-amber-500 group-hover:to-amber-600 transition-all">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">{mla.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">{mla.constituency}</span>
              </div>
            </div>
            <PartyBadge party={mla.party} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-400">{mla.district}</span>
            <span className="text-slate-300">·</span>
            <GraduationCap className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">{mla.education}</span>
          </div>
        </div>
        {metrics && (
          <div className="flex-shrink-0">
            <ProgressRing value={budgetUtil} />
          </div>
        )}
      </div>
      {metrics && (
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="text-center">
            <div className="text-base font-bold text-green-600">{metrics.completed}</div>
            <div className="text-xs text-slate-400">Done</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-blue-600">{metrics.inProgress}</div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-slate-500">{metrics.notStarted}</div>
            <div className="text-xs text-slate-400">Pending</div>
          </div>
        </div>
      )}
    </Link>
  );
}

export function MLAList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mlas, setMlas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMetrics, setShowMetrics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") || "";
  const district = searchParams.get("district") || "";
  const party = searchParams.get("party") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchMlas = useCallback(() => {
    setLoading(true);
    setError("");
    api.getMlas({
      limit: PAGE_SIZE,
      offset,
      search: search || undefined,
      district: district || undefined,
      party: party || undefined,
      withMetrics: showMetrics,
    })
      .then(res => {
        setMlas(res.data);
        setTotal(res.total);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [offset, search, district, party, showMetrics]);

  useEffect(() => { fetchMlas(); }, [fetchMlas]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== "page") p.set("page", "1");
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = search || district || party;

  const { t } = useLanguage();

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> {t.mlaList.title}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{t.mlaList.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-slate-600">Show Metrics</span>
            <div
              onClick={() => setShowMetrics(m => !m)}
              className={`w-10 h-5 rounded-full transition-colors relative ${showMetrics ? "bg-amber-500" : "bg-slate-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${showMetrics ? "left-5" : "left-0.5"}`} />
            </div>
          </label>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => updateParam("search", e.target.value)}
              placeholder="Search by MLA name or constituency..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="px-4 pb-4 flex flex-wrap gap-3">
          <select
            value={district}
            onChange={e => updateParam("district", e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[160px]"
          >
            <option value="">All Districts</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={party}
            onChange={e => updateParam("party", e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">All Parties</option>
            {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}

          {/* Active filter badges */}
          {district && (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {district}
              <button onClick={() => updateParam("district", "")} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {party && (
            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              {party}
              <button onClick={() => updateParam("party", "")} className="hover:text-amber-900"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
          Error: {error}
          <button onClick={fetchMlas} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : mlas.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No MLAs found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="mt-3 text-amber-600 hover:underline text-sm">Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mlas.map(mla => (
              <MLACard key={mla.id} mla={mla} metrics={showMetrics ? mla : undefined} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total} MLAs
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParam("page", String(page - 1))}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    let pg = i + 1;
                    if (totalPages > 7) {
                      if (page <= 4) pg = i + 1;
                      else if (page >= totalPages - 3) pg = totalPages - 6 + i;
                      else pg = page - 3 + i;
                    }
                    return (
                      <button
                        key={pg}
                        onClick={() => updateParam("page", String(pg))}
                        className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                          pg === page
                            ? "bg-amber-500 text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => updateParam("page", String(page + 1))}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}