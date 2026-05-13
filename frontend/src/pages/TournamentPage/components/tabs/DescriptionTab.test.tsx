import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DescriptionTab } from "./DescriptionTab";

describe("DescriptionTab", () => {
  it("renders heading and description text", () => {
    render(
      <DescriptionTab
        description="Line one\nLine two"
        tasks={[]}
        activeTask={null}
      />,
    );
    expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
    expect(screen.getByText(/Line two/)).toBeInTheDocument();
  });

  it("preserves whitespace from multiline description", () => {
    const text = "A\n\nB";
    const { container } = render(
      <DescriptionTab description={text} tasks={[]} activeTask={null} />,
    );
    const p = container.querySelector("p");
    expect(p).toHaveClass("whitespace-pre-wrap");
    expect(p?.textContent).toContain("A");
    expect(p?.textContent).toContain("B");
  });

  it("renders empty description as empty paragraph body", () => {
    render(<DescriptionTab description="" tasks={[]} activeTask={null} />);
    const heading = screen.getByText("Що потрібно зробити?");
    expect(heading).toBeInTheDocument();
  });
});
