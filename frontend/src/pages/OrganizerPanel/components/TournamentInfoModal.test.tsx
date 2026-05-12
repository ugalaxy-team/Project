import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentInfoModal } from "./TournamentInfoModal";

const tournament = {
  id: 4,
  title: "Design Cup",
  description: "Main description",
  status: { name: "running", display_name: "Активний" },
  tasks: [
    {
      id: 1,
      title: "Build MVP",
      description: "Ship first version",
      start_time: "2026-05-12T10:00:00Z",
      end_time: "2026-05-12T13:00:00Z",
      requirements: ["React"],
    },
  ],
  teams: [{ name: "Team Phoenix", members: [{ id: 8 }] }],
  juries: [{ id: 9, full_name: "Nina Judge", roles: [], github: "nina" }],
  reg_start: "2026-05-10T10:00:00Z",
  reg_end: "2026-05-11T10:00:00Z",
  start_date: "2026-05-12T10:00:00Z",
  end_date: "2026-05-13T10:00:00Z",
} as never;

describe("TournamentInfoModal", () => {
  it("does not render when closed", () => {
    render(<TournamentInfoModal isOpen={false} tournament={tournament} onClose={vi.fn()} />);
    expect(screen.queryByText("Design Cup")).not.toBeInTheDocument();
  });

  it("renders important tournament details and closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <TournamentInfoModal isOpen tournament={tournament} onClose={onClose} />,
    );

    expect(screen.getByText("Design Cup")).toBeInTheDocument();
    expect(screen.getByText("Build MVP")).toBeInTheDocument();
    expect(screen.getByText("Team Phoenix")).toBeInTheDocument();
    expect(screen.getByText("Nina Judge")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Зрозуміло, закрити" }));
    expect(onClose).toHaveBeenCalled();

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders fallback text when description is missing", () => {
    render(
      <TournamentInfoModal
        isOpen
        tournament={{ ...tournament, description: "" }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Опис не вказано.")).toBeInTheDocument();
  });

  it("renders empty tasks placeholder when there are no tasks", () => {
    render(
      <TournamentInfoModal isOpen tournament={{ ...tournament, tasks: [] }} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Таски відсутні")).toBeInTheDocument();
  });

  it("renders empty teams placeholder when there are no teams", () => {
    render(
      <TournamentInfoModal isOpen tournament={{ ...tournament, teams: [] }} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Команди ще не приєдналися")).toBeInTheDocument();
  });

  it("renders empty jury placeholder when juries are absent", () => {
    render(
      <TournamentInfoModal isOpen tournament={{ ...tournament, juries: [] }} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Журі не призначено")).toBeInTheDocument();
  });

  it("shows active task badge for active task", () => {
    render(
      <TournamentInfoModal
        isOpen
        tournament={{ ...tournament, active_task: { id: 1 } }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Активне")).toBeInTheDocument();
  });

  it("renders jury contact buttons when links exist", () => {
    render(<TournamentInfoModal isOpen tournament={tournament} onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  });

  it("closes when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <TournamentInfoModal isOpen tournament={tournament} onClose={onClose} />,
    );

    const backdrop = container.querySelector(".absolute.inset-0");
    expect(backdrop).toBeTruthy();
    await user.click(backdrop as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });
});
