import { Link } from "react-router";
import { Database, CheckCircle2, RefreshCw, AlertTriangle, ExternalLink, Github, Mail, FileText } from "lucide-react";

const DATA_TABLE = [
  { dataPoint: "MLA Names & Constituencies", source: "AP Election Commission 2024", status: "verified", coverage: "175/175" },
  { dataPoint: "Party Affiliations", source: "AP Legislature Official Records", status: "verified", coverage: "175/175" },
  { dataPoint: "District Boundaries", source: "Census of India 2011", status: "verified", coverage: "13/13" },
  { dataPoint: "Budget Allocations", source: "AP Finance Department 2024-25", status: "estimated", coverage: "Modelled" },
  { dataPoint: "Project Status", source: "PMGSY + District Records", status: "estimated", coverage: "Modelled" },
  { dataPoint: "Promise Tracking", source: "Party Manifestos 2024", status: "partial", coverage: "Modelled" },
  { dataPoint: "Sentiment Scores", source: "AI Model (GPT-4o-mini)", status: "synthetic", coverage: "Modelled" },
  { dataPoint: "News Articles", source: "AI Generated", status: "synthetic", coverage: "Demo only" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
      <CheckCircle2 className="w-3 h-3" /> Verified
    </span>
  );
  if (status === "estimated") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
      <RefreshCw className="w-3 h-3" /> Estimated
    </span>
  );
  if (status === "partial") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
      <RefreshCw className="w-3 h-3" /> Partial
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
      <AlertTriangle className="w-3 h-3" /> Synthetic
    </span>
  );
}

export function DataSources() {
  return (
    <div className="p-4 lg:p-6 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Data Sources</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-500" /> Our Data &amp; Methodology
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Transparency about what is real, estimated, and modelled in this platform
        </p>
      </div>

      {/* Honesty disclaimer */}
      <div className="bg-[#1E3A5F] rounded-2xl p-6 text-white">
        <h2 className="text-base font-bold mb-2 text-amber-300">📋 Our Commitment to Transparency</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          AP Civic Tracker is an independent civic platform built to increase accountability in Andhra Pradesh.
          We clearly distinguish between <strong className="text-white">verified real data</strong> and <strong className="text-white">modelled/synthetic data</strong>.
          Where data is not yet real, we model it based on publicly available patterns and clearly label it as such.
          This page explains exactly what is real, what is estimated, and how our scoring works.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { icon: "✅", label: "Verified", desc: "From official government sources" },
            { icon: "🔄", label: "Estimated", desc: "Modelled from available patterns" },
            { icon: "⚠️", label: "Synthetic", desc: "AI-generated for demonstration" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-white/10 rounded-xl px-3 py-2">
              <div className="text-sm font-bold">{icon} {label}</div>
              <div className="text-xs text-slate-300">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-base">Data Sources Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Data Point</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Source</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DATA_TABLE.map((row) => (
                <tr key={row.dataPoint} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{row.dataPoint}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs hidden md:table-cell">{row.source}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold ${row.coverage.includes("/") ? "text-green-700" : "text-slate-500"}`}>
                      {row.coverage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Formula */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-bold text-slate-700 text-base mb-4 flex items-center gap-2">
          <span className="text-amber-500 text-lg">📐</span> Scoring Formula
        </h2>
        <div className="bg-slate-900 rounded-xl p-5 font-mono text-sm text-white overflow-x-auto">
          <div className="text-slate-400 mb-2">{"/* MLA Performance Score (out of 200) */"}</div>
          <div className="text-green-400">Score</div>
          <div className="text-slate-300 pl-4">= (Completed Projects × 5)</div>
          <div className="text-blue-300 pl-4">+ (In Progress × 2)</div>
          <div className="text-red-400 pl-4">− (Not Started × 3)</div>
          <div className="text-amber-300 pl-4">+ Budget Utilization %</div>
          <div className="text-purple-300 pl-4">+ Sentiment Score</div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { range: "≥ 140 / 200", label: "High Performer", color: "bg-green-50 border-green-200 text-green-700" },
            { range: "100–139 / 200", label: "Average Performer", color: "bg-amber-50 border-amber-200 text-amber-700" },
            { range: "< 100 / 200", label: "Needs Improvement", color: "bg-red-50 border-red-200 text-red-700" },
          ].map(({ range, label, color }) => (
            <div key={label} className={`${color} border rounded-xl p-3 text-center`}>
              <div className="text-base font-black">{range}</div>
              <div className="text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Quality Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h2 className="font-bold text-amber-800 text-sm mb-2">⚠️ Important Note on Data Quality</h2>
        <p className="text-amber-700 text-sm leading-relaxed">
          Budget allocations, project statuses, and promise fulfillment data are <strong>modelled estimates</strong> based
          on historical patterns from AP state government records, PMGSY data, and district-level reports.
          Real-time verified data integration is planned for future versions. Sentiment scores are generated by
          AI and should not be treated as ground truth. News articles on this platform are AI-generated
          for demonstration purposes only.
        </p>
        <p className="text-amber-600 text-xs mt-2">
          Real affidavit data is available at <a href="https://affidavit.eci.gov.in" target="_blank" rel="noopener" className="underline hover:text-amber-800">affidavit.eci.gov.in</a>
        </p>
      </div>

      {/* How You Can Help */}
      <div>
        <h2 className="font-bold text-slate-700 text-lg mb-4">🤝 How You Can Help Improve This Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <FileText className="w-6 h-6 text-blue-600" />,
              title: "Submit RTI Data",
              desc: "If you've filed an RTI and received official data about your constituency's projects or budget, share it with us to improve accuracy.",
              action: "Submit RTI Response",
              href: "/reports",
              bg: "bg-blue-50 border-blue-200",
            },
            {
              icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
              title: "Report Inaccuracies",
              desc: "Found incorrect MLA information, wrong party affiliation, or outdated data? Report it and help us maintain credibility.",
              action: "Report an Error",
              href: "/reports",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              icon: <Github className="w-6 h-6 text-slate-700" />,
              title: "Contribute on GitHub",
              desc: "This platform will be open-sourced. Developers and data scientists can contribute to real-time data pipelines and APIs.",
              action: "GitHub (Coming Soon)",
              href: "#",
              bg: "bg-slate-50 border-slate-200",
            },
          ].map(({ icon, title, desc, action, href, bg }) => (
            <div key={title} className={`${bg} border rounded-2xl p-5`}>
              <div className="mb-3">{icon}</div>
              <h3 className="font-bold text-slate-700 text-sm mb-2">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">{desc}</p>
              <Link to={href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-white border border-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                {action} <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Last updated: <strong className="text-slate-700">April 2026</strong> · Platform version <strong className="text-slate-700">v2.0</strong> ·
          <Link to="/reports" className="ml-1 text-amber-600 hover:underline">Report an error</Link>
        </p>
      </div>
    </div>
  );
}
