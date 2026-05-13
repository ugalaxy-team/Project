import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksTab } from "./TasksTab";
import type { Task, Tournament } from "./types";

const tournaments: Tournament[] = [
  {
    id: 1,
    title: "Alpha Cup",
    description: "Desc",
    creator: { id: 7, full_name: "Anna", email: "anna@dev.com" },
    status: { name: "draft", display_name: "Чернетка" },
    status_name: "draft",
  },
];

const tasks: Task[] = [
  {
    id: 10,
    title: "Build API",
    description: "Create endpoints",
    start_time: "2026-05-01T12:00:00Z",
    end_time: "2026-05-02T12:00:00Z",
    requirements: ["Python", "FastAPI"],
  },
];

const renderTab = (props?: Partial<any>) =>
  render(
    <TasksTab
      tournaments={tournaments}
      tasks={tasks}
      selectedTournament={null}
      onTasksClick={vi.fn()}
      onCreateTaskClick={vi.fn()}
      onEditTaskClick={vi.fn()}
      onDeleteTaskClick={vi.fn()}
      onSwitchTab={vi.fn()}
      {...props}
    />,
  );

describe("TasksTab", () => {
  it("shows empty tournaments state and allows switching tab", async () => {
    const onSwitchTab = vi.fn();
    const user = userEvent.setup();

    render(
      <TasksTab
        tournaments={[]}
        tasks={[]}
        selectedTournament={null}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={onSwitchTab}
      />,
    );

    expect(screen.getByText("Турнірів ще немає")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Перейти до турнірів" }));
    expect(onSwitchTab).toHaveBeenCalledTimes(1);
  });

  it("allows selecting tournament, creating, editing and deleting tasks", async () => {
    const user = userEvent.setup();
    const onTasksClick = vi.fn();
    const onCreateTaskClick = vi.fn();
    const onEditTaskClick = vi.fn();
    const onDeleteTaskClick = vi.fn();

    render(
      <TasksTab
        tournaments={tournaments}
        tasks={tasks}
        selectedTournament={tournaments[0]}
        onTasksClick={onTasksClick}
        onCreateTaskClick={onCreateTaskClick}
        onEditTaskClick={onEditTaskClick}
        onDeleteTaskClick={onDeleteTaskClick}
        onSwitchTab={vi.fn()}
      />,
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
    expect(screen.getByText("Build API")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();

    const headerRow = screen.getByText("Поточний турнір").closest(".flex.items-center.gap-4");
    expect(headerRow).toBeTruthy();
    const backBtn = headerRow?.querySelector("button");
    expect(backBtn).toBeTruthy();
    await user.click(backBtn as HTMLButtonElement);
    expect(onTasksClick).toHaveBeenCalledWith(null);

    await user.click(screen.getByRole("button", { name: /Нове завдання/i }));
    expect(onCreateTaskClick).toHaveBeenCalledWith(tournaments[0]);

    const taskCard = screen.getByText("Build API").closest("div.group.relative") as HTMLElement;
    const [editBtn, deleteBtn] = within(taskCard).getAllByRole("button");
    await user.click(editBtn);
    expect(onEditTaskClick).toHaveBeenCalledWith(tasks[0]);

    await user.click(deleteBtn);
    expect(onDeleteTaskClick).toHaveBeenCalledWith(10);
  });

  it("matches snapshot for selected tournament empty tasks state", () => {
    const { container } = render(
      <TasksTab
        tournaments={tournaments}
        tasks={[]}
        selectedTournament={tournaments[0]}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders tournament selection cards when tournament is not selected", () => {
    renderTab();
    expect(screen.getByText("КЕРУВАННЯ ЗАВДАННЯМИ")).toBeInTheDocument();
    expect(screen.getByText("ID: 1")).toBeInTheDocument();
  });

  it("opens tournament tasks from card click", async () => {
    const user = userEvent.setup();
    const onTasksClick = vi.fn();
    renderTab({ onTasksClick });

    await user.click(screen.getByText("Alpha Cup"));
    expect(onTasksClick).toHaveBeenCalledWith(tournaments[0]);
  });

  it("shows empty tasks call to action when selected tournament has no tasks", () => {
    renderTab({
      tasks: [],
      selectedTournament: tournaments[0],
    });

    expect(screen.getByText("Тут поки порожньо")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Нове завдання/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Додати завдання" })).toBeInTheDocument();
  });

  it("creates task from empty tasks state", async () => {
    const user = userEvent.setup();
    const onCreateTaskClick = vi.fn();
    renderTab({
      tasks: [],
      selectedTournament: tournaments[0],
      onCreateTaskClick,
    });

    await user.click(screen.getByRole("button", { name: "+ Додати завдання" }));
    expect(onCreateTaskClick).toHaveBeenCalledWith(tournaments[0]);
  });

  it("hides description paragraph when task description is absent", () => {
    renderTab({
      selectedTournament: tournaments[0],
      tasks: [{ ...tasks[0], description: "" }],
    });

    expect(screen.queryByText("Create endpoints")).not.toBeInTheDocument();
  });

  it("hides requirements badges when list is empty", () => {
    renderTab({
      selectedTournament: tournaments[0],
      tasks: [{ ...tasks[0], requirements: [] }],
    });

    expect(screen.queryByText("Python")).not.toBeInTheDocument();
    expect(screen.queryByText("FastAPI")).not.toBeInTheDocument();
  });

  it("renders formatted schedule chips for selected task", () => {
    renderTab({ selectedTournament: tournaments[0] });
    expect(screen.getByText(/До /)).toBeInTheDocument();
  });
});
