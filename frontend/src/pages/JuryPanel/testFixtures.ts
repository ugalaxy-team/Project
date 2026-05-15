import type { JuryAssignment, JuryTask, SubmissionEvaluation } from "@/api/requests";
import { taskStatusByName } from "@/config/appConfig";

export function createMockTask(overrides: Partial<JuryTask> = {}): JuryTask {
  return {
    id: 42,
    title: "Round Alpha",
    description: "Test round description",
    status_id: taskStatusByName.active.name,
    status: taskStatusByName.active,
    start_time: "2026-01-01T00:00:00Z",
    end_time: "2026-02-01T00:00:00Z",
    min_reviews_per_submission: 1,
    max_score: 10,
    is_leaderboard_visible: true,
    criteria: [
      {
        id: 1,
        name: "Quality",
        description: "Overall quality",
        weight: 1,
        max_score: 10,
      },
    ],
    ...overrides,
  };
}

export function createMockEvaluation(
  assignmentId: number,
  overrides: Partial<SubmissionEvaluation> = {},
): SubmissionEvaluation {
  return {
    id: 900,
    assignment_id: assignmentId,
    submission_id: 101,
    jury_id: 5,
    comment: "Solid work",
    criterion_scores: [{ criterion_id: 1, score: 8 }],
    ...overrides,
  };
}

export function createMockAssignment(overrides: Partial<JuryAssignment> = {}): JuryAssignment {
  const task = overrides.task ?? createMockTask();
  const id = overrides.id ?? 1;

  return {
    id,
    task_id: task.id,
    submission_id: 100 + id,
    jury_id: 5,
    status: "assigned",
    submission: {
      id: 100 + id,
      team_id: 10 + id,
      task_id: task.id,
      team: {
        id: 10 + id,
        name: `Team ${id}`,
        team_email: `team${id}@test.com`,
        contact_info: "",
        tournament: { id: 99, title: "Cup", description: "Tournament" },
        members: [],
      },
      urls: [],
      ...overrides.submission,
    },
    task,
    evaluation: overrides.evaluation ?? null,
    ...overrides,
  };
}
