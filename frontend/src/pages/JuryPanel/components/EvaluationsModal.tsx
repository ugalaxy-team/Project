import { saveAssignmentEvaluation, type JuryAssignment } from "@/api/requests";
import { taskStatusByName } from "@/config/appConfig";
import { auth } from "@/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLargeLine } from "react-icons/ri";

import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface EvaluationsModalProps {
  assignment: JuryAssignment | null;
  onClose: () => void;
}

function initialRequirements(assignment: JuryAssignment): Record<number, number> {
  return Object.fromEntries(
    (assignment.evaluation?.criterion_scores || []).map((item) => [item.criterion_id, item.score]),
  );
}

function EvaluationsModalInner({ assignment, onClose }: { assignment: JuryAssignment; onClose: () => void }) {
  const { t } = useTranslation("jury");
  const queryClient = useQueryClient();
  const [comment, setComment] = useState(() => assignment.evaluation?.comment || "");
  const [requirements, setRequirements] = useState(() => initialRequirements(assignment));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error("Missing assignment context");
      return saveAssignmentEvaluation(
        assignment.id,
        {
          comment,
          criterion_scores: assignment.task.criteria.map((criterion) => ({
            criterion_id: criterion.id,
            score: requirements[criterion.id] ?? 0,
          })),
        },
        auth.currentUser,
        !!assignment.evaluation,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jury-task", assignment.task_id] });
      onClose();
    },
  });
  const isFinalized = assignment.task.status_id === taskStatusByName.evaluated.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-theme/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jury-evaluation-title"
    >
      <div
        className={cn(
          "max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-border bg-bg-card p-6 shadow-2xl shadow-primary/10 transition-colors duration-500 md:p-8",
          "dark:shadow-black/60",
        )}
      >
        <div className="sticky top-0 z-[1] -mx-6 -mt-6 mb-6 border-b border-border bg-bg-card/95 px-6 pb-4 pt-6 backdrop-blur-md md:-mx-8 md:-mt-8 md:px-8 md:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t("modal.eyebrow")}</p>
              <h2 id="jury-evaluation-title" className="mt-1 text-2xl font-black tracking-tight text-text-main md:text-3xl">
                {assignment.submission.team.name}
              </h2>
              <p className="mt-2 text-sm text-text-muted">{assignment.task.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border-2 border-border bg-bg-body p-2.5 text-text-main transition hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={t("modal.close_aria")}
            >
              <RiCloseLargeLine className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isFinalized && (
          <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {t("modal.finalized_banner")}
          </div>
        )}

        <div className="space-y-4">
          {assignment.task.criteria.map((criterion) => (
            <label
              key={criterion.id}
              className="block rounded-2xl border border-border bg-bg-body/60 p-4 transition hover:border-primary/20 dark:bg-bg-body/30"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="font-bold text-text-main">{criterion.name}</div>
                  {criterion.description ? (
                    <div className="mt-1 text-sm leading-relaxed text-text-muted">{criterion.description}</div>
                  ) : null}
                </div>
                <input
                  type="number"
                  min={0}
                  max={criterion.max_score}
                  value={requirements[criterion.id] ?? 0}
                  onChange={(event) =>
                    setRequirements((prev) => ({
                      ...prev,
                      [criterion.id]: Number(event.target.value),
                    }))
                  }
                  disabled={isFinalized}
                  readOnly={isFinalized}
                  className={cn(
                    "w-full rounded-xl border-2 border-border bg-bg-card px-3 py-2.5 text-center text-base font-bold tabular-nums text-text-main md:w-28 md:text-lg",
                    "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15",
                    "disabled:cursor-not-allowed disabled:opacity-70",
                  )}
                />
              </div>
              <div className="mt-2 text-xs font-semibold text-text-muted">
                {t("modal.criterion_meta", { weight: criterion.weight, max: criterion.max_score })}
              </div>
            </label>
          ))}

          <section>
            <label htmlFor="jury-evaluation-comment" className="mb-2 block text-sm font-bold text-text-main">
              {t("modal.comment")}
            </label>
            <textarea
              id="jury-evaluation-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={isFinalized}
              readOnly={isFinalized}
              rows={5}
              className={cn(
                "min-h-[8rem] w-full resize-y rounded-2xl border-2 border-border bg-bg-card px-4 py-3 text-sm leading-relaxed text-text-main transition",
                "placeholder:text-text-muted/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15",
                "disabled:cursor-not-allowed disabled:opacity-70",
              )}
              placeholder={t("modal.comment_placeholder")}
            />
          </section>
        </div>

        {!isFinalized && (
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end sm:gap-4">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              {t("modal.cancel")}
            </Button>
            <Button type="button" variant="primary" size="md" onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
              {t("modal.save")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const EvaluationsModal = ({ assignment, onClose }: EvaluationsModalProps) => {
  if (!assignment) return null;
  return <EvaluationsModalInner key={assignment.id} assignment={assignment} onClose={onClose} />;
};

export default EvaluationsModal;
