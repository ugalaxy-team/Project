import { useState, useRef, useEffect, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import apiClient from "@/api/client"; 
import { Hero } from "../../components/Hero";

// --- ТИПІЗАЦІЯ ---
interface TournamentData {
  title: string;
  description: string;
  start_date: string;
  reg_start: string;
  reg_end: string;
  max_team: number;
}

const TABS = [
  { id: "desc", label: "Опис завдання" },
  { id: "looking", label: "Шукають команду" },
  { id: "teams", label: "Команди (3)" },
  { id: "results", label: "Результати" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type TourneyStatus = "registration" | "active" | "waiting" | "finished";

// --- ІКОНКИ ---
const RegistrationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
);
const ActiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
const WaitingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const FinishedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
);
const GameDevIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01" /></svg>
);
const ClockIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const CheckCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
const AlertIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);

const STATUS_CONFIG: Record<TourneyStatus, { label: string; className: string; icon: ReactNode }> = {
  registration: {
    label: "Реєстрація",
    className: "bg-blue-400/90 text-blue-950 shadow-[0_0_20px_rgba(96,165,250,0.4)]",
    icon: <RegistrationIcon />,
  },
  active: {
    label: "Активно",
    className: "bg-emerald-400/90 text-emerald-950 shadow-[0_0_20px_rgba(52,211,153,0.4)]",
    icon: <ActiveIcon />,
  },
  waiting: {
    label: "Очікування результатів",
    className: "bg-accent/90 text-dark-theme shadow-[0_0_20px_rgba(250,204,21,0.4)]",
    icon: <WaitingIcon />,
  },
  finished: {
    label: "Завершено",
    className: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    icon: <FinishedIcon />,
  },
};

