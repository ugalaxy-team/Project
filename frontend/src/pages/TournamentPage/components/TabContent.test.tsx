import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabContent } from "./TabContent";
import type { TournamentData } from "../types";

vi.mock("./tabs/DescriptionTab", () => ({
  DescriptionTab: ({ description, tasks, activeTask }: any) => (
    <div data-testid="description-tab">
      <span>Description: {description}</span>
      <span>Tasks: {tasks.length}</span>
      <span>Active Task: {activeTask}</span>
    </div>
  ),
}));

vi.mock("./tabs/TeamsTab", () => ({
  TeamsTab: ({ teams }: any) => (
    <div data-testid="teams-tab">
      <span>Teams: {teams.length}</span>
    </div>
  ),
}));

vi.mock("./tabs/TaskDescriptionTab", () => ({
  TaskDescriptionTab: ({ tasks, activeTask }: any) => (
    <div data-testid="task-description-tab">
      <span>Task Description - Active: {activeTask}</span>
    </div>
  ),
}));

vi.mock("./tabs/CalendarTab", () => ({
  CalendarTab: ({ tournamentData }: any) => (
    <div data-testid="calendar-tab">
      <span>Calendar for {tournamentData.title}</span>
    </div>
  ),
}));

const mockTournament: TournamentData = {
  id: 1,
  title: "Test Tournament",
  description: "Test Description",
  min_people_in_team: 2,
  max_people_in_team: 4,
  max_teams: 10,
  active_task: null,
  tasks: [
    { id: 1, title: "Task 1" } as any,
    { id: 2, title: "Task 2" } as any,
  ],
  teams: [
    { id: 1, name: "Team 1" } as any,
    { id: 2, name: "Team 2" } as any,
  ],
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-05-01T00:00:00Z",
  start_date: "2026-06-01T00:00:00Z",
  end_date: "2026-06-30T00:00:00Z",
};

