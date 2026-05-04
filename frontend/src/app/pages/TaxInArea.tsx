import { useState, useEffect, useRef } from "react";
import { api, formatCurrency, PARTY_BG } from "../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, Sector
} from "recharts";
import {
  MapPin, IndianRupee, Zap, AlertTriangle, CheckCircle2,
  Clock, XCircle, Sparkles, TrendingUp, Building2, Search,
  Loader2, AlertCircle, ChevronDown, RefreshCw, Banknote,
  Target, Info, SlidersHorizontal, PieChart as PieIcon,
  ArrowRight, Layers, ChevronUp, HelpCircle, Users
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TaxLine {
  id: string;
  name: string;
  type: "central" | "state" | "local";
  annualAmount: number;
  description: string;
  color: string;
  flowToState: number;   // % of this tax that reaches state
  flowToConstit: number; // % of state portion reaching constituency
  icon: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"
];

const ALERT_CONFIG: Record<string, { bg: string; border: string; icon: React.ReactNode; textColor: string }> = {
  warning: { bg: "bg-amber-50", border: "border-amber-300", textColor: "text-amber-800", icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" /> },
  delay:   { bg: "bg-red-50",   border: "border-red-300",   textColor: "text-red-800",   icon: <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" /> },
  info:    { bg: "bg-blue-50",  border: "border-blue-300",  textColor: "text-blue-800",  icon: <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" /> },
  success: { bg: "bg-emerald-50", border: "border-emerald-300", textColor: "text-emerald-800", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; bar: string }> = {
  "Completed":  { label: "Completed",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, bar: "bg-emerald-500" },
  "In Progress":{ label: "In Progress",color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       icon: <Clock className="w-4 h-4 text-blue-500" />,          bar: "bg-blue-500"    },
  "Delayed":    { label: "Delayed",    color: "text-red-700",     bg: "bg-red-50 border-red-200",         icon: <AlertTriangle className="w-4 h-4 text-red-500" />,    bar: "bg-red-500"     },
  "Not Started":{ label: "Not Started",color: "text-slate-600",   bg: "bg-slate-50 border-slate-200",     icon: <XCircle className="w-4 h-4 text-slate-400" />,        bar: "bg-slate-300"   },
};

const POPULAR = [
  "Vijayawada Central", "Guntur West", "Visakhapatnam East",
  "Tirupati", "Nellore City", "Kurnool Urban",
];

// ─── Compute tax lines from annual income ─────────────────────────────────────
function computeTaxLines(annualIncome: number): TaxLine[] {
  const lac = annualIncome / 100000;

  // Income Tax slab (new regime FY 2025-26, approx)
  let incomeTax = 0;
  if (annualIncome > 1500000) incomeTax = (annualIncome - 1500000) * 0.30 + 150000 * 0.20 + 150000 * 0.15 + 100000 * 0.10 + 100000 * 0.05;
  else if (annualIncome > 1200000) incomeTax = (annualIncome - 1200000) * 0.20 + 150000 * 0.15 + 100000 * 0.10 + 100000 * 0.05;
  else if (annualIncome > 900000) incomeTax = (annualIncome - 900000) * 0.15 + 100000 * 0.10 + 100000 * 0.05;
  else if (annualIncome > 700000) incomeTax = (annualIncome - 700000) * 0.10 + 100000 * 0.05;
  else if (annualIncome > 400000) incomeTax = (annualIncome - 400000) * 0.05;
  // 87A rebate: if income ≤ 7L, tax = 0 (new regime)
  if (annualIncome <= 700000) incomeTax = 0;
  const educationCess = incomeTax * 0.04;
  incomeTax += educationCess;

  // GST: approx 8-12% of take-home spending
  const takeHome = annualIncome - incomeTax;
  const gstAmount = Math.round(takeHome * 0.09);
  const gstCentral = Math.round(gstAmount * 0.5);
  const gstState = Math.round(gstAmount * 0.5);

  // Profession Tax (AP: ₹200/month = ₹2400/yr for employees, max ₹2500)
  const profTax = annualIncome > 200000 ? 2400 : 0;

  // Property Tax (if applicable — urban avg ₹6000–12000/yr)
  const propTax = annualIncome > 500000 ? 8000 : 4000;

  // Vehicle Tax (road tax, green cess ~ ₹3000/yr assumed)
  const vehicleTax = 3600;

  // Fuel surcharge / cess (avg commuter ₹800/month)
  const fuelCess = 9600;

  // Swachh Bharat / Infra cess embedded in GST
  const swachh = Math.round(gstAmount * 0.04);

  return [
    {
      id: "income_tax",
      name: "Income Tax",
      type: "central",
      annualAmount: Math.round(incomeTax),
      description: "Paid to Central Govt. 41% devolved to states via Finance Commission. AP gets ~3.6% of central share.",
      color: "#6366F1",
      flowToState: 41,
      flowToConstit: 2.1,
      icon: "📊",
    },
    {
      id: "gst_central",
      name: "GST (Central Share)",
      type: "central",
      annualAmount: gstCentral,
      description: "CGST goes to Centre, then devolved. AP receives its share based on population & area weightage.",
      color: "#8B5CF6",
      flowToState: 41,
      flowToConstit: 2.1,
      icon: "🧾",
    },
    {
      id: "gst_state",
      name: "GST (State Share)",
      type: "state",
      annualAmount: gstState,
      description: "SGST stays entirely in Andhra Pradesh state treasury for state-level programmes.",
      color: "#10B981",
      flowToState: 100,
      flowToConstit: 2.1,
      icon: "🏛️",
    },
    {
      id: "prof_tax",
      name: "Professional Tax",
      type: "state",
      annualAmount: profTax,
      description: "AP state-level tax on salaried employees. Max ₹2,500/year. Goes directly into AP state fund.",
      color: "#06B6D4",
      flowToState: 100,
      flowToConstit: 2.5,
      icon: "💼",
    },
    {
      id: "prop_tax",
      name: "Property Tax",
      type: "local",
      annualAmount: propTax,
      description: "Collected by municipality / gram panchayat. Stays fully local for civic infrastructure.",
      color: "#F59E0B",
      flowToState: 100,
      flowToConstit: 100,
      icon: "🏠",
    },
    {
      id: "vehicle_tax",
      name: "Vehicle / Road Tax",
      type: "state",
      annualAmount: vehicleTax,
      description: "One-time or annual road tax paid to AP Transport Dept. Funds road maintenance & SH construction.",
      color: "#F97316",
      flowToState: 100,
      flowToConstit: 2.1,
      icon: "🚗",
    },
    {
      id: "fuel_cess",
      name: "Fuel Cess & Surcharge",
      type: "central",
      annualAmount: fuelCess,
      description: "Embedded in petrol/diesel prices. Part goes to National Highway fund, part to state road cess.",
      color: "#EF4444",
      flowToState: 30,
      flowToConstit: 1.8,
      icon: "⛽",
    },
    {
      id: "swachh",
      name: "Swachh Bharat Cess",
      type: "central",
      annualAmount: swachh,
      description: "Embedded in GST invoices for sanitation & clean India mission projects at local level.",
      color: "#84CC16",
      flowToState: 60,
      flowToConstit: 2.1,
      icon: "♻️",
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressBar({ value, color = "bg-indigo-500", height = "h-2.5" }: { value: number; color?: string; height?: string }) {
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
      <div className={`${height} ${color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function EfficiencyRing({ pct }: { pct: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const color = pct >= 75 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          <circle cx="56" cy="56" r={r} fill="none" stroke="#F1F5F9" strokeWidth="12" />
          <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.4s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800">{pct}%</span>
        </div>
      </div>
      <span className={`text-sm font-bold mt-1 ${pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
        {pct >= 75 ? "High" : pct >= 50 ? "Moderate" : "Low"} Efficiency
      </span>
    </div>
  );
}

function TypeBadge({ type }: { type: "central" | "state" | "local" }) {
  const cfg = {
    central: "bg-indigo-100 text-indigo-700 border-indigo-200",
    state:   "bg-emerald-100 text-emerald-700 border-emerald-200",
    local:   "bg-amber-100 text-amber-700 border-amber-200",
  }[type];
  const label = { central: "Central", state: "State", local: "Local" }[type];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide ${cfg}`}>{label}</span>;
}

// Custom active pie slice
function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#1E293B" className="text-sm" fontSize={13} fontWeight={700}>
        {payload.name.length > 14 ? payload.name.slice(0, 14) + "…" : payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6366F1" fontSize={14} fontWeight={800}>
        {formatCurrency(value)}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#94A3B8" fontSize={11}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function TaxInArea() {
  const [constituency, setConstituency] = useState("Vijayawada Central");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allConstituencies, setAllConstituencies] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tax calculator
  const [annualIncome, setAnnualIncome] = useState(800000);
  const [showTaxDetail, setShowTaxDetail] = useState<string | null>(null);
  const [activePieIndex, setActivePieIndex] = useState(0);

  const taxLines = computeTaxLines(annualIncome);
  const totalTax = taxLines.reduce((s, t) => s + t.annualAmount, 0);
  const taxToState = taxLines.reduce((s, t) => s + Math.round(t.annualAmount * t.flowToState / 100), 0);
  const taxToConstit = taxLines.reduce((s, t) => s + Math.round(t.annualAmount * t.flowToState / 100 * t.flowToConstit / 100), 0);

  const filtered = allConstituencies.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    api.getConstituencies().then(res => setAllConstituencies(res.data.map(c => c.name).sort())).catch(() => {});
  }, []);

  useEffect(() => {
    if (!constituency) return;
    setLoading(true); setError(null);
    api.getTaxArea(constituency)
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [constituency]);

  const selectConstituency = (name: string) => { setConstituency(name); setShowSearch(false); setSearchQuery(""); };
  const partyBg = data ? (PARTY_BG[data.mla.party] || "bg-slate-100 text-slate-700 border-slate-300") : "";

  const taxPieData = taxLines.filter(t => t.annualAmount > 0).map(t => ({ name: t.name, value: t.annualAmount, color: t.color }));

  const usagePieData = data?.categories?.map((c: any, i: number) => ({
    name: c.name, value: c.spent, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  })) || [];

  const incomeOptions = [300000, 500000, 700000, 800000, 1200000, 1800000, 2500000, 3500000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 py-6 shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: `${20 + i * 14}px`, height: `${20 + i * 14}px`, top: `${Math.sin(i * 0.9) * 70 + 30}%`, left: `${(i / 18) * 115 - 5}%`, opacity: 0.25 }} />
            ))}
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <IndianRupee className="w-4 h-4" />
                <span>Citizen Tax Tracker · Andhra Pradesh</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Your Tax in{" "}
                <span className="text-yellow-300">{constituency || "Your Area"}</span>
              </h1>
              <p className="text-indigo-200 text-sm mt-1">Where your money comes from · and where it goes</p>
            </div>
            {/* Picker */}
            <div className="relative z-10">
              <button onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl px-4 py-2.5 text-white text-sm font-medium transition-all min-w-[210px] justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-200" />
                  <span className="truncate max-w-[150px]">{constituency || "Select area"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-indigo-200 flex-shrink-0 transition-transform ${showSearch ? "rotate-180" : ""}`} />
              </button>
              {showSearch && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input autoFocus type="text" placeholder="Search constituency..." value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)} className="bg-transparent flex-1 text-sm text-slate-700 outline-none" />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filtered.slice(0, 40).map(c => (
                      <button key={c} onClick={() => selectConstituency(c)}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${constituency === c ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"}`}>
                        {c}
                      </button>
                    ))}
                    {filtered.length === 0 && <div className="px-3 py-4 text-sm text-slate-400 text-center">No results</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION A · TAX DEDUCTION BREAKDOWN
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                  Your Tax Deduction Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">All taxes you pay & how much reaches {constituency || "your area"}</p>
              </div>
              {/* Income selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Annual Income:</span>
                <select
                  value={annualIncome}
                  onChange={e => setAnnualIncome(Number(e.target.value))}
                  className="text-sm border border-indigo-200 bg-white text-indigo-700 font-semibold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {incomeOptions.map(v => (
                    <option key={v} value={v}>₹{(v / 100000).toFixed(0)} L/yr</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Tax Paid", value: formatCurrency(totalTax), sub: "per year", color: "from-indigo-500 to-indigo-600", icon: <IndianRupee className="w-5 h-5" /> },
                { label: "Reaches AP State", value: formatCurrency(taxToState), sub: `${Math.round(taxToState / totalTax * 100)}% of your tax`, color: "from-emerald-500 to-teal-600", icon: <Layers className="w-5 h-5" /> },
                { label: `Flows to ${constituency?.split(" ")[0] || "Constituency"}`, value: formatCurrency(taxToConstit), sub: `₹${Math.round(taxToConstit / 12).toLocaleString("en-IN")}/month`, color: "from-violet-500 to-purple-600", icon: <MapPin className="w-5 h-5" /> },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-2`}>{s.icon}</div>
                  <div className="text-lg font-black text-slate-800 leading-tight">{s.value}</div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5 leading-tight">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Tax flow visual bar */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tax Flow Funnel</div>
              <div className="space-y-2">
                {[
                  { label: "You Pay", amount: totalTax, pct: 100, color: "bg-indigo-500" },
                  { label: "Reaches AP State", amount: taxToState, pct: Math.round(taxToState / totalTax * 100), color: "bg-emerald-500" },
                  { label: `Used in ${constituency?.split(" ")[0] || "Area"}`, amount: taxToConstit, pct: Math.round(taxToConstit / totalTax * 100), color: "bg-violet-500" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-slate-600 font-medium text-right flex-shrink-0">{row.label}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden relative">
                      <div className={`h-5 ${row.color} rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
                        style={{ width: `${row.pct}%`, minWidth: row.pct > 0 ? "40px" : "0" }}>
                        <span className="text-[10px] text-white font-bold">{row.pct}%</span>
                      </div>
                    </div>
                    <div className="w-20 text-xs font-bold text-slate-700 flex-shrink-0">{formatCurrency(row.amount)}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                Constituency allocation based on AP's 175 constituencies with Finance Commission devolution ratios (FY 2025-26)
              </p>
            </div>

            {/* Pie + line items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Pie */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tax Type Split</div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taxPieData.filter(d => d.value > 0)}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        activeIndex={activePieIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                      >
                        {taxPieData.filter(d => d.value > 0).map((d, i) => (
                          <Cell key={`tax-pie-cell-${i}`} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {taxPieData.filter(d => d.value > 0).map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-slate-600 truncate">{d.name.replace("GST (", "").replace(")", "")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Itemised Deductions</div>
                {taxLines.map(t => (
                  <div key={t.id}>
                    <button
                      onClick={() => setShowTaxDetail(showTaxDetail === t.id ? null : t.id)}
                      className="w-full flex items-center gap-2 text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors group"
                    >
                      <span className="text-base flex-shrink-0">{t.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-700">{t.name}</span>
                          <TypeBadge type={t.type} />
                        </div>
                        <div className="mt-0.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((t.annualAmount / totalTax) * 100 * 3, 100)}%`, background: t.color }} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-slate-800">{formatCurrency(t.annualAmount)}</div>
                        <div className="text-[10px] text-slate-400">/yr</div>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${showTaxDetail === t.id ? "rotate-180" : ""}`} />
                    </button>
                    {showTaxDetail === t.id && (
                      <div className="mx-2 mb-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-2">
                        <p>{t.description}</p>
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                          <div className="text-center">
                            <div className="font-black text-slate-800">{formatCurrency(t.annualAmount)}</div>
                            <div className="text-slate-400">You pay</div>
                          </div>
                          <div className="text-center">
                            <div className="font-black text-emerald-700">{formatCurrency(Math.round(t.annualAmount * t.flowToState / 100))}</div>
                            <div className="text-slate-400">→ State ({t.flowToState}%)</div>
                          </div>
                          <div className="text-center">
                            <div className="font-black text-violet-700">{formatCurrency(Math.round(t.annualAmount * t.flowToState / 100 * t.flowToConstit / 100))}</div>
                            <div className="text-slate-400">→ Constit.</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Per-rupee breakdown */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">For Every ₹100 You Pay in Tax</div>
              <div className="space-y-2">
                {[
                  { label: "Kept by Central Govt", pct: Math.round((taxLines.filter(t => t.type === "central").reduce((s, t) => s + t.annualAmount * (1 - t.flowToState / 100), 0) / totalTax) * 100), color: "bg-indigo-400" },
                  { label: "Reaches AP State Govt", pct: Math.round(taxToState / totalTax * 100), color: "bg-emerald-400" },
                  { label: `Used in ${constituency?.split(" ")[0] || "Your"} Constituency`, pct: Math.round(taxToConstit / totalTax * 100), color: "bg-violet-400" },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-44 text-xs text-slate-300 flex-shrink-0">{row.label}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                      <div className={`h-4 ${row.color} rounded-full flex items-center justify-end pr-1.5 transition-all duration-1000`}
                        style={{ width: `${Math.max(row.pct, 3)}%` }}>
                        <span className="text-[10px] font-bold text-white">₹{row.pct}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading / Error state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
            <p className="font-semibold text-slate-700">Loading constituency data…</p>
            <p className="text-sm text-slate-400">Fetching projects, budgets & AI insights</p>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Failed to load data</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button onClick={() => { setError(null); setLoading(true); api.getTaxArea(constituency).then(d => { setData(d); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); }); }}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── Quick Stats ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Allocated", value: formatCurrency(data.summary.totalAllocated), icon: <Banknote className="w-5 h-5" />, color: "from-indigo-500 to-indigo-600", sub: "Public funds" },
                { label: "Total Spent", value: formatCurrency(data.summary.totalSpent), icon: <TrendingUp className="w-5 h-5" />, color: "from-emerald-500 to-emerald-600", sub: `${data.summary.efficiency}% utilized` },
                { label: "Unused Funds", value: formatCurrency(data.summary.unusedFunds), icon: <AlertTriangle className="w-5 h-5" />, color: data.summary.unusedFunds > 5000000 ? "from-amber-500 to-amber-600" : "from-slate-400 to-slate-500", sub: "Pending utilization" },
                { label: "Total Projects", value: String(data.summary.totalProjects), icon: <Building2 className="w-5 h-5" />, color: "from-violet-500 to-violet-600", sub: `${data.summary.completed} completed` },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                  <div className="text-xl font-black text-slate-800">{s.value}</div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Alerts ───────────────────────────────────────────────────── */}
            {data.alerts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.alerts.map((alert: any, i: number) => {
                  const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info;
                  return (
                    <div key={i} className={`flex items-center gap-3 ${cfg.bg} border ${cfg.border} rounded-xl px-4 py-3`}>
                      {cfg.icon}
                      <span className={`text-sm font-semibold ${cfg.textColor}`}>{alert.message}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── MLA Info + Efficiency ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Your MLA</div>
                    <h2 className="text-xl font-black text-slate-800">{data.mla.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${partyBg}`}>{data.mla.party}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.mla.district}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-600">{data.mla.score}</div>
                    <div className="text-xs text-slate-400">Score /100</div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">Rank #{data.mla.rank}</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Budget Utilization</span>
                    <span className="font-semibold">{formatCurrency(data.summary.totalSpent)} / {formatCurrency(data.summary.totalAllocated)}</span>
                  </div>
                  <ProgressBar value={data.summary.efficiency}
                    color={data.summary.efficiency >= 75 ? "bg-emerald-500" : data.summary.efficiency >= 50 ? "bg-amber-500" : "bg-red-500"} height="h-3" />
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">₹0</span>
                    <span className="font-semibold text-slate-700">{data.summary.efficiency}% utilized</span>
                    <span className="text-slate-400">{formatCurrency(data.summary.totalAllocated)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Done",    val: data.summary.completed,  color: "bg-emerald-100 text-emerald-700" },
                    { label: "Active",  val: data.summary.inProgress,  color: "bg-blue-100 text-blue-700" },
                    { label: "Delayed", val: data.summary.delayed,     color: "bg-red-100 text-red-700" },
                    { label: "Pending", val: data.summary.notStarted,  color: "bg-slate-100 text-slate-600" },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-lg px-2 py-2 text-center`}>
                      <div className="text-lg font-black">{s.val}</div>
                      <div className="text-xs font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-3">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-base font-bold text-slate-700">Accountability Indicator</h3>
                  </div>
                  <EfficiencyRing pct={data.summary.efficiency} />
                  <p className="text-xs text-slate-500 mt-3 max-w-[200px] text-center">
                    {data.summary.efficiency >= 75 ? "Excellent fund utilization — your MLA is delivering." : data.summary.efficiency >= 50 ? "Moderate utilization — room for improvement." : "Low utilization — significant funds remain unspent."}
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />≥75% Good</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />50-74% OK</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />&lt;50% Poor</div>
                </div>
              </div>
            </div>

            {/* ── AI Insight ───────────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg">
              <div className="absolute right-4 top-4 opacity-20 pointer-events-none"><Sparkles className="w-20 h-20 text-white" /></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">AI Key Insight</div>
                    <div className="text-indigo-200 text-xs">Generated from real constituency data</div>
                  </div>
                </div>
                <p className="text-white text-sm leading-relaxed font-medium">{data.aiInsight}</p>
              </div>
            </div>

            {/* ── Local Projects ───────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Local Projects
                </h3>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold">Top {data.topProjects.length} by budget</span>
              </div>
              <div className="space-y-3">
                {data.topProjects.map((p: any, i: number) => {
                  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG["Not Started"];
                  const utilPct = p.allocated > 0 ? Math.round(p.spent / p.allocated * 100) : 0;
                  return (
                    <div key={p.id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono font-semibold">#{i + 1}</span>
                            <h4 className="text-sm font-bold text-slate-800 truncate">{p.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{p.scheme}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{formatCurrency(p.spent)} spent</span>
                        <span>{formatCurrency(p.allocated)} allocated</span>
                      </div>
                      <ProgressBar value={utilPct} color={cfg.bar} height="h-2" />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-400">Progress: {p.progress}%</span>
                        <span className={`font-semibold ${cfg.color}`}>{utilPct}% funds used</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                SECTION B · DETAILED BUDGET USAGE BREAKDOWN
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-emerald-500" />
                  Budget Usage Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Scheme-wise allocation vs actual spending for {constituency}</p>
              </div>

              <div className="p-5 space-y-6">
                {/* Top summary bar */}
                <div className="relative bg-slate-100 rounded-xl h-10 overflow-hidden flex">
                  {data.categories.map((cat: any, i: number) => {
                    const pct = data.summary.totalAllocated > 0 ? (cat.allocated / data.summary.totalAllocated) * 100 : 0;
                    return (
                      <div key={cat.name} title={`${cat.name}: ${formatCurrency(cat.allocated)}`}
                        className="h-10 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden transition-all"
                        style={{ width: `${pct}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], minWidth: pct > 3 ? undefined : 0 }}>
                        {pct > 5 ? cat.name.split(" ")[0] : ""}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 -mt-2">↑ Budget allocation by scheme (proportional width)</p>

                {/* Pie + scheme table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Donut — spending distribution */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Spending Distribution</div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={usagePieData.filter((d: any) => d.value > 0)} cx="50%" cy="50%"
                            innerRadius={60} outerRadius={95} paddingAngle={2} dataKey="value"
                            activeIndex={activePieIndex} activeShape={renderActiveShape}
                            onMouseEnter={(_: any, idx: number) => setActivePieIndex(idx)}>
                            {usagePieData.filter((d: any) => d.value > 0).map((d: any, i: number) => (
                              <Cell key={`usage-pie-cell-${i}`} fill={d.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Scheme-wise table */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Scheme-wise Breakdown</div>
                    <div className="space-y-3">
                      {data.categories.map((cat: any, i: number) => {
                        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                        const unutilized = cat.allocated - cat.spent;
                        return (
                          <div key={cat.name} className="rounded-xl border border-slate-100 p-3 hover:border-indigo-200 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{cat.count} project{cat.count !== 1 ? "s" : ""}</span>
                              </div>
                              <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${cat.utilization >= 75 ? "bg-emerald-100 text-emerald-700" : cat.utilization >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                {cat.utilization}%
                              </span>
                            </div>
                            {/* Stacked bar: spent + unutilized */}
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                              <div className="h-3 rounded-l-full transition-all duration-1000"
                                style={{ width: `${cat.utilization}%`, background: color }} />
                              <div className="h-3 flex-1 bg-slate-200" />
                            </div>
                            <div className="grid grid-cols-3 gap-1 mt-2">
                              <div className="text-center">
                                <div className="text-xs font-black text-slate-700">{formatCurrency(cat.allocated)}</div>
                                <div className="text-[10px] text-slate-400">Allocated</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-black" style={{ color }}>{formatCurrency(cat.spent)}</div>
                                <div className="text-[10px] text-slate-400">Spent</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-black text-amber-600">{formatCurrency(unutilized)}</div>
                                <div className="text-[10px] text-slate-400">Unused</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Comparative bar chart */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Allocated vs Spent vs Unused — Scheme Comparison</div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.categories} margin={{ top: 0, right: 10, bottom: 40, left: 10 }} barCategoryGap="25%">
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 10000000).toFixed(0)}Cr`} />
                        <Tooltip
                          formatter={(val: any, name: string) => [formatCurrency(val), name === "allocated" ? "Allocated" : name === "spent" ? "Spent" : "Unused"]}
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="allocated" fill="#E0E7FF" radius={[4, 4, 0, 0]} name="Allocated" />
                        <Bar dataKey="spent" radius={[4, 4, 0, 0]} name="Spent">
                          {data.categories.map((_: any, i: number) => <Cell key={`cat-bar-cell-${i}`} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ₹1 Cr breakdown strip */}
                <div className="bg-slate-900 rounded-xl p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">For Every ₹1 Cr Allocated in {constituency}</div>
                  <div className="space-y-2">
                    {data.categories.slice(0, 5).map((cat: any, i: number) => {
                      const sharePct = data.summary.totalAllocated > 0 ? (cat.allocated / data.summary.totalAllocated) * 100 : 0;
                      const shareLakh = (sharePct / 100) * 100; // in L per Cr
                      return (
                        <div key={cat.name} className="flex items-center gap-3">
                          <span className="w-36 text-xs text-slate-300 truncate flex-shrink-0">{cat.name}</span>
                          <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                            <div className="h-4 rounded-full flex items-center justify-end pr-1.5 transition-all duration-1000"
                              style={{ width: `${Math.max(sharePct, 3)}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>
                              <span className="text-[10px] font-bold text-white">₹{shareLakh.toFixed(0)}L</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-300 w-10 flex-shrink-0">{sharePct.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Popular areas ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Explore Other Areas</h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR.filter(c => c !== constituency).map(c => (
                  <button key={c} onClick={() => setConstituency(c)}
                    className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 rounded-lg px-3 py-1.5 font-medium transition-all">
                    <MapPin className="w-3 h-3" /> {c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}