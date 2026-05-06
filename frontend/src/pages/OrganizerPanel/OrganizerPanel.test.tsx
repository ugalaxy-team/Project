import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrganizerPanel } from "./OrganizerPanel";
import * as reactRedux from "react-redux";
import * as reactQuery from "@tanstack/react-query";
import { tournamentStatuses } from "@/config/appConfig";

import { deleteTournament } from "@/api/requests/deleteTournament";
import { createTournament } from "@/api/requests/createTournament";

// --- Mocks Setup ---

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock("@/api/requests/getAllTournaments", () => ({
  getAllTournaments: vi.fn(),
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

vi.mock("@/api/requests/getAllUsers", () => ({
  getAllUsers: vi.fn(),
}));

vi.mock("./EditTournamentModal", () => ({
  EditTournamentModal: ({ isOpen, onSave }: any) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={() => onSave(1, { title: "Updated" })}>
          Save Edit
        </button>
      </div>
    ) : null,
}));

vi.mock("./CreateTournamentModal", () => ({
  CreateTournamentModal: ({ isOpen, onCreate }: any) =>
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={() => onCreate({ title: "New" })}>Save Create</button>
      </div>
    ) : null,
}));

// --- Mock Data ---

const mockUser = { id: 1, full_name: "Test Organizer", email: "test@test.com" };

const [draftStatus, registrationStatus] = tournamentStatuses;

const mockTournaments = [
  {
    id: 1,
    title: "Alpha Tournament",
    description: "Alpha Desc",
    creator: { id: 1, full_name: "Test Organizer" },
    status: draftStatus,
    status_name: draftStatus.name,
    max_teams: 10,
  },
  {
    id: 2,
    title: "Beta Championship",
    description: "Beta Desc",
    creator: { id: 1, full_name: "Test Organizer" },
    status: registrationStatus,
    status_name: registrationStatus.name,
  },
];

const mockAllUsers = [
  { id: 101, full_name: "Juror One", email: "j1@test.com" },
  { id: 102, full_name: "Juror Two", email: "j2@test.com" },
];

// --- Test Suite ---

describe("OrganizerPanel", () => {
  let mutateAsyncDeleteMock: any;
  let mutateAsyncUpdateMock: any;
  let mutateAsyncCreateMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mutateAsyncDeleteMock = vi.fn();
    mutateAsyncUpdateMock = vi.fn();
    mutateAsyncCreateMock = vi.fn();

    vi.mocked(reactRedux.useSelector).mockImplementation(() => mockUser);

    vi.mocked(reactQuery.useQuery).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "tournaments") {
        return { data: mockTournaments, isLoading: false } as any;
      }
      if (queryKey[0] === "users") {
        return { data: mockAllUsers, isLoading: false } as any;
      }
      return { data: [], isLoading: false } as any;
    });

    vi.mocked(reactQuery.useMutation).mockImplementation(
      ({ mutationFn }: any) => {
        if (mutationFn === deleteTournament) {
          return { mutateAsync: mutateAsyncDeleteMock } as any;
        }
        if (mutationFn === createTournament) {
          return { mutateAsync: mutateAsyncCreateMock } as any;
        }
        return { mutateAsync: mutateAsyncUpdateMock } as any;
      },
    );
  });

  // --- Rendering ---

  it("renders loading profile state if no current user", () => {
    vi.mocked(reactRedux.useSelector).mockImplementation(() => null);
    render(<OrganizerPanel />);
    expect(screen.getByText(/Завантаження профілю/i)).toBeInTheDocument();
  });

  it("renders main header and tabs", () => {
    render(<OrganizerPanel />);
    expect(screen.getByText(/ПАНЕЛЬ ОРГАНІЗАТОРА/i)).toBeInTheDocument();
    expect(screen.getByText(/МОЇ ТУРНІРИ/i)).toBeInTheDocument();
    expect(screen.getByText(/КЕРУВАННЯ ЖУРІ/i)).toBeInTheDocument();
  });

  it("renders global loading state when tournaments are loading", () => {
    vi.mocked(reactQuery.useQuery).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "tournaments")
        return { isLoading: true, data: [] } as any;
      return { isLoading: false, data: [] } as any;
    });
    render(<OrganizerPanel />);
    expect(screen.getByText(/Завантаження.../i)).toBeInTheDocument();
  });

  // --- Tournaments Tab Filtering ---

  it("renders tournaments list correctly", () => {
    render(<OrganizerPanel />);
    expect(screen.getByText("Alpha Tournament")).toBeInTheDocument();
    expect(screen.getByText("Beta Championship")).toBeInTheDocument();
  });

  it("filters tournaments by search query", () => {
    render(<OrganizerPanel />);
    const searchInput = screen.getByPlaceholderText(/Пошук турніру.../i);
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    expect(screen.getByText("Alpha Tournament")).toBeInTheDocument();
    expect(screen.queryByText("Beta Championship")).not.toBeInTheDocument();
  });

  it("filters tournaments by status", () => {
    render(<OrganizerPanel />);
    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, {
      target: { value: registrationStatus.name },
    });

    expect(screen.queryByText("Alpha Tournament")).not.toBeInTheDocument();
    expect(screen.getByText("Beta Championship")).toBeInTheDocument();
  });

  it("shows empty state when no tournaments match filters", () => {
    render(<OrganizerPanel />);
    const searchInput = screen.getByPlaceholderText(/Пошук турніру.../i);
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });

    expect(screen.getByText(/Нічого не знайдено/i)).toBeInTheDocument();
  });

  it("clears filters when clear button is clicked", () => {
    render(<OrganizerPanel />);
    const searchInput = screen.getByPlaceholderText(/Пошук турніру.../i);
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });

    const clearButton = screen.getByText(/Очистити фільтри/i);
    fireEvent.click(clearButton);

    expect(screen.getByText("Alpha Tournament")).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });

  // --- Tournament Actions ---

  it("calls delete mutation when delete button is clicked", async () => {
    render(<OrganizerPanel />);
    const deleteButtons = screen.getAllByText(/Видалити/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mutateAsyncDeleteMock).toHaveBeenCalledWith(1);
    });
  });

  it("opens create modal when create button is clicked", () => {
    render(<OrganizerPanel />);
    const createButton = screen.getByText(/\+ Створити турнір/i);
    fireEvent.click(createButton);

    expect(screen.getByTestId("create-modal")).toBeInTheDocument();
  });

  it("calls create mutation from modal", async () => {
    render(<OrganizerPanel />);
    fireEvent.click(screen.getByText(/\+ Створити турнір/i));

    fireEvent.click(screen.getByText("Save Create"));

    await waitFor(() => {
      expect(mutateAsyncCreateMock).toHaveBeenCalledWith({ title: "New" });
    });
  });

  it("opens edit modal when edit button is clicked", () => {
    render(<OrganizerPanel />);
    const editButtons = screen.getAllByText(/Редагувати/i);
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
  });

  it("calls update mutation from edit modal", async () => {
    render(<OrganizerPanel />);
    fireEvent.click(screen.getAllByText(/Редагувати/i)[0]);

    fireEvent.click(screen.getByText("Save Edit"));

    await waitFor(() => {
      expect(mutateAsyncUpdateMock).toHaveBeenCalledWith({
        id: 1,
        data: { title: "Updated" },
      });
    });
  });

  // --- Modals ---

  it("opens and displays info modal data", () => {
    render(<OrganizerPanel />);
    const infoButtons = screen
      .getAllByRole("button")
      .filter((b) => b.innerHTML.includes("svg"));
    fireEvent.click(infoButtons[0]);

    expect(screen.getByText(/Alpha Desc/i)).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("closes info modal", () => {
    render(<OrganizerPanel />);
    const infoButtons = screen
      .getAllByRole("button")
      .filter((b) => b.innerHTML.includes("svg"));
    fireEvent.click(infoButtons[0]);

    const closeBtn = screen.getByText(/Закрити/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Alpha Desc/i)).not.toBeInTheDocument();
  });

  // --- Jury Tab ---

  it("switches to jury tab and renders tournaments", () => {
    render(<OrganizerPanel />);
    fireEvent.click(screen.getByText(/КЕРУВАННЯ ЖУРІ/i));

    expect(screen.getByText(/Призначення експертів/i)).toBeInTheDocument();
    expect(screen.getAllByText("+").length).toBe(2);
  });

  it("shows empty state in jury tab if no tournaments exist", () => {
    vi.mocked(reactQuery.useQuery).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "tournaments")
        return { data: [], isLoading: false } as any;
      return { data: mockAllUsers, isLoading: false } as any;
    });
    render(<OrganizerPanel />);
    fireEvent.click(screen.getByText(/КЕРУВАННЯ ЖУРІ/i));

    expect(screen.getByText(/Турнірів ще немає/i)).toBeInTheDocument();
  });

  it("opens jury modal and lists users", () => {
    render(<OrganizerPanel />);
    fireEvent.click(screen.getByText(/КЕРУВАННЯ ЖУРІ/i));

    const addJuryButtons = screen.getAllByText("+");
    fireEvent.click(addJuryButtons[0]);

    expect(screen.getByText("ДОДАТИ ЖУРІ")).toBeInTheDocument();
    expect(screen.getByText("Juror One")).toBeInTheDocument();
    expect(screen.getByText("Juror Two")).toBeInTheDocument();
  });

  it("toggles jurors selection in jury modal", () => {
    render(<OrganizerPanel />);
    fireEvent.click(screen.getByText(/КЕРУВАННЯ ЖУРІ/i));
    fireEvent.click(screen.getAllByText("+")[0]);

    const jurorOne = screen.getByText("Juror One");
    fireEvent.click(jurorOne);

    expect(screen.getByText("Вибрано:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(jurorOne);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("closes jury modal", () => {
    render(<OrganizerPanel />);
    fireEvent.click(screen.getByText(/КЕРУВАННЯ ЖУРІ/i));
    fireEvent.click(screen.getAllByText("+")[0]);

    const saveButton = screen.getByText(/Зберегти склад/i);
    fireEvent.click(saveButton);

    expect(screen.queryByText("ДОДАТИ ЖУРІ")).not.toBeInTheDocument();
  });
});
