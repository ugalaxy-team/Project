import { describe, expect, it } from "vitest";

import { juryTaskQueryKey, juryTasksQueryKey } from "./juryQueryKeys";

describe("juryQueryKeys", () => {
  it("builds a stable task key from numeric id", () => {
    expect(juryTaskQueryKey(42)).toEqual(["jury-task", "42"]);
  });

  it("normalizes string task ids", () => {
    expect(juryTaskQueryKey("7")).toEqual(["jury-task", "7"]);
  });

  it("exposes the tasks list key", () => {
    expect(juryTasksQueryKey).toEqual(["jury-tasks"]);
  });
});
