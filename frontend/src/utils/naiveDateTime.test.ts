import { describe, expect, it } from "vitest";
import {
  compareNaiveDateTimes,
  formatNaiveDateTime,
  parseNaiveDateTimeParts,
  toNaiveApiDateTime,
  toPickerDateTimeValue,
} from "./naiveDateTime";

describe("naiveDateTime", () => {
  it("preserves wall-clock components from picker value", () => {
    expect(toNaiveApiDateTime("2026-05-15T15:00")).toBe("2026-05-15T15:00:00");
  });

  it("serializes picker value without converting through UTC", () => {
    expect(toNaiveApiDateTime("2026-05-15T15:00")).toBe("2026-05-15T15:00:00");
    expect(toNaiveApiDateTime("2026-05-15T15:00")).not.toMatch(/Z$/);
  });

  it("strips timezone suffix but keeps clock digits for picker", () => {
    expect(toPickerDateTimeValue("2026-05-15T10:00:00.000Z")).toBe("2026-05-15T10:00");
    expect(toPickerDateTimeValue("2026-05-15T10:00:00")).toBe("2026-05-15T10:00");
  });

  it("normalizes API strings with seconds", () => {
    expect(toNaiveApiDateTime("2026-05-15T10:30:45")).toBe("2026-05-15T10:30:45");
  });

  it("compares naive datetimes lexicographically after normalization", () => {
    expect(compareNaiveDateTimes("2026-05-02T10:00", "2026-05-01T23:59")).toBeGreaterThan(0);
    expect(compareNaiveDateTimes("2026-05-01T10:00", "2026-05-01T10:00")).toBe(0);
  });

  it("parses components without timezone interpretation", () => {
    expect(parseNaiveDateTimeParts("2026-05-15T15:00:00Z")).toEqual({
      year: 2026,
      month: 5,
      day: 15,
      hours: 15,
      minutes: 0,
      seconds: 0,
    });
  });

  it("formats using wall-clock local Date", () => {
    const formatted = formatNaiveDateTime("2026-05-15T15:30", "uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    expect(formatted).toContain("15");
    expect(formatted).toContain("30");
  });
});
