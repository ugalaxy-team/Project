import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { getAllUsers } from "@/api/requests/getAllUsers";

vi.mock("@/api/requests/getAllUsers", () => ({
  getAllUsers: vi.fn(),
}));

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onCreate: vi.fn().mockResolvedValue({ id: 123 }),
  onCreateTask: vi.fn().mockResolvedValue(undefined),
};

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
    expect(screen.getByText("КРОК 1 З 2")).toBeInTheDocument();
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

    await user.type(screen.getByPlaceholderText("Наприклад: Global Cyber Cup"), "Summer Cup");
    await user.type(screen.getByPlaceholderText("Короткий опис для учасників..."), "Main description");
    await user.click(screen.getByRole("button", { name: "Далі" }));

    await waitFor(() => {
      expect(screen.getByText("КРОК 2 З 2")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Створити Турнір" }));
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ title: "Summer Cup" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when modal is closed", () => {
    const { container } = render(<CreateTournamentModal {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("allows going back to first step from step two", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(<CreateTournamentModal {...baseProps} />);

    await user.type(screen.getByPlaceholderText("Наприклад: Global Cyber Cup"), "Cup");
    await user.type(screen.getByPlaceholderText("Короткий опис для учасників..."), "Desc");
    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: "Назад" }));

    expect(screen.getByText("КРОК 1 З 2")).toBeInTheDocument();
  });

  it("opens and closes jury modal from second step", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([{ id: 1, full_name: "Jury", email: "jury@x.com" } as never]);
    render(<CreateTournamentModal {...baseProps} />);

    await user.type(screen.getByPlaceholderText("Наприклад: Global Cyber Cup"), "Cup");
    await user.type(screen.getByPlaceholderText("Короткий опис для учасників..."), "Desc");
    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: /Суддівська Колегія/i }));
    expect(screen.getByText("Вибір журі")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Підтвердити" }));
    expect(screen.queryByText("Вибір журі")).not.toBeInTheDocument();
  });

  it("keeps create button disabled if team values are invalid", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(<CreateTournamentModal {...baseProps} />);

    await user.type(screen.getByPlaceholderText("Наприклад: Global Cyber Cup"), "Cup");
    await user.type(screen.getByPlaceholderText("Короткий опис для учасників..."), "Desc");
    await user.click(screen.getByRole("button", { name: "Далі" }));

    const minInput = document.querySelector("input[name='min_people_in_team']");
    expect(minInput).toBeTruthy();
    await user.clear(minInput as HTMLInputElement);
    await user.type(minInput as HTMLInputElement, "0");

    expect(screen.getByRole("button", { name: "Створити Турнір" })).toBeDisabled();
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
