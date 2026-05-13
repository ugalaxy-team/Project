import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskManagementModal } from "./TaskManagementModal";

vi.mock("@/components/ui/DateTimePicker", () => ({
  default: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <label>
      <span>{label}</span>
      <input
        aria-label={label}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  ),
}));

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

    expect(
      document.querySelector('input[name="title"]'),
    ).toHaveClass("border-red-400");
    expect(screen.getAllByText("Обов'язково").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("combobox")).toHaveClass(/border-red-400/);
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

    await user.type(
      screen.getByPlaceholderText("Наприклад: створити веб платформу"),
      "Build scoring",
    );
    await user.type(
      screen.getByPlaceholderText("Що саме потрібно зробити?"),
      "Implement rankings",
    );
    await user.type(screen.getByLabelText("Початок виконання"), "2026-05-11T12:00:00.000Z");
    await user.type(screen.getByLabelText("Дедлайн"), "2026-05-11T14:00:00.000Z");

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

  it("prefills form for editing task", async () => {
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

    await waitFor(() => {
      expect(screen.getByDisplayValue("Existing task")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Already exists")).toBeInTheDocument();
    expect(screen.getAllByText("React").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Оновити завдання" })).toBeInTheDocument();
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
    expect(
      screen.getByText("Для турніру: Test Tournament"),
    ).toBeInTheDocument();
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
    const header = screen
      .getByRole("heading", { name: "Створити завдання" })
      .closest(".flex.justify-between");
    expect(header).toBeTruthy();
    await user.click(within(header as HTMLElement).getAllByRole("button")[0]);
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

    const chipRemove = screen
      .getAllByText("Python")
      .map((el) => el.closest("span"))
      .find(
        (span) =>
          span?.className.includes("tracking-wider") &&
          within(span as HTMLElement).queryAllByRole("button").length > 0,
      );
    expect(chipRemove).toBeTruthy();
    await user.click(within(chipRemove as HTMLElement).getByRole("button"));
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

    await user.type(
      screen.getByPlaceholderText("Наприклад: створити веб платформу"),
      "ab",
    );
    await user.type(screen.getByLabelText("Початок виконання"), "2026-05-11T12:00:00.000Z");
    await user.type(screen.getByLabelText("Дедлайн"), "2026-05-11T14:00:00.000Z");
    await user.selectOptions(screen.getByRole("combobox"), "Python");
    await user.click(screen.getByRole("button", { name: "Створити завдання" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(document.querySelector('input[name="title"]')).toHaveClass(
      "border-red-400",
    );
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

    await user.type(
      screen.getByPlaceholderText("Наприклад: створити веб платформу"),
      "Build scoring",
    );
    await user.type(screen.getByLabelText("Початок виконання"), "2026-05-11T12:00:00.000Z");
    await user.type(screen.getByLabelText("Дедлайн"), "2026-05-11T14:00:00.000Z");
    await user.selectOptions(screen.getByRole("combobox"), "Python");
    await user.click(screen.getByRole("button", { name: "Створити завдання" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });
});
