import { saveAssignmentEvaluation, type JuryAssignment } from "@/api/requests";
import { taskStatusByName } from "@/config/appConfig";
import { auth } from "@/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {RiCloseLargeLine} from 'react-icons/ri';

interface EvaluationsModalProps {
  assignment: JuryAssignment | null;
  onClose: () => void;
  isFinalized?: boolean;
}

const EvaluationsModal = ({ assignment, onClose}: EvaluationsModalProps) => {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [requirements, setRequirements] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!assignment) return;
    setComment(assignment.evaluation?.comment || "");
    setRequirements(
      Object.fromEntries(
        (assignment.evaluation?.criterion_scores || []).map((item) => [item.criterion_id, item.score]),
      ),
    );
  }, [assignment]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!assignment || !auth.currentUser) throw new Error("Missing assignment context");
      return saveAssignmentEvaluation(
        assignment.id,
        {
          comment,
          criterion_scores: assignment.task.evaluation_categories.flatMap((category) =>
            category.criteria.map((criterion) => ({
              criterion_id: criterion.id,
              score: requirements[criterion.id] ?? 0,
            })),
          ),
        },
        auth.currentUser,
        !!assignment.evaluation,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jury-task", assignment?.task_id] });
      onClose();
    },
  });
  const isFinalized = assignment?.task.status_id === taskStatusByName.evaluated.name;

  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evaluation</p>
            <h2 className="text-3xl font-black text-slate-900">{assignment.submission.team.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{assignment.task.title}</p>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            <RiCloseLargeLine />
          </button>
        </div>

        {isFinalized && (
          <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
            This round has been finalized. Evaluations cannot be modified.
          </div>
        )}

        <div className="space-y-6">
          {assignment.task.evaluation_categories.map((category) => (
            <section key={category.id} className="rounded-3xl border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-900">{category.name}</h3>
              <div className="mt-4 space-y-4">
                {category.criteria.map((criterion) => (
                  <label key={criterion.id} className="block rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{criterion.name}</div>
                        {criterion.description && (
                          <div className="text-sm text-slate-600">{criterion.description}</div>
                        )}
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
                        className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Weight {criterion.weight} • Max {criterion.max_score}
                    </div>
                  </label>
                ))}
              </div>
            </section>
          ))}

          <section>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Comment</label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={isFinalized}
              readOnly={isFinalized}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="Optional feedback for the submission"
            />
          </section>
        </div>

        {!isFinalized && (
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-2 font-semibold text-slate-700">
              <RiCloseLargeLine />
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : "Save evaluation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationsModal;
