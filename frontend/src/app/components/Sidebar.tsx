import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard, Users, Trophy, IndianRupee,
  FolderKanban, ScrollText, FileText, Menu, X,
  MapPin, Newspaper, ChevronRight, GitCompare, Megaphone,
  Bot, Banknote, CalendarDays, TrendingUp, Database
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/mlas", label: "MLA Directory", icon: Users },
      { path: "/rankings", label: "Rankings", icon: Trophy },
      { path: "/attendance", label: "Attendance", icon: CalendarDays, badge: "NEW" },
    ],
  },
  {
    label: "Accountability",
    items: [
      { path: "/promises", label: "Promises", icon: ScrollText },
      { path: "/budget", label: "Budget Tracking", icon: IndianRupee },
      { path: "/projects", label: "Projects Map", icon: FolderKanban },
      { path: "/assets", label: "Asset Declarations", icon: TrendingUp },
    ],
  },
  {
    label: "Citizen Tools",
    items: [
      { path: "/compare", label: "Compare Areas", icon: GitCompare },
      { path: "/tax-area", label: "Tax in My Area", icon: Banknote },
      { path: "/ai-chat", label: "Ask AI", icon: Bot },
      { path: "/speak-up", label: "Speak Up", icon: Megaphone },
      { path: "/reports", label: "Citizen Reports", icon: FileText },
    ],
  },
  {
    label: "Platform",
    items: [
      { path: "/news", label: "News & Updates", icon: Newspaper },
      { path: "/data-sources", label: "Data Sources", icon: Database },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, mobile, onClose }: SidebarProps) {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <aside
      className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 ${
        mobile ? "w-72" : collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 min-h-[64px]">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <div className="font-bold text-sm leading-tight">AP Civic Tracker</div>
              <div className="text-xs text-slate-400 leading-tight">Andhra Pradesh</div>
            </div>
          </div>
        )}
        {collapsed && !mobile && (
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center mx-auto">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        )}
        {mobile ? (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* 175 MLAs badge */}
      {(!collapsed || mobile) && (
        <div className="mx-3 mt-3 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
          <div className="text-xs text-amber-300 font-medium">{t.allMlasLoaded}</div>
          <div className="text-xs text-slate-400">{t.districts} · {t.parties}</div>
        </div>
      )}

      {/* Navigation with sections */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            {/* Section label */}
            {(!collapsed || mobile) && (
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
                {section.label}
              </div>
            )}
            {collapsed && !mobile && (
              <div className="w-full h-px bg-slate-700 my-2" />
            )}

            {/* Section items */}
            <div className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon, badge }: any) => {
                const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-amber-500 text-white shadow-md"
                        : "text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                    {(!collapsed || mobile) && (
                      <span className="truncate flex-1">{label}</span>
                    )}
                    {(!collapsed || mobile) && badge && !isActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500 text-white font-bold flex-shrink-0">
                        {badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {(!collapsed || mobile) && (
        <div className="px-4 py-3 border-t border-slate-700">
          <div className="text-xs text-slate-500">{t.assemblyLabel}</div>
          <div className="text-xs text-slate-600">{t.legislativeAssembly} · v2.0</div>
        </div>
      )}
    </aside>
  );
}
