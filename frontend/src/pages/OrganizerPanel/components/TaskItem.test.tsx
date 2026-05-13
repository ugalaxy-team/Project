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
});
