import { useState } from "react";

const MOCK_TOURNAMENTS = [
  { id: "001", name: "ВЕСНЯНИЙ КУБОК UGALAXY", status: "Активний" },
  { id: "002", name: "CYBER SPORT STAGE", status: "Очікується" },
];

const MOCK_USERS = [
  { id: "u1", name: "Олександр Коваль", email: "olex@gmail.com", avatar: "О" },
  { id: "u2", name: "Марія Сидоренко", email: "mariya.s@ukr.net", avatar: "М" },
  { id: "u3", name: "Дмитро Іванов", email: "dima_v@gmail.com", avatar: "Д" },
  { id: "u4", name: "Анна Петренко", email: "anna.p@gmail.com", avatar: "А" },
];

const OrganizerPanel = () => {
  const [activeTab, setActiveTab] = useState<"tournaments" | "jury">("tournaments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  
  const [addedJurors, setAddedJurors] = useState<string[]>([]);

  const openJuryModal = (tournamentName: string) => {
    setSelectedTournament(tournamentName);
    setIsModalOpen(true);
    setAddedJurors([]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleJuror = (userId: string) => {
    setAddedJurors(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <section className="bg-[#8b18ff] relative pt-12 pb-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <span className="bg-[#ffde59] text-slate-900 px-4 py-1.5 rounded-full font-bold text-xs inline-block mb-6 shadow-sm">
            👋 Привіт, Організаторе!
          </span>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black tracking-wider mb-4 drop-shadow-md">
            ШТАБ ОРГАНІЗАТОРА.<br />СТВОРЮЙ. НАДИХАЙ.
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-sm font-medium">
            Твій пульт генерації емоцій. Тут ти запускаєш круті турніри, збираєш зіркове журі<br className="hidden md:block" />
            та задаєш ритм усьому Всесвіту UGalaxy. 🚀
          </p>
        </div>
        <div className="absolute -bottom-[1px] left-0 w-full leading-[0]">
          <svg viewBox="0 0 1440 100" className="h-[40px] md:h-[70px] w-full" preserveAspectRatio="none">
            <path fill="#F8FAFC" d="M0,50 C320,0 420,0 720,50 C1020,100 1120,100 1440,50 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("tournaments")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === "tournaments" ? "bg-[#ffde59] text-slate-900" : "bg-white text-slate-600 hover:bg-gray-50"
            }`}
          >
            🏆 Турніри
          </button>
          <button 
            onClick={() => setActiveTab("jury")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === "jury" ? "bg-[#ffde59] text-slate-900" : "bg-white text-slate-600 hover:bg-gray-50"
            }`}
          >
            ⚖️ Журі
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          {activeTab === "tournaments" && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Управління турнірами</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Шукати у всесвіті..." 
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b18ff]"
                />
                <select className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8b18ff] min-w-[180px]">
                  <option>Фільтрувати за...</option>
                  <option>Активні</option>
                  <option>Очікуються</option>
                </select>
                <button className="bg-[#8b18ff] hover:bg-[#7210d6] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                  + Створити турнір
                </button>
              </div>
              <div className="w-full overflow-x-auto border border-gray-100 rounded-xl">
                <div className="min-w-[600px]">
                  <div className="bg-slate-100 flex justify-between px-6 py-3 text-sm font-semibold text-slate-700">
                    <div className="w-20">ID</div>
                    <div className="flex-1">Назва турніру</div>
                    <div className="w-48 text-right">Дії</div>
                  </div>
                  
                  {MOCK_TOURNAMENTS.map((t) => (
                    <div key={t.id} className="flex justify-between items-center px-6 py-4 border-b border-gray-100 text-sm hover:bg-gray-50 transition-colors">
                      <div className="w-20 text-slate-500 font-medium">#{t.id}</div>
                      <div className="flex-1 text-slate-700 font-medium">{t.name}</div>
                      <div className="w-48 flex justify-end gap-2">
                        <button className="bg-[#475569] hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors">
                          Редагувати
                        </button>
                        <button className="bg-[#ff007f] hover:bg-pink-700 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors">
                          Видалити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "jury" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-black text-slate-800 italic uppercase mb-6">
                ВИБЕРІТЬ ТУРНІР ДЛЯ ПРИЗНАЧЕННЯ ЖУРІ
              </h2>
              
              <div className="flex flex-col gap-4">
                {MOCK_TOURNAMENTS.map((t) => (
                  <div key={t.id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg uppercase">{t.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        ID: {t.id} • Поточний статус: {t.status}
                      </p>
                    </div>
                    <button 
                      onClick={() => openJuryModal(t.name)}
                      className="bg-white border border-slate-200 text-slate-700 hover:border-[#8b18ff] hover:text-[#8b18ff] px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm whitespace-nowrap"
                    >
                      Додати журі +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-[#8b18ff] p-8 text-white relative shrink-0">
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
              <h3 className="text-3xl font-black uppercase italic mb-1">ДОДАТИ ЖУРІ</h3>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
                ТУРНІР: {selectedTournament}
              </p>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50">
              <div className="mb-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Пошук за ім'ям або email..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b18ff] shadow-sm transition-shadow"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {MOCK_USERS.map(user => {
                  const isAdded = addedJurors.includes(user.id);
                  
                  return (
                    <div 
                      key={user.id} 
                      className={`flex items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-200 ${
                        isAdded 
                          ? "border-[#8b18ff] shadow-[0_4px_12px_rgba(139,24,255,0.1)]" 
                          : "border-slate-100 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-colors ${
                          isAdded ? "bg-[#8b18ff] text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => toggleJuror(user.id)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                          isAdded 
                            ? "bg-[#8b18ff]/10 text-[#8b18ff] hover:bg-[#8b18ff]/20" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isAdded ? "✓ Додано" : "Додати +"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center shrink-0 rounded-b-[2rem]">
              <span className="text-sm font-bold text-slate-500">
                Вибрано: <span className="text-[#8b18ff]">{addedJurors.length}</span>
              </span>
              <button 
                onClick={closeModal}
                className="bg-[#8b18ff] hover:bg-[#7210d6] text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
              >
                ГОТОВО
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { OrganizerPanel };