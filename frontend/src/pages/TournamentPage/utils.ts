import { type TournamentData } from "./types";
import {
  draftStatus,
  registrationStatus,
  runningStatus,
  finishedStatus,
} from "./config";

export const getTimeLeftInfo = (targetDate: Date): string => {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return "0 годин";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} днів`;
  return `${diffHours} годин`;
};

export interface DeadlineInfo {
  currentStatus: string;
  deadlineValue: string;
  deadlineLabel: string;
}

export const getDeadlineInfo = (tournament: TournamentData | null): DeadlineInfo => {
  if (!tournament) {
    return {
      currentStatus: draftStatus.name,
      deadlineValue: "...",
      deadlineLabel: "Завантаження",
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
      deadlineValue: getTimeLeftInfo(regStart),
      deadlineLabel: "До початку реєстрації",
    };
  }

  if (
    (statusName === registrationStatus.name || now < regEnd) &&
    now < eventStart
  ) {
    return {
      currentStatus: registrationStatus.name,
      deadlineValue: getTimeLeftInfo(regEnd),
      deadlineLabel: "До кінця реєстрації",
    };
  }

  if (
    (statusName === draftStatus.name || now < eventStart) &&
    now < eventStart
  ) {
    return {
      currentStatus: draftStatus.name,
      deadlineValue: getTimeLeftInfo(eventStart),
      deadlineLabel: "До старту турніру",
    };
  }

  if (
    (statusName === runningStatus.name || now < eventEnd) &&
    statusName !== finishedStatus.name
  ) {
    return {
      currentStatus: runningStatus.name,
      deadlineValue: getTimeLeftInfo(eventEnd),
      deadlineLabel: "До завершення турніру",
    };
  }

  return {
    currentStatus: finishedStatus.name,
    deadlineValue: "Завершено",
    deadlineLabel: "Турнір",
  };
};
