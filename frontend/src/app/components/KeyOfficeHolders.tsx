import { Crown, Star, Shield, Landmark, ExternalLink } from "lucide-react";

interface Leader {
  role: string;
  name: string;
  party: "TDP" | "JSP" | "BJP" | "YSRCP" | "—";
  portfolio: string;
  icon: typeof Crown;
  gradient: string;
  testid: string;
}

const PARTY_BADGE: Record<string, string> = {
  TDP: "bg-yellow-100 text-yellow-800 border-yellow-300",
  JSP: "bg-orange-100 text-orange-800 border-orange-300",
  BJP: "bg-amber-100 text-amber-800 border-amber-300",
  YSRCP: "bg-sky-100 text-sky-800 border-sky-300",
  "—": "bg-slate-200 text-slate-700 border-slate-300",
};

const PARTY_DOT: Record<string, string> = {
  TDP: "bg-yellow-400",
  JSP: "bg-orange-500",
  BJP: "bg-amber-600",
  YSRCP: "bg-sky-500",
  "—": "bg-slate-400",
};

const LEADERS: Leader[] = [
  {
    role: "Chief Minister",
    name: "N. Chandrababu Naidu",
    party: "TDP",
    portfolio: "Head of Government · 16th Legislative Assembly",
    icon: Crown,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    testid: "leader-cm",
  },
  {
    role: "Deputy Chief Minister",
    name: "K. Pawan Kalyan",
    party: "JSP",
    portfolio: "Panchayati Raj · Rural Development · Environment",
    icon: Star,
    gradient: "from-orange-500 via-red-500 to-rose-500",
    testid: "leader-dcm",
  },
  {
    role: "Home Minister",
    name: "V. Anitha",
    party: "TDP",
    portfolio: "Home · Disaster Management",
    icon: Shield,
    gradient: "from-indigo-500 via-violet-500 to-purple-600",
    testid: "leader-home",
  },
  {
    role: "Governor",
    name: "S. Abdul Nazeer",
    party: "—",
    portfolio: "Constitutional Head of the State",
    icon: Landmark,
    gradient: "from-slate-600 via-slate-700 to-slate-800",
    testid: "leader-governor",
  },
];

function initials(name: string): string {
  // Drop initials prefix (N., S., V., K.) — take last word + first surname
  const parts = name.replace(/[A-Z]\.\s?/g, "").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function KeyOfficeHolders() {
  return (
    <section
      data-testid="key-office-holders"
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 shadow-xl border border-slate-800/50 overflow-hidden relative"
    >
      {/* Decorative grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "12px 12px" }}
      />

      <div className="relative flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-1">
            <Landmark className="w-3.5 h-3.5" />
            Key Office Holders · FY 2025–26
          </div>
          <h2 className="text-white text-lg font-black leading-tight">Andhra Pradesh Government Leadership</h2>
          <p className="text-slate-400 text-xs mt-0.5">16th Legislative Assembly · Constitutional & Cabinet Heads</p>
        </div>
        <a
          href="https://aplegislature.org"
          target="_blank"
          rel="noreferrer"
          data-testid="leadership-source-link"
          className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          aplegislature.org
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LEADERS.map(L => {
          const Icon = L.icon;
          return (
            <div
              key={L.role}
              data-testid={L.testid}
              className="group relative bg-slate-800/60 hover:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/60 p-4 transition-all duration-300 overflow-hidden"
            >
              {/* Hover shimmer */}
              <span className={`absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r ${L.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

              {/* Role pill */}
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">
                <Icon className="w-3.5 h-3.5 text-amber-400" />
                {L.role}
              </div>

              {/* Avatar + name */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${L.gradient} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                  <span className="ring-2 ring-white/20 rounded-xl absolute inset-0" />
                  {initials(L.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white leading-tight">{L.name}</div>
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${PARTY_BADGE[L.party]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${PARTY_DOT[L.party]}`} />
                    {L.party === "—" ? "Constitutional" : L.party}
                  </span>
                </div>
              </div>

              {/* Portfolio */}
              <p className="text-xs text-slate-300 leading-relaxed">{L.portfolio}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
