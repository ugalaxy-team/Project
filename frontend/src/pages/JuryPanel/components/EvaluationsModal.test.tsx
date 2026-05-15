import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EvaluationsModal from "./EvaluationsModal";
import { saveAssignmentEvaluation } from "@/api/requests";
import { taskStatusByName } from "@/config/appConfig";
import { juryTaskQueryKey } from "../juryQueryKeys";
import { createMockAssignment, createMockEvaluation, createMockTask } from "../testFixtures";
import { createTestQueryClient, renderWithJuryProviders } from "../testUtils";

vi.mock("@/api/requests", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/requests")>();
  return {
    ...actual,
    saveAssignmentEvaluation: vi.fn(),
  };
});

const { authState } = vi.hoisted(() => ({
  authState: {
    currentUser: { uid: "jury-user" } as { uid: string } | null,
  },
}));

vi.mock("@/firebase", () => ({
  auth: authState,
}));

describe("EvaluationsModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authState.currentUser = { uid: "jury-user" };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when assignment is null", () => {
    const { container } = renderWithJuryProviders(
      <EvaluationsModal assignment={null} onClose={onClose} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("saves evaluation and closes modal on success", async () => {
    const user = userEvent.setup();
    const assignment = createMockAssignment({ id: 11, task_id: 42 });
    const saved = createMockEvaluation(11, { comment: "Great job" });
    vi.mocked(saveAssignmentEvaluation).mockResolvedValue(saved);

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(juryTaskQueryKey("42"), [assignment]);

    renderWithJuryProviders(
      <EvaluationsModal assignment={assignment} onClose={onClose} />,
      { queryClient },
    );

    await user.click(screen.getByRole("button", { name: "Зберегти оцінку" }));

    await waitFor(() => {
      expect(saveAssignmentEvaluation).toHaveBeenCalledWith(
        11,
        expect.objectContaining({
          comment: "",
          criterion_scores: [{ criterion_id: 1, score: 0 }],
        }),
        expect.objectContaining({ uid: "jury-user" }),
        false,
      );
    });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const cached = queryClient.getQueryData<typeof assignment[]>(juryTaskQueryKey("42"));
    expect(cached?.[0]?.evaluation).toEqual(saved);
  });

  it("uses PATCH semantics when an evaluation already exists", async () => {
    const user = userEvent.setup();
    const existing = createMockEvaluation(5, { comment: "Previous" });
    const assignment = createMockAssignment({ id: 5, evaluation: existing });
    vi.mocked(saveAssignmentEvaluation).mockResolvedValue(existing);

    renderWithJuryProviders(<EvaluationsModal assignment={assignment} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Зберегти оцінку" }));

    await waitFor(() => {
      expect(saveAssignmentEvaluation).toHaveBeenCalledWith(
        5,
        expect.any(Object),
        expect.any(Object),
        true,
      );
    });
  });

  it("shows read-only finalized state without footer actions", () => {
    const assignment = createMockAssignment({
      task: createMockTask({
        status_id: taskStatusByName.evaluated.name,
        status: taskStatusByName.evaluated,
      }),
      evaluation: createMockEvaluation(1),
    });

    renderWithJuryProviders(<EvaluationsModal assignment={assignment} onClose={onClose} />);

    expect(screen.getByText("Раунд завершено. Оцінки не можна змінювати.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Зберегти оцінку" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Коментар")).toBeDisabled();
  });

  it("closes when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithJuryProviders(
      <EvaluationsModal assignment={createMockAssignment()} onClose={onClose} />,
    );

    await user.click(screen.getByRole("button", { name: "Скасувати" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when the dialog close control is activated", async () => {
    const user = userEvent.setup();
    renderWithJuryProviders(
      <EvaluationsModal assignment={createMockAssignment()} onClose={onClose} />,
    );

    await user.click(screen.getByRole("button", { name: "Закрити" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps long team names and comments within constrained layout", async () => {
    const user = userEvent.setup();
    const longName = "Team ".repeat(40).trim();
    const longComment = "Feedback ".repeat(80).trim();
    const assignment = createMockAssignment({
      submission: {
        ...createMockAssignment().submission,
        team: {
          ...createMockAssignment().submission.team,
          name: longName,
        },
      },
    });

    renderWithJuryProviders(<EvaluationsModal assignment={assignment} onClose={onClose} />);

    const title = screen.getByRole("heading", { level: 2 });
    expect(title).toHaveClass("break-words");
    expect(title).toHaveTextContent(longName);

    const comment = screen.getByLabelText("Коментар");
    await user.clear(comment);
    await user.click(comment);
    await user.paste(longComment);
    expect(comment).toHaveValue(longComment);
    expect(comment).toHaveClass("w-full");
    expect(comment).toHaveClass("resize-y");
  });

  it("does not persist when the jury user is missing", async () => {
    const user = userEvent.setup();
    authState.currentUser = null;

    renderWithJuryProviders(
      <EvaluationsModal assignment={createMockAssignment()} onClose={onClose} />,
    );

    await user.click(screen.getByRole("button", { name: "Зберегти оцінку" }));

    await waitFor(() => {
      expect(saveAssignmentEvaluation).not.toHaveBeenCalled();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders criteria without optional descriptions", () => {
    const assignment = createMockAssignment({
      task: createMockTask({
        criteria: [{ id: 2, name: "Speed", description: null, weight: 2, max_score: 5 }],
      }),
    });

    renderWithJuryProviders(<EvaluationsModal assignment={assignment} onClose={onClose} />);

    expect(screen.getByText("Speed")).toBeInTheDocument();
    expect(screen.queryByText("Overall quality")).not.toBeInTheDocument();
  });

  it("updates criterion score inputs", async () => {
    const user = userEvent.setup();
    renderWithJuryProviders(
      <EvaluationsModal assignment={createMockAssignment()} onClose={onClose} />,
    );

    const scoreInput = screen.getByRole("spinbutton");
    await user.clear(scoreInput);
    await user.type(scoreInput, "9");
    expect(scoreInput).toHaveValue(9);
  });
});
