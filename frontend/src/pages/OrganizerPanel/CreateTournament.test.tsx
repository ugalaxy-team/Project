import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { getAllUsers } from "@/api/requests/getAllUsers";

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

vi.mock("@/api/requests/getAllUsers", () => ({
  getAllUsers: vi.fn(),
}));

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onCreate: vi.fn().mockResolvedValue({ id: 123 }),
};

async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByPlaceholderText("Наприклад: Winter Coding Cup 2024"),
    "Summer Cup",
  );
  await user.type(
    document.querySelector('textarea[name="description"]') as HTMLTextAreaElement,
    "Long enough description for validation rules.",
  );
  await user.type(screen.getByLabelText("Відкриття"), "2026-05-01T10:00:00.000Z");
  await user.type(screen.getByLabelText("Закриття"), "2026-05-10T10:00:00.000Z");
  await user.type(screen.getByLabelText("Дата та час старту"), "2026-05-15T10:00:00.000Z");
}

describe("CreateTournamentModal", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("loads users and toggles body overflow on open", async () => {
    vi.mocked(getAllUsers).mockResolvedValue([]);
    const { unmount } = render(<CreateTournamentModal {...baseProps} />);

    await waitFor(() => {
      expect(getAllUsers).toHaveBeenCalledTimes(1);
    });
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("unset");
  });

  it("blocks next step when required fields are empty", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(<CreateTournamentModal {...baseProps} />);

    const nextButton = screen.getByRole("button", { name: "Далі" });
    expect(nextButton).toBeDisabled();
    await user.click(nextButton);
    expect(screen.getByText("Новий турнір")).toBeInTheDocument();
  });

  it("creates tournament after completing step 1 and step 2", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    const onCreate = vi.fn().mockResolvedValue({ id: 55 });
    const onClose = vi.fn();

    render(
      <CreateTournamentModal
        {...baseProps}
        onCreate={onCreate}
        onClose={onClose}
      />,
    );

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Далі" }));

    await waitFor(() => {
      expect(screen.getByText("Додати суддів")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Створити турнір" }));
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Summer Cup" }),
      );
    });
    expect(screen.getByText("Готово до запуску")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "До керування" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when modal is closed", () => {
    const { container } = render(
      <CreateTournamentModal {...baseProps} isOpen={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("allows going back to first step from step two", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(<CreateTournamentModal {...baseProps} />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: "Назад" }));

    expect(screen.getByDisplayValue("Summer Cup")).toBeInTheDocument();
  });

  it("opens and closes jury modal from second step", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([
      { id: 1, full_name: "Jury", email: "jury@x.com" } as never,
    ]);
    render(<CreateTournamentModal {...baseProps} />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: /Додати суддів/i }));
    expect(screen.getByText("Вибір журі")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Підтвердити" }));
    expect(screen.queryByText("Вибір журі")).not.toBeInTheDocument();
  });

  it("keeps create button disabled if team values are invalid", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(<CreateTournamentModal {...baseProps} />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Далі" }));

    const minInput = document.querySelector(
      "input[name='min_people_in_team']",
    ) as HTMLInputElement;
    const maxInput = document.querySelector(
      "input[name='max_people_in_team']",
    ) as HTMLInputElement;
    await user.clear(minInput);
    await user.type(minInput, "5");
    await user.clear(maxInput);
    await user.type(maxInput, "2");

    expect(screen.getByRole("button", { name: "Створити турнір" })).toBeDisabled();
  });

  it("calls onClose from cancel button on first step", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(<CreateTournamentModal {...baseProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Скасувати" }));
    expect(onClose).toHaveBeenCalled();
  });
});
