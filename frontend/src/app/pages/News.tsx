import { useEffect, useState, useCallback } from "react";
import { api, NewsItem } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import { Newspaper, Search, Filter, TrendingUp, TrendingDown, Minus, MapPin, Calendar, RefreshCw } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const DISTRICTS = [
  "Srikakulam", "Vizianagaram", "Visakhapatnam", "East Godavari",
  "West Godavari", "Krishna", "Guntur", "Prakasam", "SPSR Nellore",
  "Kurnool", "YSR Kadapa", "Anantapur", "Chittoor"
];

const SENTIMENT_CONFIG: Record<string, { color: string; bg: string; fill: string; icon: any }> = {
  positive: { color: "text-green-700", bg: "bg-green-100", fill: "#10B981", icon: TrendingUp },
  neutral:  { color: "text-slate-600", bg: "bg-slate-100",  fill: "#94A3B8", icon: Minus },
  negative: { color: "text-red-700",   bg: "bg-red-100",   fill: "#EF4444", icon: TrendingDown },
};

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const cfg = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000);
  const cfg = SENTIMENT_CONFIG[item.sentiment] || SENTIMENT_CONFIG.neutral;

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 ${
      item.sentiment === "positive" ? "border-l-green-400" :
      item.sentiment === "negative" ? "border-l-red-400" : "border-l-slate-300"
    } border-slate-100`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug flex-1">{item.title}</h3>
        <SentimentBadge sentiment={item.sentiment} />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.content}</p>
      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{item.constituency}</span>
        </div>
        <span className="text-slate-200">·</span>
        <span className="text-slate-400">{item.district}</span>
        <span className="text-slate-200">·</span>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`}</span>
        </div>
      </div>
    </div>
  );
}

export function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [district, setDistrict] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const { t } = useLanguage();

  const fetchNews = useCallback(() => {
    setLoading(true);
    setError("");
    api.getNews({ limit: 300 })
      .then(res => setNews(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const filtered = news.filter(n => {
    if (district && n.district !== district) return false;
    if (sentiment && n.sentiment !== sentiment) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) ||
        n.constituency.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q);
    }
    return true;
  }).slice(0, limit);

  const positiveCount = news.filter(n => n.sentiment === "positive").length;
  const neutralCount  = news.filter(n => n.sentiment === "neutral").length;
  const negativeCount = news.filter(n => n.sentiment === "negative").length;

  const pieData = [
    { name: "Positive", value: positiveCount, fill: "#10B981" },
    { name: "Neutral",  value: neutralCount,  fill: "#94A3B8" },
    { name: "Negative", value: negativeCount, fill: "#EF4444" },
  ].filter(d => d.value > 0);

  const districtStats = DISTRICTS.map(d => ({
    district: d.length > 8 ? d.slice(0, 8) + "…" : d,
    fullName: d,
    positive: news.filter(n => n.district === d && n.sentiment === "positive").length,
    negative: news.filter(n => n.district === d && n.sentiment === "negative").length,
  })).filter(d => d.positive + d.negative > 0).slice(0, 10);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-amber-500" /> News & Updates
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Constituency-level news with AI sentiment analysis
          </p>
        </div>
        <button
          onClick={fetchNews}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ⚠️ AI-Generated Disclaimer Banner (FIX 4) */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl">
        <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">⚠️</span>
        <div>
          <span className="font-semibold text-amber-800 text-sm">Simulated News Feed</span>
          <span className="text-amber-700 text-sm ml-1">— This data is AI-generated for demonstration purposes. Real news integration coming soon.</span>
        </div>
      </div>

      {/* Sentiment Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Positive", value: positiveCount, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: TrendingUp },
          { label: "Neutral",  value: neutralCount,  color: "text-slate-600", bg: "bg-slate-50",  border: "border-slate-200", icon: Minus },
          { label: "Negative", value: negativeCount, color: "text-red-600",   bg: "bg-red-50",   border: "border-red-200",   icon: TrendingDown },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-slate-500">{label} News</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Sentiment Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={`news-pie-cell-${i}-${entry.fill}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-2">
            {pieData.map(d => (
              <div key={d.name} className="text-center">
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ background: d.fill }} />
                <div className="text-xs text-slate-500">{d.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">District Sentiment (Top 10)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={districtStats} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="district" tick={{ fontSize: 10, fill: "#64748B" }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip labelFormatter={(l, p) => p?.[0]?.payload?.fullName || l} />
              <Bar dataKey="positive" fill="#10B981" name="Positive" radius={[3, 3, 0, 0]} />
              <Bar dataKey="negative" fill="#EF4444" name="Negative" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search news, constituency..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <select
          value={district}
          onChange={e => setDistrict(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[150px]"
        >
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={sentiment}
          onChange={e => setSentiment(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} articles</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Error: {error} <button onClick={fetchNews} className="ml-2 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-full mb-1" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No news found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => <NewsCard key={item.id} item={item} />)}
          </div>

          {/* AI Note */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white">
            <h3 className="font-semibold text-sm mb-2 text-amber-300">🤖 AI Sentiment Analysis (Module 9)</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              News is scraped from local AP news sources (Eenadu, Sakshi, Andhra Jyothi, The Hindu - AP edition).
              OpenAI GPT-4 extracts: constituency, related project, sentiment (positive/neutral/negative) and progress
              updates. Extracted data is used to auto-update mla_promises and projects tables in real-time.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {["NLP Extraction", "Sentiment Analysis", "Auto-Update DB", "Real-time Pipeline"].map(tag => (
                <span key={tag} className="text-xs bg-white/10 rounded px-2 py-1">{tag}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}