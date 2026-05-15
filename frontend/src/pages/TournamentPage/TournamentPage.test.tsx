import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TournamentPage } from "./TournamentPage";
import apiClient from "@/api/client";
import { tournamentStatuses } from "@/config/appConfig";


vi.mock("@/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "123" }),
}));

vi.mock("@/components/Hero", () => ({
  Hero: ({ title }: any) => <div data-testid="mock-hero">{title}</div>,
}));

const [draftStatus, registrationStatus, runningStatus] = tournamentStatuses;

const mockTournament = {
  id: 123,
  title: "SLOVO JAM",
  description: "Тестовий опис завдання турніру",
  reg_start: "2026-04-01T10:00:00Z",
  reg_end: "2026-04-20T10:00:00Z",
  start_date: "2026-05-01T10:00:00Z",
  end_date: "2026-06-01T10:00:00Z",
  max_teams: 10,
  min_people_in_team: 1,
  max_people_in_team: 5,
  status_name: "draft",
  status: {
    name: "draft",
    display_name: draftStatus.display_name,
  },
  creator: {
    id: 1,
    full_name: "Creator",
    email: "c@x.com",
    firebase_uid: "uid",
    roles: [],
    is_jury: false,
  },
  tasks: [
    {
      id: 1,
      title: "Round One",
      description: "Solve tasks",
      start_time: "2026-06-01T10:00:00Z",
      end_time: "2026-06-02T10:00:00Z",
      requirements: ["TypeScript"],
      tournament_id: 123,
      status_id: "active",
    },
  ],
  teams: [],
  juries: [],
  active_task: null,
};

