import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JuryTab } from "./JuryTab";
import type { Tournament } from "./types";

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

describe("JuryTab", () => {
  it("shows empty state and allows switching to tournaments", async () => {
    const user = userEvent.setup();
    const onSwitchTab = vi.fn();
    render(<JuryTab tournaments={[]} onJuryClick={vi.fn()} onSwitchTab={onSwitchTab} />);

    expect(screen.getByText("Турнірів ще немає")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Перейти до турнірів" }));
    expect(onSwitchTab).toHaveBeenCalledTimes(1);
  });

  it("calls onJuryClick when tournament card is clicked", async () => {
    const user = userEvent.setup();
    const onJuryClick = vi.fn();
    render(<JuryTab tournaments={tournaments} onJuryClick={onJuryClick} onSwitchTab={vi.fn()} />);

    await user.click(screen.getByText("Alpha Cup"));
    expect(onJuryClick).toHaveBeenCalledWith(tournaments[0]);
  });

  it("renders jury assignment heading for non-empty list", () => {
    render(<JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />);
    expect(screen.getByText("Призначення експертів")).toBeInTheDocument();
  });

  it("shows tournament id badge in card", () => {
    render(<JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />);
    expect(screen.getByText("ID: 1")).toBeInTheDocument();
  });

  it("renders every tournament as selectable card", () => {
    render(
      <JuryTab
        tournaments={[...tournaments, { ...tournaments[0], id: 2, title: "Beta Cup" }]}
        onJuryClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />,
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();
  });

  it("can select second tournament card", async () => {
    const user = userEvent.setup();
    const onJuryClick = vi.fn();
    const second = { ...tournaments[0], id: 2, title: "Beta Cup" };

    render(
      <JuryTab
        tournaments={[tournaments[0], second]}
        onJuryClick={onJuryClick}
        onSwitchTab={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Beta Cup"));
    expect(onJuryClick).toHaveBeenCalledWith(second);
  });
});
