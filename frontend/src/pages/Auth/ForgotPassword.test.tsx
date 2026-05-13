import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ForgotPassword } from "./ForgotPassword";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";


vi.mock("firebase/auth", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("../../firebase", () => ({
  auth: {},
}));

vi.mock("../../components/ui", () => ({
  Button: ({ children, isLoading, type, ...props }: any) => (
    <button
      data-testid="custom-button"
      type={type || "button"}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  ),
}));


describe("ForgotPassword Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderForgotPassword = () => {
    const user = userEvent.setup();
    const view = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    return { user, ...view };
  };

  
  describe("Initial Render", () => {
    it("matches snapshot", () => {
      const { container } = renderForgotPassword();
      expect(container).toMatchSnapshot();
    });

    it("renders the main heading and description", () => {
      renderForgotPassword();
      expect(screen.getByText("Забули пароль?")).toBeInTheDocument();
      expect(screen.getByText(/Введіть email/i)).toBeInTheDocument();
    });

    it("renders the email input field with correct attributes", () => {
      renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveValue("");
    });

    it("updates email input value when user types", async () => {
      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");

      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("renders the submit button", () => {
      renderForgotPassword();
      const button = screen.getByRole("button", {
        name: "Надіслати посилання",
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "submit");
    });

    it("renders the back to login link", () => {
      renderForgotPassword();
      const backLink = screen.getByText("Повернутися до входу");
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest("a")).toHaveAttribute("href", "/auth");
    });
  });

  
  describe("Form Validation", () => {
    it("shows an error when submitting empty email", async () => {
      const { user } = renderForgotPassword();
      const submitButton = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Некоректний формат email"),
        ).toBeInTheDocument();
      });
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("applies error styling to the input field on validation failure", async () => {
      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      const submitButton = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveClass("border-red-500");
      });
    });

    it("clears validation error when user starts typing a valid email", async () => {
      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      const submitButton = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText("Некоректний формат email"),
        ).toBeInTheDocument();
      });

      await user.type(emailInput, "valid@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Некоректний формат email"),
        ).not.toBeInTheDocument();
      });
    });
  });

  
  describe("Successful Flows", () => {
    it("calls sendPasswordResetEmail and renders success UI", async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);
      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      const submitButton = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.type(emailInput, "user@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          auth,
          "user@example.com",
        );
      });

      expect(await screen.findByText("Лист відправлено!")).toBeInTheDocument();
      expect(screen.getByText(/Перевірте пошту/i)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("name@example.com"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Повернутися до входу" }),
      ).toBeInTheDocument();
    });
  });

  
  describe("Loading States", () => {
    it("disables submit button and shows loading state during submission", async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(sendPasswordResetEmail).mockReturnValue(pendingPromise as any);

      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      const submitBtn = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.type(emailInput, "test@example.com");
      await user.click(submitBtn);

      expect(await screen.findByText("Loading...")).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      resolvePromise!(undefined);

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText("Лист відправлено!"),
        ).toBeInTheDocument();
      });
    });
  });

  
  describe("Firebase Error Handling", () => {
    it("displays error message for auth/user-not-found", async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      const submitButton = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.type(emailInput, "ghost@example.com");
      await user.click(submitButton);

      expect(
        await screen.findByText("Користувача з таким email не знайдено."),
      ).toBeInTheDocument();
    });

    it("displays generic error message for other Firebase errors", async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValue({
        code: "auth/too-many-requests",
      });
      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      const submitButton = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.type(emailInput, "network@example.com");
      await user.click(submitButton);

      expect(
        await screen.findByText("Сталася помилка. Спробуйте ще раз."),
      ).toBeInTheDocument();
    });

    it("clears previous firebase error when submitting again", async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce({
        code: "auth/user-not-found",
      });
      const { user } = renderForgotPassword();
      const emailInput = screen.getByPlaceholderText("name@example.com");
      const submitButton = screen.getByRole("button", {
        name: "Надіслати посилання",
      });

      await user.type(emailInput, "fail@example.com");
      await user.click(submitButton);

      expect(
        await screen.findByText("Користувача з таким email не знайдено."),
      ).toBeInTheDocument();

      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(sendPasswordResetEmail).mockReturnValueOnce(
        pendingPromise as any,
      );

      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Користувача з таким email не знайдено."),
        ).not.toBeInTheDocument();
      });

      resolvePromise!(undefined);
    });
  });
});
