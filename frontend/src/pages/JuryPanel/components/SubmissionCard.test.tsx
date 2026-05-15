import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SubmissionCard from "./SubmissionCard";
import { createMockAssignment, createMockEvaluation, createMockTask } from "../testFixtures";
import { taskStatusByName } from "@/config/appConfig";

describe("SubmissionCard", () => {
  it("shows pending state and start CTA for unreviewed assignments", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const assignment = createMockAssignment({ id: 3 });

    render(<SubmissionCard assignment={assignment} onOpen={onOpen} />);

    expect(screen.getByText("Очікує")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Почати оцінювання" });
    await user.click(button);
    expect(onOpen).toHaveBeenCalledWith(assignment);
  });

  it("shows update CTA when reviewed but round is not finalized", () => {
    const assignment = createMockAssignment({
      evaluation: createMockEvaluation(1),
    });

    render(<SubmissionCard assignment={assignment} onOpen={vi.fn()} />);
    expect(screen.getByText("Перевірено")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Оновити оцінку" })).toBeInTheDocument();
  });

  it("shows view-only CTA when round is finalized", () => {
    const assignment = createMockAssignment({
      evaluation: createMockEvaluation(1),
      task: createMockTask({ status_id: taskStatusByName.evaluated.name, status: taskStatusByName.evaluated }),
    });

    render(<SubmissionCard assignment={assignment} onOpen={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Переглянути оцінку" })).toBeInTheDocument();
  });

  it("lists submission urls when present", () => {
    const assignment = createMockAssignment({
      submission: {
        id: 101,
        team_id: 10,
        task_id: 42,
        team: createMockAssignment().submission.team,
        urls: [
          {
            id: 1,
            url_id: "repo",
            value: "https://example.com/repo",
            url: { name: "repo", display_name: "Repository" },
          },
        ],
      },
    });

    render(<SubmissionCard assignment={assignment} onOpen={vi.fn()} />);
    expect(screen.getByText(/Repository:/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/example\.com\/repo/)).toBeInTheDocument();
  });

  it("shows empty links placeholder when no urls exist", () => {
    render(<SubmissionCard assignment={createMockAssignment()} onOpen={vi.fn()} />);
    expect(screen.getByText("Посилання на роботу не додані.")).toBeInTheDocument();
  });
});
