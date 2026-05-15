import { describe, expect, it } from "vitest";
import * as UI from "./index";

describe("components/ui index", () => {
  it("re-exports Button for library consumers", () => {
    expect(UI.Button).toBeTypeOf("function");
  });
});
