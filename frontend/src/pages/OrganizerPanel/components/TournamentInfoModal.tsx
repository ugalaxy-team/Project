import { type Tournament } from "./types";

interface TournamentInfoModalProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
}

const TournamentInfoModal = ({
  isOpen,
  tournament,
  onClose,
}: TournamentInfoModalProps) => {
  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen || !tournament) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md isolate">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white w-full max-w-7xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[96vh] relative z-20">
        
        <div className="bg-gradient-to-r from-[#6D72F1] to-[#8185F9] p-10 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="bg-[#fbbf24] text-slate-900 px-5 py-2 rounded-xl font-black text-xs uppercase shadow-md tracking-[0.2em] mb-5 inline-block">
                {tournament.status?.display_name || tournament.status_name || "Турнір"}
              </span>
              <h3 className="text-4xl md:text-5xl font-black uppercase italic leading-tight tracking-tight drop-shadow-md">
                {tournament.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto bg-[#FBFBFF] p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-2 space-y-10">
              
              <section>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#6D72F1]"></span> Про івент
                </h4>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                    {tournament.description || "Опис не вказано."}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#6D72F1]"></span> Етапи (Таски)
                </h4>
                {tournament.tasks && tournament.tasks.length > 0 ? (
                  <div className="grid gap-6">
                    {tournament.tasks.map((task, idx) => {
                      const isActive = tournament.active_task?.id === task.id;
                      return (
                        <div key={task.id} className={`bg-white rounded-[2rem] p-7 border shadow-md transition-all relative overflow-hidden ${isActive ? 'border-[#fbbf24] ring-4 ring-[#fbbf24]/5' : 'border-slate-100'}`}>
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#fbbf24]"></div>}
                          
                          <div className="flex justify-between items-start md:items-center flex-col md:row-row gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black ${isActive ? 'bg-[#fbbf24] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {idx + 1}
                              </span>
                              <h5 className="font-black text-slate-800 uppercase text-lg">
                                {task.title}
                              </h5>
                              {isActive && (
                                <span className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase animate-pulse tracking-wider">
                                  Активне
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-black text-[#6D72F1] bg-[#6D72F1]/10 px-4 py-2 rounded-xl whitespace-nowrap border border-[#6D72F1]/10">
                              {formatShortDate(task.start_time)} — {formatShortDate(task.end_time)}
                            </span>
                          </div>
                          <p className="text-md text-slate-600 font-medium mb-6 leading-relaxed">{task.description}</p>
                          
                          {task.requirements && task.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {task.requirements.map((req, i) => (
                                <span key={i} className="text-xs font-bold bg-slate-50 text-slate-600 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
                                  <span className="text-emerald-500 text-sm">✓</span> {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 font-bold uppercase text-xs text-center py-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm">Таски відсутні</p>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-400"></span> Команди-учасники
                  </h4>
                  <span className="text-xs font-black text-slate-500 bg-slate-200/50 px-4 py-1.5 rounded-xl">Всього: {tournament.teams?.length || 0}</span>
                </div>
                
                {tournament.teams && tournament.teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tournament.teams.map((team, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="font-black text-slate-800 truncate pr-2 text-md uppercase">{team.name}</h5>
                          <span className="text-xs font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl shrink-0">
                            {team.members?.length || 0} чол.
                          </span>
                        </div>
                        <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-50">
                          {team.team_email && (
                            <p className="text-xs text-slate-500 font-bold flex items-center gap-2 truncate">
                              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                              {team.team_email}
                            </p>
                          )}
                          {team.contact_info && (
                            <p className="text-xs text-slate-500 font-bold flex items-center gap-2 truncate">
                              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                              {team.contact_info}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 font-bold uppercase text-xs text-center py-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm">Команди ще не приєдналися</p>
                )}
              </section>
            </div>

            <div className="space-y-8">
              
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-md space-y-6">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Таймінг
                </h4>
                
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#6D72F1]/5 border border-[#6D72F1]/10">
                    <p className="text-[#6D72F1] font-black uppercase text-[10px] tracking-widest mb-2">Реєстрація</p>
                    <p className="text-slate-800 font-black text-sm">{formatShortDate(tournament.reg_start)} — {formatShortDate(tournament.reg_end)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-2">Проведення</p>
                    <p className="text-slate-800 font-black text-sm">{formatShortDate(tournament.start_date)} — {formatShortDate(tournament.end_date)}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 my-6"></div>

                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 mb-4">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span> Конфігурація
                </h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Макс команд</p>
                    <p className="text-2xl font-black text-slate-700">{tournament.max_teams || "∞"}</p>
                   </div>
                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">В команді</p>
                    <p className="text-2xl font-black text-slate-700">{tournament.min_people_in_team ?? "?"}-{tournament.max_people_in_team ?? "?"}</p>
                   </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-md space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span> Журі
                  </h4>
                  <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{tournament.juries?.length || 0}</span>
                </div>
                
                {tournament.juries && tournament.juries.length > 0 ? (
                  <div className="space-y-6">
                    {tournament.juries.map((jury) => (
                      <div key={jury.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-black text-2xl shadow-sm shrink-0">
                            {jury.full_name?.[0] || "⚖️"}
                          </div>
                          <div>
                            <p className="text-md font-black text-slate-800">{jury.full_name}</p>
                            {jury.roles && jury.roles.length > 0 && (
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                {jury.roles.map(r => r.display_name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2.5 pt-4 border-t border-slate-200/50">
                          {jury.telegram && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-[#229ED9] uppercase w-16">TG:</span>
                                <a href={`https://t.me/${jury.telegram.replace('@','')}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 hover:text-[#229ED9] transition-colors truncate">
                                    @{jury.telegram.replace('@','')}
                                </a>
                            </div>
                          )}
                          {jury.email && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase w-16">Email:</span>
                                <a href={`mailto:${jury.email}`} className="text-xs font-bold text-slate-700 hover:text-[#6D72F1] transition-colors truncate">
                                    {jury.email}
                                </a>
                            </div>
                          )}
                          {jury.github && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-900 uppercase w-16">GH:</span>
                                <a href={`https://github.com/${jury.github}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 hover:text-black transition-colors truncate">
                                    {jury.github}
                                </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 font-bold uppercase text-xs text-center py-8 bg-slate-50 rounded-[2rem]">Журі не призначено</p>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex justify-end shrink-0 z-20">
          <button
            onClick={onClose}
            className="px-12 py-5 bg-[#6D72F1] hover:bg-[#5B60E0] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95"
          >
            Зрозуміло, закрити
          </button>
        </div>
      </div>
    </div>
  );
};

export { TournamentInfoModal };