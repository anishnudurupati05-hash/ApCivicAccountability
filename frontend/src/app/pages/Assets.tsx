import { useState, useMemo } from "react";
import { Link } from "react-router";
import { TrendingUp, Flame, ChevronUp, ChevronDown, Search, AlertTriangle } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, BarChart, Bar
} from "recharts";

const PARTY_COLORS: Record<string, string> = { TDP: "#F59E0B", JSP: "#F97316", BJP: "#EF4444", YSRCP: "#3B82F6" };
const PARTY_BG: Record<string, string> = {
  TDP: "bg-yellow-100 text-yellow-800 border-yellow-300",
  JSP: "bg-orange-100 text-orange-800 border-orange-300",
  BJP: "bg-amber-100 text-amber-800 border-amber-300",
  YSRCP: "bg-sky-100 text-sky-800 border-sky-300",
};

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const MLA_DATA = [
  ["Kalavapudi Sridhar", "Ichchapuram", "TDP", 54, "rural"],
  ["Dola Sri Babu", "Kaviti", "TDP", 49, "rural"],
  ["Seediri Appalaraju", "Palasa", "TDP", 58, "semi-urban"],
  ["Thammineni Sitaram", "Tekkali", "TDP", 52, "semi-urban"],
  ["Killo Satyanarayana", "Pathapatnam", "TDP", 61, "rural"],
  ["Dharani Krishnadasa", "Srikakulam", "TDP", 47, "urban"],
  ["Janardana Rao Kalikiri", "Rajam", "YSRCP", 48, "semi-urban"],
  ["Midde Seethamma", "Kurupam", "TDP", 44, "rural"],
  ["Kilaru Venkata Ramana", "Parvathipuram", "TDP", 52, "semi-urban"],
  ["Ashok Gajapathi Raju", "Salur", "TDP", 61, "urban"],
  ["Dronamraju Srinivas", "Bobbili", "TDP", 58, "semi-urban"],
  ["Vanteru Pratap", "Cheepurupalle", "TDP", 47, "rural"],
  ["Ganta Srinivasa Rao", "Bheemunipatnam", "TDP", 60, "urban"],
  ["Velagapudi Ramakrishna Babu", "Anakapalle", "TDP", 53, "urban"],
  ["Vamsi Krishna Srinivas", "Visakhapatnam East", "TDP", 44, "urban"],
  ["Veera Bhandra Chowdary", "Visakhapatnam South", "JSP", 48, "urban"],
  ["Palla Srinivasa Rao", "Visakhapatnam North", "TDP", 52, "urban"],
  ["Jasti Satyanarayana", "Visakhapatnam West", "JSP", 55, "urban"],
  ["Kolisetty Kishore Kumar", "Araku Valley", "TDP", 41, "rural"],
  ["Sivakumar Adepalli", "Paderu", "JSP", 47, "rural"],
  ["Bhuma Brahmananda Reddy", "Narsipatnam", "TDP", 58, "semi-urban"],
  ["Mantena Rama Raju", "Yelamanchili", "TDP", 51, "semi-urban"],
  ["Anagani Satya Prasad", "Pithapuram", "JSP", 51, "semi-urban"],
  ["Ambati Rambabu", "Amalapuram", "TDP", 53, "urban"],
  ["Kiran Tej Varma", "Munchingiputtu", "YSRCP", 38, "rural"],
  ["Maddala Girivara Prasad", "Chodavaram", "TDP", 54, "rural"],
  ["Vasantha Krishna Prasad", "Eluru", "TDP", 49, "urban"],
  ["Pithani Satyanarayana", "Kakinada Rural", "TDP", 55, "semi-urban"],
  ["Dwarampudi Chandrasekhar Reddy", "Kakinada City", "TDP", 47, "urban"],
  ["Thota Trimurthulu", "Prathipadu", "TDP", 55, "rural"],
];

interface AssetRecord {
  id: number;
  name: string;
  constituency: string;
  party: string;
  age: number;
  assets2019: number; // in crores
  assets2024: number;
  growthPct: number;
  growthAmt: number;
}

const assetRecords: AssetRecord[] = MLA_DATA.map((m, i) => {
  const isUrban = m[4] === "urban";
  const isSemiUrban = m[4] === "semi-urban";
  // Base 2019: rural 50L–5Cr, semi-urban 1Cr–8Cr, urban 2Cr–15Cr
  const baseMin = isUrban ? 200 : isSemiUrban ? 100 : 50;
  const baseMax = isUrban ? 1500 : isSemiUrban ? 800 : 500;
  const base2019 = Math.round((baseMin + seededRand(i * 7 + 1) * (baseMax - baseMin)) * 10) / 10;
  // Growth multiplier 1.4x to 4.2x
  const mult = 1.4 + seededRand(i * 13 + 5) * 2.8;
  const base2024 = Math.round(base2019 * mult * 10) / 10;
  const growthPct = Math.round(((base2024 - base2019) / base2019) * 100);
  return {
    id: i + 1,
    name: m[0] as string,
    constituency: m[1] as string,
    party: m[2] as string,
    age: m[3] as number,
    assets2019: base2019 / 100, // convert L to Cr
    assets2024: base2024 / 100,
    growthPct,
    growthAmt: Math.round((base2024 - base2019) / 100 * 10) / 10,
  };
});

function formatCr(v: number) {
  if (v >= 100) return `₹${v.toFixed(0)} Cr`;
  if (v >= 1) return `₹${v.toFixed(1)} Cr`;
  return `₹${(v * 100).toFixed(0)} L`;
}

