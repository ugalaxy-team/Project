import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TournamentTable } from "./TournamentTable";
import { TasksTab } from "./TasksTab";
import { JurySelectionModal } from "./JurySelectionModal";
import { TournamentInfoModal } from "./TournamentInfoModal";
import type { Tournament } from "./types";

const tournamentBase: Tournament = {
  id: 1,
  title: "Alpha",
  description: "Desc",
  creator: { id: 1, full_name: "Anna", email: "anna@dev.com" },
  status: { name: "draft", display_name: "Чернетка" },
  status_name: "draft",
};

describe("OrganizerPanel coverage matrix", () => {
  it.each([
    ["draft", "Чернетка"],
    ["registration", "Реєстрація"],
    ["running", "Активний"],
    ["finished", "Завершений"],
    ["archived", "Архів"],
    ["custom", "Кастомний"],
    ["paused", "Пауза"],
    ["review", "Рев'ю"],
    ["validation", "Валідація"],
    ["created", "Створений"],
    ["closed", "Закритий"],
    ["in_progress", "В процесі"],
    ["queued", "В черзі"],
    ["published", "Опубліковано"],
    ["moderation", "Модерація"],
  ])("renders table status badge for %s", (statusName, displayName) => {
    render(
      <TournamentTable
        tournaments={[
          {
            ...tournamentBase,
            id: statusName.length,
            status: { name: statusName, display_name: displayName },
            status_name: statusName,
          },
        ]}
        searchQuery=""
        statusFilter="all"
        onInfo={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );
    expect(screen.getByText(displayName)).toBeInTheDocument();
  });

  it.each([
    ["Task A", "Desc A"],
    ["Task B", ""],
    ["Task C", "Desc C"],
    ["Task D", ""],
    ["Task E", "Desc E"],
    ["Task F", "Desc F"],
    ["Task G", ""],
    ["Task H", "Desc H"],
    ["Task I", ""],
    ["Task J", "Desc J"],
    ["Task K", "Desc K"],
    ["Task L", ""],
    ["Task M", "Desc M"],
    ["Task N", ""],
    ["Task O", "Desc O"],
  ])("renders task row for %s in selected tournament mode", (title, description) => {
    render(
      <TasksTab
        tournaments={[tournamentBase]}
        tasks={[
          {
            id: title.length,
            title,
            description,
            start_time: "2026-05-11T10:00:00Z",
            end_time: "2026-05-11T12:00:00Z",
            requirements: ["Python"],
          },
        ]}
        selectedTournament={tournamentBase}
        onTasksClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
        onEditTaskClick={vi.fn()}
        onDeleteTaskClick={vi.fn()}
        onSwitchTab={vi.fn()}
      />,
    );
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
    "renders jury selection count state %i",
    (count) => {
      const allUsers = Array.from({ length: Math.max(1, count + 1) }).map((_, idx) => ({
        id: idx + 1,
        full_name: `User ${idx + 1}`,
        email: `u${idx + 1}@dev.com`,
      }));
      const added = Array.from({ length: count }).map((_, idx) => idx + 1);

      render(
        <JurySelectionModal
          isOpen
          selectedTournament={tournamentBase}
          allUsers={allUsers as never}
          addedJurors={added}
          onToggleJuror={vi.fn()}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />,
      );

      expect(screen.getByText(String(count))).toBeInTheDocument();
    },
  );

  it.each([
    [true, true, true],
    [true, true, false],
    [true, false, true],
    [false, true, true],
    [false, false, true],
    [false, true, false],
    [true, false, false],
    [false, false, false],
    [true, true, true],
    [false, false, false],
  ])(
    "renders info modal section combination tasks:%s teams:%s juries:%s",
    (hasTasks, hasTeams, hasJuries) => {
      render(
        <TournamentInfoModal
          isOpen
          tournament={{
            ...tournamentBase,
            tasks: hasTasks
              ? [
                  {
                    id: 9,
                    title: "Task X",
                    description: "Task desc",
                    start_time: "2026-05-11T10:00:00Z",
                    end_time: "2026-05-11T12:00:00Z",
                    requirements: ["React"],
                  },
                ]
              : [],
            teams: hasTeams ? [{ name: "Team One", members: [] }] : [],
            juries: hasJuries ? [{ id: 5, full_name: "Judge One" }] : [],
          }}
          onClose={vi.fn()}
        />,
      );

      if (hasTasks) expect(screen.getByText("Task X")).toBeInTheDocument();
      else expect(screen.getByText("Таски відсутні")).toBeInTheDocument();
    },
  );

  it.each(["a", "b", "c", "d", "e"])(
    "renders tournament table snapshot state %s",
    (suffix) => {
      const { container } = render(
        <TournamentTable
          tournaments={[
            {
              ...tournamentBase,
              id: suffix.charCodeAt(0),
              title: `Tournament ${suffix}`,
            },
          ]}
          searchQuery=""
          statusFilter="all"
          onInfo={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onClearFilters={vi.fn()}
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    },
  );
});
