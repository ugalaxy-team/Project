import { describe, expect, it } from "vitest";

import { formatStatusLabel } from "./formatStatusLabel";

describe("formatStatusLabel", () => {
  it("inserts spaces before capitals in compact API labels", () => {
    expect(formatStatusLabel("SubmissionClosed")).toBe("Submission Closed");
  });

  it("returns plain labels unchanged", () => {
    expect(formatStatusLabel("Active")).toBe("Active");
  });

  it("handles multiple consecutive capitals groups", () => {
    expect(formatStatusLabel("HTTPResponse")).toBe("HTTPResponse");
  });

  it("handles empty string", () => {
    expect(formatStatusLabel("")).toBe("");
  });
});
