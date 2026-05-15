import { useTranslation } from "react-i18next";
import { tournamentStatusByName } from "@/config/appConfig";
import { type NormalizedTournament } from "../pages/TournamentsPage/TournamentsPage";
import { cn } from "../utils/cn";
import { Clock, UserPlus, Zap, Award, Calendar } from "lucide-react";

const STATUS_CFG = {
  draft: {
    label: tournamentStatusByName.draft.display_name,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    dot: "bg-amber-400",
    gradFrom: "#fbbf24",
    gradTo: "#d97706",
    icon: Clock,
    btnTextKey: "tournament_card.btn_draft",
    btnClass:
      "bg-slate-100 text-slate-500 border border-slate-200 cursor-default",
  },
  registration: {
    label: tournamentStatusByName.registration.display_name,
    badgeBg: "bg-green-500/10",
    badgeText: "text-green-600 dark:text-green-400",
    dot: "bg-green-500",
    gradFrom: "#34d399",
    gradTo: "#059669",
    icon: UserPlus,
    btnTextKey: "tournament_card.btn_registration",
    btnClass:
      "bg-primary text-white hover:bg-primary/90 shadow-md cursor-pointer",
  },
  running: {
    label: tournamentStatusByName.running.display_name,
    badgeBg: "bg-pink-accent/10",
    badgeText: "text-pink-accent",
    dot: "bg-pink-accent",
    gradFrom: "#c084fc",
    gradTo: "#ec4899",
    icon: Zap,
    btnTextKey: "tournament_card.btn_running",
    btnClass:
      "bg-transparent border-2 border-primary text-primary hover:bg-primary/5 cursor-pointer",
  },
  finished: {
    label: tournamentStatusByName.finished.display_name,
    badgeBg: "bg-border",
    badgeText: "text-text-muted",
    dot: "bg-text-muted",
    gradFrom: "#94a3b8",
    gradTo: "#475569",
    icon: Award,
    btnTextKey: "tournament_card.btn_finished",
    btnClass:
      "bg-transparent border-2 border-border text-text-muted hover:bg-border/30 hover:text-text-main cursor-pointer",
  },
} as const;

const TAG_COLORS: Record<string, string> = {
  accent: "bg-accent/10 text-amber-600 dark:text-accent",
  primary: "bg-primary/10 text-primary",
  pink: "bg-pink-accent/10 text-pink-accent",
  light: "bg-border text-text-muted",
};

export const TournamentCard = ({
  status,
  title,
  tags = [],
  desc,
  teams,
  max,
  deadline,
}: NormalizedTournament) => {
  const { t } = useTranslation("tournaments");

  const safeStatus = (
    STATUS_CFG[status as keyof typeof STATUS_CFG] ? status : "draft"
  ) as keyof typeof STATUS_CFG;
  const cfg = STATUS_CFG[safeStatus];

  const pct = max > 0 ? Math.min(100, Math.round((teams / max) * 100)) : 0;
  const isFull = teams >= max && max > 0;
  const gradId = `grad-${title?.replace(/\s+/g, "-") || Math.random()}`;

  const StatusIcon = cfg.icon;

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="h-full bg-bg-card rounded-[28px] border-[1.5px] border-border shadow-sm flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      <div className="p-7 flex flex-col h-full">
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="shrink-0 w-11 h-11 flex items-center justify-center relative drop-shadow-md transition-transform duration-300">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={cfg.gradFrom} />
                  <stop offset="100%" stopColor={cfg.gradTo} />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${gradId})`}
                d="M12 2l2.4 2.3 3.3-.4.8 3.2 2.9 1.7-1.8 2.8 1.8 2.8-2.9 1.7-.8 3.2-3.3-.4L12 22l-2.4-2.3-3.3.4-.8-3.2-2.9-1.7 1.8-2.8-1.8-2.8 2.9-1.7.8-3.2 3.3.4L12 2z"
              />
            </svg>
            <StatusIcon
              className="relative z-10 w-5 h-5 text-white"
              strokeWidth={2.5}
            />
          </div>
          <h3 className="font-nunito text-[22px] font-extrabold leading-[1.2] flex-1 text-text-main line-clamp-2 transition-colors duration-300">
            {title}
          </h3>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[12px] font-extrabold transition-colors duration-300",
                  TAG_COLORS[tag.type] || TAG_COLORS.light,
                )}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        <p
          className="text-[15px] text-text-muted leading-relaxed font-semibold mb-6 line-clamp-3 transition-colors duration-300"
          title={desc}
        >
          {desc}
        </p>

        <div className="mt-auto">
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1.5 transition-colors duration-300">
              <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                {t("tournament_card.teams_label")}
              </span>
              <span className="font-nunito text-[20px] font-extrabold text-text-main">
                {teams}{" "}
                <span className="text-[13px] text-text-muted">/ {max}</span>
              </span>
            </div>
            <div className="h-1.5 bg-bg-body rounded-full overflow-hidden shadow-inner transition-colors duration-300">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isFull ? "bg-accent" : "bg-primary",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t-[1.5px] border-border mb-5 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-text-muted">
              <Calendar className="w-4 h-4 opacity-65" strokeWidth={2.5} />
              {t("tournament_card.until")} {formattedDeadline}
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold shadow-sm transition-colors duration-300",
                cfg.badgeBg,
                cfg.badgeText,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
          </div>

          <button
            disabled={status === "draft" || status === "finished"}
            className={cn(
              "w-full py-3.5 rounded-xl font-nunito text-[16px] font-extrabold transition-all duration-300",
              cfg.btnClass,
              (status === "draft" || status === "finished") &&
                "opacity-70 cursor-not-allowed",
            )}
          >
            {t(cfg.btnTextKey)}
          </button>
        </div>
      </div>
    </div>
  );
};
