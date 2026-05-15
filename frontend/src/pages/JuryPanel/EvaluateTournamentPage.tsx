import { finishEvaluation, getJuryAssignments, type JuryAssignment } from "@/api/requests";
import { auth } from "@/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { HiArrowLeft } from "react-icons/hi2";

import EvaluationsModal from "./components/EvaluationsModal";
import SubmissionCard from "./components/SubmissionCard";
import { JuryPanelShell } from "./components/JuryPanelShell";
import { juryTaskQueryKey } from "./juryQueryKeys";
import { taskStatusByName } from "@/config/appConfig";
import { Button } from "@/components/ui/Button";

const EvaluateTournamentPage = () => {
  const { t } = useTranslation("jury");
  const { id } = useParams();
  const [selectedAssignment, setSelectedAssignment] = useState<JuryAssignment | null>(null);
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  const {
    data: assignments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: juryTaskQueryKey(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Task id is missing");
      if (!user) throw new Error("User is not authenticated");
      return getJuryAssignments(id, user);
    },
    enabled: !!id && !!user,
  });

  const task = assignments[0]?.task;
  const tournamentId = assignments[0]?.submission.team.tournament.id;
  const allReviewed = assignments.length > 0 && assignments.every((a) => a.evaluation);
  const isFinalized = task?.status_id === taskStatusByName.evaluated.name;
  const reviewedCount = assignments.filter((a) => a.evaluation).length;
  const totalCount = assignments.length;
  const progressPct = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;
  const showRoundMeta = !isLoading && !isError && totalCount > 0;

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!tournamentId || !id || !user) throw new Error("Missing context");
      return finishEvaluation(tournamentId, Number(id), user);
    },
    onSuccess: async () => {
      if (id) {
        await queryClient.invalidateQueries({ queryKey: juryTaskQueryKey(id) });
      }
      toast.success(t("evaluate.toast_finalized"));
    },
    onError: (err) => {
      toast.error((err as Error)?.message || t("evaluate.toast_finalize_failed"));
    },
  });

  const backLink = (
    <Link
      to="/jury-panel"
      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <HiArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {t("evaluate.back")}
    </Link>
  );

  return (
    <>
      <JuryPanelShell
        eyebrow={t("evaluate.eyebrow")}
        title={task?.title || t("evaluate.loading_round")}
        description={task?.description || t("evaluate.default_description")}
        headerLeading={backLink}
        headerBadge={task?.status.display_name}
      >
        {showRoundMeta && !isFinalized ? (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-text-muted">
              <span>{t("evaluate.progress_label")}</span>
              <span className="tabular-nums text-text-main">
                {reviewedCount}/{totalCount}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("evaluate.progress_aria", {
                percent: progressPct,
                reviewed: reviewedCount,
                total: totalCount,
              })}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400 transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}

        {showRoundMeta && isFinalized ? (
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50 p-5 text-emerald-900 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/35 dark:text-emerald-100 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="min-w-0">
              <p className="font-black">{t("evaluate.finalized_title")}</p>
              <p className="mt-1 text-sm leading-relaxed opacity-90">{t("evaluate.finalized_hint")}</p>
            </div>
          </div>
        ) : null}

        {showRoundMeta && !isFinalized ? (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-bg-body/60 p-5 shadow-inner md:flex-row md:items-center md:justify-between md:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t("evaluate.status_label")}</p>
              <p className="mt-1 text-sm font-semibold text-text-main">
                {allReviewed
                  ? t("evaluate.status_all_reviewed")
                  : t("evaluate.status_partial", { reviewed: reviewedCount, total: totalCount })}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                {allReviewed ? t("evaluate.status_hint_all_reviewed") : t("evaluate.status_hint_partial")}
              </p>
            </div>
            {allReviewed ? (
              <Button
                type="button"
                variant="accent"
                size="md"
                className="shrink-0 self-start md:self-center"
                onClick={() => finishMutation.mutate()}
                disabled={finishMutation.isPending}
                isLoading={finishMutation.isPending}
              >
                {t("evaluate.finalize")}
              </Button>
            ) : null}
          </div>
        ) : null}

        {isLoading ? (
          <div
            className="rounded-2xl border border-border bg-bg-body/80 p-8 md:p-10"
            role="status"
            aria-busy="true"
            aria-label={t("evaluate.loading_aria")}
          >
            <div className="flex animate-pulse flex-col gap-4">
              <div className="h-4 w-48 rounded-full bg-border" />
              <div className="h-10 w-3/4 max-w-lg rounded-xl bg-border" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-36 rounded-2xl bg-border/80" />
                <div className="h-36 rounded-2xl bg-border/80" />
              </div>
            </div>
            <p className="mt-6 text-sm font-semibold text-text-muted">{t("evaluate.loading_hint")}</p>
          </div>
        ) : null}

        {isError ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 md:p-8"
            role="alert"
          >
            <p className="font-bold">{t("evaluate.error_title")}</p>
            <p className="mt-2 text-sm opacity-90">{t("evaluate.error_hint")}</p>
          </div>
        ) : null}

        {!isLoading && !isError && assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-bg-body/50 px-6 py-12 text-center md:px-10 md:py-16">
            <p className="text-lg font-bold text-text-main">{t("evaluate.empty_title")}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">{t("evaluate.empty_description")}</p>
            <Link
              to="/jury-panel"
              className="mt-6 inline-flex min-h-[44px] min-w-[12rem] items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
            >
              {t("evaluate.back_to_panel")}
            </Link>
          </div>
        ) : null}

        {!isLoading && !isError && assignments.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {assignments.map((assignment) => (
              <SubmissionCard key={assignment.id} assignment={assignment} onOpen={setSelectedAssignment} />
            ))}
          </div>
        ) : null}
      </JuryPanelShell>

      <EvaluationsModal assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} />
    </>
  );
};

export default EvaluateTournamentPage;
