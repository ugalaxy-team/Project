import { render, screen, fireEvent } from "@testing-library/react";
import { useSelector } from "react-redux";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Profile } from "./Profile";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../../firebase";
import { store } from "../../store";
import { deleteUser } from "@/api/requests";
import { setUser } from "@/slices/user";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("../../firebase", () => ({
  auth: {
    currentUser: { uid: "123" },
    updateCurrentUser: vi.fn(),
  },
}));

vi.mock("../../store", () => ({
  store: {
    dispatch: vi.fn(),
  },
}));

vi.mock("@/api/requests", () => ({
  deleteUser: vi.fn(),
}));

vi.mock("@/slices/user", () => ({
  setUser: vi.fn(),
}));

vi.mock("./EditProfileModal", () => ({
  EditProfileModal: ({ isOpen, onClose, currentUser }: { isOpen: boolean; onClose: () => void, currentUser: any }) =>
    isOpen ? (
      <div data-testid="edit-profile-modal">
        <span data-testid="modal-current-user">{currentUser?.email}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const mockUserFull = {
  id: "user-1",
  displayName: "Super Hacker",
  full_name: "John Doe",
  email: "hacker777@example.com",
  telegram: "@hacker777",
  github: "hacker777",
  discord: "hacker#7777",
  roles: [{ display_name: "Admin", name: "admin" }, { name: "manager" }],
};

const mockUserFallbackName = {
  id: "user-2",
  full_name: "Fallback Name",
  email: "fallback@example.com",
  roles: [],
};

const mockUserPartial = {
  id: "user-3",
  displayName: "Tester",
  email: "tester@example.com",
};

const mockUserEmpty = {
  id: "user-4",
  email: "empty@example.com",
};

describe("Profile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    window.confirm = vi.fn(() => true);
    auth.currentUser = { uid: "123" } as any;
  });

  it("displays loading state when user is null", () => {
    vi.mocked(useSelector).mockReturnValue(null);
    render(<Profile />);
    expect(screen.getByText("Завантаження...")).toBeInTheDocument();
  });

  it("renders the SVG avatar icon", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("displays user displayName preferentially over full_name", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    expect(screen.getByText("Super Hacker")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("displays fallback full_name when displayName is missing", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFallbackName);
    render(<Profile />);
    expect(screen.getByText("Fallback Name")).toBeInTheDocument();
  });

  it("displays 'Без імені' when both displayName and full_name are missing", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserEmpty);
    render(<Profile />);
    expect(screen.getByText("Без імені")).toBeInTheDocument();
  });

  it("displays roles using display_name if available, otherwise name", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    expect(screen.getByText("Роль: Admin, manager")).toBeInTheDocument();
  });

  it("displays 'Немає ролей' when roles array is empty", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFallbackName);
    render(<Profile />);
    expect(screen.getByText("Роль: Немає ролей")).toBeInTheDocument();
  });

  it("displays 'Немає ролей' when roles is undefined", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserEmpty);
    render(<Profile />);
    expect(screen.getByText("Роль: Немає ролей")).toBeInTheDocument();
  });

  it("opens edit modal on edit button click and closes on close button click", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    expect(screen.queryByTestId("edit-profile-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Редагувати профіль"));
    expect(screen.getByTestId("edit-profile-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("edit-profile-modal")).not.toBeInTheDocument();
  });

  it("passes correct currentUser data to EditProfileModal", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    fireEvent.click(screen.getByText("Редагувати профіль"));
    expect(screen.getByTestId("modal-current-user")).toHaveTextContent("hacker777@example.com");
  });

  it("calls window.confirm with correct text before deleting", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    fireEvent.click(screen.getByText("Видалити"));
    expect(window.confirm).toHaveBeenCalledWith("Ви впевнені?");
  });

  it("calls delete mutation on delete button click if confirmed", () => {
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isPending: false } as any);
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    fireEvent.click(screen.getByText("Видалити"));
    expect(mockMutate).toHaveBeenCalled();
  });

  it("does not call mutate if user cancels confirm dialog", () => {
    window.confirm = vi.fn(() => false);
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isPending: false } as any);
    vi.mocked(useSelector).mockReturnValue(mockUserFull);

    render(<Profile />);
    fireEvent.click(screen.getByText("Видалити"));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows loading state on delete button during mutation and disables it", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<Profile />);
    const deleteButton = screen.getByText("Видалення...");
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it("initializes useMutation with correct mutationKey", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
      mutationKey: ["delete user"]
    }));
  });

  it("executes mutationFn with current user", async () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    let mutationConfig: any;
    vi.mocked(useMutation).mockImplementation((config: any) => {
      mutationConfig = config;
      return { mutate: vi.fn(), isPending: false } as any;
    });

    render(<Profile />);
    await mutationConfig.mutationFn();

    expect(deleteUser).toHaveBeenCalledWith(auth.currentUser);
  });

  it("throws error in mutationFn when currentUser is null", async () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    auth.currentUser = null;

    let mutationConfig: any;
    vi.mocked(useMutation).mockImplementation((config: any) => {
      mutationConfig = config;
      return { mutate: vi.fn(), isPending: false } as any;
    });

    render(<Profile />);
    await expect(mutationConfig.mutationFn()).rejects.toThrow("Користувач не авторизований");
  });

  it("handles mutation onSuccess by clearing user data from auth and redux", async () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    let mutationConfig: any;
    vi.mocked(useMutation).mockImplementation((config: any) => {
      mutationConfig = config;
      return { mutate: vi.fn(), isPending: false } as any;
    });

    render(<Profile />);
    await mutationConfig.onSuccess();

    expect(auth.updateCurrentUser).toHaveBeenCalledWith(null);
    expect(store.dispatch).toHaveBeenCalledWith(setUser(null));
  });

  it("handles mutation onError by logging the error", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    let mutationConfig: any;
    vi.mocked(useMutation).mockImplementation((config: any) => {
      mutationConfig = config;
      return { mutate: vi.fn(), isPending: false } as any;
    });

    render(<Profile />);
    const testError = new Error("Test error message");
    mutationConfig.onError(testError);

    expect(consoleSpy).toHaveBeenCalledWith("An error occurred:", "Test error message");
    consoleSpy.mockRestore();
  });

  it("displays correct contact details when available", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    expect(screen.getByText("hacker777@example.com")).toBeInTheDocument();
    expect(screen.getByText("@hacker777")).toBeInTheDocument();
    expect(screen.getByText("hacker777")).toBeInTheDocument();
    expect(screen.getByText("hacker#7777")).toBeInTheDocument();
  });

  it("displays missing state 'Відсутній' for all missing contact details", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserEmpty);
    render(<Profile />);
    const missingBadges = screen.getAllByText("Відсутній");
    expect(missingBadges).toHaveLength(3);
  });

  it("applies specific colors for Telegram chip", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    const telegramValue = screen.getByText("@hacker777");
    const chipWrapper = telegramValue.closest("div");
    
    expect(chipWrapper).toHaveClass("bg-[#eff6ff]");
    expect(chipWrapper).toHaveClass("text-[#2563eb]");
  });

  it("applies specific colors for Discord chip", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    const discordValue = screen.getByText("hacker#7777");
    const chipWrapper = discordValue.closest("div");
    
    expect(chipWrapper).toHaveClass("bg-[#f5f3ff]");
    expect(chipWrapper).toHaveClass("text-[#7c3aed]");
  });

  it("applies default colors for Email chip", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    
    const emailValue = screen.getByText("hacker777@example.com");
    const chipWrapper = emailValue.closest("div");
    
    expect(chipWrapper).toHaveClass("bg-[#f3f4f6]");
    expect(chipWrapper).toHaveClass("text-[#111827]");
  });

  it("displays tournament lists correctly with dot color", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    expect(screen.getByText("Турніри")).toBeInTheDocument();
    expect(screen.getByText("Напишіть Ядро Лінукс")).toBeInTheDocument();
    expect(screen.getByText("Напишіть свою мову програмування")).toBeInTheDocument();
    expect(screen.getByText("Напишіть гру на JS")).toBeInTheDocument();

    const listArrows = screen.getAllByText("❯");
    expect(listArrows).toHaveLength(3);
  });
});