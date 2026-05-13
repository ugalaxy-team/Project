import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TournamentLoadingState } from "./TournamentLoadingState";

describe("TournamentLoadingState", () => {
  it("shows loading copy", () => {
    render(<TournamentLoadingState />);
    expect(screen.getByText("Завантаження турніру...")).toBeInTheDocument();
  });

  it("renders spinner icon container", () => {
    const { container } = render(<TournamentLoadingState />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses full-screen layout class", () => {
    const { container } = render(<TournamentLoadingState />);
    expect(container.firstChild).toHaveClass("min-h-screen");
  });
});
