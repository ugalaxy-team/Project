import { type Tournament, type Task } from "./types";

interface TasksTabProps {
  tournaments: Tournament[];
  tasks: Task[];
  selectedTournament: Tournament | null;
  onTasksClick: (tournament: Tournament | null) => void;
  onCreateTaskClick: (tournament: Tournament) => void;
  onEditTaskClick: (task: Task) => void;
  onDeleteTaskClick: (taskId: number) => void;
  onSwitchTab: () => void;
}

const TasksTab = ({
  tournaments,
  tasks,
  selectedTournament,
  onTasksClick,
  onCreateTaskClick,
  onEditTaskClick,
  onDeleteTaskClick,
  onSwitchTab,
}: TasksTabProps) => {
  if (tournaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">
          Турнірів ще немає
        </h3>
        <p className="text-slate-500 text-center max-w-md mb-6">
          Спочатку створи турнір, а потім зможеш керувати завданнями та
          налаштовувати параметри.
        </p>
        <button
          onClick={onSwitchTab}
          className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-sm transition-colors"
        >
          Перейти до турнірів
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 italic uppercase">
          Керування завданнями
        </h2>
      </div>

      {!selectedTournament ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t: Tournament) => (
            <div
              key={t.id}
              className="group border border-slate-100 rounded-[2rem] p-6 flex justify-between items-center bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all cursor-pointer"
              onClick={() => onTasksClick(t)}
            >
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-[#6366f1] transition-colors">
                  {t.title}
                </h3>
                <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">
                  ID: {t.id}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#6366f1] text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md font-bold text-xl">
                →
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onTasksClick(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition-colors"
              >
                ← Назад
              </button>
              <h3 className="text-xl font-black text-slate-800 uppercase">
                {selectedTournament.title}
              </h3>
            </div>
            <button
              onClick={() => onCreateTaskClick(selectedTournament)}
              className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-sm transition-colors shadow-md"
            >
              + Нове завдання
            </button>
          </div>

          {tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-lg mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-slate-600 text-sm mb-3">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500">
                        <span>
                          📅 Початок:{" "}
                          {new Date(task.start_time).toLocaleString("uk-UA")}
                        </span>
                        {task.end_time && (
                          <span>
                            ⏰ Кінець:{" "}
                            {new Date(task.end_time).toLocaleString("uk-UA")}
                          </span>
                        )}
                      </div>
                      {task.requirements && task.requirements.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {task.requirements.map((req: string) => (
                            <span
                              key={req}
                              className="text-xs bg-[#6366f1] text-white px-2 py-1 rounded-full"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onEditTaskClick(task)}
                        className="px-3 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-bold text-sm transition-colors"
                        title="Редагувати"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDeleteTaskClick(task.id)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors"
                        title="Видалити"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
              <div className="text-5xl mb-4">✨</div>
              <h4 className="text-lg font-black text-slate-800 mb-2 text-center">
                Завдань ще немає
              </h4>
              <p className="text-slate-500 text-center max-w-md mb-4">
                Створи перше завдання для турніру
              </p>
              <button
                onClick={() => onCreateTaskClick(selectedTournament)}
                className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-sm transition-colors"
              >
                + Нове завдання
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { TasksTab };
