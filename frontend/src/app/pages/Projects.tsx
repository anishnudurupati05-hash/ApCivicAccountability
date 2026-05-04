import { useEffect, useState, useCallback } from "react";
import { api, Project, formatCurrency, STATUS_COLORS } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  FolderKanban, MapPin, CheckCircle2, Clock, AlertCircle,
  XCircle, Filter, Search, TrendingUp, ChevronLeft, ChevronRight
} from "lucide-react";

const DISTRICTS = [
  "Srikakulam", "Vizianagaram", "Visakhapatnam", "East Godavari",
  "West Godavari", "Krishna", "Guntur", "Prakasam", "SPSR Nellore",
  "Kurnool", "YSR Kadapa", "Anantapur", "Chittoor"
];
const STATUSES = ["Completed", "In Progress", "Not Started", "Delayed"];
const STATUS_FILL: Record<string, string> = {
  "Completed": "#10B981",
  "In Progress": "#3B82F6",
  "Not Started": "#94A3B8",
  "Delayed": "#EF4444",
};
const STATUS_ICON: Record<string, any> = {
  "Completed": CheckCircle2,
  "In Progress": Clock,
  "Not Started": AlertCircle,
  "Delayed": XCircle,
};

function ProjectCard({ project }: { project: Project }) {
  const StatusIcon = STATUS_ICON[project.status] || AlertCircle;
  const statusCls = STATUS_COLORS[project.status] || "bg-gray-100 text-gray-600";
  const progressColor =
    project.status === "Completed" ? "bg-green-500" :
    project.status === "In Progress" ? "bg-blue-500" :
    project.status === "Delayed" ? "bg-red-400" : "bg-slate-300";

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug flex-1">{project.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1 ${statusCls}`}>
          <StatusIcon className="w-3 h-3" />
          {project.status}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>{project.constituency} · {project.district}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <FolderKanban className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>{project.scheme}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span className="font-medium">{project.progress_percent}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progressColor} transition-all`}
            style={{ width: `${project.progress_percent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-slate-400">Allocated</div>
          <div className="font-semibold text-slate-700">{formatCurrency(project.allocated_amount)}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-slate-400">Spent</div>
          <div className="font-semibold text-blue-700">{formatCurrency(project.spent_amount)}</div>
        </div>
      </div>
    </div>
  );
}

function MapView({ projects }: { projects: Project[] }) {
  // AP bounding box approx: lat 12.5–19.5, lng 76.5–84.5
  const mapW = 600, mapH = 400;
  const latMin = 12.5, latMax = 19.5, lngMin = 76.5, lngMax = 84.5;

  const toX = (lng: number) => ((lng - lngMin) / (lngMax - lngMin)) * mapW;
  const toY = (lat: number) => mapH - ((lat - latMin) / (latMax - latMin)) * mapH;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-hidden">
      <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-amber-500" /> Project Locations Map — Andhra Pradesh
      </h2>
      <div className="overflow-x-auto">
        <svg width={mapW} height={mapH} className="bg-blue-50 rounded-lg border border-blue-100" style={{ minWidth: mapW }}>
          {/* AP outline approximation */}
          <rect x={0} y={0} width={mapW} height={mapH} fill="#EFF6FF" rx={8} />
          <text x={mapW / 2} y={mapH / 2} textAnchor="middle" fill="#CBD5E1" fontSize={32} fontWeight="bold" opacity={0.3}>
            Andhra Pradesh
          </text>
          {/* Plot projects */}
          {projects.map(p => {
            if (!p.latitude || !p.longitude) return null;
            const x = toX(p.longitude);
            const y = toY(p.latitude);
            const color = STATUS_FILL[p.status] || "#94A3B8";
            return (
              <g key={p.id}>
                <circle cx={x} cy={y} r={6} fill={color} opacity={0.8} stroke="white" strokeWidth={1.5}>
                  <title>{p.name} ({p.constituency}) — {p.status}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {STATUSES.map(s => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_FILL[s] }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map" | "list">("grid");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  const fetchProjects = useCallback(() => {
    setLoading(true);
    setError("");
    api.getProjects({
      district: district || undefined,
      status: status || undefined,
      limit: 500,
      offset: 0,
    })
      .then(res => {
        setTotal(res.total);
        let data = res.data as Project[];
        if (search) {
          const q = search.toLowerCase();
          data = data.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.constituency.toLowerCase().includes(q) ||
            p.scheme.toLowerCase().includes(q)
          );
        }
        setProjects(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [district, status, search]);

  useEffect(() => {
    fetchProjects();
    setPage(1);
  }, [fetchProjects]);

  const completed  = projects.filter(p => p.status === "Completed").length;
  const inProgress = projects.filter(p => p.status === "In Progress").length;
  const notStarted = projects.filter(p => p.status === "Not Started").length;
  const delayed    = projects.filter(p => p.status === "Delayed").length;

  const pieData = [
    { name: "Completed", value: completed,  fill: "#10B981" },
    { name: "In Progress", value: inProgress, fill: "#3B82F6" },
    { name: "Not Started", value: notStarted, fill: "#94A3B8" },
    { name: "Delayed", value: delayed,     fill: "#EF4444" },
  ].filter(d => d.value > 0);

  const districtStats = DISTRICTS.map(d => ({
    district: d.length > 8 ? d.slice(0, 8) + "…" : d,
    fullName: d,
    total: projects.filter(p => p.district === d).length,
    completed: projects.filter(p => p.district === d && p.status === "Completed").length,
  })).filter(d => d.total > 0);

  const totalPages = Math.ceil(projects.length / PAGE_SIZE);
  const paginated = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500">Loading projects...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        Error: {error}
        <button onClick={fetchProjects} className="ml-3 underline">Retry</button>
      </div>
    </div>
  );

  const { t } = useLanguage();

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-500" /> Project Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Constituency-level development projects across Andhra Pradesh
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          {total} Total Projects
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Completed", value: completed,  icon: CheckCircle2, color: "bg-green-500", text: "text-green-600", bg: "bg-green-50" },
          { label: "In Progress", value: inProgress, icon: Clock, color: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50" },
          { label: "Not Started", value: notStarted, icon: AlertCircle, color: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" },
          { label: "Delayed", value: delayed,     icon: XCircle, color: "bg-red-500", text: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, icon: Icon, color, text, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-white shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className={`text-2xl font-black ${text}`}>{value}</div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                {pieData.map((entry, i) => <Cell key={`projects-pie-cell-${i}-${entry.fill}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="text-slate-600">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">District-wise Projects</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={districtStats} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="district" tick={{ fontSize: 10, fill: "#64748B" }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip labelFormatter={(l, p) => p?.[0]?.payload?.fullName || l} />
              <Legend />
              <Bar dataKey="total" fill="#DBEAFE" stroke="#3B82F6" name="Total" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project or constituency..."
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
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1 ml-auto">
          {(["grid", "map", "list"] as const).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                viewMode === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && <MapView projects={projects} />}

      {/* Grid View */}
      {viewMode === "grid" && (
        <>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, projects.length)}–{Math.min(page * PAGE_SIZE, projects.length)} of {projects.length} projects
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Constituency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Scheme</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Allocated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 100).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-slate-700 font-medium text-xs leading-snug max-w-xs">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" /> {p.constituency}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{p.scheme}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-600 hidden lg:table-cell">{formatCurrency(p.allocated_amount)}</td>
                    <td className="px-4 py-3 text-right text-xs text-blue-600 hidden lg:table-cell">{formatCurrency(p.spent_amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full hidden sm:block">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${p.progress_percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{p.progress_percent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}