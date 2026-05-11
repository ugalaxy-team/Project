import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { OrganizerPanel } from "./OrganizerPanel";
import { getAllTournaments } from "@/api/requests/getAllTournaments";
import { getTasks } from "@/api/requests/getTasks";
import { deleteTask } from "@/api/requests/deleteTask";
import { deleteTournament } from "@/api/requests/deleteTournament";
import { createTournament } from "@/api/requests/createTournament";
import { updateTournament } from "@/api/requests/updateTournament";
import { createTask } from "@/api/requests/createTask";
import { updateTask } from "@/api/requests/updateTask";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

vi.mock("@/api/requests/getAllTournaments", () => ({
  getAllTournaments: vi.fn(),
}));

vi.mock("@/api/requests/getTasks", () => ({
  getTasks: vi.fn(),
}));

vi.mock("@/api/requests/deleteTask", () => ({
  deleteTask: vi.fn(),
}));

vi.mock("@/api/requests/deleteTournament", () => ({
  deleteTournament: vi.fn(),
}));

vi.mock("@/api/requests/updateTournament", () => ({
  updateTournament: vi.fn(),
}));

vi.mock("@/api/requests/createTournament", () => ({
  createTournament: vi.fn(),
}));

vi.mock("@/api/requests/createTask", () => ({
  createTask: vi.fn(),
}));

vi.mock("@/api/requests/updateTask", () => ({
  updateTask: vi.fn(),
}));

vi.mock("@/api/requests/getAllUsers", () => ({
  getAllUsers: vi.fn().mockResolvedValue([]),
}));

const currentUser = { id: 7, email: "anna@dev.com" };

const tournaments = [
  {
    id: 1,
    title: "My Tournament",
    description: "Desc",
    creator: { id: 7, full_name: "Anna", email: "anna@dev.com" },
    status: { name: "draft", display_name: "Чернетка" },
    status_name: "draft",
  },
  {
    id: 2,
    title: "Foreign Tournament",
    description: "Desc",
    creator: { id: 99, full_name: "Other", email: "other@dev.com" },
    status: { name: "draft", display_name: "Чернетка" },
    status_name: "draft",
  },
];

const tasks = [
  {
    id: 101,
    title: "Prepare docs",
    description: "Write docs",
    start_time: "2026-05-11T12:00:00Z",
    end_time: "2026-05-11T14:00:00Z",
    requirements: ["TypeScript"],
  },
];

const renderPanel = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizerPanel />
    </QueryClientProvider>,
  );
};

