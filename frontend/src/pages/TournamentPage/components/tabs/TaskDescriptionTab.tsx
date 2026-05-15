import { useTranslation } from "react-i18next";
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

  const datePart = start.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
  });
  const startTimePart = start.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTimePart = end.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}, ${startTimePart} — ${endTimePart}`;
};

const hasTaskStarted = (startTime: string): boolean => {
  return new Date(startTime) <= new Date();
};

export const TaskDescriptionTab = ({
  tasks = [],
  activeTask,
}: DescriptionTabProps) => {
  const { t } = useTranslation("tournament");

  if (!tasks || tasks.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300 [&>svg]:w-10 [&>svg]:h-10">
          <ClockIcon className="text-text-main transition-colors duration-300" />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("task_desc.empty.title")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          {t("task_desc.empty.description")}
        </p>
      </div>
    );
  }

  const taskToDisplay = activeTask || tasks?.[0];
  const taskStarted = taskToDisplay
    ? hasTaskStarted(taskToDisplay.start_time)
    : false;

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-10">
      {!taskStarted && taskToDisplay && (
        <section>
          <div className="relative overflow-hidden bg-bg-body backdrop-blur-md border border-border rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-center shadow-sm transition-colors duration-300">
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center shadow-sm border border-border transition-colors duration-300 [&>svg]:w-10 [&>svg]:h-10">
                  <ClockIcon className="text-primary transition-colors duration-300" />
                </div>
              </div>
              <h3 className="text-[22px] md:text-[26px] text-text-main font-bold mb-2 transition-colors duration-300">
                {t("task_desc.not_started.title")}
              </h3>
              <p className="text-text-muted text-[15px] md:text-[17px] transition-colors duration-300">
                {t("task_desc.not_started.subtitle")}{" "}
                <span className="text-primary font-bold">
                  {formatDate(taskToDisplay.start_time)}
                </span>
              </p>
            </div>
          </div>
        </section>
      )}

      {taskStarted && taskToDisplay && (
        <section>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <h3 className="text-[20px] md:text-[24px] text-text-main font-bold flex items-center gap-3 transition-colors duration-300">
              <div className="bg-primary p-2 rounded-xl"></div>
              {t("task_desc.current_task.title")}
            </h3>
            <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 transition-colors duration-300">
              {formatTimeRange(
                taskToDisplay.start_time,
                taskToDisplay.end_time,
              )}
            </div>
          </div>

          <div className="bg-bg-body p-6 md:p-8 rounded-[24px] md:rounded-[28px] border border-border shadow-sm transition-colors duration-300">
            <h4 className="text-[20px] md:text-[24px] font-extrabold text-text-main mb-4 transition-colors duration-300">
              {taskToDisplay.title}
            </h4>

            {taskToDisplay.description && (
              <div className="mb-8 text-text-muted leading-relaxed text-[15px] md:text-[16px] whitespace-pre-wrap transition-colors duration-300">
                {taskToDisplay.description}
              </div>
            )}

            {taskToDisplay.requirements &&
              taskToDisplay.requirements.length > 0 && (
                <div className="pt-6 border-t border-border transition-colors duration-300">
                  <p className="text-[12px] font-bold text-text-muted/70 uppercase tracking-widest mb-4 transition-colors duration-300">
                    {t("task_desc.current_task.requirements")}
                  </p>
                  <ul className="grid gap-3">
                    {taskToDisplay.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl bg-bg-card border border-border text-text-main text-[14px] md:text-[15px] transition-colors duration-300"
                      >
                        <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-primary shrink-0"></div>
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
          <h3 className="text-[18px] md:text-[20px] text-text-main font-bold mb-6 flex items-center gap-2 transition-colors duration-300">
            {t("task_desc.schedule.title", { count: tasks.length })}
          </h3>
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-bg-body border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 gap-3 sm:gap-0"
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-[12px] font-bold uppercase tracking-tight transition-colors duration-300 ${
                      task.id === activeTask?.id
                        ? "text-primary"
                        : "text-text-muted/70"
                    }`}
                  >
                    {task.id === activeTask?.id
                      ? `● ${t("task_desc.schedule.active_badge")}`
                      : t("task_desc.schedule.stage_badge")}
                  </span>
                  <h4 className="font-bold text-text-main transition-colors duration-300">
                    {task.title}
                  </h4>
                </div>
                <div className="sm:text-right">
                  <p className="text-[13px] md:text-[14px] font-medium text-text-muted transition-colors duration-300">
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
