import React from 'react';
import { 
  CalendarIcon, 
  UserPlusIcon, 
  FlagIcon, 
  CheckCircleIcon, 
  ClockIcon
} from "lucide-react"; 

const fDate = (d: string) => new Date(d).toLocaleString("uk-UA", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit"
});

export const CalendarTab = ({ tournamentData }: { tournamentData: any }) => {
  if (!tournamentData) return null;

  const { 
    reg_start, reg_end, start_date, end_date, tasks, active_task 
  } = tournamentData;

  const timeline = [
    {
      id: 'reg',
      title: "Реєстрація команд",
      start: reg_start,
      end: reg_end,
      icon: <UserPlusIcon className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-400",
      description: "Час збирати команду та подавати заявку на участь."
    },
    {
      id: 'start',
      title: "Відкриття турніру",
      start: start_date,
      icon: <FlagIcon className="w-6 h-6" />,
      color: "from-purple-600 to-indigo-500",
      description: "Офіційний старт та анонс головних правил."
    },
    ...(tasks || []).map((t: any) => ({
      id: `task-${t.id}`,
      title: t.title,
      start: t.start_time,
      end: t.end_time,
      icon: <FlagIcon className="w-6 h-6" />,
      color: t.id === active_task?.id ? "from-amber-500 to-orange-400" : "from-slate-400 to-slate-500",
      description: t.description,
      isActive: t.id === active_task?.id,
      requirements: t.requirements
    })),
    {
      id: 'end',
      title: "Фінал та нагородження",
      start: end_date,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-400",
      description: "Визначення переможців та вручення призів."
    }
  ];

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto font-sans">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Шлях Турніру
        </h2>
        <p className="text-slate-500">Слідкуйте за етапами та не пропустіть дедлайни</p>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-slate-100 rounded-full hidden md:block"></div>

        <div className="space-y-16">
          {timeline.map((step, index) => {
            const isLeft = index % 2 === 0;
            const isActive = step.isActive;

            return (
              <div key={step.id} className={`relative flex items-center justify-between w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
                  <div className={`w-10 h-10 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${step.color} z-20 transition-transform duration-500 ${isActive ? 'scale-125 ring-4 ring-orange-100' : ''}`}>
                    <div className="text-white scale-75 font-bold flex items-center justify-center h-full">
                       {isActive ? <ClockIcon className="animate-spin" /> : null}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[45%]">
                  <div className={`
                    group relative p-8 rounded-[32px] transition-all duration-500
                    ${isActive 
                      ? 'bg-white shadow-[0_20px_50px_rgba(241,177,0,0.15)] border-2 border-amber-200 ring-1 ring-amber-100' 
                      : 'bg-white/60 hover:bg-white border border-slate-100 shadow-sm hover:shadow-xl'}
                  `}>
                    
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 bg-gradient-to-r text-white ${step.color}`}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {fDate(step.start)}
                      {step.end && ` — ${new Date(step.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {step.title}
                    </h3>
                    
                    <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                      {step.description}
                    </p>

                    {step.requirements && step.requirements.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-4">
                         {step.requirements.map((r: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-[11px] font-bold rounded-lg uppercase border border-slate-100">
                             {r}
                           </span>
                         ))}
                       </div>
                    )}

                    {isActive && (
                      <div className="mt-6 flex items-center gap-2 text-amber-600 font-bold text-sm animate-pulse">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        Зараз триває
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