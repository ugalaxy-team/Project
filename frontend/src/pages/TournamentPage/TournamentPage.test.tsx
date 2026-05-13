import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TournamentPage } from "./TournamentPage";
import apiClient from "@/api/client";
import { tournamentStatuses } from "@/config/appConfig";

// --- Mocks ---
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
});
