import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentMainContent } from "./TournamentMainContent";
import type { TournamentData } from "../types";

vi.mock("./TabNavigation", () => ({
  TabNavigation: ({ activeTab, onTabChange }: any) => (
    <div data-testid="tab-navigation">
      <button onClick={() => onTabChange("desc")} data-testid="tab-desc">
        Description
      </button>
      <button onClick={() => onTabChange("task_desc")} data-testid="tab-task">
        Tasks
      </button>
      <button onClick={() => onTabChange("teams")} data-testid="tab-teams">
        Teams
      </button>
      <button onClick={() => onTabChange("calendar")} data-testid="tab-calendar">
        Calendar
      </button>
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  ),
}));

vi.mock("./TabContent", () => ({
  TabContent: ({ activeTab, tournament }: any) => (
    <div data-testid="tab-content">
      Content for {activeTab} - Tournament ID: {tournament.id}
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
  tasks: [],
  teams: [],
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-05-01T00:00:00Z",
  start_date: "2026-06-01T00:00:00Z",
  end_date: "2026-06-30T00:00:00Z",
};

describe("TournamentMainContent", () => {
  it("renders tab navigation component", () => {
    render(<TournamentMainContent tournament={mockTournament} />);
    expect(screen.getByTestId("tab-navigation")).toBeInTheDocument();
  });

  it("renders tab content component", () => {
    render(<TournamentMainContent tournament={mockTournament} />);
    expect(screen.getByTestId("tab-content")).toBeInTheDocument();
  });

  it("renders with description tab active by default", () => {
    render(<TournamentMainContent tournament={mockTournament} />);
    expect(screen.getByTestId("active-tab")).toHaveTextContent("desc");
  });

  it("passes tournament data to tab content", () => {
    render(<TournamentMainContent tournament={mockTournament} />);
    expect(screen.getByText(/Tournament ID: 1/)).toBeInTheDocument();
  });

  it("switches to task description tab when clicked", async () => {
    const user = userEvent.setup();
    render(<TournamentMainContent tournament={mockTournament} />);

    await user.click(screen.getByTestId("tab-task"));
    expect(screen.getByTestId("active-tab")).toHaveTextContent("task_desc");
  });

  it("switches to teams tab when clicked", async () => {
    const user = userEvent.setup();
    render(<TournamentMainContent tournament={mockTournament} />);

    await user.click(screen.getByTestId("tab-teams"));
    expect(screen.getByTestId("active-tab")).toHaveTextContent("teams");
  });

  it("switches to calendar tab when clicked", async () => {
    const user = userEvent.setup();
    render(<TournamentMainContent tournament={mockTournament} />);

    await user.click(screen.getByTestId("tab-calendar"));
    expect(screen.getByTestId("active-tab")).toHaveTextContent("calendar");
  });

  it("switches back to description tab", async () => {
    const user = userEvent.setup();
    render(<TournamentMainContent tournament={mockTournament} />);

    await user.click(screen.getByTestId("tab-task"));
    expect(screen.getByTestId("active-tab")).toHaveTextContent("task_desc");

    await user.click(screen.getByTestId("tab-desc"));
    expect(screen.getByTestId("active-tab")).toHaveTextContent("desc");
  });

  it("handles rapid tab switching", async () => {
    const user = userEvent.setup();
    render(<TournamentMainContent tournament={mockTournament} />);

    await user.click(screen.getByTestId("tab-task"));
    await user.click(screen.getByTestId("tab-teams"));
    await user.click(screen.getByTestId("tab-calendar"));
    await user.click(screen.getByTestId("tab-desc"));

    expect(screen.getByTestId("active-tab")).toHaveTextContent("desc");
  });

  it("maintains correct content when switching tabs multiple times", async () => {
    const user = userEvent.setup();
    render(<TournamentMainContent tournament={mockTournament} />);

    await user.click(screen.getByTestId("tab-teams"));
    expect(screen.getByText(/Content for teams/)).toBeInTheDocument();

    await user.click(screen.getByTestId("tab-calendar"));
    expect(screen.getByText(/Content for calendar/)).toBeInTheDocument();

    await user.click(screen.getByTestId("tab-desc"));
    expect(screen.getByText(/Content for desc/)).toBeInTheDocument();
  });

  it("passes updated tournament data when props change", () => {
    const { rerender } = render(
      <TournamentMainContent tournament={mockTournament} />
    );
    expect(screen.getByText(/Tournament ID: 1/)).toBeInTheDocument();

    const updatedTournament = { ...mockTournament, id: 2 };
    rerender(<TournamentMainContent tournament={updatedTournament} />);
    expect(screen.getByText(/Tournament ID: 2/)).toBeInTheDocument();
  });

  it("applies correct CSS classes to main container", () => {
    const { container } = render(
      <TournamentMainContent tournament={mockTournament} />
    );
    const mainElement = container.querySelector("main");
    expect(mainElement).toHaveClass("max-w-[1000px]");
    expect(mainElement).toHaveClass("mx-auto");
    expect(mainElement).toHaveClass("relative");
  });

  it("renders with proper spacing classes", () => {
    const { container } = render(
      <TournamentMainContent tournament={mockTournament} />
    );
    const mainElement = container.querySelector("main");
    expect(mainElement).toHaveClass("mt-6");
    expect(mainElement).toHaveClass("mb-[100px]");
    expect(mainElement).toHaveClass("px-5");
  });

  it("handles tournament with empty teams array", () => {
    const emptyTeamsTournament = { ...mockTournament, teams: [] };
    render(<TournamentMainContent tournament={emptyTeamsTournament} />);
    expect(screen.getByTestId("tab-content")).toBeInTheDocument();
  });

  it("handles tournament with multiple teams", () => {
    const multiTeamTournament = {
      ...mockTournament,
      teams: [
        { id: 1, name: "Team 1" },
        { id: 2, name: "Team 2" },
        { id: 3, name: "Team 3" },
      ] as any,
    };
    render(<TournamentMainContent tournament={multiTeamTournament} />);
    expect(screen.getByTestId("tab-content")).toBeInTheDocument();
  });

  it("handles tournament with empty tasks array", () => {
    const emptyTasksTournament = { ...mockTournament, tasks: [] };
    render(<TournamentMainContent tournament={emptyTasksTournament} />);
    expect(screen.getByTestId("tab-content")).toBeInTheDocument();
  });

  it("handles tournament with multiple tasks", () => {
    const multiTaskTournament = {
      ...mockTournament,
      tasks: [
        { id: 1, title: "Task 1" },
        { id: 2, title: "Task 2" },
      ] as any,
    };
    render(<TournamentMainContent tournament={multiTaskTournament} />);
    expect(screen.getByTestId("tab-content")).toBeInTheDocument();
  });

  it("maintains tab state independently from tournament data updates", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TournamentMainContent tournament={mockTournament} />
    );

    await user.click(screen.getByTestId("tab-teams"));
    expect(screen.getByTestId("active-tab")).toHaveTextContent("teams");

    const updatedTournament = {
      ...mockTournament,
      title: "Updated Title",
    };
    rerender(<TournamentMainContent tournament={updatedTournament} />);

    // Tab should still be on teams
    expect(screen.getByTestId("active-tab")).toHaveTextContent("teams");
  });

  it("renders responsive layout", () => {
    const { container } = render(
      <TournamentMainContent tournament={mockTournament} />
    );
    const mainElement = container.querySelector("main");
    expect(mainElement).toHaveClass("w-full");
  });

  it("handles z-index layering correctly", () => {
    const { container } = render(
      <TournamentMainContent tournament={mockTournament} />
    );
    const mainElement = container.querySelector("main");
    expect(mainElement).toHaveClass("z-10");
  });

  it("tabs are clickable elements", () => {
    render(<TournamentMainContent tournament={mockTournament} />);
    const descTab = screen.getByTestId("tab-desc");
    const taskTab = screen.getByTestId("tab-task");
    const teamsTab = screen.getByTestId("tab-teams");
    const calendarTab = screen.getByTestId("tab-calendar");

    expect(descTab).toBeInTheDocument();
    expect(taskTab).toBeInTheDocument();
    expect(teamsTab).toBeInTheDocument();
    expect(calendarTab).toBeInTheDocument();
  });

  it("does not break with null tournament values", () => {
    const nullValueTournament = {
      ...mockTournament,
      active_task: null,
      description: "",
    };
    render(<TournamentMainContent tournament={nullValueTournament} />);
    expect(screen.getByTestId("tab-content")).toBeInTheDocument();
  });
});
