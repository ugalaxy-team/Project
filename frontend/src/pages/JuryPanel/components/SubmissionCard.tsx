import type { JuryAssignment } from "@/api/requests";
import { appConfig, taskStatusByName } from "@/config/appConfig";

interface SubmissionCardProps {
  assignment: JuryAssignment;
  onOpen: (assignment: JuryAssignment) => void;
}

const SubmissionCard = ({ assignment, onOpen }: SubmissionCardProps) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submission</p>
          <h2 className="text-2xl font-black text-slate-900">{assignment.submission.team.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{assignment.submission.team.team_email}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            assignment.evaluation ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {assignment.evaluation ? "Reviewed" : "Pending"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        {assignment.submission.urls.length > 0 ? (
          assignment.submission.urls.map((item) => (
            <p
              key={item.id}
              className="block truncate rounded-2xl bg-slate-50 px-4 py-2 hover:bg-slate-100"
            >
              {item.url.display_name}: {item.value}
            </p>
          ))
        ) : (
          <p className="rounded-2xl bg-slate-50 px-4 py-2">No submission links were attached.</p>
        )}
      </div>

      <button
        onClick={() => onOpen(assignment)}
        className="mt-5 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        {assignment.evaluation ? assignment.task.status_id === taskStatusByName.evaluated.name ? 'View evaluation':  "Update evaluation" : "Start evaluation"}
      </button>
    </div>
  );
};

export default SubmissionCard;
