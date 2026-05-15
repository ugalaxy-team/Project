import type { TFunction } from "i18next";
import { type TournamentData } from "./types";
import {
  draftStatus,
  registrationStatus,
  runningStatus,
  finishedStatus,
} from "./config";

export const getTimeLeftInfo = (targetDate: Date, t: TFunction): string => {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return "00:00";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return t("header.deadlines.days", { count: diffDays });

  if (diffHours > 0) return t("header.deadlines.hours", { count: diffHours });

  const mins = diffMinutes % 60;
  const secs = diffSeconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export interface DeadlineInfo {
  currentStatus: string;
  deadlineValue: string | null;
  deadlineLabel: string | null;
}

export const getDeadlineInfo = (
  tournament: TournamentData | null,
  t: TFunction,
): DeadlineInfo => {
  if (!tournament) {
    return {
      currentStatus: draftStatus.name,
      deadlineValue: "...",
      deadlineLabel: t("loading"),
    };
  }

  const now = new Date();
  const regStart = new Date(tournament.reg_start);
  const regEnd = new Date(tournament.reg_end);
  const eventStart = new Date(tournament.start_date);
  const eventEnd = tournament.end_date
    ? new Date(tournament.end_date)
    : new Date(eventStart.getTime() + 48 * 60 * 60 * 1000);

  const statusName =
    (tournament as any).status?.name ||
    (tournament as any).status_name ||
    (tournament as any).status;

  if (now < regStart) {
    return {
      currentStatus: draftStatus.name,
      deadlineValue: getTimeLeftInfo(regStart, t),
      deadlineLabel: t("header.deadlines.registration_starts"),
    };
  }

  if (
    (statusName === registrationStatus.name || now < regEnd) &&
    now < eventStart
  ) {
    return {
      currentStatus: registrationStatus.name,
      deadlineValue: getTimeLeftInfo(regEnd, t),
      deadlineLabel: t("header.deadlines.registration_ends"),
    };
  }

  if (
    (statusName === draftStatus.name || now < eventStart) &&
    now < eventStart
  ) {
    return {
      currentStatus: draftStatus.name,
      deadlineValue: getTimeLeftInfo(eventStart, t),
      deadlineLabel: t("header.deadlines.tournament_starts"),
    };
  }

  if (
    (statusName === runningStatus.name || now < eventEnd) &&
    statusName !== finishedStatus.name
  ) {
    return {
      currentStatus: runningStatus.name,
      deadlineValue: getTimeLeftInfo(eventEnd, t),
      deadlineLabel: t("header.deadlines.tournament_ends"),
    };
  }

  return {
    currentStatus: finishedStatus.name,
    deadlineValue: t("header.deadlines.finished"),
    deadlineLabel: t("header.deadlines.tournament"),
  };
};
