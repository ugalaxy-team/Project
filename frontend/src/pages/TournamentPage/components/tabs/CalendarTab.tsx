import { useTranslation } from "react-i18next";
import {
  CalendarIcon,
  UserPlusIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";

const fDate = (d: string) =>
  new Date(d).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

export const CalendarTab = ({ tournamentData }: { tournamentData: any }) => {
  const { t } = useTranslation("tournament");

  if (!tournamentData) return null;

  const { reg_start, reg_end, start_date, end_date, tasks, active_task } =
    tournamentData;

  const timeline = [
    {
      id: "reg",
      title: t("calendar.events.registration.title"),
      start: reg_start,
      end: reg_end,
      icon: <UserPlusIcon className="w-5 h-5 md:w-6 md:h-6" />,
      color: "from-blue-500 to-cyan-400",
      description: t("calendar.events.registration.desc"),
    },
    {
      id: "start",
      title: t("calendar.events.start.title"),
      start: start_date,
      icon: <FlagIcon className="w-5 h-5 md:w-6 md:h-6" />,
      color: "from-purple-600 to-indigo-500",
      description: t("calendar.events.start.desc"),
    },
    ...(tasks || []).map((tItem: any) => ({
      id: `task-${tItem.id}`,
      title: tItem.title,
      start: tItem.start_time,
      end: tItem.end_time,
      icon: <FlagIcon className="w-5 h-5 md:w-6 md:h-6" />,
      color:
        tItem.id === active_task?.id
          ? "from-primary to-primary/70"
          : "from-slate-400 to-slate-500",
      description: tItem.description,
      isActive: tItem.id === active_task?.id,
      requirements: tItem.requirements,
    })),
    {
      id: "end",
      title: t("calendar.events.end.title"),
      start: end_date,
      icon: <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" />,
      color: "from-emerald-500 to-teal-400",
      description: t("calendar.events.end.desc"),
    },
  ];

  return (
    <div className="py-8 md:py-12 md:px-6 max-w-5xl mx-auto font-inter">
      <div className="mb-10 md:mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-text-main mb-3 tracking-tight transition-colors duration-300 font-quicksand">
          {t("calendar.title")}
        </h2>
        <p className="text-text-muted text-[15px] md:text-[16px] transition-colors duration-300">
          {t("calendar.subtitle")}
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border rounded-full hidden md:block transition-colors duration-300"></div>

        <div className="space-y-12 md:space-y-16">
          {timeline.map((step, index) => {
            const isLeft = index % 2 === 0;
            const isActive = step.isActive;

            return (
              <div
                key={step.id}
                className={`relative flex flex-col md:flex-row items-center justify-between w-full ${isLeft ? "md:flex-row-reverse" : ""}`}
              >
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
                  <div
                    className={`w-10 h-10 rounded-full border-[3px] border-bg-card shadow-sm bg-gradient-to-br ${step.color} z-20 transition-all duration-500 flex items-center justify-center ${isActive ? "scale-125 ring-4 ring-primary/20" : ""}`}
                  >
                    <div className="text-white scale-75 font-bold flex items-center justify-center h-full">
                      {isActive ? (
                        <ClockIcon className="animate-spin w-6 h-6" />
                      ) : (
                        step.icon
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[45%]">
                  <div
                    className={`
                    group relative p-6 md:p-8 rounded-[24px] md:rounded-[32px] transition-all duration-500
                    ${
                      isActive
                        ? "bg-bg-card shadow-lg shadow-primary/5 border-2 border-primary/30 ring-1 ring-primary/10"
                        : "bg-bg-body hover:bg-bg-card border border-border shadow-sm hover:shadow-md"
                    }
                  `}
                  >
                    <div
                      className={`inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[11px] md:text-xs font-bold mb-4 bg-gradient-to-r text-white ${step.color}`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {fDate(step.start)}
                      {step.end &&
                        ` — ${new Date(step.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </div>

                    <h3 className="text-[20px] md:text-2xl font-bold text-text-main mb-2 md:mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-text-muted leading-relaxed mb-4 text-[14px] md:text-sm transition-colors duration-300">
                      {step.description}
                    </p>

                    {step.requirements && step.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {step.requirements.map((r: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-bg-body text-text-muted text-[11px] font-bold rounded-lg uppercase border border-border transition-colors duration-300"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {isActive && (
                      <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm animate-pulse">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        {t("calendar.active_badge")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden md:block md:w-[45%]"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
