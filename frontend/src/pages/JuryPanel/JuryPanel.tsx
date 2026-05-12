import { getJuryTasks } from "@/api/requests";
import { auth } from "@/firebase";
import { useQuery } from "@tanstack/react-query";
import TournamentCard from "./components/TournamentCard";

const JuryPanel = () => {
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
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight">Jury panel</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Review only the rounds assigned to you. Each task opens its own rubric and submission list.
          </p>
        </div>

        {isLoading && <div className="rounded-3xl bg-white p-8 shadow-sm">Loading tasks...</div>}
        {error && <div className="rounded-3xl bg-red-50 p-8 text-red-700 shadow-sm">Failed to load jury tasks.</div>}

        {!isLoading && !error && tasks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
                No jury assignments yet.
              </div>
            ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <TournamentCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JuryPanel;
