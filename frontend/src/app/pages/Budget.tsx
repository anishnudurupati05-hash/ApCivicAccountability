import { useState, useEffect } from "react";
import { api, Budget as BudgetItem, formatCurrency } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

function BudgetBar({ label, allocated, spent, pct }: { label: string; allocated: number; spent: number; pct: number }) {
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-slate-700 text-sm">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">Allocated: {formatCurrency(allocated)}</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-black ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-500"}`}>{pct}%</span>
          <p className="text-xs text-slate-400">utilized</p>
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Spent: {formatCurrency(spent)}</span>
        <span>Balance: {formatCurrency(allocated - spent)}</span>
      </div>
    </div>
  );
}

export function Budget() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getBudgets()
      .then(res => setBudgets(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-6"><div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div></div>
  );

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated_amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent_amount, 0);
  const overallUtil = Math.round((totalSpent / totalAllocated) * 100);

  const barData = budgets.map(b => ({
    name: b.department.length > 10 ? b.department.slice(0, 10) + "..." : b.department,
    fullName: b.department,
    Allocated: Math.round(b.allocated_amount / 10000000),
    Spent: Math.round(b.spent_amount / 10000000),
  }));

  const pieData = budgets.map((b, i) => ({
    name: b.department,
    value: Math.round(b.allocated_amount / 10000000),
  }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-amber-500" /> Budget Tracking
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Allocated vs Spent — FY 2024–25</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Allocated</div>
          <div className="text-3xl font-black text-slate-800 mt-1">{formatCurrency(totalAllocated)}</div>
          <div className="text-xs text-slate-400 mt-1">Across 8 departments</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Spent</div>
          <div className="text-3xl font-black text-blue-600 mt-1">{formatCurrency(totalSpent)}</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> {overallUtil}% of budget utilized
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Balance Remaining</div>
          <div className="text-3xl font-black text-amber-600 mt-1">{formatCurrency(totalAllocated - totalSpent)}</div>
          <div className="text-xs text-slate-400 mt-1">{100 - overallUtil}% unspent</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Allocated vs Spent by Department (₹ Cr)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip
                formatter={(v, n) => [`₹${v} Cr`, n]}
                labelFormatter={(l, payload) => payload?.[0]?.payload?.fullName || l}
              />
              <Legend />
              <Bar dataKey="Allocated" fill="#DBEAFE" stroke="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Allocation Share</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value">
                {pieData.map((entry, i) => <Cell key={`budget-pie-cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v} Cr`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1 overflow-y-auto max-h-40">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600 truncate flex-1">{d.name}</span>
                <span className="font-medium text-slate-700">₹{d.value}Cr</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Department-wise Budget Utilization</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {budgets.map(b => (
            <BudgetBar
              key={b.id}
              label={b.department}
              allocated={b.allocated_amount}
              spent={b.spent_amount}
              pct={b.utilization_percent}
            />
          ))}
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-700">Scheme-wise Budget Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Scheme</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Allocated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Spent</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Balance</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{b.scheme}</td>
                  <td className="px-4 py-3 text-slate-500">{b.department}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(b.allocated_amount)}</td>
                  <td className="px-4 py-3 text-right font-medium text-blue-600">{formatCurrency(b.spent_amount)}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(b.allocated_amount - b.spent_amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {b.utilization_percent >= 70
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <AlertCircle className="w-4 h-4 text-amber-500" />}
                      <span className={`text-xs font-bold ${b.utilization_percent >= 70 ? "text-green-600" : b.utilization_percent >= 40 ? "text-amber-600" : "text-red-500"}`}>
                        {b.utilization_percent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}