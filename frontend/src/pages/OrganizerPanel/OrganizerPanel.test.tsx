import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrganizerPanel } from "./OrganizerPanel";
import * as reactRedux from "react-redux";
import * as reactQuery from "@tanstack/react-query";
import { tournamentStatuses } from "@/config/appConfig";

// --- МОКИ ЗАЛЕЖНОСТЕЙ ---

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

// Мокаємо дочірні компоненти, щоб ізолювати тестування панелі
vi.mock("./EditTournamentModal", () => ({
  EditTournamentModal: ({ isOpen, onClose, onSave }: any) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={onClose}>Close Edit</button>
        <button onClick={() => onSave(1, { title: "Updated" })}>
          Save Edit
        </button>
      </div>
    ) : null,
}));

vi.mock("./CreateTournamentModal", () => ({
  CreateTournamentModal: ({ isOpen, onClose, onCreate }: any) =>
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={onClose}>Close Create</button>
        <button onClick={() => onCreate({ title: "New" })}>Save Create</button>
      </div>
    ) : null,
}));

vi.mock("@/config/appConfig", () => ({
  tournamentStatuses: [
    { name: "draft", display_name: "Draft" },
    { name: "registration", display_name: "Registration" },
    { name: "running", display_name: "Running" },
    { name: "finished", display_name: "Finished" },
  ],
}));

// --- ТЕСТОВІ ДАНІ ---

const mockUser = {
  id: 1,
  full_name: "John Organizer",
  email: "john@example.com",
};

const mockTournaments = [
  {
    id: 1,
    title: "Alpha Tournament",
    description: "Alpha Desc",
    creator: { id: 1 },
    status: { name: "draft", display_name: "Draft" },
    reg_start: "2024-01-01T10:00:00Z",
    reg_end: "2024-01-10T10:00:00Z",
    start_date: "2024-01-15T10:00:00Z",
    end_date: "2024-01-20T10:00:00Z",
    max_teams: 16,
  },
  {
    id: 2,
    title: "Beta Championship",
    description: "Beta Desc",
    creator: { id: 1 },
    status: { name: "registration", display_name: "Registration" },
  },
];

const mockUsers = [
  { id: 101, full_name: "Expert One", email: "exp1@test.com" },
  { id: 102, full_name: "Expert Two", email: "exp2@test.com" },
];

