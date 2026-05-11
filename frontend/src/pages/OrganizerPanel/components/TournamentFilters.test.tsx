import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentFilters } from "./TournamentFilters";

describe("TournamentFilters", () => {
  it("updates search query and status filter via user input", async () => {
    const user = userEvent.setup();
    const setSearchQuery = vi.fn();
    const setStatusFilter = vi.fn();

    render(
      <TournamentFilters
        searchQuery=""
        setSearchQuery={setSearchQuery}
        statusFilter="all"
        setStatusFilter={setStatusFilter}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "Alpha");
    expect(setSearchQuery).toHaveBeenCalled();

    await user.selectOptions(screen.getByRole("combobox"), "running");
    expect(setStatusFilter).toHaveBeenCalledWith("running");
  });

  it("renders initial values from props", () => {
    render(
      <TournamentFilters
        searchQuery="pre-filled"
        setSearchQuery={vi.fn()}
        statusFilter="draft"
        setStatusFilter={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("pre-filled")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("draft");
  });

  it("contains an all-status option", () => {
    render(
      <TournamentFilters
        searchQuery=""
        setSearchQuery={vi.fn()}
        statusFilter="all"
        setStatusFilter={vi.fn()}
      />,
    );

    expect(screen.getByRole("option", { name: "Усі статуси" })).toBeInTheDocument();
  });

  it("calls search setter once for each typed character", async () => {
    const user = userEvent.setup();
    const setSearchQuery = vi.fn();
    render(
      <TournamentFilters
        searchQuery=""
        setSearchQuery={setSearchQuery}
        statusFilter="all"
        setStatusFilter={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "abc");
    expect(setSearchQuery).toHaveBeenCalledTimes(3);
    expect(setSearchQuery).toHaveBeenLastCalledWith("c");
  });
});
