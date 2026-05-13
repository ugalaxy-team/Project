import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentErrorState } from "./TournamentErrorState";

describe("TournamentErrorState", () => {
  it("renders friendly heading", () => {
    render(
      <TournamentErrorState error={new Error("x")} onRetry={vi.fn()} />,
    );
    expect(screen.getByText("Ой, халепа!")).toBeInTheDocument();
  });

  it("shows axios-style response message", () => {
    const err = {
      response: { data: { message: "Server exploded" } },
    } as unknown as Error;
    render(<TournamentErrorState error={err} onRetry={vi.fn()} />);
    expect(screen.getByText("Server exploded")).toBeInTheDocument();
  });

  it("shows axios detail array message when present", () => {
    const err = {
      response: { data: { detail: [{ msg: "Invalid id" }] } },
    } as unknown as Error;
    render(<TournamentErrorState error={err} onRetry={vi.fn()} />);
    expect(screen.getByText("Invalid id")).toBeInTheDocument();
  });

  it("falls back to error.message", () => {
    render(
      <TournamentErrorState
        error={new Error("Plain message")}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText("Plain message")).toBeInTheDocument();
  });

  it("calls onRetry when retry button pressed", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<TournamentErrorState error={new Error("e")} onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Спробувати знову" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
