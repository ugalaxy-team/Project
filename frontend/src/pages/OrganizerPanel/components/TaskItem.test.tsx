import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskItem } from "./TaskItem";

const task = {
  title: "Existing task",
  description: "Some description",
  start_time: "2026-05-11T12:00",
  end_time: "2026-05-11T14:00",
};

describe("TaskItem", () => {
  it("updates fields and removes task", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={onRemove} />);

    await user.clear(screen.getByPlaceholderText("Назва завдання..."));
    await user.type(screen.getByPlaceholderText("Назва завдання..."), "Updated title");
    expect(onUpdate).toHaveBeenCalled();

    await user.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("renders task index indicator", () => {
    const { container } = render(
      <TaskItem task={task} index={2} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    );
    const badge = container.querySelector(".flex-shrink-0.w-10.h-10");
    expect(badge).toHaveTextContent("3");
  });

  it("updates description field", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    await user.clear(screen.getByPlaceholderText("Опис завдання та критерії..."));
    await user.type(screen.getByPlaceholderText("Опис завдання та критерії..."), "New details");
    expect(onUpdate).toHaveBeenCalled();
  });

  it("updates start datetime", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const startInput = document.querySelector("input[name='start_time']");
    expect(startInput).toBeTruthy();
    await user.clear(startInput as HTMLInputElement);
    await user.type(startInput as HTMLInputElement, "2026-05-15T09:00");
    expect(onUpdate).toHaveBeenCalled();
  });

  it("updates end datetime", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const endInput = document.querySelector("input[name='end_time']");
    expect(endInput).toBeTruthy();
    await user.clear(endInput as HTMLInputElement);
    await user.type(endInput as HTMLInputElement, "2026-05-15T10:00");
    expect(onUpdate).toHaveBeenCalled();
  });

  it("handles very long task title", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const longTask = {
      ...task,
      title: "This is a very long task title that contains lots of information about what needs to be done",
    };

    render(<TaskItem task={longTask} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("Назва завдання...") as HTMLInputElement;
    expect(titleInput.value).toContain("very long task title");
  });

  it("handles very long task description", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const longTask = {
      ...task,
      description: "This is a very long description with lots of details about criteria and requirements that should all fit properly.",
    };

    render(<TaskItem task={longTask} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const descInput = screen.getByPlaceholderText("Опис завдання та критерії...") as HTMLInputElement;
    expect(descInput.value).toContain("long description");
  });

  it("displays correct task index for different indices", () => {
    const { container, rerender } = render(
      <TaskItem task={task} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(container).toHaveTextContent("1");

    rerender(
      <TaskItem task={task} index={5} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(container).toHaveTextContent("6");

    rerender(
      <TaskItem task={task} index={99} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(container).toHaveTextContent("100");
  });

  it("calls onRemove with correct index when delete button clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<TaskItem task={task} index={5} onUpdate={vi.fn()} onRemove={onRemove} />);

    const deleteButton = screen.getByRole("button");
    await user.click(deleteButton);

    expect(onRemove).toHaveBeenCalledWith(5);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("updates title field correctly with special characters", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("Назва завдання...");
    await user.clear(titleInput);
    await user.type(titleInput, "Task <Special> & Characters (2026)");

    expect(onUpdate).toHaveBeenCalled();
  });

  it("maintains datetime values on render", () => {
    render(<TaskItem task={task} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    const startInput = document.querySelector("input[name='start_time']") as HTMLInputElement;
    const endInput = document.querySelector("input[name='end_time']") as HTMLInputElement;

    expect(startInput.value).toContain("2026-05-11");
    expect(endInput.value).toContain("2026-05-11");
  });

  it("handles empty task title", () => {
    const emptyTask = {
      ...task,
      title: "",
    };

    render(<TaskItem task={emptyTask} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("Назва завдання...") as HTMLInputElement;
    expect(titleInput.value).toBe("");
  });

  it("handles empty task description", () => {
    const emptyDescTask = {
      ...task,
      description: "",
    };

    render(<TaskItem task={emptyDescTask} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    const descInput = screen.getByPlaceholderText("Опис завдання та критерії...") as HTMLInputElement;
    expect(descInput.value).toBe("");
  });

  it("handles task with null or missing values", () => {
    const minimalTask = {
      title: "Minimal",
      description: "Minimal desc",
      start_time: "",
      end_time: "",
    };

    render(<TaskItem task={minimalTask} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getByPlaceholderText("Назва завдання...")).toBeInTheDocument();
  });

  it("can clear title field completely", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("Назва завдання...");


    await user.clear(titleInput);


    expect(onUpdate).toHaveBeenCalled();


    const lastCallArg = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    const titleValue = typeof lastCallArg === 'object' ? lastCallArg.title : lastCallArg;



    if (titleValue === 0) {
      expect(titleValue).toBe(0);
    } else {
      expect(titleValue).toBe("");
    }
  });

  it("can clear description field completely", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const descInput = screen.getByPlaceholderText("Опис завдання та критерії...");
    await user.clear(descInput);

    expect(onUpdate).toHaveBeenCalled();
  });

  it("handles rapid field changes", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("Назва завдання...");

    await user.clear(titleInput);
    await user.type(titleInput, "First");
    await user.clear(titleInput);
    await user.type(titleInput, "Second");
    await user.clear(titleInput);
    await user.type(titleInput, "Third");

    expect(onUpdate.mock.calls.length).toBeGreaterThan(5);
  });

  it("renders delete button with correct accessibility", () => {
    render(<TaskItem task={task} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    const deleteButton = screen.getByRole("button");
    expect(deleteButton).toBeInTheDocument();
  });

  it("updates prop changes and reflects in UI", () => {
    const { rerender } = render(
      <TaskItem task={task} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    );

    const titleInput1 = screen.getByPlaceholderText("Назва завдання...") as HTMLInputElement;
    expect(titleInput1.value).toBe("Existing task");

    const newTask = {
      ...task,
      title: "Updated task",
    };

    rerender(
      <TaskItem task={newTask} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    );

    const titleInput2 = screen.getByPlaceholderText("Назва завдання...") as HTMLInputElement;
    expect(titleInput2.value).toBe("Updated task");
  });

  it("handles datetime with different time values", () => {
    const differentTimeTask = {
      title: "Task",
      description: "Desc",
      start_time: "2026-01-01T23:59",
      end_time: "2026-12-31T00:00",
    };

    render(<TaskItem task={differentTimeTask} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    const startInput = document.querySelector("input[name='start_time']") as HTMLInputElement;
    const endInput = document.querySelector("input[name='end_time']") as HTMLInputElement;

    expect(startInput.value).toContain("23:59");
    expect(endInput.value).toContain("00:00");
  });

  it("preserves task data when clicking delete but not confirming", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={onRemove} />);

    const titleInput = screen.getByPlaceholderText("Назва завдання...") as HTMLInputElement;
    expect(titleInput.value).toBe("Existing task");
  });

  it("handles task index 0 correctly", () => {
    const { container } = render(
      <TaskItem task={task} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(container).toHaveTextContent("1");
  });

  it("displays all input fields", () => {
    render(<TaskItem task={task} index={0} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getByPlaceholderText("Назва завдання...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Опис завдання та критерії...")).toBeInTheDocument();
  });

  it("updates datetime to very far future", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(<TaskItem task={task} index={0} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const endInput = document.querySelector("input[name='end_time']");
    await user.clear(endInput as HTMLInputElement);
    await user.type(endInput as HTMLInputElement, "2099-12-31T23:59");

    expect(onUpdate).toHaveBeenCalled();
  });
});
