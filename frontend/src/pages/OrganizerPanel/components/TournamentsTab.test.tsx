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
});
