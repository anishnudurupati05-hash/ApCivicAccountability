import { useEffect, useState, useRef } from "react";
import { api, SpeakUpIssue } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Megaphone, ThumbsUp, MessageCircle, Flame, Heart, AlertTriangle,
  Plus, X, ChevronDown, ChevronUp, Send, MapPin, Clock,
  TrendingUp, Filter, Search, Mail, Copy, CheckCircle2, PhoneCall
} from "lucide-react";

const CATEGORIES = [
  "Roads", "Water", "Education", "Healthcare", "Safety", "Housing",
  "Sanitation", "Agriculture", "Transport", "Infrastructure", "Employment", "Disaster Relief", "Other"
];

const CATEGORY_COLORS: Record<string, string> = {
  Roads: "bg-orange-100 text-orange-700 border-orange-200",
  Water: "bg-blue-100 text-blue-700 border-blue-200",
  Education: "bg-purple-100 text-purple-700 border-purple-200",
  Healthcare: "bg-red-100 text-red-700 border-red-200",
  Safety: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Housing: "bg-teal-100 text-teal-700 border-teal-200",
  Sanitation: "bg-lime-100 text-lime-700 border-lime-200",
  Agriculture: "bg-green-100 text-green-700 border-green-200",
  Transport: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Infrastructure: "bg-slate-100 text-slate-700 border-slate-200",
  Employment: "bg-amber-100 text-amber-700 border-amber-200",
  "Disaster Relief": "bg-rose-100 text-rose-700 border-rose-200",
  Other: "bg-gray-100 text-gray-700 border-gray-200",
};

