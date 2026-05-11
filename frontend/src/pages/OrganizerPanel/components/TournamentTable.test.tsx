import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentTable } from "./TournamentTable";
import type { Tournament } from "./types";
import { tournamentStatuses } from "@/config/appConfig";

const tournament: Tournament = {
  id: 42,
  title: "Cyber Arena",
  description: "Desc",
  creator: { id: 7, full_name: "Anna", email: "anna@dev.com" },
  status: { name: "registration_open", display_name: "Реєстрація" },
  status_name: "registration_open",
};

const renderTable = (items: Tournament[], searchQuery = "", statusFilter = "all") =>
  render(
    <TournamentTable
      tournaments={items}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      onInfo={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onClearFilters={vi.fn()}
    />,
  );

describe("TournamentTable", () => {
  it("shows empty filtered state and clears filters", async () => {
    const onClearFilters = vi.fn();
    const user = userEvent.setup();

    render(
      <TournamentTable
        tournaments={[]}
        searchQuery="missing"
        statusFilter="draft"
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onClearFilters={onClearFilters}
      />,
    );

    expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Очистити фільтри" }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("renders table row and calls action callbacks", async () => {
    const user = userEvent.setup();
    const onInfo = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TournamentTable
        tournaments={[tournament]}
        searchQuery=""
        statusFilter="all"
        onInfo={onInfo}
        onEdit={onEdit}
        onDelete={onDelete}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.getByText("#42")).toBeInTheDocument();
    expect(screen.getByText("Cyber Arena")).toBeInTheDocument();
    expect(screen.getByText("Реєстрація")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    await user.click(screen.getByRole("button", { name: "Редагувати" }));
    await user.click(screen.getByRole("button", { name: "Видалити" }));

    expect(onInfo).toHaveBeenCalledWith(tournament);
    expect(onEdit).toHaveBeenCalledWith(tournament);
    expect(onDelete).toHaveBeenCalledWith(42);
  });

  it("shows default empty state text when there are no tournaments and no filters", () => {
    renderTable([], "", "all");
    expect(
      screen.getByText("Тут поки що немає турнірів. Створи перший турнір, щоб почати!"),
    ).toBeInTheDocument();
  });

  it("shows filtered empty state text with search query value", () => {
    renderTable([], "omega", "all");
    expect(screen.getByText(/omega/)).toBeInTheDocument();
  });

  it("renders multiple tournaments in table", () => {
    renderTable([
      tournament,
      { ...tournament, id: 43, title: "Delta", status_name: "running" },
      { ...tournament, id: 44, title: "Sigma", status_name: "finished" },
    ]);

    expect(screen.getByText("Cyber Arena")).toBeInTheDocument();
    expect(screen.getByText("Delta")).toBeInTheDocument();
    expect(screen.getByText("Sigma")).toBeInTheDocument();
  });

  it("shows status from status_name when status object is missing", () => {
    renderTable([
      {
        ...tournament,
        status: undefined as never,
        status_name: "custom_state",
      },
    ]);

    expect(screen.getByText("custom_state")).toBeInTheDocument();
  });

  const [draftStatus, registrationStatus, runningStatus, finishedStatus] = tournamentStatuses;
  it.each([
    [draftStatus.name, "bg-amber-100"],
    [registrationStatus.name, "bg-blue-100"],
    [runningStatus.name, "bg-emerald-100"],
    [finishedStatus.name, "bg-slate-200"],
    ["unknown", "bg-slate-100"],
  ])("applies status color class for %s", (statusName, expectedClass) => {
    renderTable([
      {
        ...tournament,
        id: Math.random(),
        status: { name: statusName, display_name: statusName },
        status_name: statusName,
      } as never,
    ]);

    const badge = screen.getByText(statusName);
    expect(badge).toHaveClass(expectedClass);
  });

  it("calls action handlers for each row separately", async () => {
    const user = userEvent.setup();
    const onInfo = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <TournamentTable
        tournaments={[tournament, { ...tournament, id: 99, title: "Zeta" }]}
        searchQuery=""
        statusFilter="all"
        onInfo={onInfo}
        onEdit={onEdit}
        onDelete={onDelete}
        onClearFilters={vi.fn()}
      />,
    );

    await user.click(screen.getAllByRole("button")[0]);
    await user.click(screen.getAllByRole("button", { name: "Редагувати" })[1]);
    await user.click(screen.getAllByRole("button", { name: "Видалити" })[1]);

    expect(onInfo).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
    expect(onDelete).toHaveBeenCalledWith(99);
  });
});
