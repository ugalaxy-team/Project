import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { JuryPanelShell } from "./JuryPanelShell";

describe("JuryPanelShell", () => {
  it("renders eyebrow, title, description, and children", () => {
    render(
      <JuryPanelShell
        eyebrow="Assigned round"
        title="Round title"
        description="Round description"
        headerBadge="SubmissionClosed"
      >
        <p>Panel body</p>
      </JuryPanelShell>,
    );

    expect(screen.getByText("Assigned round")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Round title" })).toBeInTheDocument();
    expect(screen.getByText("Round description")).toBeInTheDocument();
    expect(screen.getByText("Panel body")).toBeInTheDocument();
    expect(screen.getByText("Submission Closed")).toBeInTheDocument();
  });

  it("omits header badge when not provided", () => {
    render(
      <JuryPanelShell eyebrow="Eyebrow" title="Title">
        <span>Child</span>
      </JuryPanelShell>,
    );

    expect(screen.queryByText("Submission Closed")).not.toBeInTheDocument();
  });

  it("renders header leading content", () => {
    render(
      <JuryPanelShell
        eyebrow="Eyebrow"
        title="Title"
        headerLeading={<a href="/back">Go back</a>}
      >
        <span>Child</span>
      </JuryPanelShell>,
    );

    expect(screen.getByRole("link", { name: "Go back" })).toBeInTheDocument();
  });

  it("keeps long titles and badges within break-word layout", () => {
    const longTitle = "A".repeat(120);
    const longBadge = "VeryLongStatusNameWithoutSpaces";

    render(
      <JuryPanelShell eyebrow="Eyebrow" title={longTitle} headerBadge={longBadge}>
        <span>Child</span>
      </JuryPanelShell>,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("break-words");
    expect(heading).toHaveTextContent(longTitle);

    const badge = screen.getByText("Very Long Status Name Without Spaces");
    expect(badge.closest("span")).toHaveClass("break-words");
  });
});
