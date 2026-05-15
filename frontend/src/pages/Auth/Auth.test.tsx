import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthPage } from "./AuthPage";
import SignOut from "./SignOut";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { syncUser } from "../../firebase";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock("../../firebase", () => ({
  auth: {},
  google: {},
  syncUser: vi.fn(),
}));

vi.mock("@lottiefiles/react-lottie-player", () => ({
  Player: () => <div data-testid="lottie-player">Lottie Animation</div>,
}));

vi.mock("lucide-react", () => ({
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
}));

vi.mock("../../components/ui", () => ({
  Button: ({ children, isLoading, leftIcon, ...props }: any) => (
    <button data-testid="custom-button" disabled={isLoading} {...props}>
      {isLoading ? "Loading..." : children}
      {leftIcon && <span data-testid="left-icon">Icon</span>}
    </button>
  ),
}));

describe("AuthPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuthPage = () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );
    return { user };
  };

  it("matches snapshot", () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  describe("UI Elements Rendering", () => {
    it("renders the login form by default with correct texts", () => {
      renderAuthPage();
      expect(screen.getByText("З поверненням!")).toBeInTheDocument();
      expect(
        screen.getByText("Продовжуйте свій шлях в UGalaxy"),
      ).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Пароль")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("name@example.com"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Увійти" }),
      ).toBeInTheDocument();
    });

    it("renders Lottie animation and static decorative text content", () => {
      renderAuthPage();
      expect(screen.getByTestId("lottie-player")).toBeInTheDocument();
      expect(
        screen.getByText(/Твоя історія починається тут/i),
      ).toBeInTheDocument();
      expect(screen.getByText("UGalaxy")).toBeInTheDocument();
      expect(screen.getByText("Star for Life")).toBeInTheDocument();
    });

    it("renders the Google sign-in button and its icon", () => {
      renderAuthPage();
      expect(
        screen.getByRole("button", { name: /Вхід через Google/i }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders Terms and Privacy Policy links", () => {
      renderAuthPage();
      expect(screen.getByText("Умовами використання")).toBeInTheDocument();
      expect(
        screen.getByText("Політикою конфіденційності"),
      ).toBeInTheDocument();
    });

    it("renders inputs with correct HTML types in default state", () => {
      renderAuthPage();
      expect(screen.getByPlaceholderText("name@example.com")).toHaveAttribute(
        "type",
        "email",
      );
      expect(screen.getByPlaceholderText("Мінімум 8 символів")).toHaveAttribute(
        "type",
        "password",
      );
    });
  });

  describe("Auth Mode Switching", () => {
    it("switches to Register mode and updates headings and buttons", async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole("button", { name: "Реєстрація" }));

      expect(await screen.findByText("Створити акаунт")).toBeInTheDocument();
      expect(
        screen.getByText("Готовий до нових челенджів?"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Зареєструватись" }),
      ).toBeInTheDocument();
    });

    it("shows Display Name input only in Register mode", async () => {
      const { user } = renderAuthPage();
      expect(
        screen.queryByPlaceholderText("Наприклад, izachoc"),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      expect(
        await screen.findByPlaceholderText("Наприклад, izachoc"),
      ).toBeInTheDocument();
    });

    it("hides Display Name input when switching back to Login mode", async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      await screen.findByPlaceholderText("Наприклад, izachoc");

      await user.click(screen.getByRole("button", { name: "Вхід" }));
      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText("Наприклад, izachoc"),
        ).not.toBeInTheDocument();
      });
    });

    it('displays "Forgot Password?" link exclusively in Login mode', async () => {
      const { user } = renderAuthPage();
      const forgotLink = screen.getByText("Забули пароль?");
      expect(forgotLink).toHaveClass("opacity-100");

      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      expect(forgotLink).toHaveClass("opacity-0 pointer-events-none");
    });

    it("clears firebase error when toggling modes", async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
        code: "auth/wrong-password",
      });
      const { user } = renderAuthPage();

      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "test@test.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      expect(
        await screen.findByText("Невірний email або пароль."),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      expect(
        screen.queryByText("Невірний email або пароль."),
      ).not.toBeInTheDocument();
    });
  });

  describe("Password Input Interaction", () => {
    it("toggles password visibility and icons on click", async () => {
      const { user } = renderAuthPage();
      const passwordInput = screen.getByPlaceholderText("Мінімум 8 символів");

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(screen.getByTestId("eye-icon")).toBeInTheDocument();

      await user.click(screen.getByTestId("eye-icon"));
      expect(passwordInput).toHaveAttribute("type", "text");
      expect(screen.getByTestId("eye-off-icon")).toBeInTheDocument();

      await user.click(screen.getByTestId("eye-off-icon"));
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("retains typed password value when toggling visibility", async () => {
      const { user } = renderAuthPage();
      const passwordInput = screen.getByPlaceholderText("Мінімум 8 символів");

      await user.type(passwordInput, "secret123");
      await user.click(screen.getByTestId("eye-icon"));

      expect(passwordInput).toHaveValue("secret123");
    });

    it("updates input border color to red for invalid password length", async () => {
      const { user } = renderAuthPage();
      const passwordInput = screen.getByPlaceholderText("Мінімум 8 символів");

      await user.type(passwordInput, "123");
      await waitFor(() => {
        expect(passwordInput).toHaveClass("border-red-500");
      });
    });

    it("updates input border color to indigo for valid password length", async () => {
      const { user } = renderAuthPage();
      const passwordInput = screen.getByPlaceholderText("Мінімум 8 символів");

      await user.type(passwordInput, "12345678");
      await waitFor(() => {
        expect(passwordInput).toHaveClass("border-indigo-500");
      });
    });
  });

  describe("Form Validation (Zod & React Hook Form)", () => {
    it("prevents submission and shows errors for empty fields in login mode", async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      expect(
        await screen.findByText("Некоректний формат email"),
      ).toBeInTheDocument();
      expect(await screen.findByText("Мінімум 8 символів")).toBeInTheDocument();
      expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("prevents submission and shows ALL errors for empty fields in register mode", async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      await user.click(screen.getByRole("button", { name: "Зареєструватись" }));

      expect(
        await screen.findByText("Нікнейм обов'язковий (мінімум 2 символи)"),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Некоректний формат email"),
      ).toBeInTheDocument();
      expect(await screen.findByText("Мінімум 8 символів")).toBeInTheDocument();
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("shows error if Display Name is exactly 1 character", async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole("button", { name: "Реєстрація" }));

      await user.type(screen.getByPlaceholderText("Наприклад, izachoc"), "A");
      await user.click(screen.getByRole("button", { name: "Зареєструватись" }));

      expect(
        await screen.findByText("Нікнейм обов'язковий (мінімум 2 символи)"),
      ).toBeInTheDocument();
    });

    it("removes Display Name error when valid input is provided", async () => {
      const { user } = renderAuthPage();
      await user.click(screen.getByRole("button", { name: "Реєстрація" }));

      await user.type(screen.getByPlaceholderText("Наприклад, izachoc"), "A");
      await user.click(screen.getByRole("button", { name: "Зареєструватись" }));
      expect(
        await screen.findByText("Нікнейм обов'язковий (мінімум 2 символи)"),
      ).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText("Наприклад, izachoc"), "lex");
      await user.click(screen.getByRole("button", { name: "Зареєструватись" }));
      await waitFor(() => {
        expect(
          screen.queryByText("Нікнейм обов'язковий (мінімум 2 символи)"),
        ).not.toBeInTheDocument();
      });
    });

    it("shows error for exactly 7 characters in password", async () => {
      const { user } = renderAuthPage();
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "1234567",
      );
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      expect(await screen.findByText("Мінімум 8 символів")).toBeInTheDocument();
    });

    it("accepts exactly 8 characters in password without errors", async () => {
      const { user } = renderAuthPage();
      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "test@test.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      await waitFor(() => {
        expect(
          screen.queryByText("Мінімум 8 символів"),
        ).not.toBeInTheDocument();
      });
    });

    it("ignores displayName validation when in login mode", async () => {
      const { user } = renderAuthPage();
      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "test@test.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );

      await user.click(screen.getByRole("button", { name: "Увійти" }));
      await waitFor(() => {
        expect(
          screen.queryByText("Нікнейм обов'язковий"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Successful Auth Flows", () => {
    it("successfully registers a user, updates profile, and redirects", async () => {
      const mockUser = { uid: "user-777" };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);

      const { user } = renderAuthPage();
      await user.click(screen.getByRole("button", { name: "Реєстрація" }));

      await user.type(
        screen.getByPlaceholderText("Наприклад, izachoc"),
        "SuperDev",
      );
      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "super@test.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "strongPass1",
      );
      await user.click(screen.getByRole("button", { name: "Зареєструватись" }));

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          "super@test.com",
          "strongPass1",
        );
        expect(updateProfile).toHaveBeenCalledWith(mockUser, {
          displayName: "SuperDev",
        });
        expect(syncUser).toHaveBeenCalledWith(mockUser);
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("successfully logs in an existing user and redirects", async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as any);
      const { user } = renderAuthPage();

      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "old@user.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "myPassword8",
      );
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          "old@user.com",
          "myPassword8",
        );
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Loading States", () => {
    it("disables submit button and shows loading state during login", async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(signInWithEmailAndPassword).mockReturnValue(
        pendingPromise as any,
      );

      const { user } = renderAuthPage();

      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "test@test.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );

      const submitBtn = screen.getByRole("button", { name: "Увійти" });
      await user.click(submitBtn);

      expect(await screen.findByText("Loading...")).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      resolvePromise!({});
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });
    });

    it("disables submit button and shows loading state during registration", async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(createUserWithEmailAndPassword).mockReturnValue(
        pendingPromise as any,
      );

      const { user } = renderAuthPage();

      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      await user.type(
        screen.getByPlaceholderText("Наприклад, izachoc"),
        "DevUser",
      );
      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "test@test.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );

      const submitBtn = screen.getByRole("button", { name: "Зареєструватись" });
      await user.click(submitBtn);

      expect(await screen.findByText("Loading...")).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      resolvePromise!({});
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });
    });
  });

  describe("Firebase Error Handling", () => {
    it('displays error message for "auth/email-already-in-use"', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
        code: "auth/email-already-in-use",
      });
      const { user } = renderAuthPage();

      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      await user.type(screen.getByPlaceholderText("Наприклад, izachoc"), "Dev");
      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "exist@test.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );
      await user.click(screen.getByRole("button", { name: "Зареєструватись" }));

      expect(
        await screen.findByText("Цей email вже використовується."),
      ).toBeInTheDocument();
    });

    it('displays error message for "auth/wrong-password" during login', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
        code: "auth/wrong-password",
      });
      const { user } = renderAuthPage();

      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "a@a.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      expect(
        await screen.findByText("Невірний email або пароль."),
      ).toBeInTheDocument();
    });

    it('displays error message for "auth/invalid-credential" during login', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
        code: "auth/invalid-credential",
      });
      const { user } = renderAuthPage();

      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "a@a.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      expect(
        await screen.findByText("Невірний email або пароль."),
      ).toBeInTheDocument();
    });

    it("displays generic error for unknown firebase codes", async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
        code: "auth/too-many-requests",
      });
      const { user } = renderAuthPage();

      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "a@a.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );
      await user.click(screen.getByRole("button", { name: "Увійти" }));

      expect(
        await screen.findByText("Сталася помилка. Спробуйте ще раз."),
      ).toBeInTheDocument();
    });

    it("handles unexpected errors gracefully during registration profile update", async () => {
      const mockUser = { uid: "user-error" };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);
      vi.mocked(updateProfile).mockRejectedValue(
        new Error("Profile update failed"),
      );

      const { user } = renderAuthPage();

      await user.click(screen.getByRole("button", { name: "Реєстрація" }));
      await user.type(screen.getByPlaceholderText("Наприклад, izachoc"), "Dev");
      await user.type(
        screen.getByPlaceholderText("name@example.com"),
        "a@a.com",
      );
      await user.type(
        screen.getByPlaceholderText("Мінімум 8 символів"),
        "12345678",
      );
      await user.click(screen.getByRole("button", { name: "Зареєструватись" }));

      expect(
        await screen.findByText("Сталася помилка. Спробуйте ще раз."),
      ).toBeInTheDocument();
    });
  });

  describe("Google Authentication", () => {
    it("successfully authenticates via Google popup and redirects", async () => {
      vi.mocked(signInWithPopup).mockResolvedValue({} as any);
      const { user } = renderAuthPage();

      await user.click(
        screen.getByRole("button", { name: /Вхід через Google/i }),
      );

      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("catches Google Sign-In exceptions without crashing", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(signInWithPopup).mockRejectedValue(new Error("Popup closed"));

      const { user } = renderAuthPage();
      await user.click(
        screen.getByRole("button", { name: /Вхід через Google/i }),
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Google Sign-In Error:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });
});

describe("SignOut Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSignOut = () =>
    render(
      <MemoryRouter>
        <SignOut />
      </MemoryRouter>,
    );

  it("calls signOut and redirects to home on successful logout", async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    renderSignOut();

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});
