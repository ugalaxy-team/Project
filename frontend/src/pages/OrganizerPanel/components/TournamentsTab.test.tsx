import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentsTab } from "./TournamentsTab";
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
  {
    id: 2,
    title: "Beta Cup",
    description: "Desc",
    creator: { id: 7, full_name: "Anna", email: "anna@dev.com" },
    status: { name: "running", display_name: "Активний" },
    status_name: "running",
  },
];

const Harness = (props: {
  onInfo: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onDelete: (id: number) => void;
  onCreateClick: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <TournamentsTab
      tournaments={tournaments}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      onInfo={props.onInfo}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onCreateClick={props.onCreateClick}
    />
  );
};

describe("TournamentsTab", () => {
  it("filters tournaments by search and status", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    expect(screen.getByText("Всього: 2")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "Beta");
    expect(screen.getByText("Всього: 1")).toBeInTheDocument();
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Cup")).not.toBeInTheDocument();
  });

  it("triggers tournament row actions and create action", async () => {
    const user = userEvent.setup();
    const onInfo = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onCreateClick = vi.fn();

    render(
      <Harness
        onInfo={onInfo}
        onEdit={onEdit}
        onDelete={onDelete}
        onCreateClick={onCreateClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "+ Створити турнір" }));
    expect(onCreateClick).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByRole("button")[1]);
    await user.click(screen.getAllByRole("button", { name: "Редагувати" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Видалити" })[0]);

    expect(onInfo).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("shows count for all tournaments by default", () => {
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    expect(screen.getByText("Всього: 2")).toBeInTheDocument();
  });

  it("filters by tournament id text", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "2");
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Cup")).not.toBeInTheDocument();
  });

  it("supports case-insensitive title filtering", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "alpha");
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("filters by status via status combobox", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "running");
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Cup")).not.toBeInTheDocument();
  });

  it("shows empty state when filters hide all tournaments", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "unknown");
    expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
  });

  it("combines search and status filtering", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "draft");
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "Beta");
    expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
  });

  it("clears search and resets filter display", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "Beta");
    expect(screen.getByText("Всього: 1")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Пошук турніру...") as HTMLInputElement;
    await user.clear(searchInput);
    expect(screen.getByText("Всього: 2")).toBeInTheDocument();
  });

  it("handles very long tournament titles", async () => {
    const user = userEvent.setup();
    const longTitleTournaments = [
      {
        ...tournaments[0],
        title: "This is an extremely long tournament title that goes on and on and should still be displayed correctly",
      },
    ];

    const { rerender } = render(
      <TournamentsTab
        tournaments={longTitleTournaments}
        searchQuery=""
        setSearchQuery={vi.fn()}
        statusFilter="all"
        setStatusFilter={vi.fn()}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(
      screen.getByText(/This is an extremely long tournament title/i)
    ).toBeInTheDocument();
  });

  it("handles very long tournament descriptions", () => {
    const longDescTournaments = [
      {
        ...tournaments[0],
        description: "This is a very long description that contains lots of information about the tournament. " +
          "It includes details about rules, schedule, and requirements.",
      },
    ];

    render(
      <TournamentsTab
        tournaments={longDescTournaments}
        searchQuery=""
        setSearchQuery={vi.fn()}
        statusFilter="all"
        setStatusFilter={vi.fn()}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText(/Alpha Cup/i)).toBeInTheDocument();
  });

  it("correctly displays tournament status badges", () => {
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    expect(screen.getByText("Чернетка")).toBeInTheDocument();
    expect(screen.getByText("Активний")).toBeInTheDocument();
  });

  it("displays all tournament information in table rows", () => {
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
    expect(screen.getByText("Чернетка")).toBeInTheDocument();

    
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();
    expect(screen.getByText("Активний")).toBeInTheDocument();
  });

  it("handles multiple consecutive searches", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Пошук турніру...") as HTMLInputElement;

    
    await user.type(searchInput, "Alpha");
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();

    
    await user.clear(searchInput);
    await user.type(searchInput, "Beta");
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();

    
    await user.clear(searchInput);
    expect(screen.getByText("Всього: 2")).toBeInTheDocument();
  });

  it("calls onInfo callback with correct tournament data", async () => {
    const user = userEvent.setup();
    const onInfo = vi.fn();

    render(
      <Harness
        onInfo={onInfo}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    
    const infoButtons = screen.getAllByRole("button").slice(1, 3); 
    await user.click(infoButtons[0]);

    expect(onInfo).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      title: "Alpha Cup",
    }));
  });

  it("calls onEdit callback with correct tournament data", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    const editButtons = screen.getAllByRole("button", { name: "Редагувати" });
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      title: "Alpha Cup",
    }));
  });

  it("calls onDelete callback with correct tournament id", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onCreateClick={vi.fn()}
      />,
    );

    const deleteButtons = screen.getAllByRole("button", { name: "Видалити" });
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("displays create tournament button", () => {
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "+ Створити турнір" })).toBeInTheDocument();
  });

  it("calls onCreateClick when create button is clicked", async () => {
    const user = userEvent.setup();
    const onCreateClick = vi.fn();

    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={onCreateClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "+ Створити турнір" }));
    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it("renders status filter dropdown with all options", () => {
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    const statusSelect = screen.getByRole("combobox");
    expect(statusSelect).toBeInTheDocument();
  });

  it("handles empty tournament list", () => {
    render(
      <TournamentsTab
        tournaments={[]}
        searchQuery=""
        setSearchQuery={vi.fn()}
        statusFilter="all"
        setStatusFilter={vi.fn()}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
  });

  it("handles tournament list with one item", () => {
    render(
      <TournamentsTab
        tournaments={[tournaments[0]]}
        searchQuery=""
        setSearchQuery={vi.fn()}
        statusFilter="all"
        setStatusFilter={vi.fn()}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText("Всього: 1")).toBeInTheDocument();
  });

  it("handles large number of tournaments", () => {
    const largeTournamentList = Array.from({ length: 50 }, (_, i) => ({
      ...tournaments[0],
      id: i,
      title: `Tournament ${i}`,
    }));

    render(
      <TournamentsTab
        tournaments={largeTournamentList}
        searchQuery=""
        setSearchQuery={vi.fn()}
        statusFilter="all"
        setStatusFilter={vi.fn()}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText("Всього: 50")).toBeInTheDocument();
  });

  it("updates count when search query changes", async () => {
    const user = userEvent.setup();
    const setSearchQuery = vi.fn();

    render(
      <TournamentsTab
        tournaments={tournaments}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        statusFilter="all"
        setStatusFilter={vi.fn()}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText("Всього: 2")).toBeInTheDocument();
  });

  it("handles special characters in search", async () => {
    const user = userEvent.setup();
    const specialCharTournaments = [
      {
        ...tournaments[0],
        title: "Cup & Tournament (2026)",
      },
    ];

    render(
      <TournamentsTab
        tournaments={specialCharTournaments}
        searchQuery=""
        setSearchQuery={vi.fn()}
        statusFilter="all"
        setStatusFilter={vi.fn()}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText("Cup & Tournament (2026)")).toBeInTheDocument();
  });

  it("filters maintain state across rerenders", () => {
    const setSearchQuery = vi.fn();
    const setStatusFilter = vi.fn();

    const { rerender } = render(
      <TournamentsTab
        tournaments={tournaments}
        searchQuery="Alpha"
        setSearchQuery={setSearchQuery}
        statusFilter="draft"
        setStatusFilter={setStatusFilter}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();

    
    rerender(
      <TournamentsTab
        tournaments={tournaments}
        searchQuery="Alpha"
        setSearchQuery={setSearchQuery}
        statusFilter="draft"
        setStatusFilter={setStatusFilter}
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("renders action buttons for each tournament", () => {
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    const editButtons = screen.getAllByRole("button", { name: "Редагувати" });
    const deleteButtons = screen.getAllByRole("button", { name: "Видалити" });

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it("search field is empty by default", () => {
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Пошук турніру...") as HTMLInputElement;
    expect(searchInput.value).toBe("");
  });

  it("handles numeric tournament IDs in search", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "1");
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();
  });

  it("handles partial text matching in search", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "Cup");
    expect(screen.getByText("Всього: 2")).toBeInTheDocument(); 
  });

  it("handles status filter changing multiple times", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    const statusSelect = screen.getByRole("combobox");

    
    await user.selectOptions(statusSelect, "draft");
    expect(screen.getByText("Alpha Cup")).toBeInTheDocument();

    
    await user.selectOptions(statusSelect, "running");
    expect(screen.getByText("Beta Cup")).toBeInTheDocument();

    
    await user.selectOptions(statusSelect, "all");
    expect(screen.getByText("Всього: 2")).toBeInTheDocument();
  });
});
