import { useState, useRef, useEffect, type ReactNode } from "react";
import { Header } from "../../components/Header";
import { Hero } from "../../components/Hero";

const TABS = [
  { id: "desc", label: "Опис завдання" },
  { id: "looking", label: "Шукають команду" },
  { id: "teams", label: "Команди (3)" },
  { id: "results", label: "Результати" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type TourneyStatus = "registration" | "active" | "waiting" | "finished";

const RegistrationIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const ActiveIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const WaitingIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FinishedIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const GameDevIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 12h4M8 10v4M15 13h.01M18 11h.01" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-primary)"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const STATUS_CONFIG: Record<
  TourneyStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  registration: {
    label: "Реєстрація",
    className: "bg-blue-400 text-blue-950 shadow-blue-400/20",
    icon: <RegistrationIcon />,
  },
  active: {
    label: "Активно",
    className: "bg-emerald-400 text-emerald-950 shadow-emerald-400/20",
    icon: <ActiveIcon />,
  },
  waiting: {
    label: "Очікування результатів",
    className: "bg-accent text-dark-theme shadow-accent/20",
    icon: <WaitingIcon />,
  },
  finished: {
    label: "Завершено",
    className: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    icon: <FinishedIcon />,
  },
};

export const TournamentPage = () => {
  const currentStatus: TourneyStatus = "active";
  const statusInfo = STATUS_CONFIG[currentStatus];

  return (
    <div className="min-h-screen bg-bg-body font-inter text-dark-theme flex flex-col">
      <Header />

      <Hero
        bgText="SLOVO JAM"
        description=""
        title={
          <div className="flex flex-col items-center w-full mt-8">
            <div className="flex gap-3 mb-6 flex-wrap justify-center text-base normal-case tracking-normal">
              <div
                className={`px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2 shadow-lg ${statusInfo.className}`}
              >
                {statusInfo.icon} {statusInfo.label}
              </div>
              <div className="bg-white/10 border border-white/20 text-white backdrop-blur-md px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2">
                <GameDevIcon /> GameDev & Алгоритми
              </div>
            </div>

            <span className="mb-8 block text-[clamp(48px,8vw,96px)] leading-none">
              Slovo Game Jam
            </span>

            <div className="flex flex-wrap items-center justify-center w-full gap-8 md:gap-12 mb-12 text-base normal-case bg-white/10 px-6 md:px-10 py-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl shadow-black/5">
              <StatItem value="48 годин" label="Дедлайн" />
              <div className="hidden md:block w-[1px] bg-white/20 self-stretch"></div>
              <StatItem value="3-5" label="Учасників у команді" />
              <div className="hidden md:block w-[1px] bg-white/20 self-stretch"></div>
              <StatItem value="Top 3" label="Призові місця" />
            </div>

            <div className="flex gap-4 text-base font-normal normal-case tracking-normal font-quicksand relative z-30">
              <button className="btn btn-accent px-10 py-4 shadow-xl shadow-accent/30 hover:-translate-y-1 hover:scale-105 transition-all text-dark-theme">
                Подати заявку
              </button>
              <button className="btn btn-outline px-10 py-4 hover:bg-white/10 hover:-translate-y-1 transition-all">
                Шукаю команду
              </button>
            </div>
          </div>
        }
      />

      <TournamentMainContent />
    </div>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center font-quicksand">
    <span className="font-bold text-[32px] text-accent leading-none mb-2 tracking-wider">
      {value}
    </span>
    <span className="text-[14px] opacity-90 text-white font-bold tracking-[0.1em] uppercase">
      {label}
    </span>
  </div>
);

const TournamentMainContent = () => {
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
              className={`font-quicksand font-bold text-[22px] cursor-pointer relative z-10 transition-colors duration-300 ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-slate-400 hover:text-primary/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div
            className="absolute bottom-0 h-[4px] bg-primary rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
            style={{
              left: `${lineStyle.left}px`,
              width: `${lineStyle.width}px`,
            }}
          />
        </div>
      </div>

      <div className="bg-bg-card rounded-[32px] p-8 md:p-[60px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] min-h-[400px]">
        {activeTab === "desc" && <DescriptionTab />}
        {activeTab !== "desc" && <PlaceholderTab />}
      </div>
    </main>
  );
};

const DescriptionTab = () => (
  <div className="animate-[fadeIn_0.4s_ease_forwards] flex flex-col gap-10">
    <section>
      <h2 className="text-[32px] text-dark-theme font-quicksand font-bold mb-6">
        Що потрібно зробити?
      </h2>
      <p className="text-[18px] text-slate-600 leading-[1.7]">
        Ваша мета — створити ядро аналог лінукс, створити ядро аналог лінукс,
        створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро
        аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс,
        створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро
        аналог лінукс, створити ядро аналог лінукс
      </p>
    </section>

    <section>
      <h3 className="text-[24px] text-dark-theme font-quicksand font-bold mb-5 flex items-center gap-3">
        <CheckCircleIcon /> Ключові вимоги:
      </h3>
      <ul className="flex flex-col gap-4 text-[18px] text-slate-600 pl-2">
        <li className="flex gap-3 items-start">
          <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0"></div>
          <p>
            створити ядро аналог лінукс, створити ядро аналог лінукс, створити
            ядро аналог лінукс,
          </p>
        </li>
        <li className="flex gap-3 items-start">
          <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0"></div>
          <p>створити ядро аналог лінукс,</p>
        </li>
        <li className="flex gap-3 items-start">
          <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0"></div>
          <p>створити ядро аналог лінукс, створити ядро аналог лінукс,</p>
        </li>
      </ul>
    </section>

    <section className="bg-slate-50 p-8 rounded-[24px] border border-slate-100">
      <h3 className="text-[20px] text-dark-theme font-quicksand font-bold mb-4">
        Стек технологій:
      </h3>
      <p className="text-[16px] text-slate-500 mb-5">
        Жодних жорстких обмежень! Всього лиш вимога писати на перфокатрі, та
        використовуючи два резистора і пачку мівіни змусити це чудо запуститись.
      </p>

      <div className="flex flex-wrap gap-3">
        {["Перфокарти", "Два резистора", "Пачка мівіни"].map((tech) => (
          <span
            key={tech}
            className="px-5 py-2 bg-white text-dark-theme border-2 border-slate-200 rounded-full font-quicksand font-bold shadow-sm"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  </div>
);

const PlaceholderTab = () => (
  <div className="animate-[fadeIn_0.4s_ease_forwards] flex flex-col items-center justify-center text-center py-10">
    <div className="w-[80px] h-[80px] bg-slate-50 rounded-full flex justify-center items-center text-slate-300 mb-6">
      <ClockIcon />
    </div>
    <h2 className="text-[32px] mb-4 text-dark-theme font-quicksand font-bold">
      Скоро буде...
    </h2>
    <p className="max-w-[400px] text-slate-500 text-[18px]">
      Інформація для цього розділу наразі готується. Повертайтеся трохи згодом!
    </p>
  </div>
);
