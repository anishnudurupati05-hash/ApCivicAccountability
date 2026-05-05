import { useState } from "react";
import { Landmark, Copy, CheckCircle2 } from "lucide-react";

interface TagMinisterProps {
  issueId: number;
  title: string;
  constituency: string;
  category: string;
  description?: string;
  upvotes: number;
}

interface Minister {
  role: string;
  name: string;
  party: "TDP" | "JSP" | "BJP" | "YSRCP" | "—";
}

const CM: Minister = { role: "Chief Minister", name: "N. Chandrababu Naidu", party: "TDP" };
const DCM: Minister = { role: "Deputy CM", name: "K. Pawan Kalyan", party: "JSP" };
const GOVERNOR: Minister = { role: "Governor", name: "S. Abdul Nazeer", party: "—" };

const CATEGORY_TO_MINISTERS: Record<string, Minister[]> = {
  Roads: [CM, { role: "Roads & Buildings", name: "B.C. Janardhan Reddy", party: "TDP" }],
  Water: [CM, { role: "Water Resources", name: "Nimmala Ramanaidu", party: "TDP" }, DCM],
  Education: [CM, { role: "Education & IT", name: "Nara Lokesh", party: "TDP" }],
  Healthcare: [CM, { role: "Health & Family Welfare", name: "Satya Kumar Yadav", party: "BJP" }],
  Safety: [CM, { role: "Home", name: "V. Anitha", party: "TDP" }],
  Housing: [CM, { role: "Housing", name: "Kolusu Parthasarathy", party: "TDP" }],
  Sanitation: [{ role: "Municipal Administration", name: "P. Narayana", party: "TDP" }, DCM],
  Agriculture: [CM, { role: "Agriculture", name: "K. Atchannaidu", party: "TDP" }],
  Transport: [CM, { role: "Transport", name: "M. Ramprasad Reddy", party: "TDP" }],
  Infrastructure: [CM, { role: "Roads & Buildings", name: "B.C. Janardhan Reddy", party: "TDP" }],
  Employment: [CM, { role: "Labour & Employment", name: "Vasamsetti Subhash", party: "JSP" }],
  "Disaster Relief": [CM, { role: "Home", name: "V. Anitha", party: "TDP" }],
  Other: [CM, GOVERNOR],
};

const PARTY_DOT: Record<string, string> = {
  TDP: "bg-yellow-400",
  JSP: "bg-orange-500",
  BJP: "bg-amber-600",
  YSRCP: "bg-sky-500",
  "—": "bg-slate-400",
};

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.85 11.85 0 0012.06 0C5.5 0 .17 5.34.17 11.91c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.65a11.86 11.86 0 005.79 1.49h.01c6.56 0 11.9-5.34 11.9-11.91 0-3.18-1.24-6.17-3.45-8.45zM12.07 21.5h-.01a9.6 9.6 0 01-4.89-1.34l-.35-.21-3.72.97 1-3.62-.23-.37a9.55 9.55 0 01-1.48-5.12c0-5.29 4.31-9.6 9.62-9.6 2.57 0 4.98 1 6.79 2.81a9.55 9.55 0 012.81 6.79c0 5.29-4.31 9.6-9.54 9.69zm5.27-7.18c-.29-.14-1.71-.85-1.97-.94-.27-.1-.46-.14-.65.14-.19.29-.74.94-.91 1.13-.17.19-.34.21-.62.07-.29-.14-1.21-.45-2.31-1.42-.85-.76-1.43-1.7-1.6-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.5l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.39 0 1.41 1.03 2.78 1.17 2.97.14.19 2.03 3.1 4.92 4.34.69.3 1.22.48 1.64.61.69.22 1.31.19 1.81.12.55-.08 1.71-.7 1.95-1.38.24-.68.24-1.27.17-1.39-.07-.12-.26-.19-.55-.33z" />
    </svg>
  );
}

export function TagMinister({
  issueId, title, constituency, category, description, upvotes,
}: TagMinisterProps) {
  const [copied, setCopied] = useState(false);

  const ministers = CATEGORY_TO_MINISTERS[category] || CATEGORY_TO_MINISTERS.Other;

  const trimmedDesc = (description || "").slice(0, 280);
  const ministerLines = ministers.map(m => `• ${m.role} — ${m.name}${m.party !== "—" ? ` (${m.party})` : ""}`).join("\n");
  const issueLink = `https://ap-civic-tracker.app/speak-up?issue=${issueId}`;

  const cardText =
    `🏛️ ${title}\n` +
    `📍 ${constituency}  ·  🏷️ ${category}\n\n` +
    (trimmedDesc ? `${trimmedDesc}${(description || "").length > 280 ? "…" : ""}\n\n` : "") +
    `⬆️ ${upvotes} citizens upvoted this issue.\n\n` +
    `Tagged for accountability:\n${ministerLines}\n\n` +
    `Read more & add your voice → ${issueLink}\n\n` +
    `#APCivicTracker · Citizens Demand Action`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(cardText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      data-testid={`tag-minister-strip-${issueId}`}
      className="bg-gradient-to-r from-indigo-50 via-white to-violet-50 border border-indigo-100 rounded-xl px-3.5 py-3 mt-3"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2">
        <Landmark className="w-3.5 h-3.5" />
        Tag the Responsible Minister
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {ministers.map(m => (
          <span
            key={`${m.role}-${m.name}`}
            data-testid={`tag-minister-pill-${issueId}-${m.role.replace(/\s+/g, "-").toLowerCase()}`}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${PARTY_DOT[m.party]}`} />
            <span className="font-semibold">{m.role}</span>
            <span className="text-slate-400">·</span>
            <span>{m.name}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          data-testid={`tag-minister-whatsapp-${issueId}`}
          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          Share on WhatsApp
        </a>

        <button
          type="button"
          onClick={handleCopy}
          data-testid={`tag-minister-copy-${issueId}`}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy card
            </>
          )}
        </button>

        <span className="ml-auto text-[10px] text-slate-400 hidden sm:inline">
          Auto-tagged by category
        </span>
      </div>
    </div>
  );
}
