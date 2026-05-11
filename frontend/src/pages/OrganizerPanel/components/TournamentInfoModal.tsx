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
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen || !tournament) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm isolate">
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Головний контейнер - світлий і широкий */}
      <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] relative z-20">
        
        {/* Header - Світлий фірмовий градієнт */}
        <div className="bg-gradient-to-r from-[#6D72F1] to-[#8185F9] p-8 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="bg-[#fbbf24] text-slate-900 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-sm tracking-widest mb-4 inline-block">
                {tournament.status?.display_name || tournament.status_name || "Турнір"}
              </span>
              <h3 className="text-3xl md:text-4xl font-black uppercase italic leading-tight tracking-tight drop-shadow-sm">
                {tournament.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90 backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Основний контент */}
        <div className="flex-grow overflow-y-auto bg-[#FBFBFF] p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ЛІВА ЧАСТИНА (Опис, Таски, Команди) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Опис */}
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6D72F1]"></span> Про івент
                </h4>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                    {tournament.description || "Опис не вказано."}
                  </p>
                </div>
              </section>

              {/* Таски */}
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6D72F1]"></span> Етапи (Таски)
                </h4>
                {tournament.tasks && tournament.tasks.length > 0 ? (
                  <div className="grid gap-4">
                    {tournament.tasks.map((task, idx) => {
                      const isActive = tournament.active_task?.id === task.id;
                      return (
                        <div key={task.id} className={`bg-white rounded-3xl p-5 border shadow-sm transition-all relative overflow-hidden ${isActive ? 'border-[#fbbf24] shadow-[#fbbf24]/10' : 'border-slate-100'}`}>
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#fbbf24]"></div>}
                          
                          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black ${isActive ? 'bg-[#fbbf24] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {idx + 1}
                              </span>
                              <h5 className="font-bold text-slate-800 uppercase text-sm">
                                {task.title}
                              </h5>
                              {isActive && (
                                <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase animate-pulse">
                                  Активне
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#6D72F1] bg-[#6D72F1]/10 px-3 py-1.5 rounded-xl whitespace-nowrap">
                              {formatShortDate(task.start_time)} — {formatShortDate(task.end_time)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium mb-4">{task.description}</p>
                          
                          {task.requirements && task.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {task.requirements.map((req, i) => (
                                <span key={i} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1">
                                  <span className="text-emerald-500">✓</span> {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 font-bold uppercase text-[10px] text-center py-8 bg-white rounded-3xl border border-slate-100 shadow-sm">Таски відсутні</p>
                )}
              </section>

              {/* Команди з усіма даними */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Команди-учасники
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-lg">Всього: {tournament.teams?.length || 0}</span>
                </div>
                
                {tournament.teams && tournament.teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournament.teams.map((team, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-black text-slate-800 truncate pr-2 text-sm">{team.name}</h5>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg shrink-0">
                            {team.members?.length || 0} чол.
                          </span>
                        </div>
                        <div className="space-y-1.5 mt-3">
                          {team.team_email && (
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                              {team.team_email}
                            </p>
                          )}
                          {team.contact_info && (
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {team.contact_info}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 font-bold uppercase text-[10px] text-center py-8 bg-white rounded-3xl border border-slate-100 shadow-sm">Команди ще не приєдналися</p>
                )}
              </section>
            </div>

            {/* ПРАВА ЧАСТИНА (Таймінг, Правила, Журі) */}
            <div className="space-y-6">
              
              {/* Таймінг - СВІТЛИЙ */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Таймінг
                </h4>
                
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#6D72F1]/5 border border-[#6D72F1]/10">
                    <p className="text-[#6D72F1] font-black uppercase text-[9px] tracking-widest mb-1">Реєстрація</p>
                    <p className="text-slate-800 font-bold text-xs">{formatShortDate(tournament.reg_start)} — {formatShortDate(tournament.reg_end)}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-emerald-600 font-black uppercase text-[9px] tracking-widest mb-1">Проведення</p>
                    <p className="text-slate-800 font-bold text-xs">{formatShortDate(tournament.start_date)} — {formatShortDate(tournament.end_date)}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 my-4"></div>

                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span> Конфігурація
                </h4>
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Макс команд</p>
                    <p className="text-lg font-black text-slate-700">{tournament.max_teams || "∞"}</p>
                   </div>
                   <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">В команді</p>
                    <p className="text-lg font-black text-slate-700">{tournament.min_people_in_team ?? "?"}-{tournament.max_people_in_team ?? "?"}</p>
                   </div>
                </div>
              </div>

              {/* ЖУРІ З КНОПКАМИ */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Журі
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{tournament.juries?.length || 0}</span>
                </div>
                
                {tournament.juries && tournament.juries.length > 0 ? (
                  <div className="space-y-4">
                    {tournament.juries.map((jury) => (
                      <div key={jury.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg shadow-sm">
                            {jury.full_name?.[0] || "⚖️"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{jury.full_name}</p>
                            {jury.roles && jury.roles.length > 0 && (
                              <p className="text-[10px] text-slate-500 font-medium truncate">
                                {jury.roles.map(r => r.display_name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* КНОПОЧКИ ДЛЯ ЗВ'ЯЗКУ */}
                        <div className="flex flex-wrap gap-2">
                          {jury.telegram && (
                            <a href={`https://t.me/${jury.telegram.replace('@','')}`} target="_blank" rel="noreferrer" 
                               className="flex-1 text-center text-[10px] font-bold text-white bg-[#229ED9] hover:bg-[#1d86b8] px-2 py-2 rounded-xl transition-colors">
                              Telegram
                            </a>
                          )}
                          {jury.github && (
                            <a href={`https://github.com/${jury.github}`} target="_blank" rel="noreferrer" 
                               className="flex-1 text-center text-[10px] font-bold text-white bg-[#24292e] hover:bg-[#1b1f23] px-2 py-2 rounded-xl transition-colors">
                              GitHub
                            </a>
                          )}
                          {jury.email && (
                            <a href={`mailto:${jury.email}`} 
                               className="flex-1 text-center text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-2 rounded-xl transition-colors">
                              Email
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 font-bold uppercase text-[10px] text-center py-4 bg-slate-50 rounded-2xl">Журі не призначено</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-100 flex justify-end shrink-0 z-20">
          <button
            onClick={onClose}
            className="px-10 py-3.5 bg-[#6D72F1] hover:bg-[#5B60E0] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            Зрозуміло, закрити
          </button>
        </div>
      </div>
    </div>
  );
};

export { TournamentInfoModal };