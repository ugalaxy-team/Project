import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import TournamentCard from "./TournamentCard";
import { createMockTask } from "../testFixtures";

describe("TournamentCard", () => {
  const renderCard = (task = createMockTask()) =>
    render(
      <MemoryRouter>
        <TournamentCard task={task} />
      </MemoryRouter>,
    );

  it("renders task metadata and evaluation link", () => {
    const task = createMockTask({ id: 7, title: "Design sprint" });
    renderCard(task);

    expect(screen.getByRole("heading", { level: 2, name: "Design sprint" })).toBeInTheDocument();
    expect(screen.getByText("Завдання №7")).toBeInTheDocument();
    expect(screen.getByText("Test round description")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Відкрити раунд" })).toHaveAttribute(
      "href",
      "/jury-panel/evaluate/7",
    );
  });

  it("shows fallback description when task has none", () => {
    renderCard(createMockTask({ description: null }));
    expect(screen.getByText("Для цього раунду немає опису.")).toBeInTheDocument();
  });

  it("formats compact status labels for display", () => {
    renderCard(
      createMockTask({
        status: { name: "submission_closed", display_name: "SubmissionClosed" },
      }),
    );
    expect(screen.getByText("Submission Closed")).toBeInTheDocument();
  });

  it("renders review count and scoring scale chips", () => {
    renderCard(createMockTask({ min_reviews_per_submission: 2, max_score: 15 }));
    expect(screen.getByText("2 перевірок / робота")).toBeInTheDocument();
    expect(screen.getByText("Шкала 0–15")).toBeInTheDocument();
  });
});
