import type { JuryTask } from "@/api/requests";
import { Link } from "react-router-dom";

interface TournamentCardProps {
  task: JuryTask;
}

const TournamentCard = ({ task }: TournamentCardProps) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
          {task.status_id}
        </span>
        <span className="text-xs text-slate-500">Task #{task.id}</span>
      </div>
      <h2 className="text-2xl font-black text-slate-900">{task.title}</h2>
      <p className="mt-3 min-h-12 text-sm text-slate-600">
        {task.description || "No description provided for this round."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">{task.min_reviews_per_submission} reviews/submission</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Scale 0-{task.max_score}</span>
      </div>
      <Link
        to={`/jury-panel/evaluate/${task.id}`}
        className="mt-6 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Open round
      </Link>
    </div>
  );
};

export default TournamentCard;
