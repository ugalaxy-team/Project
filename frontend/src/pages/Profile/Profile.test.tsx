import { render, screen, fireEvent } from "@testing-library/react";
import { useSelector } from "react-redux";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Profile } from "./Profile";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../../firebase";
import { store } from "../../store";
import { deleteUser } from "@/api/requests";
import { setUser } from "@/slices/user";

// Магія: мокаємо переклади, щоб вони просто повертали свої ключі
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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
  EditProfileModal: ({
    isOpen,
    onClose,
    currentUser,
  }: {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
  }) =>
    isOpen ? (
      <div data-testid="edit-profile-modal">
        <span data-testid="modal-current-user">{currentUser?.email}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Оновлені мок-дані: додали масив турнірів!
const mockUserFull = {
  id: "user-1",
  displayName: "Super Hacker",
  full_name: "John Doe",
  email: "hacker777@example.com",
  telegram: "@hacker777",
  github: "hacker777",
  discord: "hacker#7777",
  roles: [{ display_name: "Admin", name: "admin" }, { name: "manager" }],
  created_tournaments: [
    { id: 1, title: "Напишіть Ядро Лінукс" },
    { id: 2, name: "Напишіть свою мову програмування" },
    { id: 3, title: "Напишіть гру на JS" },
  ],
};

const mockUserFallbackName = {
  id: "user-2",
  full_name: "Fallback Name",
  email: "fallback@example.com",
  roles: [],
  created_tournaments: [],
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
    expect(screen.getByText("loading")).toBeInTheDocument();
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

  it("displays 'unnamed' key when both displayName and full_name are missing", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserEmpty);
    render(<Profile />);
    expect(screen.getByText("unnamed")).toBeInTheDocument();
  });

  it("displays roles using display_name if available, otherwise name", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    expect(screen.getByText("role: Admin, manager")).toBeInTheDocument();
  });

  it("displays 'no_roles' when roles array is empty", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFallbackName);
    render(<Profile />);
    expect(screen.getByText("role: no_roles")).toBeInTheDocument();
  });

  it("opens edit modal on edit button click and closes on close button click", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    expect(screen.queryByTestId("edit-profile-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("edit_profile"));
    expect(screen.getByTestId("edit-profile-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("edit-profile-modal")).not.toBeInTheDocument();
  });

  it("passes correct currentUser data to EditProfileModal", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    fireEvent.click(screen.getByText("edit_profile"));
    expect(screen.getByTestId("modal-current-user")).toHaveTextContent(
      "hacker777@example.com",
    );
  });

  it("calls window.confirm with correct text before deleting", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);
    fireEvent.click(screen.getByText("delete_account"));
    expect(window.confirm).toHaveBeenCalledWith("confirm_delete");
  });

  it("calls delete mutation on delete button click if confirmed", () => {
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    fireEvent.click(screen.getByText("delete_account"));
    expect(mockMutate).toHaveBeenCalled();
  });

  it("does not call mutate if user cancels confirm dialog", () => {
    window.confirm = vi.fn(() => false);
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
    vi.mocked(useSelector).mockReturnValue(mockUserFull);

    render(<Profile />);
    fireEvent.click(screen.getByText("delete_account"));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("disables delete button during mutation", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<Profile />);
    // Шукаємо кнопку за текстом ключа
    const deleteButton = screen.getByText("delete_account").closest("button");
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
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
    await expect(mutationConfig.mutationFn()).rejects.toThrow(
      "errors.not_authorized",
    );
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

  it("displays missing state 'missing' for all missing contact details", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserEmpty);
    render(<Profile />);
    const missingBadges = screen.getAllByText("missing");
    expect(missingBadges).toHaveLength(3); // Telegram, GitHub, Discord
  });

  it("applies specific colors for Telegram chip", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    const telegramValue = screen.getByText("@hacker777");
    const chipWrapper = telegramValue.closest("div");

    expect(chipWrapper).toHaveClass("bg-blue-500/10");
    expect(chipWrapper).toHaveClass("text-blue-600");
  });

  it("applies specific colors for Discord chip", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    const discordValue = screen.getByText("hacker#7777");
    const chipWrapper = discordValue.closest("div");

    expect(chipWrapper).toHaveClass("bg-purple-500/10");
    expect(chipWrapper).toHaveClass("text-purple-600");
  });

  it("displays tournament lists correctly from API data", () => {
    vi.mocked(useSelector).mockReturnValue(mockUserFull);
    render(<Profile />);

    expect(screen.getByText("tournaments")).toBeInTheDocument();
    expect(screen.getByText("Напишіть Ядро Лінукс")).toBeInTheDocument();
    expect(
      screen.getByText("Напишіть свою мову програмування"),
    ).toBeInTheDocument();
    expect(screen.getByText("Напишіть гру на JS")).toBeInTheDocument();
  });
});