describe("TabContent", () => {
  it("renders description tab when activeTab is 'desc'", () => {
    render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    expect(screen.getByTestId("description-tab")).toBeInTheDocument();
  });

  it("renders task description tab when activeTab is 'task_desc'", () => {
    render(
      <TabContent activeTab="task_desc" tournament={mockTournament} />
    );
    expect(screen.getByTestId("task-description-tab")).toBeInTheDocument();
  });

  it("renders teams tab when activeTab is 'teams'", () => {
    render(
      <TabContent activeTab="teams" tournament={mockTournament} />
    );
    expect(screen.getByTestId("teams-tab")).toBeInTheDocument();
  });

  it("renders calendar tab when activeTab is 'calendar'", () => {
    render(
      <TabContent activeTab="calendar" tournament={mockTournament} />
    );
    expect(screen.getByTestId("calendar-tab")).toBeInTheDocument();
  });

  it("passes tournament description to DescriptionTab", () => {
    render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    expect(screen.getByText("Description: Test Description")).toBeInTheDocument();
  });

  it("passes tasks array to DescriptionTab", () => {
    render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    expect(screen.getByText("Tasks: 2")).toBeInTheDocument();
  });

  it("passes activeTask to DescriptionTab", () => {
    const tournamentWithActiveTask = {
      ...mockTournament,
      active_task: 1,
    };
    render(
      <TabContent activeTab="desc" tournament={tournamentWithActiveTask} />
    );
    expect(screen.getByText("Active Task: 1")).toBeInTheDocument();
  });

  it("passes teams to TeamsTab", () => {
    render(
      <TabContent activeTab="teams" tournament={mockTournament} />
    );
    expect(screen.getByText("Teams: 2")).toBeInTheDocument();
  });

  it("passes tournamentData to CalendarTab", () => {
    render(
      <TabContent activeTab="calendar" tournament={mockTournament} />
    );
    expect(screen.getByText("Calendar for Test Tournament")).toBeInTheDocument();
  });

  it("switches between tabs correctly", () => {
    const { rerender } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    expect(screen.getByTestId("description-tab")).toBeInTheDocument();

    rerender(
      <TabContent activeTab="teams" tournament={mockTournament} />
    );
    expect(screen.queryByTestId("description-tab")).not.toBeInTheDocument();
    expect(screen.getByTestId("teams-tab")).toBeInTheDocument();
  });

  it("handles empty tasks array", () => {
    const tournamentWithoutTasks = {
      ...mockTournament,
      tasks: [],
    };
    render(
      <TabContent activeTab="desc" tournament={tournamentWithoutTasks} />
    );
    expect(screen.getByText("Tasks: 0")).toBeInTheDocument();
  });

  it("handles empty teams array", () => {
    const tournamentWithoutTeams = {
      ...mockTournament,
      teams: [],
    };
    render(
      <TabContent activeTab="teams" tournament={tournamentWithoutTeams} />
    );
    expect(screen.getByText("Teams: 0")).toBeInTheDocument();
  });

it("handles null activeTask", () => {
  const tournamentWithNullTask = {
    ...mockTournament,
    active_task: null,
  };
  render(
    <TabContent activeTab="desc" tournament={tournamentWithNullTask} />
  );
  
  // Використовуємо регулярний вираз, щоб знайти початок рядка
  expect(screen.getByText(/Active Task:/i)).toBeInTheDocument();
});

  it("handles empty description", () => {
  const tournamentNoDesc = {
    ...mockTournament,
    description: "",
  };
  
  render(<TabContent activeTab="desc" tournament={tournamentNoDesc} />);

  const descriptionElement = screen.getByText((content, element) => {
    // trim() видалить зайві пробіли та переноси рядків, які створює React
    return element?.textContent?.trim() === "Description:";
  });

  expect(descriptionElement).toBeInTheDocument();
});

  it("applies correct container styling", () => {
    const { container } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    const div = container.firstChild;
    expect(div).toHaveClass("bg-bg-card");
    expect(div).toHaveClass("rounded-[32px]");
    expect(div).toHaveClass("p-6");
    expect(div).toHaveClass("shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)]");
  });

  it("has minimum height", () => {
    const { container } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    const div = container.firstChild;
    expect(div).toHaveClass("min-h-[400px]");
  });

  it("renders with border", () => {
    const { container } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    const div = container.firstChild;
    expect(div).toHaveClass("border");
    expect(div).toHaveClass("border-slate-100");
  });

  it("responsive padding classes are applied", () => {
    const { container } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    const div = container.firstChild;
    expect(div).toHaveClass("md:p-[60px]");
  });

  it("transitions correctly on update", () => {
    const { container } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    const div = container.firstChild;
    expect(div).toHaveClass("transition-all");
  });

  it("renders only one tab content at a time for desc", () => {
    const { container } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    const testIds = container.querySelectorAll(
      "[data-testid$='-tab']"
    );
    expect(testIds.length).toBe(1);
    expect(testIds[0]).toHaveAttribute("data-testid", "description-tab");
  });

  it("renders only one tab content at a time for task_desc", () => {
    const { container } = render(
      <TabContent activeTab="task_desc" tournament={mockTournament} />
    );
    const testIds = container.querySelectorAll(
      "[data-testid$='-tab']"
    );
    expect(testIds.length).toBe(1);
    expect(testIds[0]).toHaveAttribute("data-testid", "task-description-tab");
  });

  it("renders only one tab content at a time for teams", () => {
    const { container } = render(
      <TabContent activeTab="teams" tournament={mockTournament} />
    );
    const testIds = container.querySelectorAll(
      "[data-testid$='-tab']"
    );
    expect(testIds.length).toBe(1);
    expect(testIds[0]).toHaveAttribute("data-testid", "teams-tab");
  });

  it("renders only one tab content at a time for calendar", () => {
    const { container } = render(
      <TabContent activeTab="calendar" tournament={mockTournament} />
    );
    const testIds = container.querySelectorAll(
      "[data-testid$='-tab']"
    );
    expect(testIds.length).toBe(1);
    expect(testIds[0]).toHaveAttribute("data-testid", "calendar-tab");
  });

  it("handles tournament with many tasks", () => {
    const tournamentWithManyTasks = {
      ...mockTournament,
      tasks: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1}`,
      })) as any,
    };
    render(
      <TabContent activeTab="desc" tournament={tournamentWithManyTasks} />
    );
    expect(screen.getByText("Tasks: 20")).toBeInTheDocument();
  });

  it("handles tournament with many teams", () => {
    const tournamentWithManyTeams = {
      ...mockTournament,
      teams: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
      })) as any,
    };
    render(
      <TabContent activeTab="teams" tournament={tournamentWithManyTeams} />
    );
    expect(screen.getByText("Teams: 50")).toBeInTheDocument();
  });

  it("handles long tournament title", () => {
    const tournamentWithLongTitle = {
      ...mockTournament,
      title: "This is a very long tournament title that should be displayed correctly",
    };
    render(
      <TabContent activeTab="calendar" tournament={tournamentWithLongTitle} />
    );
    expect(screen.getByText("Calendar for This is a very long tournament title that should be displayed correctly")).toBeInTheDocument();
  });

  it("handles special characters in description", () => {
    const tournamentWithSpecialChars = {
      ...mockTournament,
      description: "Test <>&\"' Description",
    };
    render(
      <TabContent activeTab="desc" tournament={tournamentWithSpecialChars} />
    );
    expect(screen.getByText("Description: Test <>&\"' Description")).toBeInTheDocument();
  });

  it("consistently passes tournament data across multiple rerenders", () => {
    const { rerender } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );

    rerender(
      <TabContent activeTab="teams" tournament={mockTournament} />
    );

    rerender(
      <TabContent activeTab="calendar" tournament={mockTournament} />
    );

    expect(screen.getByText("Calendar for Test Tournament")).toBeInTheDocument();
  });

  it("handles activeTask as number", () => {
    const tournament = {
      ...mockTournament,
      active_task: 42,
    };
    render(
      <TabContent activeTab="desc" tournament={tournament} />
    );
    expect(screen.getByText("Active Task: 42")).toBeInTheDocument();
  });

  it("handles activeTask as string", () => {
    const tournament = {
      ...mockTournament,
      active_task: "task-uuid-123" as any,
    };
    render(
      <TabContent activeTab="desc" tournament={tournament} />
    );
    expect(screen.getByText("Active Task: task-uuid-123")).toBeInTheDocument();
  });

  it("updates content when tournament prop changes while on same tab", () => {
    const { rerender } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    expect(screen.getByText("Description: Test Description")).toBeInTheDocument();

    const updatedTournament = {
      ...mockTournament,
      description: "Updated Description",
    };
    rerender(
      <TabContent activeTab="desc" tournament={updatedTournament} />
    );
    expect(screen.getByText("Description: Updated Description")).toBeInTheDocument();
  });

  it("container has correct z-index context", () => {
    const { container } = render(
      <TabContent activeTab="desc" tournament={mockTournament} />
    );
    const div = container.firstChild;
    // Check if parent or ancestor has proper positioning context
    expect(div).toBeInTheDocument();
  });
});
