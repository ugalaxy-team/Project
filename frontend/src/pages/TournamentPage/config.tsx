import { tournamentStatuses } from "@/config/appConfig";
import { DraftIcon, RegistrationIcon, ActiveIcon, FinishedIcon } from "./icons";
import type { TabConfig, StatusConfig, TabId } from "./types";

export const TABS: { id: TabId; label: string }[] = [
  { id: "desc", label: "Опис" },
  { id: "task_desc", label: "Завдання" },
  { id: "teams", label: "Команди" },
  { id: "calendar", label: "Календар" },
  { id: "leaderboard", label: "Рейтинг" },
  { id: "submissions", label: "Здача робіт" },
];

const [draftStatus, registrationStatus, runningStatus, finishedStatus] =
  tournamentStatuses;

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  [draftStatus.name]: {
    label: draftStatus.display_name,
    className:
      "bg-accent/90 text-dark-theme shadow-[0_0_20px_rgba(250,204,21,0.4)]",
    icon: <DraftIcon />,
  },
  [registrationStatus.name]: {
    label: registrationStatus.display_name,
    className:
      "bg-blue-400/90 text-blue-950 shadow-[0_0_20px_rgba(96,165,250,0.4)]",
    icon: <RegistrationIcon />,
  },
  [runningStatus.name]: {
    label: runningStatus.display_name,
    className:
      "bg-emerald-400/90 text-emerald-950 shadow-[0_0_20px_rgba(52,211,153,0.4)]",
    icon: <ActiveIcon />,
  },
  [finishedStatus.name]: {
    label: finishedStatus.display_name,
    className: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    icon: <FinishedIcon />,
  },
};

export { draftStatus, registrationStatus, runningStatus, finishedStatus };
