import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import EvaluateTournamentPage from "./EvaluateTournamentPage";
import {
  finishEvaluation,
  getJuryAssignments,
  saveAssignmentEvaluation,
} from "@/api/requests";
import { taskStatusByName } from "@/config/appConfig";
import { juryTaskQueryKey } from "./juryQueryKeys";
import {
  createMockAssignment,
  createMockEvaluation,
  createMockTask,
} from "./testFixtures";
import { createTestQueryClient, renderWithJuryProviders } from "./testUtils";

vi.mock("@/api/requests", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/requests")>();
  return {
    ...actual,
    getJuryAssignments: vi.fn(),
    saveAssignmentEvaluation: vi.fn(),
    finishEvaluation: vi.fn(),
  };
});

const TASK_ID = "42";

const { authState, routeParams, queryTestState } = vi.hoisted(() => ({
  authState: {
    currentUser: { uid: "jury-user" } as { uid: string } | null,
  },
  routeParams: { id: "42" } as { id?: string },
  queryTestState: { forceEnabled: false },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: (options: Parameters<typeof actual.useQuery>[0]) =>
      actual.useQuery({
        ...options,
        enabled: queryTestState.forceEnabled ? true : options?.enabled,
      }),
  };
});

vi.mock("@/firebase", () => ({
  auth: authState,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: () => routeParams,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EvaluateTournamentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.currentUser = { uid: "jury-user" };
    routeParams.id = TASK_ID;
    queryTestState.forceEnabled = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state while assignments are fetched", () => {
    vi.mocked(getJuryAssignments).mockReturnValue(new Promise(() => undefined));

    renderWithJuryProviders(<EvaluateTournamentPage />);

    expect(screen.getByRole("status", { name: "Завантаження робіт" })).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("hides progress and status sections in zero-assignment state", async () => {
    vi.mocked(getJuryAssignments).mockResolvedValue([]);

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByText("Немає робіт для цього раунду")).toBeInTheDocument();
    });

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Прогрес перевірки")).not.toBeInTheDocument();
    expect(screen.queryByText("Статус раунду")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Завершити оцінювання" })).not.toBeInTheDocument();
  });

  it("shows error UI and hides progress metrics when fetch fails", async () => {
    vi.mocked(getJuryAssignments).mockRejectedValue(new Error("Server error"));

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Не вдалося завантажити призначені роботи");
    });

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Статус раунду")).not.toBeInTheDocument();
  });

  it("renders partial progress and status copy", async () => {
    vi.mocked(getJuryAssignments).mockResolvedValue([
      createMockAssignment({ id: 1, evaluation: createMockEvaluation(1) }),
      createMockAssignment({ id: 2, evaluation: null }),
    ]);

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    });

    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByText("Перевірено 1 з 2 робіт.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Завершити оцінювання" })).not.toBeInTheDocument();
  });

  it("shows finalize button when every assignment is already reviewed", async () => {
    vi.mocked(getJuryAssignments).mockResolvedValue([
      createMockAssignment({ id: 1, evaluation: createMockEvaluation(1) }),
      createMockAssignment({ id: 2, evaluation: createMockEvaluation(2) }),
    ]);

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Завершити оцінювання" })).toBeInTheDocument();
    });
  });

  it("reveals finalize button immediately after saving the last pending grade", async () => {
    const user = userEvent.setup();
    const reviewed = createMockAssignment({
      id: 1,
      evaluation: createMockEvaluation(1),
    });
    const pending = createMockAssignment({ id: 2, evaluation: null });
    const savedEvaluation = createMockEvaluation(2, { comment: "Done" });

    let currentAssignments = [reviewed, pending];
    vi.mocked(getJuryAssignments).mockImplementation(async () => currentAssignments);
    vi.mocked(saveAssignmentEvaluation).mockImplementation(async () => {
      currentAssignments = [reviewed, { ...pending, evaluation: savedEvaluation }];
      return savedEvaluation;
    });

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByText("Перевірено 1 з 2 робіт.")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "Завершити оцінювання" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Почати оцінювання" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Зберегти оцінку" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Завершити оцінювання" })).toBeInTheDocument();
    });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("shows finalized banner and hides progress controls for evaluated rounds", async () => {
    vi.mocked(getJuryAssignments).mockResolvedValue([
      createMockAssignment({
        evaluation: createMockEvaluation(1),
        task: createMockTask({
          status_id: taskStatusByName.evaluated.name,
          status: taskStatusByName.evaluated,
        }),
      }),
    ]);

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByText("Цей раунд завершено")).toBeInTheDocument();
    });

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Статус раунду")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Завершити оцінювання" })).not.toBeInTheDocument();
  });

  it("finalizes the round when the finalize button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(getJuryAssignments).mockResolvedValue([
      createMockAssignment({ id: 1, evaluation: createMockEvaluation(1) }),
    ]);
    vi.mocked(finishEvaluation).mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();
    renderWithJuryProviders(<EvaluateTournamentPage />, { queryClient });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Завершити оцінювання" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Завершити оцінювання" }));

    await waitFor(() => {
      expect(finishEvaluation).toHaveBeenCalledWith(99, 42, expect.objectContaining({ uid: "jury-user" }));
    });
  });

  it("opens evaluation modal from a submission card", async () => {
    const user = userEvent.setup();
    vi.mocked(getJuryAssignments).mockResolvedValue([createMockAssignment({ id: 3 })]);

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Почати оцінювання" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Почати оцінювання" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { level: 2, name: "Team 3" })).toBeInTheDocument();
  });

  it("pre-populates query cache updates through jury task key", async () => {
    const assignments = [createMockAssignment({ id: 1 })];
    vi.mocked(getJuryAssignments).mockResolvedValue(assignments);

    const queryClient = createTestQueryClient();
    renderWithJuryProviders(<EvaluateTournamentPage />, { queryClient });

    await waitFor(() => {
      expect(queryClient.getQueryData(juryTaskQueryKey(TASK_ID))).toEqual(assignments);
    });
  });

  it("shows error UI when the route id is missing", async () => {
    queryTestState.forceEnabled = true;
    routeParams.id = undefined;

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows error UI when the jury user is not authenticated", async () => {
    queryTestState.forceEnabled = true;
    authState.currentUser = null;

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("surfaces finalize errors via toast", async () => {
    const user = userEvent.setup();
    vi.mocked(getJuryAssignments).mockResolvedValue([
      createMockAssignment({ id: 1, evaluation: createMockEvaluation(1) }),
    ]);
    vi.mocked(finishEvaluation).mockRejectedValue(new Error("Finalize failed"));

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Завершити оцінювання" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Завершити оцінювання" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Finalize failed");
    });
  });

  it("does not call finalize API when tournament context is missing", async () => {
    const user = userEvent.setup();
    const base = createMockAssignment();
    vi.mocked(getJuryAssignments).mockResolvedValue([
      {
        ...base,
        evaluation: createMockEvaluation(base.id),
        submission: {
          ...base.submission,
          team: {
            ...base.submission.team,
            tournament: { id: undefined as unknown as number, title: "", description: "" },
          },
        },
      },
    ]);

    renderWithJuryProviders(<EvaluateTournamentPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Завершити оцінювання" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Завершити оцінювання" }));
    expect(finishEvaluation).not.toHaveBeenCalled();
  });
});
