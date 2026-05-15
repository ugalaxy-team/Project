import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JurySelectionModal } from "./JurySelectionModal";

const users = [
  { id: 1, full_name: "Anna Dev", email: "anna@dev.com" },
  { id: 2, full_name: "Max Ops", email: "max@dev.com" },
];

describe("JurySelectionModal", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <JurySelectionModal
        isOpen={false}
        selectedTournament={{ id: 1, title: "Cup" } as never}
        allUsers={users as never}
        addedJurors={[]}
        onToggleJuror={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows empty state when no users available", () => {
    render(
      <JurySelectionModal
        isOpen
        selectedTournament={{ id: 1, title: "Cup" } as never}
        allUsers={[]}
        addedJurors={[]}
        onToggleJuror={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText("Користувачів не знайдено")).toBeInTheDocument();
  });

  it("toggles jurors and confirms selection", async () => {
    const user = userEvent.setup();
    const onToggleJuror = vi.fn();
    const onSave = vi.fn();

    render(
      <JurySelectionModal
        isOpen
        selectedTournament={{ id: 1, title: "Cup" } as never}
        allUsers={users as never}
        addedJurors={[1]}
        onToggleJuror={onToggleJuror}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Max Ops/i }));
    expect(onToggleJuror).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole("button", { name: "Підтвердити" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("shows tournament title in subheader", () => {
    render(
      <JurySelectionModal
        isOpen
        selectedTournament={{ id: 1, title: "Cup" } as never}
        allUsers={users as never}
        addedJurors={[]}
        onToggleJuror={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText("Cup")).toBeInTheDocument();
  });

  it("calls onClose from cancel button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <JurySelectionModal
        isOpen
        selectedTournament={{ id: 1, title: "Cup" } as never}
        allUsers={users as never}
        addedJurors={[]}
        onToggleJuror={vi.fn()}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Скасувати" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose from header close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <JurySelectionModal
        isOpen
        selectedTournament={{ id: 1, title: "Cup" } as never}
        allUsers={users as never}
        addedJurors={[]}
        onToggleJuror={vi.fn()}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    );

    await user.click(screen.getAllByRole("button")[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows selected jury count from props", () => {
    render(
      <JurySelectionModal
        isOpen
        selectedTournament={{ id: 1, title: "Cup" } as never}
        allUsers={users as never}
        addedJurors={[1, 2]}
        onToggleJuror={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("експертів")).toBeInTheDocument();
  });
});
