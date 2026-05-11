import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskManagementModal } from "./TaskManagementModal";

const tournament = {
  id: 11,
  title: "Test Tournament",
};

describe("TaskManagementModal", () => {
  it("does not render when closed", () => {
    const { container } = render(
      <TaskManagementModal
        isOpen={false}
        tournament={tournament as never}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("validates required fields before submit", async () => {
    const user = userEvent.setup();

    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Створити завдання" }));

    expect(screen.getByText("Назва повинна бути не менше 3 символів")).toBeInTheDocument();
    expect(screen.getByText("Додайте хоча б одну вимогу")).toBeInTheDocument();
  });

  it("submits valid task form and closes modal", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    await user.type(screen.getByPlaceholderText("Введіть назву..."), "Build scoring");
    await user.type(screen.getByPlaceholderText("Опишіть завдання..."), "Implement rankings");
    const startInput = document.querySelector("input[name='start_time']");
    const endInput = document.querySelector("input[name='end_time']");
    expect(startInput).toBeTruthy();
    expect(endInput).toBeTruthy();
    await user.type(startInput as HTMLInputElement, "2026-05-11T12:00");
    await user.type(endInput as HTMLInputElement, "2026-05-11T14:00");

    await user.selectOptions(screen.getByRole("combobox"), "Python");

    await user.click(screen.getByRole("button", { name: "Створити завдання" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Build scoring",
          description: "Implement rankings",
          requirements: ["Python"],
        }),
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("prefills form for editing task", () => {
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        editingTask={{
          id: 5,
          title: "Existing task",
          description: "Already exists",
          start_time: "2026-05-11T10:00:00Z",
          end_time: "2026-05-11T12:00:00Z",
          requirements: ["React"],
        }}
      />,
    );

    expect(screen.getByDisplayValue("Existing task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Already exists")).toBeInTheDocument();
    expect(screen.getAllByText("React").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Зберегти завдання" })).toBeInTheDocument();
  });

  it("shows tournament title in header details", () => {
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Test Tournament")).toBeInTheDocument();
  });

  it("closes modal from cancel button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={onClose}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Скасувати" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes modal from top close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={onClose}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await user.click(screen.getByRole("button", { name: "✕" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables submit button and shows saving text when loading", () => {
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        isLoading
      />,
    );

    const button = screen.getByRole("button", { name: "Збереження..." });
    expect(button).toBeDisabled();
  });

  it("allows adding and removing requirements", async () => {
    const user = userEvent.setup();
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "Python");
    expect(screen.getAllByText("Python").length).toBeGreaterThan(1);

    const removeButtons = screen.getAllByRole("button", { name: "✕" });
    await user.click(removeButtons[1]);
    expect(screen.getAllByText("Python").length).toBe(1);
  });

  it("does not submit when title is shorter than 3 chars", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    await user.type(screen.getByPlaceholderText("Введіть назву..."), "ab");
    await user.type(screen.getByPlaceholderText("Опишіть завдання..."), "desc");
    await user.selectOptions(screen.getByRole("combobox"), "Python");
    await user.click(screen.getByRole("button", { name: "Створити завдання" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Назва повинна бути не менше 3 символів")).toBeInTheDocument();
  });

  it("resets edited values after successful submit", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(
      <TaskManagementModal
        isOpen
        tournament={tournament as never}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    await user.type(screen.getByPlaceholderText("Введіть назву..."), "Build scoring");
    const startInput = document.querySelector("input[name='start_time']");
    const endInput = document.querySelector("input[name='end_time']");
    await user.type(startInput as HTMLInputElement, "2026-05-11T12:00");
    await user.type(endInput as HTMLInputElement, "2026-05-11T14:00");
    await user.selectOptions(screen.getByRole("combobox"), "Python");
    await user.click(screen.getByRole("button", { name: "Створити завдання" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });
});