const REACTION_CONFIG = [
  { key: "agree" as const, emoji: "👍", label: "Agree", color: "text-blue-600 hover:bg-blue-50" },
  { key: "fire" as const, emoji: "🔥", label: "Urgent", color: "text-orange-600 hover:bg-orange-50" },
  { key: "heart" as const, emoji: "❤️", label: "Care", color: "text-rose-600 hover:bg-rose-50" },
  { key: "angry" as const, emoji: "😡", label: "Angry", color: "text-red-600 hover:bg-red-50" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function HotScore({ issue }: { issue: SpeakUpIssue }) {
  const score = issue.upvotes * 2 + (issue.reactions?.fire || 0) + (issue.comments?.length || 0) * 3;
  if (score > 600) return <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold animate-pulse">🔥 Viral</span>;
  if (score > 300) return <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">🔥 Hot</span>;
  if (score > 100) return <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">📈 Trending</span>;
  return null;
}

interface IssueCardProps {
  issue: SpeakUpIssue;
  onUpvote: (id: number) => void;
  onReact: (id: number, type: "agree" | "fire" | "heart" | "angry") => void;
  onComment: (id: number, text: string, author: string) => void;
  localUpvoted: Set<number>;
  localReacted: Map<number, string>;
}

// Escalate to MLA button (IMPROVE)
function EscalateMLA({ constituency, issueTitle }: { constituency: string; issueTitle: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const mlaName = `MLA of ${constituency}`;
  const emailBody = `Dear ${mlaName},\n\nI am a constituent from ${constituency} raising this urgent issue:\n\n"${issueTitle}"\n\nI request you to take immediate action on this matter.\n\nThis issue has been raised by citizens on AP Civic Tracker (ap-civic-tracker.app).\n\nYours faithfully,\nA Concerned Citizen of ${constituency}`;
  const mailtoLink = `mailto:?subject=Urgent: ${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(emailBody)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailBody).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShow(s => !s)}
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        <PhoneCall className="w-3.5 h-3.5" /> Escalate to MLA
      </button>

      {show && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-amber-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> Escalate to {mlaName}
              </div>
              <button onClick={() => setShow(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-3">Pre-filled email template ready to send:</p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              {emailBody}
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={mailtoLink}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg transition-colors"
                onClick={() => setShow(false)}
              >
                <Mail className="w-3.5 h-3.5" /> Open Email
              </a>
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg transition-colors"
              >
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Text</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue, onUpvote, onReact, onComment, localUpvoted, localReacted }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasUpvoted = localUpvoted.has(issue.id);
  const hasReacted = localReacted.get(issue.id);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(issue.id, commentText.trim(), commentAuthor.trim() || "Anonymous");
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Upvote column */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onUpvote(issue.id)}
              disabled={hasUpvoted}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border transition-all ${
                hasUpvoted
                  ? "bg-amber-50 border-amber-300 text-amber-600"
                  : "border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50"
              }`}
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-bold">{issue.upvotes}</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[issue.category] || CATEGORY_COLORS.Other}`}>
                {issue.category}
              </span>
              <HotScore issue={issue} />
            </div>

            <h3 className="font-bold text-slate-800 text-base leading-snug">{issue.title}</h3>

            {issue.description && (
              <p className={`text-sm text-slate-600 mt-1.5 leading-relaxed ${!expanded && "line-clamp-2"}`}>
                {issue.description}
              </p>
            )}
            {issue.description && issue.description.length > 120 && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="text-xs text-amber-600 hover:underline mt-1"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {issue.constituency}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(issue.created_at)}
              </span>
              <span>by <strong className="text-slate-600">{issue.author}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Reaction Bar */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {REACTION_CONFIG.map(({ key, emoji, label, color }) => (
            <button
              key={key}
              onClick={() => onReact(issue.id, key)}
              disabled={!!hasReacted}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                hasReacted === key
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : `border-transparent ${color} hover:border-current disabled:opacity-60`
              }`}
              title={label}
            >
              <span>{emoji}</span>
              <span>{(issue.reactions?.[key] || 0)}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Escalate to MLA button (IMPROVE) */}
          <EscalateMLA constituency={issue.constituency} issueTitle={issue.title} />
          <button
            onClick={() => setShowComments(s => !s)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{issue.comments?.length || 0} comments</span>
            {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pt-3 pb-4 border-t border-slate-100 space-y-3">
          {/* Existing comments */}
          {(issue.comments || []).length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-2">No comments yet. Be the first!</p>
          )}
          {(issue.comments || []).map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                {c.author[0]?.toUpperCase()}
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-700">{c.author}</span>
                  <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}

          {/* Add comment */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <input
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <div className="flex gap-2">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={2}
                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submitting}
                className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg disabled:opacity-40 self-end transition-colors"
              >
                {submitting ? "..." : <><Send className="w-3 h-3" /> Post</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PostIssueModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

function PostIssueModal({ onClose, onSubmit }: PostIssueModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: "", description: "", constituency: "", category: "", author: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.constituency.trim() || !form.category) {
      setError("Title, constituency, and category are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to post issue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" /> {t.speakUp.postIssue}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.speakUp.issueTitle} *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Describe the issue in one line..."
              maxLength={200}
              className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="text-right text-xs text-slate-400 mt-1">{form.title.length}/200</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.speakUp.issueDesc}</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Provide details — what happened, how many affected, how long..."
              rows={4}
              maxLength={1000}
              className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="text-right text-xs text-slate-400 mt-1">{form.description.length}/1000</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.speakUp.constituency} *</label>
              <input
                value={form.constituency}
                onChange={e => setForm(f => ({ ...f, constituency: e.target.value }))}
                placeholder="e.g. Vijayawada Central"
                className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.speakUp.category} *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.speakUp.yourName}</label>
            <input
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              placeholder="Your name (leave blank to post anonymously)"
              className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              {t.speakUp.cancel}
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Megaphone className="w-4 h-4" />}
              {submitting ? "Posting..." : t.speakUp.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SpeakUp() {
  const { t } = useLanguage();
  const [issues, setIssues] = useState<SpeakUpIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<"hot" | "recent" | "upvotes">("hot");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  // Local state for optimistic updates
  const [localUpvoted, setLocalUpvoted] = useState<Set<number>>(new Set());
  const [localReacted, setLocalReacted] = useState<Map<number, string>>(new Map());

  const loadIssues = () => {
    setLoading(true);
    setError("");
    api.getSpeakUpIssues({ sort, category: categoryFilter || undefined })
      .then(r => setIssues(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadIssues(); }, [sort, categoryFilter]);

  const handleUpvote = async (id: number) => {
    if (localUpvoted.has(id)) return;
    setLocalUpvoted(s => new Set([...s, id]));
    // Optimistic update
    setIssues(prev => prev.map(i => i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));
    try {
      await api.upvoteIssue(id);
    } catch {
      // revert on error
      setIssues(prev => prev.map(i => i.id === id ? { ...i, upvotes: i.upvotes - 1 } : i));
      setLocalUpvoted(s => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  const handleReact = async (id: number, type: "agree" | "fire" | "heart" | "angry") => {
    if (localReacted.has(id)) return;
    setLocalReacted(m => new Map([...m, [id, type]]));
    // Optimistic update
    setIssues(prev => prev.map(i => {
      if (i.id !== id) return i;
      return { ...i, reactions: { ...i.reactions, [type]: (i.reactions?.[type] || 0) + 1 } };
    }));
    try {
      await api.reactToIssue(id, type);
    } catch {
      setIssues(prev => prev.map(i => {
        if (i.id !== id) return i;
        return { ...i, reactions: { ...i.reactions, [type]: Math.max((i.reactions?.[type] || 1) - 1, 0) } };
      }));
      setLocalReacted(m => { const n = new Map(m); n.delete(id); return n; });
    }
  };

  const handleComment = async (id: number, text: string, author: string) => {
    const res = await api.commentOnIssue(id, { text, author });
    setIssues(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newComment = res.data;
      return { ...i, comments: [...(i.comments || []), newComment] };
    }));
  };

  const handlePostIssue = async (data: any) => {
    await api.createSpeakUpIssue(data);
    setSuccessMsg(t.speakUp.success);
    setTimeout(() => setSuccessMsg(""), 4000);
    loadIssues();
  };

  const displayIssues = issues.filter(i =>
    !search || i.constituency.toLowerCase().includes(search.toLowerCase()) || i.title.toLowerCase().includes(search.toLowerCase())
  );

  const topIssue = issues[0];
  const totalUpvotes = issues.reduce((s, i) => s + i.upvotes, 0);
  const totalComments = issues.reduce((s, i) => s + (i.comments?.length || 0), 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" /> {t.speakUp.title}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{t.speakUp.subtitle}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> {t.speakUp.postIssue}
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium flex items-center gap-2">
          ✅ {successMsg}
        </div>
      )}

      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-amber-600">{issues.length}</div>
          <div className="text-xs text-amber-700 font-medium">Issues Raised</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-blue-600">{totalUpvotes.toLocaleString()}</div>
          <div className="text-xs text-blue-700 font-medium">Total Upvotes</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-green-600">{totalComments}</div>
          <div className="text-xs text-green-700 font-medium">Discussions</div>
        </div>
      </div>

      {/* Top issue highlight */}
      {!loading && topIssue && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2 uppercase tracking-wide">
            <Flame className="w-3.5 h-3.5" /> Most Urgent Issue Right Now
          </div>
          <p className="font-bold text-base leading-tight">{topIssue.title}</p>
          <div className="flex items-center gap-3 mt-2 text-slate-300 text-xs">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{topIssue.constituency}</span>
            <span>⬆ {topIssue.upvotes} upvotes</span>
            <span>🔥 {topIssue.reactions?.fire || 0} urgent</span>
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Sort tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[
            { key: "hot" as const, label: t.speakUp.hot },
            { key: "recent" as const, label: t.speakUp.recent },
            { key: "upvotes" as const, label: t.speakUp.topVoted },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                sort === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.speakUp.searchConstituency}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter("")}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !categoryFilter ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              categoryFilter === cat
                ? `${CATEGORY_COLORS[cat]} border-current font-bold`
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-16 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-16" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issues feed */}
      {!loading && displayIssues.length === 0 && (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{t.speakUp.noIssues}</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {displayIssues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onUpvote={handleUpvote}
              onReact={handleReact}
              onComment={handleComment}
              localUpvoted={localUpvoted}
              localReacted={localReacted}
            />
          ))}
        </div>
      )}

      {/* Post modal */}
      {showModal && (
        <PostIssueModal
          onClose={() => setShowModal(false)}
          onSubmit={handlePostIssue}
        />
      )}
    </div>
  );
}