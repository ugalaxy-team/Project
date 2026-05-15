import { type Tournament, type Task } from "./types";
import { formatNaiveDateTime } from "@/utils/naiveDateTime";
import { 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Trash2, 
  Pencil, 
  ClipboardList, 
  LayoutGrid,
  Trophy
} from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-4xl">
          <ClipboardList className="text-slate-300" size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">
          Турнірів ще немає
        </h3>
        <p className="text-slate-500 text-center max-w-sm mb-8 leading-relaxed">
          Спочатку створи свій перший турнір, щоб наповнити його крутими завданнями.
        </p>
        <button
          onClick={onSwitchTab}
          className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Trophy size={18} />
          Перейти до турнірів
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-indigo-600" size={28} />
            КЕРУВАННЯ ЗАВДАННЯМИ
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            {!selectedTournament ? "Оберіть турнір для редагування" : "Налаштування завдань турніру"}
          </p>
        </div>
      </div>

      {!selectedTournament ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((t: Tournament) => (
            <div
              key={t.id}
              onClick={() => onTasksClick(t)}
              className="group relative overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all cursor-pointer hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
              
              <div className="relative flex justify-between items-center">
                <div className="space-y-3">
                  <div className="inline-flex px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    ID: {t.id}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase leading-tight group-hover:text-indigo-600 transition-colors">
                    {t.title}
                  </h3>
                </div>
                
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onTasksClick(null)}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all active:scale-90"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Поточний турнір</span>
                <h3 className="text-xl font-black text-slate-900 uppercase">
                  {selectedTournament.title}
                </h3>
              </div>
            </div>
            <button
              onClick={() => onCreateTaskClick(selectedTournament)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Plus size={18} />
              Нове завдання
            </button>
          </div>

          {tasks && tasks.length > 0 ? (
            <div className="grid gap-4">
              {tasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 transition-all hover:shadow-lg hover:border-indigo-100"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="font-black text-slate-800 text-xl mb-2 group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">
                          <Calendar size={14} className="text-indigo-500" />
                          {formatNaiveDateTime(task.start_time, "uk-UA", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {task.end_time && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-xl text-xs font-bold text-red-600 border border-red-100">
                            <Clock size={14} />
                            До {formatNaiveDateTime(task.end_time, "uk-UA", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                      </div>

                      {task.requirements && task.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {task.requirements.map((req: string) => (
                            <span
                              key={req}
                              className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-black uppercase tracking-wider border border-indigo-100"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 self-center">
                      <button
                        onClick={() => onEditTaskClick(task)}
                        className="p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-400 rounded-xl transition-all shadow-sm active:scale-90"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteTaskClick(task.id)}
                        className="p-3 bg-white border border-slate-200 hover:border-red-400 hover:text-red-600 text-slate-400 rounded-xl transition-all shadow-sm active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <Plus className="text-slate-300" size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">Тут поки порожньо</h4>
              <p className="text-slate-400 text-sm mb-6">Додайте перше завдання для цього турніру</p>
              <button
                onClick={() => onCreateTaskClick(selectedTournament)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                + Додати завдання
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { TasksTab };