import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditTournamentModal } from "./EditTournamentModal";
import { getAllUsers } from "@/api/requests/getAllUsers";

vi.mock("@/api/requests/getAllUsers", () => ({
  getAllUsers: vi.fn(),
}));

const tournament = {
  id: 9,
  title: "Old Cup",
  description: "Old description",
  start_date: "2026-05-15T10:00:00.000Z",
  reg_start: "2026-05-11T10:00:00.000Z",
  reg_end: "2026-05-12T10:00:00.000Z",
  max_teams: 10,
  min_people_in_team: 2,
  max_people_in_team: 4,
  juries: [{ id: 11 }],
};

describe("EditTournamentModal", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("prefills form with selected tournament values", async () => {
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(
      <EditTournamentModal
        isOpen
        onClose={vi.fn()}
        tournament={tournament}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Old Cup")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Old description")).toBeInTheDocument();
    });
  });

  it("prevents save when max people is less than min people", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(
      <EditTournamentModal
        isOpen
        onClose={vi.fn()}
        tournament={tournament}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Далі" }));
    const maxPeopleInput = document.querySelector("input[name='max_people_in_team']");
    expect(maxPeopleInput).toBeTruthy();
    await user.clear(maxPeopleInput as HTMLInputElement);
    await user.type(maxPeopleInput as HTMLInputElement, "1");

    const saveButton = screen.getByRole("button", { name: /Зберегти зміни/i });
    expect(saveButton).toBeDisabled();
    await user.click(saveButton);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves updated tournament", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(
      <EditTournamentModal
        isOpen
        onClose={onClose}
        tournament={tournament}
        onSave={onSave}
      />,
    );

    const titleInput = screen.getByDisplayValue("Old Cup");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Cup");
    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: /Зберегти зміни/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        9,
        expect.objectContaining({
          title: "Updated Cup",
          juries: [11],
        }),
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not render when modal is closed", () => {
    const { container } = render(
      <EditTournamentModal
        isOpen={false}
        onClose={vi.fn()}
        tournament={tournament}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("goes back to first step from second step", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(
      <EditTournamentModal
        isOpen
        onClose={vi.fn()}
        tournament={tournament}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByDisplayValue("Old Cup")).toBeInTheDocument();
  });

  it("opens jury modal on second step", async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsers).mockResolvedValue([{ id: 11, full_name: "Judge", email: "j@x.com" } as never]);
    render(
      <EditTournamentModal
        isOpen
        onClose={vi.fn()}
        tournament={tournament}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: /Суддівська команда/i }));
    expect(screen.getByText("Вибір журі")).toBeInTheDocument();
  });

  it("closes modal via cancel button on first step", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(
      <EditTournamentModal
        isOpen
        onClose={onClose}
        tournament={tournament}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Скасувати" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps next button disabled when tournament is null and required fields are empty", () => {
    vi.mocked(getAllUsers).mockResolvedValue([]);
    render(
      <EditTournamentModal
        isOpen
        onClose={vi.fn()}
        tournament={null}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByRole("button", { name: "Далі" })).toBeDisabled();
  });
});
