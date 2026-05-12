import { CheckCircleIcon, ClockIcon } from "../../icons";
import type { TaskInfo } from "../../types";

interface DescriptionTabProps {
  description: string;
  tasks?: TaskInfo[];
  activeTask?: TaskInfo | null;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const formatDateRange = (startTime: string, endTime: string): string => {
  const start = formatDate(startTime);
  const endDate = new Date(endTime);
  const endHours = String(endDate.getHours()).padStart(2, "0");
  const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
  return `${start} - ${endHours}:${endMinutes}`;
};

const hasTaskStarted = (startTime: string): boolean => {
  return new Date(startTime) <= new Date();
};

export const DescriptionTab = ({
  description,
  tasks = [],
  activeTask,
}: DescriptionTabProps) => {
  const taskToDisplay = activeTask || tasks?.[0];
  const taskStarted = taskToDisplay ? hasTaskStarted(taskToDisplay.start_time) : false;

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-12">
      <section>
        <h2 className="text-[28px] md:text-[32px] text-dark-theme font-quicksand font-black mb-6 border-b border-slate-100 pb-4">
          Що потрібно зробити?
        </h2>
        <p className="text-[17px] md:text-[18px] text-slate-600 leading-[1.8] whitespace-pre-wrap font-medium">
          {description}
        </p>
      </section>

      {!taskStarted && taskToDisplay && (
        <section>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <ClockIcon />
              </div>
            </div>
            <h3 className="text-[22px] text-amber-950 font-quicksand font-bold mb-2">
              Турнір ще не розпочався
            </h3>
            <p className="text-amber-700 text-[16px]">
              Етап розпочнеться {formatDate(taskToDisplay.start_time)}
            </p>
          </div>
        </section>
      )}

      {taskStarted && taskToDisplay && (
        <section>
          <h3 className="text-[24px] text-dark-theme font-quicksand font-bold mb-6 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <CheckCircleIcon />
            </div>
            Активне завдання:
          </h3>
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-primary/20">
            <h4 className="text-[20px] font-bold text-dark-theme mb-3">
              {taskToDisplay.title}
            </h4>
            {taskToDisplay.requirements && taskToDisplay.requirements.length > 0 && (
              <div className="mt-4">
                <p className="text-[14px] font-semibold text-slate-700 mb-2">
                  Вимоги:
                </p>
                <ul className="space-y-2">
                  {taskToDisplay.requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-[14px] text-slate-600"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
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
          <h3 className="text-[24px] text-dark-theme font-quicksand font-bold mb-6">
            Усі етапи ({tasks.length})
          </h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-semibold text-dark-theme flex-1">
                    {task.title}
                  </h4>
                  <span className="text-[13px] text-slate-500 whitespace-nowrap">
                    {formatDateRange(task.start_time, task.end_time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
