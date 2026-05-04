import { MLAWithMetrics } from "../lib/api";

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}

export function getBadges(mla: MLAWithMetrics): Badge[] {
  const badges: Badge[] = [];
  const rank = mla.rank ?? 999;

  if (mla.score >= 145) {
    badges.push({
      id: "top-performer",
      label: "Top Performer",
      emoji: "🏆",
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      description: "Overall score in top tier",
    });
  }

  if (rank <= 10) {
    badges.push({
      id: "elite",
      label: "Elite MLA",
      emoji: "⭐",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-300",
      description: "Ranked in AP's top 10",
    });
  }

  if (mla.completed >= 12) {
    badges.push({
      id: "promise-keeper",
      label: "Promise Keeper",
      emoji: "🔥",
      color: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-300",
      description: "12+ projects completed",
    });
  }

  if (mla.budgetUtil >= 80) {
    badges.push({
      id: "budget-champion",
      label: "Budget Champ",
      emoji: "💰",
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-300",
      description: "80%+ budget utilized",
    });
  }

  if (mla.sentiment >= 72) {
    badges.push({
      id: "peoples-choice",
      label: "People's Choice",
      emoji: "❤️",
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-300",
      description: "High public sentiment score",
    });
  }

  if (mla.inProgress >= 8) {
    badges.push({
      id: "active-builder",
      label: "Active Builder",
      emoji: "🏗️",
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-300",
      description: "8+ projects actively running",
    });
  }

  if (mla.notStarted >= 10 && mla.completed < 5) {
    badges.push({
      id: "delayed-zone",
      label: "Delayed Zone",
      emoji: "⚠️",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-300",
      description: "10+ projects not yet started",
    });
  }

  return badges;
}

interface BadgeDisplayProps {
  mla: MLAWithMetrics;
  max?: number;
  size?: "sm" | "md";
}

export function BadgeDisplay({ mla, max = 3, size = "sm" }: BadgeDisplayProps) {
  const badges = getBadges(mla);
  const shown = badges.slice(0, max);
  const extra = badges.length - shown.length;

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {shown.map((badge) => (
        <span
          key={badge.id}
          title={badge.description}
          className={`inline-flex items-center gap-0.5 border rounded-full font-medium ${badge.bg} ${badge.border} ${badge.color} ${
            size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"
          }`}
        >
          <span>{badge.emoji}</span>
          <span className="hidden sm:inline">{badge.label}</span>
        </span>
      ))}
      {extra > 0 && (
        <span className="text-xs text-slate-400 font-medium">+{extra}</span>
      )}
    </div>
  );
}

interface BadgePanelProps {
  mla: MLAWithMetrics;
}

export function BadgePanel({ mla }: BadgePanelProps) {
  const badges = getBadges(mla);
  if (badges.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic">No badges earned yet.</p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${badge.bg} ${badge.border}`}
        >
          <span className="text-lg">{badge.emoji}</span>
          <div>
            <div className={`text-sm font-bold ${badge.color}`}>{badge.label}</div>
            <div className="text-xs text-slate-500">{badge.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Gamification Streak Banner ───────────────────────────────────────────────
export interface Streak {
  emoji: string;
  title: string;
  sub: string;
  color: string;
}

export function getStreaks(mla: MLAWithMetrics): Streak[] {
  const streaks: Streak[] = [];
  if (mla.sentiment >= 65) {
    streaks.push({ emoji: "🔥", title: "Trending Up!", sub: "Positive sentiment this month", color: "from-orange-400 to-red-400" });
  }
  if (mla.completed >= 8) {
    streaks.push({ emoji: "⚡", title: "On a Roll!", sub: `${mla.completed} projects done`, color: "from-yellow-400 to-amber-400" });
  }
  if (mla.budgetUtil >= 75) {
    streaks.push({ emoji: "💪", title: "Funds Flowing", sub: `${mla.budgetUtil}% budget utilised`, color: "from-green-400 to-emerald-500" });
  }
  return streaks;
}
