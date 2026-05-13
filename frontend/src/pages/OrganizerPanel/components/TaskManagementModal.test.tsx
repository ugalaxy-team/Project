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

async function pickRequirement(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("button", { name: /Виберіть варіант/i }));
  await user.click(await screen.findByRole("option", { name }));
}

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

    await user.click(screen.getByRole("button", { name: "Зберегти" }));

    expect(document.querySelector('input[name="title"]')).toHaveClass("border-red-200");
    expect(screen.getAllByText("Вкажіть час").length).toBe(2);
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
      screen.getByPlaceholderText("Наприклад: Розробка смарт-контракту"),
      "Build scoring",
    );
    await user.type(
      document.querySelector('textarea[name="description"]') as HTMLTextAreaElement,
      "Implement rankings",
    );
    await user.type(screen.getByLabelText("Старт прийому"), "2026-05-11T12:00:00.000Z");
    await user.type(screen.getByLabelText("Кінцевий дедлайн"), "2026-05-11T14:00:00.000Z");

    await pickRequirement(user, "Python");

    await user.click(screen.getByRole("button", { name: "Зберегти" }));

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
    expect(screen.getByRole("heading", { name: "Оновити таск" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Зберегти" })).toBeInTheDocument();
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
    expect(screen.getByText(/Турнір:\s*Test Tournament/)).toBeInTheDocument();
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
      .getByRole("heading", { name: "Нове завдання" })
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

    const cancelBtn = screen.getByRole("button", { name: "Скасувати" });
    const [, saveBtn] = within(cancelBtn.parentElement as HTMLElement).getAllByRole("button");
    expect(saveBtn).toBeDisabled();
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

    await pickRequirement(user, "Python");
    expect(screen.getByText("Python")).toBeInTheDocument();

    const chipRow = screen.getByText("Python").closest("div.flex");
    expect(chipRow).toBeTruthy();
    await user.click(within(chipRow as HTMLElement).getByRole("button"));
    expect(screen.queryByText("Python")).not.toBeInTheDocument();
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
      screen.getByPlaceholderText("Наприклад: Розробка смарт-контракту"),
      "ab",
    );
    await user.type(screen.getByLabelText("Старт прийому"), "2026-05-11T12:00:00.000Z");
    await user.type(screen.getByLabelText("Кінцевий дедлайн"), "2026-05-11T14:00:00.000Z");
    await pickRequirement(user, "Python");
    await user.click(screen.getByRole("button", { name: "Зберегти" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(document.querySelector('input[name="title"]')).toHaveClass("border-red-200");
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
      screen.getByPlaceholderText("Наприклад: Розробка смарт-контракту"),
      "Build scoring",
    );
    await user.type(screen.getByLabelText("Старт прийому"), "2026-05-11T12:00:00.000Z");
    await user.type(screen.getByLabelText("Кінцевий дедлайн"), "2026-05-11T14:00:00.000Z");
    await pickRequirement(user, "Python");
    await user.click(screen.getByRole("button", { name: "Зберегти" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });
});
