import { getJuryTasks } from "@/api/requests";
import { auth } from "@/firebase";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import TournamentCard from "./components/TournamentCard";
import { juryTasksQueryKey } from "./juryQueryKeys";
import { Hero } from "@/components/Hero";
import { Stars } from "@/components/Stars"

const JuryPanel = () => {
  const { t } = useTranslation("jury");
  const user = auth.currentUser;

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: juryTasksQueryKey,
    queryFn: async () => {
      if (!user) throw new Error("User is not authenticated");
      return getJuryTasks(user);
    },
    enabled: !!user,
  });

  const heroTitle = t("panel.title");
  const heroDescription = t("panel.description");

  return (
    <div className="relative min-h-screen pb-32">
      <div className="relative z-20">
        <div className="relative top-5"><Stars/></div>
        <Hero
          bgText="JURY"
          title={heroTitle}
          description={heroDescription}
        />
      </div>

      <main className="container mx-auto px-5 pb-20 -mt-10 relative z-40">
        {isLoading && (
          <div
            className="rounded-3xl border border-border bg-bg-body/80 p-8 md:p-12 shadow-xl backdrop-blur-md"
            role="status"
            aria-busy="true"
          >
            <div className="flex animate-pulse flex-col gap-6">
              <div className="h-12 w-1/3 rounded-xl bg-border" />
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-border/50" />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-200 md:p-12"
            role="alert"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {t("panel.error_title")}
            </h2>
            <p className="mt-3 text-lg opacity-80">{t("panel.error_hint")}</p>
          </div>
        )}

        {!isLoading && !error && tasks.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-border bg-bg-body/50 px-6 py-20 text-center md:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-border/30 text-4xl">
              ☕
            </div>
            <h2 className="text-2xl font-black text-text-main uppercase">
              {t("panel.empty_title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-muted text-lg">
              {t("panel.empty_description")}
            </p>
          </div>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <div id="tasks" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <TournamentCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default JuryPanel;