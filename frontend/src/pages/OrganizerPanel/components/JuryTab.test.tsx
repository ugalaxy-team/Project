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

  it("renders with correct heading text", () => {
  render(<JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />);
  
  
  expect(screen.getByText(/призначення експертів/i)).toBeInTheDocument();
});

  it("handles tournament with very long title", () => {
    const longTitleTournament = {
      ...tournaments[0],
      title: "This is an extremely long tournament title that should still render correctly",
    };

    render(
      <JuryTab
        tournaments={[longTitleTournament]}
        onJuryClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText(/extremely long tournament title/i)).toBeInTheDocument();
  });

  it("handles tournament with very long description", () => {
    const longDescTournament = {
      ...tournaments[0],
      description: "This is a very long description that contains lots of information about the tournament.",
    };

    render(
      <JuryTab
        tournaments={[longDescTournament]}
        onJuryClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("renders creator information", () => {
    render(<JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />);
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("handles multiple tournament selection callbacks", async () => {
    const user = userEvent.setup();
    const onJuryClick = vi.fn();
    const tournaments2 = [
      tournaments[0],
      { ...tournaments[0], id: 2, title: "Beta Cup" },
      { ...tournaments[0], id: 3, title: "Gamma Cup" },
    ];

    render(
      <JuryTab tournaments={tournaments2} onJuryClick={onJuryClick} onSwitchTab={vi.fn()} />
    );

    await user.click(screen.getByText("Alpha Cup"));
    expect(onJuryClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));

    await user.click(screen.getByText("Beta Cup"));
    expect(onJuryClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));

    await user.click(screen.getByText("Gamma Cup"));
    expect(onJuryClick).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));

    expect(onJuryClick).toHaveBeenCalledTimes(3);
  });

  it("handles large number of tournaments", () => {
    const largeTournamentList = Array.from({ length: 100 }, (_, i) => ({
      ...tournaments[0],
      id: i,
      title: `Tournament ${i}`,
    }));

    render(
      <JuryTab
        tournaments={largeTournamentList}
        onJuryClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Tournament 0")).toBeInTheDocument();
  });

  it("calls onSwitchTab with correct value when switch button is clicked", async () => {
    const user = userEvent.setup();
    const onSwitchTab = vi.fn();

    render(<JuryTab tournaments={[]} onJuryClick={vi.fn()} onSwitchTab={onSwitchTab} />);

    await user.click(screen.getByRole("button", { name: "Перейти до турнірів" }));
    expect(onSwitchTab).toHaveBeenCalledTimes(1);
  });

  it("renders tournament card with correct layout", () => {
    const { container } = render(
      <JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    const card = container.querySelector("[class*='rounded']");
    expect(card).toBeInTheDocument();
  });

  it("handles tournament with empty description", () => {
    const noDescTournament = {
      ...tournaments[0],
      description: "",
    };

    render(
      <JuryTab
        tournaments={[noDescTournament]}
        onJuryClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("handles tournament with null creator", () => {
    const noCreatorTournament = {
      ...tournaments[0],
      creator: null as any,
    };

    render(
      <JuryTab
        tournaments={[noCreatorTournament]}
        onJuryClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("renders multiple tournament cards side by side", () => {
    const tournaments3 = [
      tournaments[0],
      { ...tournaments[0], id: 2, title: "Beta Cup" },
      { ...tournaments[0], id: 3, title: "Gamma Cup" },
    ];

    render(
      <JuryTab tournaments={tournaments3} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();
    expect(screen.getByText("Gamma Cup")).toBeInTheDocument();
  });

  it("tournament cards are clickable", async () => {
    const user = userEvent.setup();
    const onJuryClick = vi.fn();

    render(
      <JuryTab tournaments={tournaments} onJuryClick={onJuryClick} onSwitchTab={vi.fn()} />
    );

    const card = screen.getByText("Alpha Cup");
    expect(card).toBeInTheDocument();

    await user.click(card);
    expect(onJuryClick).toHaveBeenCalledTimes(1);
  });

  it("handles special characters in tournament title", () => {
    const specialCharTournament = {
      ...tournaments[0],
      title: "Cup & Tournament (2026) <Special>",
    };

    render(
      <JuryTab
        tournaments={[specialCharTournament]}
        onJuryClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />
    );

    expect(screen.getByText("Cup & Tournament (2026) <Special>")).toBeInTheDocument();
  });

  it("displays tournament ID for each tournament", () => {
    const tournaments3 = [
      tournaments[0],
      { ...tournaments[0], id: 2, title: "Beta Cup" },
      { ...tournaments[0], id: 3, title: "Gamma Cup" },
    ];

    render(
      <JuryTab tournaments={tournaments3} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.getByText("ID: 1")).toBeInTheDocument();
    expect(screen.getByText("ID: 2")).toBeInTheDocument();
    expect(screen.getByText("ID: 3")).toBeInTheDocument();
  });

  it("updates on prop changes", () => {
    const { rerender } = render(
      <JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();

    const newTournaments = [
      { ...tournaments[0], id: 99, title: "New Tournament" },
    ];

    rerender(
      <JuryTab tournaments={newTournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.queryByText("Alpha Cup")).not.toBeInTheDocument();
    expect(screen.getByText("New Tournament")).toBeInTheDocument();
  });

  it("handles empty tournament list after non-empty list", () => {
    const { rerender } = render(
      <JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();

    rerender(
      <JuryTab tournaments={[]} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.getByText("Турнірів ще немає")).toBeInTheDocument();
  });

  it("handles transition from empty to populated tournament list", () => {
    const { rerender } = render(
      <JuryTab tournaments={[]} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.getByText("Турнірів ще немає")).toBeInTheDocument();

    rerender(
      <JuryTab tournaments={tournaments} onJuryClick={vi.fn()} onSwitchTab={vi.fn()} />
    );

    expect(screen.queryByText("Турнірів ще немає")).not.toBeInTheDocument();
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("calls onJuryClick with exact tournament object", async () => {
    const user = userEvent.setup();
    const onJuryClick = vi.fn();
    const exactTournament = {
      id: 42,
      title: "Exact Tournament",
      description: "Exact Desc",
      creator: { id: 7, full_name: "Anna", email: "anna@dev.com" },
      status: { name: "draft", display_name: "Чернетка" },
      status_name: "draft",
    };

    render(
      <JuryTab
        tournaments={[exactTournament]}
        onJuryClick={onJuryClick}
        onSwitchTab={vi.fn()}
      />
    );

    await user.click(screen.getByText("Exact Tournament"));
    expect(onJuryClick).toHaveBeenCalledWith(exactTournament);
  });

  it("has correct accessible structure", () => {
  render(
    <JuryTab 
      tournaments={tournaments} 
      onJuryClick={vi.fn()} 
      onSwitchTab={vi.fn()} 
    />
  );

  
  const mainHeading = screen.getByRole("heading", { 
    level: 2, 
    name: /призначення експертів/i 
  });
  expect(mainHeading).toBeInTheDocument();

  
  const tournamentHeading = screen.getByRole("heading", { 
    level: 3, 
    name: tournaments[0].title 
  });
  expect(tournamentHeading).toBeInTheDocument();
  
  
  expect(screen.getByText(new RegExp(`ID: ${tournaments[0].id}`))).toBeInTheDocument();
});
});
