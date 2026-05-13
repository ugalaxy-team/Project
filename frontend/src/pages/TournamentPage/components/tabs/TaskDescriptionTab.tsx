import { ClockIcon } from "../../icons";
import type { TaskInfo } from "../../types";

interface DescriptionTabProps {
  tasks?: TaskInfo[];
  activeTask?: TaskInfo | null;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const datePart = start.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
  const startTimePart = start.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  const endTimePart = end.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

  return `${datePart}, ${startTimePart} — ${endTimePart}`;
};

const hasTaskStarted = (startTime: string): boolean => {
  return new Date(startTime) <= new Date();
};

export const TaskDescriptionTab = ({
  tasks = [],
  activeTask,
}: DescriptionTabProps) => {
  const taskToDisplay = activeTask || tasks?.[0];
  const taskStarted = taskToDisplay ? hasTaskStarted(taskToDisplay.start_time) : false;

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-10">
    
      {!taskStarted && taskToDisplay && (
        <section>
          <div className="relative overflow-hidden bg-amber-50/50 backdrop-blur-md border border-amber-100 rounded-[32px] p-10 text-center shadow-sm">
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
                  <ClockIcon className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <h3 className="text-[26px] text-slate-900 font-bold mb-2">
                Турнір ще не розпочався
              </h3>
              <p className="text-slate-600 text-[17px]">
                Етап розпочнеться: <span className="text-amber-600 font-bold">{formatDate(taskToDisplay.start_time)}</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {taskStarted && taskToDisplay && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[24px] text-indigo-950 font-bold flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
              </div>
              Поточне завдання
            </h3>
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
              {formatTimeRange(taskToDisplay.start_time, taskToDisplay.end_time)}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[28px] border border-slate-200 shadow-sm">
            <h4 className="text-[24px] font-extrabold text-slate-900 mb-4">
              {taskToDisplay.title}
            </h4>
            
            {taskToDisplay.description && (
              <div className="mb-8 text-slate-700 leading-relaxed text-[16px] whitespace-pre-wrap">
                {taskToDisplay.description}
              </div>
            )}

            {taskToDisplay.requirements && taskToDisplay.requirements.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Що потрібно зробити:
                </p>
                <ul className="grid gap-3">
                  {taskToDisplay.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 text-slate-800 text-[15px]">
                      <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-indigo-500"></div>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {tasks && tasks.length > 0 && (
        <section>
          <h3 className="text-[20px] text-slate-900 font-bold mb-6 flex items-center gap-2">
            Графік усіх етапів ({tasks.length})
          </h3>
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-1">
                  <span className={`text-[12px] font-bold uppercase tracking-tight ${task.id === activeTask?.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {task.id === activeTask?.id ? '● Зараз триває' : 'Етап'}
                  </span>
                  <h4 className="font-bold text-slate-800">{task.title}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium text-slate-600">
                    {formatTimeRange(task.start_time, task.end_time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};