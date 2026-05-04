import { useLanguage, Language } from "../contexts/LanguageContext";

const LANGUAGES: { code: Language; label: string; short: string; flag: string }[] = [
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { code: "te", label: "తెలుగు", short: "తె", flag: "🏛️" },
  { code: "hi", label: "हिन्दी", short: "हि", flag: "🇮🇳" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
      {LANGUAGES.map(({ code, label, short }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          title={label}
          className={`
            relative px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200
            ${language === code
              ? "bg-white text-amber-700 shadow-sm border border-amber-200 ring-1 ring-amber-300/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
            }
          `}
        >
          {short}
          {language === code && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