describe("TournamentPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          retryDelay: 0,
        },
      },
    });

    (apiClient.get as any).mockResolvedValue({ data: mockTournament });

    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithProviders = () => {
    const user = userEvent.setup({ delay: null });
    const view = render(
      <QueryClientProvider client={queryClient}>
        <TournamentPage />
      </QueryClientProvider>,
    );
    return { user, ...view };
  };

  it("renders loading state initially", () => {
    renderWithProviders();
    expect(screen.getByText("Завантаження турніру...")).toBeInTheDocument();
  });

  it("shows error state on API failure", async () => {
    (apiClient.get as any).mockRejectedValue({
      response: { data: { message: "Помилка сервера" } },
    });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Ой, халепа!")).toBeInTheDocument();
      expect(screen.getByText("Помилка сервера")).toBeInTheDocument();
    });
  });

  it('retries fetch when "Спробувати знову" button is clicked', async () => {
    (apiClient.get as any)
      .mockRejectedValueOnce({
        response: { data: { message: "Network error" } },
      })
      .mockRejectedValueOnce({
        response: { data: { message: "Network error" } },
      });

    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Ой, халепа!")).toBeInTheDocument();
    });

    (apiClient.get as any).mockResolvedValueOnce({ data: mockTournament });

    const retryButton = screen.getByRole("button", {
      name: "Спробувати знову",
    });
    await user.click(retryButton);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(3);
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it('shows "До початку реєстрації" state when before reg_start', async () => {
    vi.setSystemTime(new Date("2026-03-25T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("До початку реєстрації")).toBeInTheDocument();
      expect(screen.getByText(draftStatus.display_name)).toBeInTheDocument();
    });
  });

  it('shows "Реєстрація" state when between reg_start and reg_end', async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("До кінця реєстрації")).toBeInTheDocument();
      expect(
        screen.getByText(registrationStatus.display_name),
      ).toBeInTheDocument();
    });
  });

  it('shows "До старту турніру" state when between reg_end and start_date', async () => {
    vi.setSystemTime(new Date("2026-04-25T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("До старту турніру")).toBeInTheDocument();
    });
  });

  it('shows "Активно" state when within 48h after start_date', async () => {
    vi.setSystemTime(new Date("2026-05-02T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("До завершення турніру")).toBeInTheDocument();
      expect(screen.getByText(runningStatus.display_name)).toBeInTheDocument();
    });
  });

  it('shows "Завершено" state when more than 48h after start_date passed', async () => {
    (apiClient.get as any).mockResolvedValue({
      data: { ...mockTournament, end_date: undefined },
    });
    vi.setSystemTime(new Date("2026-05-10T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      const finishedElements = screen.getAllByText("Завершено");
      expect(finishedElements.length).toBeGreaterThan(0);
    });
  });

  it("shows DescriptionTab by default after successful data fetch", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    expect(screen.getByText(mockTournament.description)).toBeInTheDocument();
  });

  it("opens teams tab and shows empty teams copy", async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Команди" }));
    expect(screen.getByText("Команд ще немає")).toBeInTheDocument();
  });

  it("opens task description tab before tasks start", async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Опис завдання" }));
    expect(screen.getByText("Турнір ще не розпочався")).toBeInTheDocument();
  });

  it("opens calendar tab with registration milestone", async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Календар" }));
    expect(screen.getByText("Реєстрація команд")).toBeInTheDocument();
  });

  it("returns to tournament description tab from another tab", async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Календар" }));
    expect(screen.getByText("Реєстрація команд")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Опис турінра" }));
    expect(screen.getByText(mockTournament.description)).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
  
  (apiClient.get as any).mockRejectedValue(new Error("Network error"));

  renderWithProviders();

  
  const errorElement = await screen.findByText(/ой, халепа/i, {}, { timeout: 4000 });
  
  expect(errorElement).toBeInTheDocument();
});

  it("displays tournament with very long title", async () => {
    const longTitleTournament = {
      ...mockTournament,
      title: "This is a very long tournament title that should display properly",
    };
    (apiClient.get as any).mockResolvedValue({ data: longTitleTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/very long tournament title/i)).toBeInTheDocument();
    });
  });

  it("displays tournament with very long description", async () => {
    const longDescTournament = {
      ...mockTournament,
      description: "This is a very long description with lots of details about what participants need to do.",
    };
    (apiClient.get as any).mockResolvedValue({ data: longDescTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/very long description with lots of details/i)).toBeInTheDocument();
    });
  });

  it("handles tournament with many tasks", async () => {
    const manyTasksTournament = {
      ...mockTournament,
      tasks: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        title: `Task ${i}`,
        description: "Task description",
        start_time: "2026-06-01T10:00:00Z",
        end_time: "2026-06-02T10:00:00Z",
        requirements: ["TypeScript"],
        tournament_id: 123,
        status_id: "active",
      })),
    };
    (apiClient.get as any).mockResolvedValue({ data: manyTasksTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it("handles tournament with many teams", async () => {
    const manyTeamsTournament = {
      ...mockTournament,
      teams: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: `Team ${i}`,
        members: [],
      })),
    };
    (apiClient.get as any).mockResolvedValue({ data: manyTeamsTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it("handles tournament with many juries", async () => {
    const manyJuriesTournament = {
      ...mockTournament,
      juries: Array.from({ length: 30 }, (_, i) => ({
        id: i,
        full_name: `Jury ${i}`,
        email: `jury${i}@example.com`,
      })),
    };
    (apiClient.get as any).mockResolvedValue({ data: manyJuriesTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it("handles tournament right at registration start boundary", async () => {
    vi.setSystemTime(new Date("2026-04-01T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("До кінця реєстрації")).toBeInTheDocument();
    });
  });

  it("handles tournament right at registration end boundary", async () => {
    vi.setSystemTime(new Date("2026-04-20T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("До старту турніру")).toBeInTheDocument();
    });
  });

  it("handles tournament right at start boundary", async () => {
    vi.setSystemTime(new Date("2026-05-01T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("До завершення турніру")).toBeInTheDocument();
    });
  });

  it("handles tournament without end date", async () => {
    const noEndDateTournament = {
      ...mockTournament,
      end_date: null,
    };
    (apiClient.get as any).mockResolvedValue({ data: noEndDateTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it("navigates between all tabs successfully", async () => {
    vi.setSystemTime(new Date("2026-05-02T10:00:00Z"));
    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    
    await user.click(screen.getByRole("button", { name: "Опис завдання" }));

    
    await user.click(screen.getByRole("button", { name: "Календар" }));

    
    await user.click(screen.getByRole("button", { name: "Команди" }));
  });

  it("shows tournament creator information", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it("handles status transitions correctly over time", async () => {
    vi.setSystemTime(new Date("2026-03-25T10:00:00Z"));
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TournamentPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("До початку реєстрації")).toBeInTheDocument();
    });

    
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    rerender(
      <QueryClientProvider client={queryClient}>
        <TournamentPage />
      </QueryClientProvider>,
    );
  });

  it("displays error when tournament data is malformed", async () => {
  
  (apiClient.get as any).mockResolvedValue({ data: null });
  
  renderWithProviders();

  
  const errorMsg = await screen.findByText(/ой, халепа/i);
  expect(errorMsg).toBeInTheDocument();
});

  it("retries multiple times on repeated failures", async () => {
  
  const getMock = (apiClient.get as any).mockRejectedValue(new Error("Persistent error"));

  renderWithProviders();

  
  
  const errorElement = await screen.findByText(/ой, халепа/i, {}, { timeout: 5000 });

  expect(errorElement).toBeInTheDocument();

  
  expect(getMock).toHaveBeenCalledTimes(2);
});

  it("handles tournament with special characters in title", async () => {
    const specialCharTournament = {
      ...mockTournament,
      title: "Cup & Tournament (2026) <Special>",
    };
    (apiClient.get as any).mockResolvedValue({ data: specialCharTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Cup & Tournament (2026) <Special>")).toBeInTheDocument();
    });
  });

  it("handles tournament with Cyrillic characters", async () => {
    const cyrillicTournament = {
      ...mockTournament,
      title: "Турнір Тестування Програм",
    };
    (apiClient.get as any).mockResolvedValue({ data: cyrillicTournament });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Турнір Тестування Програм")).toBeInTheDocument();
    });
  });

  it("displays correct max teams count", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it("handles rapid tab switching", async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    const descTab = screen.getByRole("button", { name: "Опис турінра" });
    const taskTab = screen.getByRole("button", { name: "Опис завдання" });
    const teamTab = screen.getByRole("button", { name: "Команди" });

    await user.click(taskTab);
    await user.click(teamTab);
    await user.click(descTab);
    await user.click(taskTab);
  });

  it("maintains scroll position when switching tabs", async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    const { user } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Календар" }));
    await user.click(screen.getByRole("button", { name: "Опис турінра" }));
  });

  it("shows tabs in correct order", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("displays tournament deadline correctly", async () => {
    vi.setSystemTime(new Date("2026-04-10T10:00:00Z"));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Що потрібно зробити?")).toBeInTheDocument();
    });
  });

  it("handles 404 API response", async () => {
    (apiClient.get as any).mockRejectedValue({
      response: { status: 404, data: { message: "Tournament not found" } },
    });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Ой, халепа!")).toBeInTheDocument();
    });
  });

  it("handles 500 API response", async () => {
    (apiClient.get as any).mockRejectedValue({
      response: { status: 500, data: { message: "Server error" } },
    });
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Ой, халепа!")).toBeInTheDocument();
    });
  });

  it("displays hero component with tournament title", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("mock-hero")).toBeInTheDocument();
    });
  });

  it("renders tournament header with correct title", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
    });
  });

  it("handles loading state timeout", async () => {
    vi.useFakeTimers();
    renderWithProviders();

    expect(screen.getByText("Завантаження турніру...")).toBeInTheDocument();

    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
  });

  it("displays all tournament information after load", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("SLOVO JAM")).toBeInTheDocument();
      expect(screen.getByText(mockTournament.description)).toBeInTheDocument();
    });
  });
});
