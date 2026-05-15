import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarTab } from "./CalendarTab";

const tournamentData = {
  reg_start: "2026-04-01T10:00:00.000Z",
  reg_end: "2026-04-20T10:00:00.000Z",
  start_date: "2026-05-01T10:00:00.000Z",
  end_date: "2026-06-01T10:00:00.000Z",
  tasks: [
    {
      id: 1,
      title: "Hack",
      description: "Ship",
      start_time: "2026-05-05T10:00:00.000Z",
      end_time: "2026-05-06T10:00:00.000Z",
      requirements: ["Docker"],
    },
  ],
  active_task: { id: 1 },
};

describe("CalendarTab", () => {
  it("renders page title", () => {
    render(<CalendarTab tournamentData={tournamentData} />);
    expect(screen.getByText("Шлях Турніру")).toBeInTheDocument();
  });

  it("renders registration milestone", () => {
    render(<CalendarTab tournamentData={tournamentData} />);
    expect(screen.getByText("Реєстрація команд")).toBeInTheDocument();
  });

  it("renders tournament opening milestone", () => {
    render(<CalendarTab tournamentData={tournamentData} />);
    expect(screen.getByText("Відкриття турніру")).toBeInTheDocument();
  });

  it("renders task title from timeline", () => {
    render(<CalendarTab tournamentData={tournamentData} />);
    expect(screen.getByText("Hack")).toBeInTheDocument();
  });

  it("renders finale milestone", () => {
    render(<CalendarTab tournamentData={tournamentData} />);
    expect(screen.getByText("Фінал та нагородження")).toBeInTheDocument();
  });

  it("shows active pulse label for active task", () => {
    render(<CalendarTab tournamentData={tournamentData} />);
    expect(screen.getByText("Зараз триває")).toBeInTheDocument();
  });
});