describe("OrganizerPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSelector).mockReturnValue(currentUser);
    vi.mocked(getAllTournaments).mockResolvedValue(tournaments as never);
    vi.mocked(getTasks).mockResolvedValue(tasks as never);
    vi.mocked(deleteTask).mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("shows profile loading placeholder when user is missing", () => {
    vi.mocked(useSelector).mockReturnValue(null);
    renderPanel();
    expect(screen.getByText("Завантаження профілю...")).toBeInTheDocument();
  });

  it("renders only tournaments created by current user", async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText("My Tournament")).toBeInTheDocument();
    });
    expect(screen.queryByText("Foreign Tournament")).not.toBeInTheDocument();
  });

  it("loads tournament tasks when organizer opens tournament in tasks tab", async () => {
    const user = userEvent.setup();
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText("My Tournament")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "📋 КЕРУВАННЯ ЗАВДАННЯМИ" }));
    await user.click(screen.getByText("My Tournament"));

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(1);
      expect(screen.getByText("Prepare docs")).toBeInTheDocument();
    });
  });

  it("shows empty tasks state when getTasks request fails", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getTasks).mockRejectedValue(new Error("fetch failed"));
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText("My Tournament")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "📋 КЕРУВАННЯ ЗАВДАННЯМИ" }));
    await user.click(screen.getByText("My Tournament"));

    await waitFor(() => {
      expect(screen.getByText("Завдань ще немає")).toBeInTheDocument();
    });
    errorSpy.mockRestore();
  });

  it("does not delete task when organizer cancels confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(window.confirm).mockReturnValue(false);
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText("My Tournament")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "📋 КЕРУВАННЯ ЗАВДАННЯМИ" }));
    await user.click(screen.getByText("My Tournament"));
    await waitFor(() => {
      expect(screen.getByText("Prepare docs")).toBeInTheDocument();
    });

    await user.click(screen.getByTitle("Видалити"));
    expect(deleteTask).not.toHaveBeenCalled();
  });

  it("switches between tournaments and tasks tabs", async () => {
    const user = userEvent.setup();
    renderPanel();

    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "📋 КЕРУВАННЯ ЗАВДАННЯМИ" }));
    expect(screen.getByText("Керування завданнями")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "🏆 МОЇ ТУРНІРИ" }));
    expect(screen.getByText("Управління списком")).toBeInTheDocument();
  });

  it("filters tournaments from search input", async () => {
    const user = userEvent.setup();
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText("Пошук турніру..."), "missing");
    expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
  });

  it("opens and closes create tournament modal", async () => {
    const user = userEvent.setup();
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "+ Створити турнір" }));
    expect(screen.getByText("НОВИЙ ТУРНІР")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Скасувати" }));
    await waitFor(() => expect(screen.queryByText("НОВИЙ ТУРНІР")).not.toBeInTheDocument());
  });

  it("creates tournament from modal and calls api mutation", async () => {
    const user = userEvent.setup();
    vi.mocked(createTournament).mockResolvedValue({ id: 15 } as never);
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "+ Створити турнір" }));
    await user.type(screen.getByPlaceholderText("Наприклад: Global Cyber Cup"), "New Cup");
    await user.type(screen.getByPlaceholderText("Короткий опис для учасників..."), "Description");
    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: "Створити Турнір" }));

    await waitFor(() => expect(createTournament).toHaveBeenCalled());
  });

  it("opens and closes tournament info modal", async () => {
    const user = userEvent.setup();
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());

    await user.click(screen.getAllByRole("button")[3]);
    expect(screen.getByText("Зрозуміло, закрити")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Зрозуміло, закрити" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Зрозуміло, закрити" })).not.toBeInTheDocument(),
    );
  });

  it("edits tournament and calls update mutation", async () => {
    const user = userEvent.setup();
    vi.mocked(updateTournament).mockResolvedValue({ ok: true } as never);
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Редагувати" }));
    await user.clear(screen.getByDisplayValue("My Tournament"));
    await user.type(screen.getByPlaceholderText("Наприклад: Global Cyber Cup"), "Updated Name");
    await user.click(screen.getByRole("button", { name: "Далі" }));
    await user.click(screen.getByRole("button", { name: "Зберегти Зміни" }));

    await waitFor(() => expect(updateTournament).toHaveBeenCalled());
  });

  it("deletes tournament from tournaments tab", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteTournament).mockResolvedValue({} as never);
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());

    await user.click(screen.getAllByRole("button", { name: "Видалити" })[0]);
    await waitFor(() => expect(deleteTournament).toHaveBeenCalled());
    expect(vi.mocked(deleteTournament).mock.calls[0][0]).toBe(1);
  });

  it("creates task from task modal", async () => {
    const user = userEvent.setup();
    vi.mocked(createTask).mockResolvedValue({ id: 111 } as never);
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "📋 КЕРУВАННЯ ЗАВДАННЯМИ" }));
    await user.click(screen.getByText("My Tournament"));

    await user.click(screen.getByRole("button", { name: "+ Нове завдання" }));
    await user.type(screen.getByPlaceholderText("Введіть назву..."), "Task name");
    const startInput = document.querySelector("input[name='start_time']");
    const endInput = document.querySelector("input[name='end_time']");
    await user.type(startInput as HTMLInputElement, "2026-05-11T12:00");
    await user.type(endInput as HTMLInputElement, "2026-05-11T13:00");
    await user.selectOptions(screen.getByRole("combobox"), "Python");
    await user.click(screen.getByRole("button", { name: "Створити завдання" }));

    await waitFor(() => expect(createTask).toHaveBeenCalledWith(1, expect.any(Object)));
  });

  it("updates existing task from task modal", async () => {
    const user = userEvent.setup();
    vi.mocked(updateTask).mockResolvedValue({ ...tasks[0], title: "Updated task" } as never);
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "📋 КЕРУВАННЯ ЗАВДАННЯМИ" }));
    await user.click(screen.getByText("My Tournament"));
    await waitFor(() => expect(screen.getByText("Prepare docs")).toBeInTheDocument());

    await user.click(screen.getByTitle("Редагувати"));
    const titleInput = screen.getByDisplayValue("Prepare docs");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated task");
    await user.click(screen.getByRole("button", { name: "Зберегти завдання" }));

    await waitFor(() => expect(updateTask).toHaveBeenCalledWith(1, 101, expect.any(Object)));
  });

  it("deletes task when organizer confirms action", async () => {
    const user = userEvent.setup();
    vi.mocked(window.confirm).mockReturnValue(true);
    renderPanel();
    await waitFor(() => expect(screen.getByText("My Tournament")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "📋 КЕРУВАННЯ ЗАВДАННЯМИ" }));
    await user.click(screen.getByText("My Tournament"));
    await waitFor(() => expect(screen.getByText("Prepare docs")).toBeInTheDocument());

    await user.click(screen.getByTitle("Видалити"));
    await waitFor(() => expect(deleteTask).toHaveBeenCalledWith(1, 101));
  });
});
