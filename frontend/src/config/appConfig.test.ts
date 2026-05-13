import { describe, expect, it } from "vitest";
import {
  appConfig,
  roleByName,
  roles,
  tournamentStatuses,
  tournamentStatusByName,
  taskStatuses,
  taskStatusByName,
  newsCategories,
} from "./appConfig";

describe("appConfig", () => {
  it("loads roles from shared config", () => {
    expect(roles.length).toBeGreaterThan(0);
    expect(roles.some((r) => r.name === "user")).toBe(true);
  });

  it("roleByName maps organizer entry", () => {
    expect(roleByName.organizer?.display_name).toBeTruthy();
  });

  it("exposes admin role metadata", () => {
    expect(roleByName.admin?.name).toBe("admin");
  });

  it("lists tournament statuses", () => {
    expect(tournamentStatuses.map((s) => s.name)).toContain("draft");
    expect(tournamentStatuses.map((s) => s.name)).toContain("finished");
  });

  it("tournamentStatusByName resolves draft", () => {
    expect(tournamentStatusByName.draft?.display_name).toBeTruthy();
  });

  it("tournamentStatusByName resolves registration", () => {
    expect(tournamentStatusByName.registration).toBeDefined();
  });

  it("lists task statuses", () => {
    expect(taskStatuses.length).toBeGreaterThan(0);
  });

  it("taskStatusByName resolves active", () => {
    expect(taskStatusByName.active).toBeDefined();
  });

  it("taskStatusByName resolves draft task status", () => {
    expect(taskStatusByName.draft?.display_name).toBeTruthy();
  });

  it("newsCategories is a non-empty array", () => {
    expect(Array.isArray(newsCategories)).toBe(true);
    expect(newsCategories.length).toBeGreaterThan(0);
  });

  it("each news category has display fields", () => {
    for (const c of newsCategories) {
      expect(c.name).toBeTruthy();
      expect(c.display_name).toBeTruthy();
    }
  });

  it("raw appConfig preserves roles array shape", () => {
    expect(appConfig.roles[0]).toMatchObject({
      name: expect.any(String),
      display_name: expect.any(String),
    });
  });

  it("tournament statuses include running", () => {
    expect(tournamentStatusByName.running).toBeDefined();
  });

  it("task statuses include evaluated", () => {
    expect(taskStatusByName.evaluated).toBeDefined();
  });

  it("user role has description string", () => {
    expect(roleByName.user?.description?.length).toBeGreaterThan(0);
  });
});
