import { finishEvaluation, getJuryAssignments, type JuryAssignment } from "@/api/requests";
import { auth } from "@/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import EvaluationsModal from "./components/EvaluationsModal";
import SubmissionCard from "./components/SubmissionCard";
import { taskStatusByName } from "@/config/appConfig";

const EvaluateTournamentPage = () => {
  const { id } = useParams();
  const [selectedAssignment, setSelectedAssignment] = useState<JuryAssignment | null>(null);
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  const {
    data: assignments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jury-task", id],
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

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!tournamentId || !id || !user) throw new Error("Missing context");
      return finishEvaluation(tournamentId, Number(id), user);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jury-task", id] });
      toast.success("Round finalized successfully");
    },
    onError: (err) => {
      toast.error((err as Error)?.message || "Failed to finalize round");
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Assigned round</p>
          <h1 className="mt-2 text-4xl font-black">{task?.title || "Loading round"}</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            {task?.description || "Review every assigned submission using the round rubric."}
          </p>
        </div>

        {isFinalized ? (
          <div className="mb-8 rounded-3xl bg-emerald-50 p-6 text-emerald-800 ring-1 ring-emerald-200">
            <p className="font-semibold">This round has been finalized.</p>
          </div>
        ) : (
          <div className="mb-8 flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">Round status</p>
              <p className="text-xs text-slate-500">
                {allReviewed
                  ? "All assigned submissions have been reviewed. An organizer can finalize this round."
                  : `${assignments.filter((a) => a.evaluation).length}/${assignments.length} submissions reviewed.`}
              </p>
            </div>
            {allReviewed && <button
              onClick={() => finishMutation.mutate()}
              disabled={finishMutation.isPending}
              className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {finishMutation.isPending ? "Finalizing..." : "Finalize evaluation"}
            </button>}
          </div>
        )}

        {isLoading && <div className="rounded-3xl bg-white p-8 shadow-sm">Loading submissions...</div>}
        {error && <div className="rounded-3xl bg-red-50 p-8 text-red-700 shadow-sm">Failed to load assigned submissions.</div>}

        {!isLoading && !error && assignments.length === 0 ? (
              <div className="rounded-3xl w-full border border-dashed border-slate-300 bg-white p-8 text-slate-500">
                No submissions assigned for this round.
              </div>
            ) : <div className="grid gap-5 lg:grid-cols-2">
              {assignments.map((assignment) => (
                <SubmissionCard
                  key={assignment.id}
                  assignment={assignment}
                  onOpen={setSelectedAssignment}
                />
              ))}
          
          </div>
          
        }
      </div>

      <EvaluationsModal assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} isFinalized={isFinalized} />
    </div>
  );
};

export default EvaluateTournamentPage;
