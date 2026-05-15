import type { JuryAssignment } from "@/api/requests";
import { taskStatusByName } from "@/config/appConfig";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

interface SubmissionCardProps {
  assignment: JuryAssignment;
  onOpen: (assignment: JuryAssignment) => void;
}

const SubmissionCard = ({ assignment, onOpen }: SubmissionCardProps) => {
  const { t } = useTranslation("jury");
  const done = Boolean(assignment.evaluation);
  const locked = assignment.task.status_id === taskStatusByName.evaluated.name;

  const ctaLabel = done ? (locked ? t("submission.cta_view") : t("submission.cta_update")) : t("submission.cta_start");

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-bg-card shadow-md transition-all duration-300",
        done
          ? "border-emerald-500/25 ring-1 ring-emerald-500/10 dark:border-emerald-500/20"
          : "border-amber-500/30 ring-2 ring-amber-400/25 dark:border-amber-500/35",
      )}
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t("submission.label")}</p>
            <h2 className="mt-1 truncate text-xl font-black tracking-tight text-text-main md:text-2xl">
              {assignment.submission.team.name}
            </h2>
            <p className="mt-1 truncate text-sm text-text-muted">{assignment.submission.team.team_email}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
              done
                ? "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200"
                : "bg-amber-500/15 text-amber-900 ring-amber-500/30 dark:text-amber-100",
            )}
          >
            {done ? t("submission.reviewed") : t("submission.pending")}
          </span>
        </div>

        <div className="space-y-2 text-sm text-text-muted">
          {assignment.submission.urls.length > 0 ? (
            assignment.submission.urls.map((item) => (
              <p
                key={item.id}
                className="truncate rounded-xl border border-border bg-bg-body/70 px-3 py-2.5 font-medium text-text-main transition hover:border-primary/30 hover:bg-bg-body"
              >
                <span className="text-text-muted">{item.url.display_name}:</span> {item.value}
              </p>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-bg-body/50 px-3 py-2.5 text-text-muted">
              {t("submission.no_links")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-3 border-t border-border bg-bg-body/40 px-6 py-4 dark:bg-bg-body/20">
        <button
          type="button"
          onClick={() => onOpen(assignment)}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg transition",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            done && !locked
              ? "bg-slate-800 shadow-slate-900/25 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              : "bg-primary shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/35",
          )}
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  );
};

export default SubmissionCard;