function GrowthBadge({ pct }: { pct: number }) {
  if (pct > 300) return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">+{pct}% 🔍</span>;
  if (pct >= 150) return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">+{pct}%</span>;
  return <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+{pct}%</span>;
}

export function Assets() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"growthPct" | "assets2024" | "name">("growthPct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [party, setParty] = useState("");

  const sorted = useMemo(() => {
    return [...assetRecords]
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
        if (sortBy === "growthPct") return mult * (a.growthPct - b.growthPct);
        if (sortBy === "assets2024") return mult * (a.assets2024 - b.assets2024);
        return mult * a.name.localeCompare(b.name);
      });
  }, [search, sortBy, sortDir, party]);

  const toggle = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const avgGrowth = Math.round(assetRecords.reduce((s, m) => s + m.growthPct, 0) / assetRecords.length);
  const highGrowthCount = assetRecords.filter(m => m.growthPct > 200).length;
  const top10 = [...assetRecords].sort((a, b) => b.growthPct - a.growthPct).slice(0, 10);
  const totalWealth = assetRecords.reduce((s, m) => s + m.assets2024, 0);

  // Scatter data
  const scatterData = assetRecords.map(m => ({ x: m.age, y: m.assets2024, name: m.name, party: m.party, pct: m.growthPct }));

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Asset Declarations</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-500" /> MLA Asset Declarations
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Comparing declared assets from 2019 and 2024 election affidavits filed with Election Commission of India
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
        <span className="text-blue-500 flex-shrink-0 mt-0.5">📋</span>
        <span className="text-blue-700">
          Asset data is modelled for demonstration. Real figures are available at{" "}
          <a href="https://affidavit.eci.gov.in" target="_blank" rel="noopener" className="underline font-medium">affidavit.eci.gov.in</a>
          {" "}for each candidate.
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg. Asset Growth", value: `+${avgGrowth}%`, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Highest Growth MLA", value: top10[0]?.name.split(" ")[0], color: "text-red-600", bg: "bg-red-50 border-red-200" },
          { label: "MLAs >200% Growth", value: highGrowthCount, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Total Declared Wealth 2024", value: formatCr(totalWealth), color: "text-green-600", bg: "bg-green-50 border-green-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border rounded-xl p-4`}>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className={`text-xl font-black mt-1 ${color} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Scatter + Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scatter: Age vs Assets 2024 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Age vs Total Assets 2024</h2>
          <p className="text-xs text-slate-400 mb-3">Colored by party</p>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="x" name="Age" type="number" domain={[35, 70]} label={{ value: "Age", position: "insideBottom", offset: -12, fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis dataKey="y" name="Assets (Cr)" unit=" Cr" tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-2 text-xs shadow-md">
                      <div className="font-bold text-slate-700">{d.name}</div>
                      <div className="text-slate-500">Age: {d.x} | Assets: ₹{d.y.toFixed(1)} Cr</div>
                      <div className="text-amber-600">Growth: +{d.pct}%</div>
                    </div>
                  );
                }}
              />
              {Object.keys(PARTY_COLORS).map(p => (
                <Scatter
                  key={p}
                  name={p}
                  data={scatterData.filter(d => d.party === p)}
                  fill={PARTY_COLORS[p]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-1 flex-wrap">
            {Object.entries(PARTY_COLORS).map(([p, c]) => (
              <div key={p} className="flex items-center gap-1 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />{p}
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Highest Growth Leaderboard */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Highest Growth Leaderboard (Top 10)
          </h2>
          <div className="space-y-2.5">
            {top10.map((mla, i) => (
              <div key={mla.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? "bg-red-100 text-red-700" : i < 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{mla.name}</div>
                  <div className="text-xs text-slate-400 truncate">{mla.constituency} · {mla.party}</div>
                </div>
                <GrowthBadge pct={mla.growthPct} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
            <div className="flex gap-3">
              <span className="text-red-500 font-medium">🔍 &gt;300% — Scrutiny needed</span>
              <span className="text-amber-500 font-medium">150–300% — Elevated</span>
              <span className="text-green-500 font-medium">&lt;150% — Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search MLA or constituency..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" />
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
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase cursor-pointer" onClick={() => toggle("name")}>
                  MLA {sortBy === "name" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Party</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">2019 Assets</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase cursor-pointer" onClick={() => toggle("assets2024")}>
                  2024 Assets {sortBy === "assets2024" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase cursor-pointer" onClick={() => toggle("growthPct")}>
                  Growth % {sortBy === "growthPct" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Growth Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((mla, idx) => (
                <tr key={mla.id} className={`hover:bg-amber-50 transition-colors ${mla.growthPct > 300 ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 text-sm">{mla.name}</div>
                    <div className="text-xs text-slate-400">{mla.constituency}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${PARTY_BG[mla.party] || ""}`}>{mla.party}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs hidden sm:table-cell">{formatCr(mla.assets2019)}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">{formatCr(mla.assets2024)}</td>
                  <td className="px-4 py-3 text-right"><GrowthBadge pct={mla.growthPct} /></td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-amber-700 hidden md:table-cell">+{formatCr(mla.growthAmt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No MLAs match your search</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        All figures are modelled estimates. Verify at{" "}
        <a href="https://affidavit.eci.gov.in" className="underline text-amber-600" target="_blank" rel="noopener">affidavit.eci.gov.in</a>
      </p>
    </div>
  );
}
