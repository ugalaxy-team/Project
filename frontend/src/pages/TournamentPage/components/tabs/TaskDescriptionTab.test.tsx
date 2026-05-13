import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskDescriptionTab } from "./TaskDescriptionTab";
import type { TaskInfo } from "../../types";

const futureTask: TaskInfo = {
  id: 1,
  title: "Build",
  description: "Desc",
  start_time: "2030-01-15T10:00:00.000Z",
  end_time: "2030-01-16T10:00:00.000Z",
  requirements: ["React"],
  tournament_id: 1,
  status_id: "active",
};

const pastTask: TaskInfo = {
  ...futureTask,
  start_time: "2020-01-01T10:00:00.000Z",
  end_time: "2020-01-02T10:00:00.000Z",
};

describe("TaskDescriptionTab", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-05-01T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows not started banner when active task is in the future", () => {
    render(
      <TaskDescriptionTab tasks={[futureTask]} activeTask={futureTask} />,
    );
    expect(screen.getByText("Турнір ще не розпочався")).toBeInTheDocument();
  });

  it("shows current task details when task already started", () => {
    render(<TaskDescriptionTab tasks={[pastTask]} activeTask={pastTask} />);
    expect(screen.getByText("Поточне завдання")).toBeInTheDocument();
    expect(screen.getAllByText("Build").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });

  it("renders requirement list for active task", () => {
    render(<TaskDescriptionTab tasks={[pastTask]} activeTask={pastTask} />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("uses first task when activeTask is null", () => {
    render(<TaskDescriptionTab tasks={[pastTask]} activeTask={null} />);
    expect(screen.getAllByText("Build").length).toBeGreaterThanOrEqual(1);
  });

  it("renders schedule heading with task count", () => {
    render(
      <TaskDescriptionTab tasks={[pastTask, { ...pastTask, id: 2, title: "T2" }]} activeTask={pastTask} />,
    );
    expect(screen.getByText("Графік усіх етапів (2)")).toBeInTheDocument();
  });

  it("marks active leg in schedule list", () => {
    render(
      <TaskDescriptionTab
        tasks={[pastTask, { ...pastTask, id: 2, title: "Other" }]}
        activeTask={pastTask}
      />,
    );
    expect(screen.getAllByText("● Зараз триває").length).toBeGreaterThan(0);
  });

  it("hides long description block when description empty for started task", () => {
    const t = { ...pastTask, description: "" };
    render(<TaskDescriptionTab tasks={[t]} activeTask={t} />);
    expect(screen.queryByText("Desc")).not.toBeInTheDocument();
  });

  it("does not show requirement section when requirements empty", () => {
    const t = { ...pastTask, requirements: [] };
    render(<TaskDescriptionTab tasks={[t]} activeTask={t} />);
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });
});
