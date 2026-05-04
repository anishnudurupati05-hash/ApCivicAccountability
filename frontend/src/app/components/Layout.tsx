import { Outlet } from "react-router";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import { Menu, Bell, Search, Database, AlertTriangle, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router";

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/mlas?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar collapsed={false} onToggle={() => {}} mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white w-72 transition-all"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-medium">{t.liveStatus}</span>
            </div>
            <button
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title={t.notifications}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
              AP
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>

          {/* Site-wide Footer */}
          <footer className="bg-[#1E3A5F] text-white mt-auto flex-shrink-0">
            <div className="px-6 py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-amber-400">AP Civic Tracker — Open Data Initiative</div>
                  <p className="text-slate-300 text-xs mt-1 max-w-md">
                    Built to increase transparency and accountability in Andhra Pradesh. 
                    This is an independent civic platform. Not affiliated with AP Government.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <Link to="/data-sources" className="text-slate-300 hover:text-amber-400 flex items-center gap-1 transition-colors">
                    <Database className="w-3.5 h-3.5" /> Data Sources
                  </Link>
                  <Link to="/reports" className="text-slate-300 hover:text-amber-400 flex items-center gap-1 transition-colors">
                    <AlertTriangle className="w-3.5 h-3.5" /> Report an Error
                  </Link>
                  <span className="text-slate-500">v2.0 · April 2026</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}