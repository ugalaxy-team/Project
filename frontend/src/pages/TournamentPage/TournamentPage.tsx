import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { tournamentStatuses } from "@/config/appConfig";
import { Hero } from "../../components/Hero";

interface TournamentData {
  title: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  reg_start: string;
  reg_end: string;
  max_teams: number;
  status: {
    name: string;
    display_name: string;
  };
}

const TABS = [
  { id: "desc", i18nKey: "tabs.description", fallback: "Опис завдання" },
  { id: "looking", i18nKey: "tabs.looking", fallback: "Шукають команду" },
  { id: "teams", i18nKey: "tabs.teams", fallback: "Команди (3)" },
  { id: "results", i18nKey: "tabs.results", fallback: "Результати" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const [draftStatus, registrationStatus, runningStatus, finishedStatus] =
  tournamentStatuses;

type TourneyStatus = string;

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
const DraftIcon = () => (
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
const AlertIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const SpinnerIcon = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-8 w-8 text-accent"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const STATUS_CONFIG: Record<
  TourneyStatus,
  { i18nKey: string; fallback: string; className: string; icon: ReactNode }
> = {
  [draftStatus.name]: {
    i18nKey: "status.waiting",
    fallback: draftStatus.display_name,
    className:
      "bg-accent/10 text-yellow-600 dark:bg-accent/20 dark:text-accent shadow-[0_0_20px_rgba(250,204,21,0.2)]",
    icon: <DraftIcon />,
  },
  [registrationStatus.name]: {
    i18nKey: "status.registration",
    fallback: registrationStatus.display_name,
    className:
      "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    icon: <RegistrationIcon />,
  },
  [runningStatus.name]: {
    i18nKey: "status.active",
    fallback: runningStatus.display_name,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    icon: <ActiveIcon />,
  },
  [finishedStatus.name]: {
    i18nKey: "status.finished",
    fallback: finishedStatus.display_name,
    className: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    icon: <FinishedIcon />,
  },
};

const getTimeLeftInfo = (targetDate: Date, t: any) => {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return t("time.zero_hours", "0 годин");

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} ${t("time.days", "днів")}`;
  return `${diffHours} ${t("time.hours", "годин")}`;
};

export const TournamentPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("tournament");
  const navigate = useNavigate();

  // Використовуємо реальний запит до сервера з гілки dev
  const {
    data: tournament,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      if (!id) throw new Error("ID турніру не знайдено");
      const response = await apiClient.get<TournamentData>(
        `/tournaments/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });

  const { currentStatus, deadlineValue, deadlineLabel } = useMemo(() => {
    if (!tournament) {
      return {
        currentStatus: draftStatus.name,
        deadlineValue: "...",
        deadlineLabel: t("hero.loading", "Завантаження"),
      };
    }

    const now = new Date();
    const regStart = new Date(tournament.reg_start);
    const regEnd = new Date(tournament.reg_end);
    const eventStart = new Date(tournament.start_date);
    const eventEnd = tournament.end_date
      ? new Date(tournament.end_date)
      : new Date(eventStart.getTime() + 48 * 60 * 60 * 1000);
    const statusName = tournament.status?.name;

    if (now < regStart) {
      return {
        currentStatus: draftStatus.name,
        deadlineValue: getTimeLeftInfo(regStart, t),
        deadlineLabel: t("deadline.to_reg_start", "До початку реєстрації"),
      };
    }

    if (
      (statusName === registrationStatus.name || now < regEnd) &&
      now < eventStart
    ) {
      return {
        currentStatus: registrationStatus.name,
        deadlineValue: getTimeLeftInfo(regEnd, t),
        deadlineLabel: t("deadline.to_reg_end", "До кінця реєстрації"),
      };
    }

    if (
      (statusName === draftStatus.name || now < eventStart) &&
      now < eventStart
    ) {
      return {
        currentStatus: draftStatus.name,
        deadlineValue: getTimeLeftInfo(eventStart, t),
        deadlineLabel: t("deadline.to_event_start", "До старту турніру"),
      };
    }

    if (
      (statusName === runningStatus.name || now < eventEnd) &&
      statusName !== finishedStatus.name
    ) {
      return {
        currentStatus: runningStatus.name,
        deadlineValue: getTimeLeftInfo(eventEnd, t),
        deadlineLabel: t("deadline.to_submission", "До здачі роботи"),
      };
    }

    return {
      currentStatus: finishedStatus.name,
      deadlineValue: t("status.finished", "Завершено"),
      deadlineLabel: t("hero.tournament", "Турнір"),
    };
  }, [tournament, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-body flex flex-col items-center justify-center font-quicksand transition-colors duration-500">
        <SpinnerIcon />
        <p className="mt-4 text-xl font-medium tracking-wide animate-pulse text-text-main">
          {t("loading", "Завантаження турніру...")}
        </p>
      </div>
    );
  }

  if (error || !tournament) {
    const errorMessage =
      (error as any)?.response?.data?.detail?.[0]?.msg ||
      (error as any)?.response?.data?.message ||
      (error as Error)?.message ||
      t("errors.default_500", "Помилка 500: Турнір не знайдено");

    return (
      <div className="min-h-[70vh] bg-bg-body flex items-center justify-center p-5 transition-colors duration-500">
        <div className="max-w-md w-full bg-bg-card border border-red-500/20 rounded-[32px] p-8 md:p-10 flex flex-col items-center text-center shadow-[0_20px_50px_-10px_rgba(239,68,68,0.15)] animate-[fadeIn_0.4s_ease_forwards] transition-colors duration-500">
          <div className="text-red-500 bg-red-500/10 p-5 rounded-full mb-6 shadow-inner">
            <AlertIcon />
          </div>
          <h2 className="text-2xl md:text-3xl font-quicksand font-black text-text-main mb-4 transition-colors duration-500">
            {t("errors.oops", "Ой, халепа!")}
          </h2>
          <p className="text-text-muted text-[17px] mb-3 font-medium leading-relaxed transition-colors duration-500">
            {t(
              "errors.lost_tournament",
              "Проблемки. Турнір трохи загубився в мережі або щось пішло не так. Але не хвилюйтесь, ми вже намагаємося його знайти!",
            )}
          </p>
          <div className="bg-bg-body border border-border rounded-xl px-4 py-2 mb-8 w-full transition-colors duration-500">
            <p className="text-sm text-red-400 font-mono truncate">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="w-full sm:w-auto px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:-translate-y-1"
          >
            {t("errors.try_again", "Спробувати знову")}
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[currentStatus];

  return (
    <div className="min-h-screen bg-bg-body font-inter text-text-main flex flex-col selection:bg-accent/30 transition-colors duration-500">
      <Hero
        bgText="SLOVO JAM"
        description=""
        title={
          <div className="flex flex-col items-center w-full mt-8 animate-[fadeIn_0.6s_ease-out_forwards]">
            <div className="flex gap-3 mb-6 flex-wrap justify-center text-base normal-case tracking-normal">
              <div
                className={`px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default ${statusInfo.className}`}
              >
                {statusInfo.icon} {t(statusInfo.i18nKey, statusInfo.fallback)}
              </div>
              <div className="bg-white/10 border border-white/20 text-white backdrop-blur-md px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
                <GameDevIcon /> GameDev & Алгоритми
              </div>
            </div>

            <h1 className="mb-8 block text-[clamp(40px,8vw,80px)] leading-[1.1] font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center w-full gap-8 md:gap-12 mb-12 text-base normal-case bg-white/5 hover:bg-white/10 transition-colors px-6 md:px-12 py-8 rounded-[32px] backdrop-blur-xl border border-white/10 shadow-2xl">
              <StatItem value={deadlineValue} label={deadlineLabel} />
              <div className="hidden md:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent self-center"></div>
              <StatItem
                value={`До ${tournament.max_teams}`}
                label={t("hero.participants", "Учасників у команді")}
              />
              <div className="hidden md:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent self-center"></div>
              <StatItem
                value="Top 3"
                label={t("hero.prizes", "Призові місця")}
              />
            </div>

            <div className="flex gap-4 text-base font-normal normal-case tracking-normal font-quicksand relative z-30">
              <button className="btn btn-accent px-10 py-4 shadow-[0_0_30px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_40px_rgba(var(--color-accent),0.5)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-dark-theme font-bold rounded-xl">
                {t("hero.apply", "Подати заявку")}
              </button>
              <button className="btn btn-outline px-10 py-4 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 rounded-xl border-white/30 text-white">
                {t("hero.find_team", "Шукаю команду")}
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

const TournamentMainContent = ({
  tournament,
}: {
  tournament: TournamentData;
}) => {
  const { t } = useTranslation("tournament");
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
    <main className="max-w-[1000px] w-full mx-auto mt-6 mb-[100px] relative z-10 px-5 transition-colors duration-500">
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
                  : "text-text-muted hover:text-primary/70"
              }`}
            >
              {t(tab.i18nKey, tab.fallback)}
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

      <div className="bg-bg-card rounded-[32px] p-6 md:p-[60px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-border min-h-[400px] transition-colors duration-500">
        {activeTab === "desc" && (
          <DescriptionTab description={tournament.description} />
        )}
        {activeTab !== "desc" && <PlaceholderTab />}
      </div>
    </main>
  );
};

const DescriptionTab = ({ description }: { description: string }) => {
  const { t } = useTranslation("tournament");

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-12">
      <section>
        <h2 className="text-[28px] md:text-[32px] text-text-main font-quicksand font-black mb-6 border-b border-border pb-4 transition-colors duration-500">
          {t("content.desc_title", "Що потрібно зробити?")}
        </h2>
        <p className="text-[17px] md:text-[18px] text-text-muted leading-[1.8] whitespace-pre-wrap font-medium transition-colors duration-500">
          {description}
        </p>
      </section>

      <section>
        <h3 className="text-[24px] text-text-main font-quicksand font-bold mb-6 flex items-center gap-3 transition-colors duration-500">
          <div className="bg-primary/10 p-2 rounded-xl">
            <CheckCircleIcon />
          </div>
          {t("content.req_title", "Ключові вимоги:")}
        </h3>
        <ul className="flex flex-col gap-5 text-[17px] text-text-muted pl-2 transition-colors duration-500">
          <li className="flex gap-4 items-start bg-bg-body p-4 rounded-2xl hover:bg-border/30 transition-colors duration-500">
            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_rgba(var(--color-primary),0.6)]"></div>
            <p className="leading-relaxed">
              {t(
                "content.req_1",
                "Створити інноваційний проект з використанням GameDev підходів.",
              )}
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
};

const PlaceholderTab = () => {
  const { t } = useTranslation("tournament");

  return (
    <div className="animate-[fadeIn_0.4s_ease_forwards] flex flex-col items-center justify-center text-center py-16">
      <div className="w-[100px] h-[100px] bg-bg-body rounded-full flex justify-center items-center text-text-muted mb-8 shadow-inner transition-colors duration-500">
        <ClockIcon />
      </div>
      <h2 className="text-[28px] md:text-[32px] mb-4 text-text-main font-quicksand font-bold transition-colors duration-500">
        {t("content.placeholder_title", "В розробці...")}
      </h2>
      <p className="max-w-[420px] text-text-muted text-[17px] leading-relaxed transition-colors duration-500">
        {t(
          "content.placeholder_desc",
          "Інформація для цього розділу наразі готується. Повертайтеся трохи згодом, ми вже працюємо над цим!",
        )}
      </p>
    </div>
  );
};
