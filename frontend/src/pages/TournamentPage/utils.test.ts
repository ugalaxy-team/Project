import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TournamentData } from "./types";
import {
  draftStatus,
  registrationStatus,
  runningStatus,
  finishedStatus,
} from "./config";
import { getDeadlineInfo, getTimeLeftInfo } from "./utils";

const baseCreator: TournamentData["creator"] = {
  id: 1,
  full_name: "C",
  email: "c@x.com",
  firebase_uid: "u",
  roles: [],
  is_jury: false,
};

const makeTournament = (overrides: Partial<TournamentData> = {}): TournamentData => ({
  id: 1,
  title: "T",
  description: "D",
  reg_start: "2026-04-01T10:00:00.000Z",
  reg_end: "2026-04-20T10:00:00.000Z",
  start_date: "2026-05-01T10:00:00.000Z",
  end_date: "2026-06-01T10:00:00.000Z",
  max_teams: 8,
  min_people_in_team: 1,
  max_people_in_team: 4,
  status: { name: "draft", display_name: "Draft" },
  status_name: "draft",
  creator: baseCreator,
  tasks: [],
  teams: [],
  juries: [],
  ...overrides,
});

describe("getTimeLeftInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 годин when target is in the past", () => {
    vi.setSystemTime(new Date("2026-05-10T12:00:00Z"));
    expect(getTimeLeftInfo(new Date("2026-05-09T12:00:00Z"))).toBe("0 годин");
  });

  it("returns 0 годин when target equals now", () => {
    vi.setSystemTime(new Date("2026-05-10T12:00:00Z"));
    expect(getTimeLeftInfo(new Date("2026-05-10T12:00:00Z"))).toBe("0 годин");
  });

  it("returns hours when less than one full day remains", () => {
    vi.setSystemTime(new Date("2026-05-10T10:00:00Z"));
    expect(getTimeLeftInfo(new Date("2026-05-11T06:00:00Z"))).toBe("20 годин");
  });

  it("returns 1 годин when between 1 and 24 hours remain and no full day", () => {
    vi.setSystemTime(new Date("2026-05-10T10:00:00Z"));
    expect(getTimeLeftInfo(new Date("2026-05-10T20:00:00Z"))).toBe("10 годин");
  });

  it("returns days when at least one full day remains", () => {
    vi.setSystemTime(new Date("2026-05-10T10:00:00Z"));
    expect(getTimeLeftInfo(new Date("2026-05-15T10:00:00Z"))).toBe("5 днів");
  });

  it("prefers day count when remainder crosses 24h boundary", () => {
    vi.setSystemTime(new Date("2026-05-10T10:00:00Z"));
    expect(getTimeLeftInfo(new Date("2026-05-12T15:00:00Z"))).toBe("2 днів");
  });

  it("returns single-day label for slightly more than 24h", () => {
    vi.setSystemTime(new Date("2026-05-10T10:00:00Z"));
    expect(getTimeLeftInfo(new Date("2026-05-11T11:00:00Z"))).toBe("1 днів");
  });
});

describe("getDeadlineInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns loading placeholder when tournament is null", () => {
    expect(getDeadlineInfo(null)).toEqual({
      currentStatus: draftStatus.name,
      deadlineValue: "...",
      deadlineLabel: "Завантаження",
    });
  });

  it("returns draft + registration countdown before reg_start", () => {
    vi.setSystemTime(new Date("2026-03-25T10:00:00Z"));
    const info = getDeadlineInfo(makeTournament());
    expect(info.currentStatus).toBe(draftStatus.name);
    expect(info.deadlineLabel).toBe("До початку реєстрації");
    expect(info.deadlineValue).toMatch(/днів|годин/);
  });

  it("returns registration phase while inside reg window and before event start", () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    const info = getDeadlineInfo(
      makeTournament({ status: { name: "draft", display_name: "Draft" } }),
    );
    expect(info.currentStatus).toBe(registrationStatus.name);
    expect(info.deadlineLabel).toBe("До кінця реєстрації");
  });

  it("returns registration phase when status is registration even after reg_end if before start", () => {
    vi.setSystemTime(new Date("2026-04-25T10:00:00Z"));
    const info = getDeadlineInfo(
      makeTournament({
        status: { name: registrationStatus.name, display_name: "Reg" },
        status_name: registrationStatus.name,
      }),
    );
    expect(info.currentStatus).toBe(registrationStatus.name);
    expect(info.deadlineLabel).toBe("До кінця реєстрації");
  });

  it("returns draft countdown to event start after reg when status is draft", () => {
    vi.setSystemTime(new Date("2026-04-25T10:00:00Z"));
    const info = getDeadlineInfo(
      makeTournament({
        status: { name: draftStatus.name, display_name: "Draft" },
        status_name: draftStatus.name,
      }),
    );
    expect(info.currentStatus).toBe(draftStatus.name);
    expect(info.deadlineLabel).toBe("До старту турніру");
  });

  it("uses start_date + 48h as implicit end when end_date is missing", () => {
    vi.setSystemTime(new Date("2026-05-10T10:00:00Z"));
    const t = makeTournament({
      status: { name: draftStatus.name, display_name: "Draft" },
      status_name: draftStatus.name,
    });
    delete (t as { end_date?: string }).end_date;
    const info = getDeadlineInfo(t);
    expect(info.currentStatus).toBe(finishedStatus.name);
    expect(info.deadlineValue).toBe("Завершено");
  });

  it("returns running phase before custom end_date", () => {
    vi.setSystemTime(new Date("2026-05-02T10:00:00Z"));
    const info = getDeadlineInfo(
      makeTournament({
        status: { name: runningStatus.name, display_name: "Run" },
        status_name: runningStatus.name,
      }),
    );
    expect(info.currentStatus).toBe(runningStatus.name);
    expect(info.deadlineLabel).toBe("До завершення турніру");
  });

  it("returns finished when past end_date", () => {
    vi.setSystemTime(new Date("2026-07-01T10:00:00Z"));
    const info = getDeadlineInfo(makeTournament());
    expect(info.currentStatus).toBe(finishedStatus.name);
    expect(info.deadlineValue).toBe("Завершено");
    expect(info.deadlineLabel).toBe("Турнір");
  });
});
