import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type RootState } from "../../store"; 
import { getAllTournaments } from "@/api/requests/getAllTournaments"; 
import { deleteTournament } from "@/api/requests/deleteTournament";
import { updateTournament } from "@/api/requests/updateTournament";
import { createTournament } from "@/api/requests/createTournament";
import { EditTournamentModal } from "./EditTournamentModal";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { getAllUsers } from "@/api/requests/getAllUsers";

interface Creator {
  id: number;
  full_name: string;
  email: string;
}

interface TournamentStatus {
  name: string;
  display_name: string;
}

interface Tournament {
  id: number;
  title: string;
  description: string;
  creator: Creator;
  status: TournamentStatus;
  status_name: string;
  reg_start?: string;
  reg_end?: string;
  start_date?: string;
  end_date?: string;
  max_teams?: number;
}

interface User {
  full_name: string;
  id: number;
  email: string;
  firebase_uid: string;
  roles: Roles[];
  telegram: string;
  github: string;
  discord: string;
}

interface Roles {
  name: string;
  display_name: string;
  description: string;
}

const OrganizerPanel = () => {
  const currentUser = useSelector((s: RootState) => s.user.user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"tournaments" | "jury">("tournaments");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false);
  
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [addedJurors, setAddedJurors] = useState<number[]>([]); 

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments", currentUser?.id],
    queryFn: async () => {
      const data = await getAllTournaments();
      return data.filter((t: Tournament) => t.creator?.id === currentUser?.id);
    },
    enabled: !!currentUser?.id,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateTournament(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setIsEditModalOpen(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setIsCreateModalOpen(false);
    },
  });

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t: Tournament) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.id.toString().includes(searchQuery);
      const matchesStatus = statusFilter === "all" || t.status?.name === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tournaments, searchQuery, statusFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleDeleteTournament = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Помилка при видаленні:", error);
    }
  };

  const openInfo = (t: Tournament) => {
    setSelectedTournament(t);
    setIsInfoModalOpen(true);
  };

  const openEdit = (t: Tournament) => {
    setSelectedTournament(t);
    setIsEditModalOpen(true);
  };

  const openJury = (t: Tournament) => {
    setSelectedTournament(t);
    setIsJuryModalOpen(true);
    setAddedJurors([]);
  };

  const toggleJuror = (userId: number) => {
    setAddedJurors(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (!currentUser) return <div className="p-10 text-center font-bold text-slate-500">Завантаження профілю...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <section className="bg-[#6366f1] relative pt-12 pb-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <span className="bg-[#fbbf24] text-slate-900 px-4 py-1.5 rounded-full font-bold text-xs inline-block mb-6 shadow-sm">
            👋 Привіт, {'Організаторе'}!
          </span>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black tracking-wider mb-4 drop-shadow-md uppercase italic leading-tight">
            ПАНЕЛЬ ОРГАНІЗАТОРА
          </h1>
        </div>
        <div className="absolute -bottom-[1px] left-0 w-full leading-[0]">
          <svg viewBox="0 0 1440 100" className="h-[40px] md:h-[70px] w-full" preserveAspectRatio="none">
            <path fill="#F8FAFC" d="M0,50 C320,0 420,0 720,50 C1020,100 1120,100 1440,50 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("tournaments")}
            className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              activeTab === "tournaments" ? "bg-[#fbbf24] text-slate-900 scale-105" : "bg-white text-slate-500 hover:bg-gray-50"
            }`}
          >
            🏆 МОЇ ТУРНІРИ
          </button>
          <button 
            onClick={() => setActiveTab("jury")}
            className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              activeTab === "jury" ? "bg-[#fbbf24] text-slate-900 scale-105" : "bg-white text-slate-500 hover:bg-gray-50"
            }`}
          >
            ⚖️ КЕРУВАННЯ ЖУРІ
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-gray-100">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#6366f1]"></div>
              <p className="text-slate-400 font-bold animate-pulse">Завантаження...</p>
            </div>
          ) : (
            <>
              {activeTab === "tournaments" && (
                <div>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase italic">Управління списком</h2>
                      <p className="text-slate-400 text-sm">Всього: {filteredTournaments.length}</p>
                    </div>
                    <button 
                      className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-8 py-3.5 rounded-xl text-sm font-black transition-all shadow-lg uppercase"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      + Створити турнір
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2 relative">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Пошук турніру..." 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366f1] bg-slate-50/50"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-slate-900">🔍</span>
                    </div>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3.5 rounded-2xl border border-gray-200 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    >
                      <option value="all">Усі статуси</option>
                      <option value="active">Активні</option>
                      <option value="pending">Очікуються</option>
                      <option value="closed">Завершені</option>
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    {filteredTournaments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">Нічого не знайдено</h3>
                        <p className="text-slate-500 text-center max-w-md mb-6">
                          {searchQuery || statusFilter !== "all" 
                            ? `На жаль, турнірів за запитом "${searchQuery || 'вибраний статус'}" не знайдено. Спробуй змінити параметри пошуку.`
                            : "Тут поки що немає турнірів. Створи перший турнір, щоб почати!"}
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                          className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-colors"
                        >
                          Очистити фільтри
                        </button>
                      </div>
                    ) : (
                      <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                          <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-6">
                            <th className="pb-2 pl-6">ID</th>
                            <th className="pb-2">Назва</th>
                            <th className="pb-2">Статус</th>
                            <th className="pb-2 text-right pr-6">Керування</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTournaments.map((t) => (
                            <tr key={t.id} className="bg-white border border-gray-100 shadow-sm group hover:shadow-md transition-all">
                              <td className="py-5 pl-6 rounded-l-2xl text-slate-400 font-bold">#{t.id}</td>
                              <td className="py-5 font-black text-slate-800 uppercase text-sm">{t.title}</td>
                              <td className="py-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(t.status?.name || t.status_name)}`}>
                                  {t.status?.display_name || t.status_name}
                                </span>
                              </td>
                            <td className="py-5 pr-6 rounded-r-2xl text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => openInfo(t)} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                </button>
                                <button onClick={() => openEdit(t)} className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all">
                                  Редагувати
                                </button>
                                <button 
                                  onClick={() => handleDeleteTournament(t.id)}
                                  className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                                >
                                  Видалити
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "jury" && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 italic uppercase">Призначення експертів</h2>
                  </div>
                  {tournaments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">Турнірів ще немає</h3>
                      <p className="text-slate-500 text-center max-w-md mb-6">
                        Спочатку створи турнір, а потім зможеш керувати журі та додавати експертів для оцінювання.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab("tournaments");
                        }}
                        className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-sm transition-colors"
                      >
                        Перейти до турнірів
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tournaments.map((t: Tournament) => (
                        <div 
                          key={t.id} 
                          className="group border border-slate-100 rounded-[2rem] p-6 flex justify-between items-center bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all cursor-pointer" 
                          onClick={() => openJury(t)}
                        >
                          <div>
                            <h3 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-[#6366f1] transition-colors">{t.title}</h3>
                            <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">ID: {t.id}</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-[#6366f1] text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md font-bold text-xl">
                            +
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isInfoModalOpen && selectedTournament && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3">
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setIsInfoModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl relative z-10">

            <div className="bg-[#6366f1] p-6 pb-5 text-white relative">
              <button 
                onClick={() => setIsInfoModalOpen(false)} 
                className="absolute top-3 right-4 text-white/50 hover:text-white text-2xl"
              >
                ×
              </button>

              <span className="bg-[#fbbf24] text-slate-900 px-3 py-1 rounded-md font-black text-[10px] uppercase mb-2 inline-block">
                🚀 Інфо
              </span>

              <h3 className="text-xl md:text-2xl font-black uppercase italic leading-tight">
                {selectedTournament.title}
              </h3>
            </div>
            
            <div className="p-5 space-y-5">
              
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">
                  Про проєкт
                </h4>

                <div className="h-[120px] overflow-y-auto rounded-xl bg-slate-50 p-3 border">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {selectedTournament.description || "Опис не вказано."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                
                <div className="p-3 rounded-xl bg-indigo-50 border">
                  <span className="text-[10px] font-black text-indigo-500 uppercase block mb-1">
                    📅 Реєстрація
                  </span>
                  <div className="text-sm font-semibold text-slate-700">
                    {formatDate(selectedTournament.reg_start)} — {formatDate(selectedTournament.reg_end)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border">
                  <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1">
                    🚀 Проведення
                  </span>
                  <div className="text-sm font-semibold text-slate-700">
                    {formatDate(selectedTournament.start_date)} — {formatDate(selectedTournament.end_date)}
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white">
                <span className="text-xs uppercase text-slate-400">
                  Макс. команд
                </span>
                <span className="text-2xl font-black text-[#fbbf24]">
                  {selectedTournament.max_teams || "∞"}
                </span>
              </div>

              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="w-full py-3 bg-[#6366f1] text-white rounded-xl font-black uppercase text-xs tracking-wide hover:bg-[#4f46e5]"
              >
                Закрити
              </button>

            </div>
          </div>
        </div>
      )}

      {isJuryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsJuryModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#6366f1] p-8 text-white shrink-0">
              <button onClick={() => setIsJuryModalOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white text-xl">✕</button>
              <h3 className="text-3xl font-black uppercase italic mb-1">ДОДАТИ ЖУРІ</h3>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">ТУРНІР: {selectedTournament?.title}</p>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50">
              <div className="flex flex-col gap-3">
                {allUsers.length === 0 ? (
                  <p className="text-center text-slate-500 font-bold py-6">Завантаження списку експертів...</p>
                ) : (
                  allUsers.map((user: User) => {
                    const isAdded = addedJurors.includes(user.id);
                    return (
                      <div 
                        key={user.id} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          isAdded 
                            ? "bg-[#6366f1] border-[#6366f1]" 
                            : "bg-white border-slate-100 hover:bg-slate-100" 
                        }`}
                        onClick={() => toggleJuror(user.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-300 ${
                            isAdded ? "bg-white text-[#6366f1]" : "bg-slate-100 text-slate-500"
                          }`}>
                            {user.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className={`font-bold transition-all duration-300 ${isAdded ? "text-white" : "text-slate-800"}`}>
                              {user.full_name}
                            </p>
                            <p className={`text-xs transition-all duration-300 ${isAdded ? "text-white/70" : "text-slate-400"}`}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                            isAdded ? "bg-white text-[#6366f1]" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isAdded ? "✓" : "+"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-white flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">Вибрано: <span className="text-[#6366f1]">{addedJurors.length}</span></span>
              <button onClick={() => setIsJuryModalOpen(false)} className="bg-[#6366f1] text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">
                Зберегти склад
              </button>
            </div>
          </div>
        </div>
      )}

      <EditTournamentModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tournament={selectedTournament}
        onSave={async (id, data) => {
          await updateMutation.mutateAsync({ id, data });
        }}
      />
      <CreateTournamentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (data) => {
          await createMutation.mutateAsync(data);
        }}
      />

    </div>
  );
};

export { OrganizerPanel };