describe("OrganizerPanel Component", () => {
  let mockInvalidateQueries: any;
  let mockMutateAsync: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Базовий мок Redux (користувач залогінений)
    vi.spyOn(reactRedux, "useSelector").mockImplementation(() => mockUser);

    mockInvalidateQueries = vi.fn();
    vi.spyOn(reactQuery, "useQueryClient").mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as any);

    mockMutateAsync = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    // Базовий мок React Query (дані завантажені успішно)
    vi.spyOn(reactQuery, "useQuery").mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "tournaments") {
        return { data: mockTournaments, isLoading: false };
      }
      if (queryKey[0] === "users") {
        return { data: mockUsers, isLoading: false };
      }
      return { data: [], isLoading: false };
    });
  });

  // =========================================================================
  // БЛОК 1: Ініціалізація та стан завантаження
  // =========================================================================
  describe("1. Initialization & Loading States", () => {
    it("renders loading profile state when no currentUser is present", () => {
      vi.spyOn(reactRedux, "useSelector").mockReturnValue(null);
      render(<OrganizerPanel />);
      expect(screen.getByText("Завантаження профілю...")).toBeInTheDocument();
    });

    it("renders general loading spinner when useQuery isLoading is true", () => {
      vi.spyOn(reactQuery, "useQuery").mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "tournaments") return { data: [], isLoading: true };
        return { data: [], isLoading: false };
      });
      render(<OrganizerPanel />);
      expect(screen.getByText("Завантаження...")).toBeInTheDocument();
      // Переконуємось, що контент панелі ще не відображається
      expect(screen.queryByText("Управління списком")).not.toBeInTheDocument();
    });

    it("renders welcome message with user role", () => {
      render(<OrganizerPanel />);
      expect(screen.getByText(/👋 Привіт, Організаторе!/i)).toBeInTheDocument();
      expect(screen.getByText("ПАНЕЛЬ ОРГАНІЗАТОРА")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // БЛОК 2: Вкладка "Мої турніри" (Відображення списку)
  // =========================================================================
  describe("2. Tournaments Tab (List & Rendering)", () => {
    it("renders empty state when there are no tournaments", () => {
      vi.spyOn(reactQuery, "useQuery").mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "tournaments") return { data: [], isLoading: false };
        return { data: [], isLoading: false };
      });
      render(<OrganizerPanel />);
      expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
      expect(screen.getByText(/Тут поки що немає турнірів/i)).toBeInTheDocument();
    });

    it("renders table with tournaments", () => {
      render(<OrganizerPanel />);
      expect(screen.getByText("Alpha Tournament")).toBeInTheDocument();
      expect(screen.getByText("Beta Championship")).toBeInTheDocument();
      expect(screen.getByText("Всього: 2")).toBeInTheDocument();
    });

    it("applies correct status color classes based on tournament status", () => {
      render(<OrganizerPanel />);
      
      // Використовуємо tagName === "SPAN", щоб уникнути вибору <option> з селекта
      const draftStatusSpans = screen
        .getAllByText("Draft")
        .filter((el) => el.tagName === "SPAN");
      const regStatusSpans = screen
        .getAllByText("Registration")
        .filter((el) => el.tagName === "SPAN");

      expect(draftStatusSpans[0]).toHaveClass("bg-amber-100");
      expect(regStatusSpans[0]).toHaveClass("bg-blue-100");
    });
  });

  // =========================================================================
  // БЛОК 3: Пошук та Фільтрація
  // =========================================================================
  describe("3. Searching & Filtering", () => {
    it("filters tournaments by search query (title match)", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const searchInput = screen.getByPlaceholderText("Пошук турніру...");
      await user.type(searchInput, "Alpha");

      expect(screen.getByText("Alpha Tournament")).toBeInTheDocument();
      expect(screen.queryByText("Beta Championship")).not.toBeInTheDocument();
      expect(screen.getByText("Всього: 1")).toBeInTheDocument();
    });

    it("filters tournaments by search query (ID match)", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const searchInput = screen.getByPlaceholderText("Пошук турніру...");
      await user.type(searchInput, "2"); // ID другого турніру

      expect(screen.queryByText("Alpha Tournament")).not.toBeInTheDocument();
      expect(screen.getByText("Beta Championship")).toBeInTheDocument();
    });

    it("shows 'not found' message when search yields no results", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const searchInput = screen.getByPlaceholderText("Пошук турніру...");
      await user.type(searchInput, "Unknown Tournament");

      expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
      expect(screen.getByText(/На жаль, турнірів за запитом/i)).toBeInTheDocument();
    });

    it("clears filters when 'Очистити фільтри' is clicked", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const searchInput = screen.getByPlaceholderText("Пошук турніру...");
      await user.type(searchInput, "Unknown");
      
      const clearBtn = screen.getByText("Очистити фільтри");
      await user.click(clearBtn);

      expect(searchInput).toHaveValue("");
      expect(screen.getByText("Alpha Tournament")).toBeInTheDocument();
      expect(screen.getByText("Beta Championship")).toBeInTheDocument();
    });

    it("filters tournaments by status select", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "registration");

      expect(screen.queryByText("Alpha Tournament")).not.toBeInTheDocument();
      expect(screen.getByText("Beta Championship")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // БЛОК 4: Вкладка "Керування журі"
  // =========================================================================
  describe("4. Jury Management Tab", () => {
    it("switches to jury tab and displays list of tournaments as cards", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const juryTabBtn = screen.getByText("⚖️ КЕРУВАННЯ ЖУРІ");
      await user.click(juryTabBtn);

      expect(screen.getByText("Призначення експертів")).toBeInTheDocument();
      // У вкладці журі турніри виводяться не таблицею, а карточками з класом
      const alphaCardTitle = screen.getAllByText("Alpha Tournament")[0];
      expect(alphaCardTitle).toBeInTheDocument();
    });

    it("displays empty state in jury tab if no tournaments exist", async () => {
      vi.spyOn(reactQuery, "useQuery").mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "tournaments") return { data: [], isLoading: false };
        return { data: [], isLoading: false };
      });
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      await user.click(screen.getByText("⚖️ КЕРУВАННЯ ЖУРІ"));

      expect(screen.getByText("Турнірів ще немає")).toBeInTheDocument();
      
      // Перевірка кнопки повернення
      await user.click(screen.getByText("Перейти до турнірів"));
      expect(screen.getByText("Управління списком")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // БЛОК 5: Модальне вікно Інформації (Info Modal)
  // =========================================================================
  describe("5. Info Modal Interactions", () => {
    it("opens info modal with correct data and formats dates properly", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      // Кнопка з SVG іконкою (інфо)
      const infoButtons = screen.getAllByRole("button").filter(b => b.innerHTML.includes("svg"));
      await user.click(infoButtons[0]); // Клікаємо по Alpha Tournament

      expect(screen.getByText("Alpha Desc")).toBeInTheDocument();
      expect(screen.getByText("16")).toBeInTheDocument(); // max_teams
      expect(screen.getByText(/01.01.2024/)).toBeInTheDocument(); // reg_start formatted
    });

    it("handles invalid date strings gracefully", async () => {
      const corruptData = [{ ...mockTournaments[0], reg_start: "invalid-date-string" }];
      vi.spyOn(reactQuery, "useQuery").mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "tournaments") return { data: corruptData, isLoading: false };
        return { data: [], isLoading: false };
      });
      
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      const infoButtons = screen.getAllByRole("button").filter(b => b.innerHTML.includes("svg"));
      await user.click(infoButtons[0]);

      // Має відрендерити "invalid-date-string", а не впасти з помилкою
      expect(screen.getByText(/invalid-date-string/)).toBeInTheDocument();
    });

    it("closes info modal when clicking close button", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const infoButtons = screen.getAllByRole("button").filter(b => b.innerHTML.includes("svg"));
      await user.click(infoButtons[0]);
      
      const closeBtn = screen.getByText("Закрити");
      await user.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText("Alpha Desc")).not.toBeInTheDocument();
      });
    });

    it("closes info modal when clicking backdrop", async () => {
      render(<OrganizerPanel />);
      const infoButtons = screen.getAllByRole("button").filter(b => b.innerHTML.includes("svg"));
      fireEvent.click(infoButtons[0]);

      // Знаходимо backdrop за класом "backdrop-blur-sm"
      const backdrop = document.querySelector(".backdrop-blur-sm");
      expect(backdrop).toBeInTheDocument();
      
      if (backdrop) fireEvent.click(backdrop);

      await waitFor(() => {
        expect(screen.queryByText("Alpha Desc")).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // БЛОК 6: Модальне вікно Журі (Jury Modal)
  // =========================================================================
  describe("6. Jury Modal Interactions", () => {
    it("opens jury modal and lists available users", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      await user.click(screen.getByText("⚖️ КЕРУВАННЯ ЖУРІ"));
      
      // Клік по карточці турніру
      const tournamentCard = screen.getAllByText("Alpha Tournament")[0];
      await user.click(tournamentCard);

      expect(screen.getByText("ДОДАТИ ЖУРІ")).toBeInTheDocument();
      expect(screen.getByText("Expert One")).toBeInTheDocument();
      expect(screen.getByText("Expert Two")).toBeInTheDocument();
    });

    it("toggles jurors on click and updates selected count", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      await user.click(screen.getByText("⚖️ КЕРУВАННЯ ЖУРІ"));
      await user.click(screen.getAllByText("Alpha Tournament")[0]);

      // Спочатку вибрано 0
      expect(screen.getByText("0")).toBeInTheDocument(); // У "Вибрано: 0"

      // Клік по Expert One
      const expertOne = screen.getByText("Expert One");
      await user.click(expertOne);

      // Рахунок оновлюється
      expect(screen.getByText("1")).toBeInTheDocument();
      
      // Клік знову знімає вибір
      await user.click(expertOne);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("closes jury modal on 'Зберегти склад' click", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      await user.click(screen.getByText("⚖️ КЕРУВАННЯ ЖУРІ"));
      await user.click(screen.getAllByText("Alpha Tournament")[0]);
      
      await user.click(screen.getByText("Зберегти склад"));

      await waitFor(() => {
        expect(screen.queryByText("ДОДАТИ ЖУРІ")).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // БЛОК 7: Мутації та CRUD операції (Видалення, Створення, Редагування)
  // =========================================================================
  describe("7. CRUD Operations & Mutations", () => {
    it("calls delete mutation when 'Видалити' is clicked", async () => {
      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const deleteButtons = screen.getAllByText("Видалити");
      await user.click(deleteButtons[0]);

      expect(mockMutateAsync).toHaveBeenCalledWith(1); // ID першого турніру
    });

    it("opens Create modal and handles save", async () => {
      // Перевизначаємо мок для цього тесту, щоб зімітувати успішне виконання і закриття модалки
      vi.spyOn(reactQuery, "useMutation").mockImplementation((options: any) => ({
        mutateAsync: async (variables: any) => {
          mockMutateAsync(variables);
          if (options?.onSuccess) options.onSuccess();
          return Promise.resolve();
        },
      }) as any);

      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      await user.click(screen.getByText("+ Створити турнір"));
      expect(screen.getByTestId("create-modal")).toBeInTheDocument();

      // Клікаємо кнопку збереження в замоканій модалці
      await user.click(screen.getByText("Save Create"));
      
      expect(mockMutateAsync).toHaveBeenCalledWith({ title: "New" });
      
      // Тепер вікно має успішно зникнути без таймаутів
      await waitFor(() => {
        expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
      });
    });

    it("opens Edit modal and handles update", async () => {
      // Перевизначаємо мок для цього тесту
      vi.spyOn(reactQuery, "useMutation").mockImplementation((options: any) => ({
        mutateAsync: async (variables: any) => {
          mockMutateAsync(variables);
          if (options?.onSuccess) options.onSuccess();
          return Promise.resolve();
        },
      }) as any);

      const user = userEvent.setup();
      render(<OrganizerPanel />);
      
      const editButtons = screen.getAllByText("Редагувати");
      await user.click(editButtons[0]); // Edit Alpha

      expect(screen.getByTestId("edit-modal")).toBeInTheDocument();

      // Клікаємо кнопку збереження в замоканій модалці
      await user.click(screen.getByText("Save Edit"));
      
      expect(mockMutateAsync).toHaveBeenCalledWith({ id: 1, data: { title: "Updated" } });
      
      // Чекаємо закриття вікна
      await waitFor(() => {
        expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
      });
    });
  });
});