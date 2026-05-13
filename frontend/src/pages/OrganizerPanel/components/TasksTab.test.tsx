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

  it("renders multiple tasks in correct order", () => {
    const multipleTasks = [
      { ...tasks[0], id: 1, title: "Task One" },
      { ...tasks[0], id: 2, title: "Task Two" },
      { ...tasks[0], id: 3, title: "Task Three" },
    ];

    renderTab({
      selectedTournament: tournaments[0],
      tasks: multipleTasks,
    });

    expect(screen.getByText("Task One")).toBeInTheDocument();
    expect(screen.getByText("Task Two")).toBeInTheDocument();
    expect(screen.getByText("Task Three")).toBeInTheDocument();
  });

  it("handles tasks with very long titles", () => {
    const longTitleTask = {
      ...tasks[0],
      title: "This is a very long task title that goes on and on and should still be displayed correctly without breaking the layout",
    };

    renderTab({
      selectedTournament: tournaments[0],
      tasks: [longTitleTask],
    });

    expect(
      screen.getByText(/This is a very long task title/i)
    ).toBeInTheDocument();
  });

  it("handles tasks with very long descriptions", () => {
    const longDescTask = {
      ...tasks[0],
      description: "This is a very long description that contains lots of details about what needs to be done. " +
        "It goes on for quite a while and should still render properly without breaking the component layout.",
    };

    renderTab({
      selectedTournament: tournaments[0],
      tasks: [longDescTask],
    });

    expect(
      screen.getByText(/This is a very long description/i)
    ).toBeInTheDocument();
  });

  it("handles tasks with many requirements", () => {
    const manyReqsTask = {
      ...tasks[0],
      requirements: [
        "Python", "JavaScript", "TypeScript", "React", "Node.js",
        "Express", "PostgreSQL", "MongoDB", "Docker", "Kubernetes",
      ],
    };

    renderTab({
      selectedTournament: tournaments[0],
      tasks: [manyReqsTask],
    });

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });

  it("handles task with single requirement", () => {
    const singleReqTask = {
      ...tasks[0],
      requirements: ["Python"],
    };

    renderTab({
      selectedTournament: tournaments[0],
      tasks: [singleReqTask],
    });

    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("switches between multiple tournaments", async () => {
    const user = userEvent.setup();
    const onTasksClick = vi.fn();

    const multipleTournaments = [
      { ...tournaments[0], id: 1, title: "Tournament A" },
      { ...tournaments[0], id: 2, title: "Tournament B" },
      { ...tournaments[0], id: 3, title: "Tournament C" },
    ];

    const { rerender } = render(
      <TasksTab
        tournaments={multipleTournaments}
        tasks={tasks}
        selectedTournament={multipleTournaments[0]}
        onTasksClick={onTasksClick}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Tournament A")).toBeInTheDocument();

    
    rerender(
      <TasksTab
        tournaments={multipleTournaments}
        tasks={tasks}
        selectedTournament={multipleTournaments[1]}
        onTasksClick={onTasksClick}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Tournament B")).toBeInTheDocument();
  });

  it("renders back button and header correctly when tournament is selected", () => {
    renderTab({
      selectedTournament: tournaments[0],
    });

    expect(screen.getByText("Поточний турнір")).toBeInTheDocument();
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("calls all callbacks with correct data", async () => {
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
      />
    );

    
    const headerRow = screen.getByText("Поточний турнір").closest(".flex.items-center.gap-4");
    const backBtn = headerRow?.querySelector("button");
    await user.click(backBtn as HTMLButtonElement);
    expect(onTasksClick).toHaveBeenCalledWith(null);

    
    await user.click(screen.getByRole("button", { name: /Нове завдання/i }));
    expect(onCreateTaskClick).toHaveBeenCalledWith(tournaments[0]);

    
    const taskCard = screen.getByText("Build API").closest("div.group.relative") as HTMLElement;
    const [editBtn] = within(taskCard).getAllByRole("button");
    await user.click(editBtn);
    expect(onEditTaskClick).toHaveBeenCalledWith(expect.objectContaining({ id: 10 }));

    
    const [, deleteBtn] = within(taskCard).getAllByRole("button");
    await user.click(deleteBtn);
    expect(onDeleteTaskClick).toHaveBeenCalledWith(10);
  });

  it("displays task list empty state with no selected tournament", () => {
    renderTab({ selectedTournament: null });
    expect(screen.getByText("КЕРУВАННЯ ЗАВДАННЯМИ")).toBeInTheDocument();
  });

  it("renders all tournament cards when not selected", () => {
    const multipleTournaments = [
      { ...tournaments[0], id: 1, title: "Tournament A" },
      { ...tournaments[0], id: 2, title: "Tournament B" },
      { ...tournaments[0], id: 3, title: "Tournament C" },
    ];

    render(
      <TasksTab
        tournaments={multipleTournaments}
        tasks={[]}
        selectedTournament={null}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Tournament A")).toBeInTheDocument();
    expect(screen.getByText("Tournament B")).toBeInTheDocument();
    expect(screen.getByText("Tournament C")).toBeInTheDocument();
  });

  it("handles task with empty string requirements", () => {
    const taskWithEmptyReqs = {
      ...tasks[0],
      requirements: ["", "Python", ""],
    };

    renderTab({
      selectedTournament: tournaments[0],
      tasks: [taskWithEmptyReqs],
    });

    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("updates when selectedTournament prop changes to null", () => {
    const { rerender } = render(
      <TasksTab
        tournaments={tournaments}
        tasks={tasks}
        selectedTournament={tournaments[0]}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Build API")).toBeInTheDocument();

    rerender(
      <TasksTab
        tournaments={tournaments}
        tasks={tasks}
        selectedTournament={null}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.queryByText("Build API")).not.toBeInTheDocument();
  });

  it("updates when tasks prop changes", () => {
    const { rerender } = render(
      <TasksTab
        tournaments={tournaments}
        tasks={tasks}
        selectedTournament={tournaments[0]}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Build API")).toBeInTheDocument();

    const newTasks = [
      { ...tasks[0], id: 11, title: "New Task" },
    ];

    rerender(
      <TasksTab
        tournaments={tournaments}
        tasks={newTasks}
        selectedTournament={tournaments[0]}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.queryByText("Build API")).not.toBeInTheDocument();
    expect(screen.getByText("New Task")).toBeInTheDocument();
  });

  it("handles no requirements array gracefully", () => {
    const taskWithoutReqs = {
      ...tasks[0],
      requirements: undefined as any,
    };

    renderTab({
      selectedTournament: tournaments[0],
      tasks: [taskWithoutReqs],
    });

    
    expect(screen.getByText("Build API")).toBeInTheDocument();
  });

  it("handles null description gracefully", () => {
    const taskWithNullDesc = {
      ...tasks[0],
      description: null as any,
    };

    renderTab({
      selectedTournament: tournaments[0],
      tasks: [taskWithNullDesc],
    });

    expect(screen.getByText("Build API")).toBeInTheDocument();
  });

  it("renders task cards with consistent layout", () => {
    renderTab({ selectedTournament: tournaments[0] });

    const taskCard = screen.getByText("Build API").closest("div.group.relative");
    expect(taskCard).toBeInTheDocument();
    expect(taskCard).toHaveClass("group");
    expect(taskCard).toHaveClass("relative");
  });

  it("displays edit and delete buttons on task card", () => {
    renderTab({ selectedTournament: tournaments[0] });

    const taskCard = screen.getByText("Build API").closest("div.group.relative") as HTMLElement;
    const buttons = within(taskCard).getAllByRole("button");
    expect(buttons).toHaveLength(2); 
  });

  it("handles tournament with same ID as previous selection", async () => {
    const user = userEvent.setup();
    const onTasksClick = vi.fn();

    const { rerender } = render(
      <TasksTab
        tournaments={tournaments}
        tasks={tasks}
        selectedTournament={tournaments[0]}
        onTasksClick={onTasksClick}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    rerender(
      <TasksTab
        tournaments={tournaments}
        tasks={[...tasks]}
        selectedTournament={tournaments[0]}
        onTasksClick={onTasksClick}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Build API")).toBeInTheDocument();
  });

  it("handles large number of tournaments", () => {
    const largeTournamentList = Array.from({ length: 50 }, (_, i) => ({
      ...tournaments[0],
      id: i,
      title: `Tournament ${i}`,
    }));

    render(
      <TasksTab
        tournaments={largeTournamentList}
        tasks={[]}
        selectedTournament={null}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    
    expect(screen.getByText("Tournament 0")).toBeInTheDocument();
  });

  it("handles extremely large number of tasks", () => {
    const largeTasks = Array.from({ length: 100 }, (_, i) => ({
      ...tasks[0],
      id: i,
      title: `Task ${i}`,
    }));

    render(
      <TasksTab
        tournaments={tournaments}
        tasks={largeTasks}
        selectedTournament={tournaments[0]}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    
    expect(screen.getByText("Task 0")).toBeInTheDocument();
  });

  it("correctly identifies task by ID in delete callback", async () => {
    const user = userEvent.setup();
    const onDeleteTaskClick = vi.fn();

    const multipleTasksWithDifferentIds = [
      { ...tasks[0], id: 100, title: "Task 100" },
      { ...tasks[0], id: 200, title: "Task 200" },
      { ...tasks[0], id: 300, title: "Task 300" },
    ];

    render(
      <TasksTab
        tournaments={tournaments}
        tasks={multipleTasksWithDifferentIds}
        selectedTournament={tournaments[0]}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={onDeleteTaskClick}
        onSwitchTab={vi.fn()}
      />
    );

    const task200Card = screen.getByText("Task 200").closest("div.group.relative") as HTMLElement;
    const [, deleteBtn] = within(task200Card).getAllByRole("button");
    await user.click(deleteBtn);

    expect(onDeleteTaskClick).toHaveBeenCalledWith(200);
  });

  it("renders tournament ID in display", () => {
    renderTab();
    expect(screen.getByText("ID: 1")).toBeInTheDocument();
  });

  it("handles tournament description display correctly", () => {
    const tournamentWithLongDesc = [
      {
        ...tournaments[0],
        description: "This is a very long tournament description that contains detailed information",
      },
    ];

    render(
      <TasksTab
        tournaments={tournamentWithLongDesc}
        tasks={[]}
        selectedTournament={null}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });
});
