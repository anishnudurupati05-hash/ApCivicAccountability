import { useState, useRef, useEffect } from "react";
import { api, MLAWithMetrics } from "../lib/api";
import {
  Bot, Send, MapPin, Sparkles, ChevronDown,
  User, Loader2, RefreshCw, Lightbulb, X, Search, AlertCircle,
  TrendingUp, CheckCircle2, BarChart2, WifiOff
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: Date;
  isError?: boolean;
  isFallback?: boolean;
  fallbackData?: {
    mlaName: string;
    constituency: string;
    score: number;
    completed: number;
    budgetUtil: number;
    party: string;
  };
}

const SUGGESTED_QUESTIONS = [
  { text: "Why are roads bad in my area?", icon: "🛣️" },
  { text: "What did my MLA promise?", icon: "📋" },
  { text: "How is budget being spent here?", icon: "💰" },
  { text: "Which projects are delayed?", icon: "⚠️" },
  { text: "How does my area compare to others?", icon: "📊" },
  { text: "What schemes are available for farmers?", icon: "🌾" },
  { text: "Is water supply improving?", icon: "💧" },
  { text: "What is the MLA's performance score?", icon: "⭐" },
];

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Namaste! 🙏 I'm your AP Civic AI — powered by real data from all 175 constituencies in Andhra Pradesh.\n\nSelect your constituency below and ask me anything about your MLA, local projects, budget spending, or public schemes.\n\n*Try: \"Why are roads bad in my area?\" or \"What did my MLA promise?\"*",
  timestamp: new Date(),
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [constituency, setConstituency] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [allConstituencies, setAllConstituencies] = useState<string[]>([]);
  const [mlaCache, setMlaCache] = useState<MLAWithMetrics | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load constituency list
  useEffect(() => {
    api.getConstituencies()
      .then(res => setAllConstituencies(res.data.map(c => c.name).sort()))
      .catch(() => {});
  }, []);

  // Pre-fetch MLA data when constituency changes (for fallback card)
  useEffect(() => {
    if (!constituency) { setMlaCache(null); return; }
    api.getMlaByConstituency(constituency)
      .then(mla => setMlaCache(mla))
      .catch(() => setMlaCache(null));
  }, [constituency]);

  const filteredConstituencies = allConstituencies.filter(c =>
    c.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    setMessages(prev => [
      ...prev,
      { ...msg, id: `${msg.role}-${Date.now()}-${Math.random()}`, timestamp: new Date() },
    ]);
  };

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading) return;

    // Clear input immediately
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    // Add user bubble
    addMessage({ role: "user", content: text });
    setIsLoading(true);

    // Create a fresh AbortController with 30s timeout
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      // Build constituency-aware system context locally so the LLM has data
      let systemContext: string | undefined;
      if (constituency && mlaCache) {
        const totalBudget = (mlaCache.projects ?? []).reduce((s: number, p: any) => s + (p.allocated_amount || 0), 0);
        const totalSpent = (mlaCache.projects ?? []).reduce((s: number, p: any) => s + (p.spent_amount || 0), 0);
        const completed = (mlaCache.projects ?? []).filter((p: any) => p.status === "Completed").length;
        const delayed = (mlaCache.projects ?? []).filter((p: any) => p.status === "Delayed").length;
        const efficiency = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const projectExamples = (mlaCache.projects ?? []).slice(0, 5).map((p: any) =>
          `${p.name} — ${p.status} (${Math.round((p.spent_amount / Math.max(p.allocated_amount, 1)) * 100)}% spent)`
        ).join("; ");
        const newsHeadlines = (mlaCache.news ?? []).slice(0, 5).map((n: any) => `"${n.title}" (${n.sentiment})`).join("; ");
        const promiseSummary = (mlaCache.promises ?? []).slice(0, 5).map((p: any) =>
          `${p.description} [${p.status || "Pending"}]`
        ).join("; ");

        systemContext = `You are an AI assistant for AP Civic Tracker, a civic accountability platform for Andhra Pradesh, India.

CONSTITUENCY CONTEXT — ${mlaCache.constituency}:
- MLA: ${mlaCache.name} (${mlaCache.party}), ${mlaCache.district} District
- Total Projects: ${(mlaCache.projects ?? []).length} (${completed} completed, ${delayed} delayed)
- Budget Allocated: ₹${(totalBudget / 10000000).toFixed(1)} Cr | Spent: ₹${(totalSpent / 10000000).toFixed(1)} Cr | Efficiency: ${efficiency}%
- Score: ${mlaCache.score}/200 | Rank: ${mlaCache.rank ?? "N/A"}/175

Recent News Headlines: ${newsHeadlines}

Party Promises (${mlaCache.party}): ${promiseSummary}

Project Examples: ${projectExamples}

Answer questions about this constituency clearly and helpfully. Connect questions about roads, water, health and education to the actual data above. Be conversational, empathetic, and fact-based. Use ₹ for currency. Keep answers under 150 words.`;
      }

      const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/ai/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          system_context: systemContext,
          history,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => `HTTP ${res.status}`);
        console.error("AI chat error:", errText);
        throw new Error(`server_error:${res.status}`);
      }

      const data = await res.json();

      if (data.error) throw new Error("server_error:response");
      if (!data.reply) throw new Error("server_error:empty");

      addMessage({ role: "assistant", content: data.reply });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      // Show graceful fallback card instead of raw error (FIX 2)
      addMessage({
        role: "assistant",
        content: isTimeout
          ? "The AI took too long to respond (30s timeout)."
          : "The AI encountered a temporary issue.",
        isError: true,
        isFallback: true,
        fallbackData: mlaCache ? {
          mlaName: mlaCache.name,
          constituency: mlaCache.constituency,
          score: mlaCache.score,
          completed: mlaCache.completed,
          budgetUtil: mlaCache.budgetUtil,
          party: mlaCache.party,
        } : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages([WELCOME]);
    setInput("");
  };

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("*") && line.endsWith("*")) {
        return <em key={i} className="text-amber-600 not-italic font-semibold">{line.slice(1, -1)}</em>;
      }
      if (line === "") return <br key={i} />;
      return <span key={i}>{line}<br /></span>;
    });
  };

  const renderFallbackCard = (msg: Message) => {
    const isTimeout = msg.content.includes("30s");
    return (
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border-b border-amber-200">
          <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">AI Temporarily Unavailable</p>
            <p className="text-xs text-amber-600">
              {isTimeout ? "Request timed out — server may be busy." : "A temporary error occurred."}
            </p>
          </div>
        </div>

        {/* Stats fallback */}
        {msg.fallbackData ? (
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              📊 Key Stats — {msg.fallbackData.constituency}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg p-2.5">
                <div className="text-xs text-slate-500 mb-1">MLA</div>
                <div className="text-sm font-bold text-slate-800 leading-tight">{msg.fallbackData.mlaName}</div>
                <div className="text-xs text-slate-500 mt-0.5">{msg.fallbackData.party}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Score</div>
                <div className={`text-lg font-black ${msg.fallbackData.score >= 140 ? "text-green-600" : msg.fallbackData.score >= 100 ? "text-amber-600" : "text-red-500"}`}>
                  {msg.fallbackData.score}<span className="text-xs font-normal text-slate-400">/200</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-2.5">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</div>
                <div className="text-lg font-black text-green-700">{msg.fallbackData.completed}</div>
                <div className="text-xs text-green-600">projects</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Budget Used</div>
                <div className="text-lg font-black text-blue-700">{msg.fallbackData.budgetUtil}%</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 text-sm text-slate-500">
            Select a constituency above to see key stats here when AI is unavailable.
          </div>
        )}

        {/* Retry */}
        <div className="px-4 pb-3">
          <button
            onClick={() => {
              const lastUser = [...messages].reverse().find(m => m.role === "user");
              if (lastUser) sendMessage(lastUser.content);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Retry Question
          </button>
        </div>

        <div className="px-4 pb-2 text-xs text-slate-400">
          {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: "calc(100vh - 64px)" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                  Ask About Your Area
                  <span className="text-[10px] bg-white/25 text-white px-2 py-0.5 rounded-full font-bold tracking-wide">AI</span>
                </h1>
                <p className="text-indigo-200 text-xs">Powered by real AP constituency data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-200">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
              <button onClick={clearChat} title="Clear chat"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Constituency Picker */}
          <div className="relative">
            <button onClick={() => setShowPicker(p => !p)}
              className="w-full flex items-center justify-between bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl px-3 py-2.5 text-white text-sm transition-all">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-200 flex-shrink-0" />
                <span className={constituency ? "text-white font-medium" : "text-indigo-300"}>
                  {constituency || "Select your constituency (optional — for personalised answers)"}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-indigo-200 flex-shrink-0 transition-transform ${showPicker ? "rotate-180" : ""}`} />
            </button>

            {showPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input autoFocus type="text" placeholder="Search constituency..."
                      value={pickerSearch} onChange={e => setPickerSearch(e.target.value)}
                      className="bg-transparent flex-1 text-sm text-slate-700 outline-none" />
                  </div>
                </div>
                {constituency && (
                  <button onClick={() => { setConstituency(""); setShowPicker(false); setPickerSearch(""); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-b border-slate-100">
                    <X className="w-4 h-4" /> Clear selection
                  </button>
                )}
                <div className="max-h-52 overflow-y-auto">
                  {filteredConstituencies.slice(0, 30).map(c => (
                    <button key={c} onClick={() => { setConstituency(c); setShowPicker(false); setPickerSearch(""); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${constituency === c ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"}`}>
                      {c}
                    </button>
                  ))}
                  {filteredConstituencies.length === 0 && (
                    <div className="px-3 py-4 text-sm text-slate-400 text-center">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                msg.role === "user"
                  ? "bg-amber-500 text-white"
                  : msg.isFallback
                  ? "bg-amber-100 text-amber-600"
                  : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
              }`}>
                {msg.role === "user"
                  ? <User className="w-4 h-4" />
                  : msg.isFallback
                  ? <WifiOff className="w-4 h-4" />
                  : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble or Fallback Card */}
              {msg.isFallback ? (
                renderFallbackCard(msg)
              ) : (
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-amber-500 text-white rounded-tr-sm"
                    : "bg-white text-slate-800 rounded-tl-sm border border-slate-100"
                }`}>
                  <div className="whitespace-pre-line">{renderContent(msg.content)}</div>
                  <div className={`text-xs mt-1.5 ${msg.role === "user" ? "text-amber-100" : "text-slate-400"}`}>
                    {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm border border-slate-100 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span className="text-sm text-slate-400">Thinking…</span>
                  <button onClick={() => { abortRef.current?.abort(); setIsLoading(false); }}
                    className="ml-2 text-xs text-slate-400 hover:text-red-500 underline">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {messages.length <= 2 && !isLoading && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Try asking</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q.text)}
                    className="flex items-center gap-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl px-3 py-2.5 text-left transition-all group shadow-sm">
                    <span className="text-lg flex-shrink-0">{q.icon}</span>
                    <span className="text-sm text-slate-700 group-hover:text-indigo-700 font-medium">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 shadow-lg flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {constituency && (
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3 h-3 text-indigo-500" />
              <span className="text-xs text-indigo-600 font-semibold">{constituency}</span>
              <span className="text-xs text-slate-400">· asking about this area</span>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
                placeholder={constituency ? `Ask about ${constituency}…` : "Ask about any area or MLA in Andhra Pradesh…"}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none"
                rows={1}
                style={{ maxHeight: "120px", overflowY: "auto" }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md transition-all flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-center">
            <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
            AI responses use live AP constituency data · Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}