import { getJuryTasks } from "@/api/requests";
import { auth } from "@/firebase";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import TournamentCard from "./components/TournamentCard";
import { JuryPanelShell } from "./components/JuryPanelShell";

const JuryPanel = () => {
  const { t } = useTranslation("jury");
  const user = auth.currentUser;
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ["jury-tasks"],
    queryFn: async () => {
      if (!user) throw new Error("User is not authenticated");
      return getJuryTasks(user);
    },
    enabled: !!user,
  });

  return (
    <JuryPanelShell
      eyebrow={t("panel.eyebrow")}
      title={t("panel.title")}
      description={t("panel.description")}
    >
      {!isLoading && !error && tasks.length > 0 ? (
        <div className="mb-8 flex flex-col gap-1 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t("panel.assignments_label")}</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-text-main">{tasks.length}</p>
            <p className="text-sm text-text-muted">{t("panel.rounds_ready", { count: tasks.length })}</p>
          </div>
        </div>
      ) : null}

      {isLoading && (
        <div
          className="rounded-2xl border border-border bg-bg-body/80 p-8 md:p-10"
          role="status"
          aria-busy="true"
          aria-label={t("panel.loading_aria")}
        >
          <div className="flex animate-pulse flex-col gap-4">
            <div className="h-4 w-40 rounded-full bg-border" />
            <div className="h-10 w-2/3 max-w-md rounded-xl bg-border" />
            <div className="h-3 w-full max-w-lg rounded-full bg-border/70" />
          </div>
          <p className="mt-6 text-sm font-semibold text-text-muted">{t("panel.loading_hint")}</p>
        </div>
      )}

      {error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 md:p-8"
          role="alert"
        >
          <p className="font-bold">{t("panel.error_title")}</p>
          <p className="mt-2 text-sm opacity-90">{t("panel.error_hint")}</p>
        </div>
      )}

      {!isLoading && !error && tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg-body/50 px-6 py-12 text-center md:px-10 md:py-16">
          <p className="text-lg font-bold text-text-main">{t("panel.empty_title")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">{t("panel.empty_description")}</p>
        </div>
      ) : null}

      {!isLoading && !error && tasks.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TournamentCard key={task.id} task={task} />
          ))}
        </div>
      ) : null}
    </JuryPanelShell>
  );
};

export default JuryPanel;
