import type { JuryTask } from "@/api/requests";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

interface TournamentCardProps {
  task: JuryTask;
}

const TournamentCard = ({ task }: TournamentCardProps) => {
  const { t } = useTranslation("jury");

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-card p-6 shadow-md transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10",
        "dark:hover:shadow-primary/5",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-pink-accent opacity-90"
        aria-hidden
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary ring-1 ring-primary/20 dark:bg-primary/20 dark:text-indigo-100">
          {task.status_id}
        </span>
        <span className="text-xs font-semibold tabular-nums text-text-muted">{t("task_card.task_id", { id: task.id })}</span>
      </div>
      <h2 className="text-xl font-black tracking-tight text-text-main md:text-2xl">{task.title}</h2>
      <p className="mt-3 min-h-[3rem] flex-1 text-sm leading-relaxed text-text-muted">
        {task.description || t("task_card.no_description")}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-bg-body/80 px-3 py-1 text-xs font-semibold text-text-muted">
          {t("task_card.reviews_per_submission", { count: task.min_reviews_per_submission })}
        </span>
        <span className="rounded-full border border-border bg-bg-body/80 px-3 py-1 text-xs font-semibold text-text-muted">
          {t("task_card.scale", { max: task.max_score })}
        </span>
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <Link
          to={`/jury-panel/evaluate/${task.id}`}
          className={cn(
            "inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-primary/30 transition",
            "hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "sm:w-auto",
          )}
        >
          {t("task_card.open_round")}
        </Link>
      </div>
    </article>
  );
};

export default TournamentCard;