export const TournamentPage = () => {
  const { id } = useParams<{ id: string }>(); 
  
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) {
        setError("ID турніру не знайдено");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiClient.get<TournamentData>(`/tournaments/${id}`);
        setTournament(response.data);
        setError(null);
      } catch (err: any) {
        const errorMessage = 
          err.response?.data?.detail?.[0]?.msg || 
          err.response?.data?.message || 
          "Не вдалося завантажити інформацію про турнір.";
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const currentStatus: TourneyStatus = "active"; 
  const statusInfo = STATUS_CONFIG[currentStatus];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-body flex flex-col items-center justify-center font-quicksand text-white">
        <SpinnerIcon />
        <p className="mt-4 text-xl font-medium tracking-wide animate-pulse text-white/80">
          Завантаження турніру...
        </p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-bg-body flex items-center justify-center p-5">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="text-red-400 mb-4">
            <AlertIcon />
          </div>
          <h2 className="text-2xl font-quicksand font-bold text-white mb-2">Ой, халепа!</h2>
          <p className="text-red-200/80 mb-6">{error || "Турнір не знайдено"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all font-medium border border-white/10"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-body font-inter text-dark-theme flex flex-col selection:bg-accent/30">
      <Hero
        bgText="SLOVO JAM"
        description=""
        title={
          <div className="flex flex-col items-center w-full mt-8 animate-[fadeIn_0.6s_ease-out_forwards]">
            <div className="flex gap-3 mb-6 flex-wrap justify-center text-base normal-case tracking-normal">
              <div className={`px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default ${statusInfo.className}`}>
                {statusInfo.icon} {statusInfo.label}
              </div>
              <div className="bg-white/10 border border-white/20 text-white backdrop-blur-md px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
                <GameDevIcon /> GameDev & Алгоритми
              </div>
            </div>

            <h1 className="mb-8 block text-[clamp(40px,8vw,80px)] leading-[1.1] font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center w-full gap-8 md:gap-12 mb-12 text-base normal-case bg-white/5 hover:bg-white/10 transition-colors px-6 md:px-12 py-8 rounded-[32px] backdrop-blur-xl border border-white/10 shadow-2xl">
              <StatItem value="48 годин" label="Дедлайн" />
              <div className="hidden md:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent self-center"></div>
              <StatItem value={`До ${tournament.max_team}`} label="Учасників у команді" />
              <div className="hidden md:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent self-center"></div>
              <StatItem value="Top 3" label="Призові місця" />
            </div>

            <div className="flex gap-4 text-base font-normal normal-case tracking-normal font-quicksand relative z-30">
              <button className="btn btn-accent px-10 py-4 shadow-[0_0_30px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_40px_rgba(var(--color-accent),0.5)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-dark-theme font-bold rounded-xl">
                Подати заявку
              </button>
              <button className="btn btn-outline px-10 py-4 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 rounded-xl border-white/30 text-white">
                Шукаю команду
              </button>
            </div>
          </div>
        }
      />

      <TournamentMainContent tournament={tournament} />
    </div>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center font-quicksand group cursor-default">
    <span className="font-bold text-[36px] text-accent leading-none mb-2 tracking-wider group-hover:scale-110 transition-transform duration-300">
      {value}
    </span>
    <span className="text-[13px] opacity-70 group-hover:opacity-100 transition-opacity text-white font-bold tracking-[0.15em] uppercase">
      {label}
    </span>
  </div>
);

const TournamentMainContent = ({ tournament }: { tournament: TournamentData }) => {
  const [activeTab, setActiveTab] = useState<TabId>("desc");
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);
    const activeElement = tabsRef.current[activeIndex];

    if (activeElement) {
      setLineStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <main className="max-w-[1000px] w-full mx-auto mt-6 mb-[100px] relative z-10 px-5">
      <div className="flex justify-center mb-10 relative overflow-x-auto no-scrollbar">
        <div className="flex gap-8 relative pb-4 min-w-max px-2">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              onClick={() => setActiveTab(tab.id)}
              className={`font-quicksand font-bold text-[20px] md:text-[22px] cursor-pointer relative z-10 transition-colors duration-300 px-2 py-1 ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-slate-400 hover:text-primary/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div
            className="absolute bottom-0 h-[4px] bg-primary rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"
            style={{
              left: `${lineStyle.left}px`,
              width: `${lineStyle.width}px`,
            }}
          />
        </div>
      </div>

      <div className="bg-bg-card rounded-[32px] p-6 md:p-[60px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-slate-100 min-h-[400px] transition-all">
        {activeTab === "desc" && <DescriptionTab description={tournament.description} />}
        {activeTab !== "desc" && <PlaceholderTab />}
      </div>
    </main>
  );
};

const DescriptionTab = ({ description }: { description: string }) => (
  <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-12">
    <section>
      <h2 className="text-[28px] md:text-[32px] text-dark-theme font-quicksand font-black mb-6 border-b border-slate-100 pb-4">
        Що потрібно зробити?
      </h2>
      <p className="text-[17px] md:text-[18px] text-slate-600 leading-[1.8] whitespace-pre-wrap font-medium">
        {description}
      </p>
    </section>

    <section>
      <h3 className="text-[24px] text-dark-theme font-quicksand font-bold mb-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <CheckCircleIcon />
        </div>
        Ключові вимоги:
      </h3>
      <ul className="flex flex-col gap-5 text-[17px] text-slate-600 pl-2">
        <li className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
          <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_rgba(var(--color-primary),0.6)]"></div>
          <p className="leading-relaxed">Створити інноваційний проект з використанням GameDev підходів.</p>
        </li>
      </ul>
    </section>
  </div>
);

const PlaceholderTab = () => (
  <div className="animate-[fadeIn_0.4s_ease_forwards] flex flex-col items-center justify-center text-center py-16">
    <div className="w-[100px] h-[100px] bg-slate-50/80 rounded-full flex justify-center items-center text-slate-300 mb-8 shadow-inner">
      <ClockIcon />
    </div>
    <h2 className="text-[28px] md:text-[32px] mb-4 text-dark-theme font-quicksand font-bold">
      В розробці...
    </h2>
    <p className="max-w-[420px] text-slate-500 text-[17px] leading-relaxed">
      Інформація для цього розділу наразі готується. Повертайтеся трохи згодом, ми вже працюємо над цим!
    </p>
  </div>
);