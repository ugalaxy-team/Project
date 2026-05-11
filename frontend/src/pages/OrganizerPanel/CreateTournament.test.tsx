import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTournamentModal } from "./CreateTournamentModal";

describe("CreateTournamentModal", () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = () => {
    const user = userEvent.setup();
    const view = render(
      <CreateTournamentModal
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />,
    );
    return { user, ...view };
  };

  const getForm = () =>
    document.getElementById("create-tournament-form") as HTMLFormElement;
  const getBackdrop = () =>
    document.querySelector(".bg-slate-900\\/40") as HTMLDivElement;

  // --- Rendering (Small) ---

  describe("Rendering", () => {
    it("does not render anything when isOpen is false", () => {
      const { container } = render(
        <CreateTournamentModal
          isOpen={false}
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders the modal dialog when isOpen is true", () => {
      renderModal();
      expect(screen.getByText("НОВИЙ ТУРНІР")).toBeInTheDocument();
      expect(
        screen.getByText("СТВОРЕННЯ НОВОЇ ПОДІЇ У ВСЕСВІТІ"),
      ).toBeInTheDocument();
    });

    it("renders all form text inputs", () => {
      renderModal();
      expect(
        screen.getByPlaceholderText("Введіть круту назву..."),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Про що цей турнір?"),
      ).toBeInTheDocument();
      expect(
        document.querySelector('input[name="max_teams"]'),
      ).toBeInTheDocument();
    });

    it("renders all datetime inputs", () => {
      renderModal();
      expect(
        document.querySelector('input[name="reg_start"]'),
      ).toBeInTheDocument();
      expect(
        document.querySelector('input[name="reg_end"]'),
      ).toBeInTheDocument();
      expect(
        document.querySelector('input[name="start_date"]'),
      ).toBeInTheDocument();
    });

    it("renders control buttons with correct initial text", () => {
      renderModal();
      expect(screen.getByText("СКАСУВАТИ")).toBeInTheDocument();
      expect(screen.getByText("СТВОРИТИ ТУРНІР")).toBeInTheDocument();
      expect(screen.getByText("✕")).toBeInTheDocument();
    });
  });

  // --- Input Handling (Small) ---

  describe("Input Handling", () => {
    it("updates title input value correctly", async () => {
      const { user } = renderModal();
      const titleInput = screen.getByPlaceholderText("Введіть круту назву...");

      await user.type(titleInput, "Super Cup");
      expect(titleInput).toHaveValue("Super Cup");
    });

    it("updates description input value correctly", async () => {
      const { user } = renderModal();
      const descInput = screen.getByPlaceholderText("Про що цей турнір?");

      await user.type(descInput, "Test description");
      expect(descInput).toHaveValue("Test description");
    });

    it("updates datetime inputs correctly via fireEvent", () => {
      renderModal();
      const regStartInput = document.querySelector(
        'input[name="reg_start"]',
      ) as HTMLInputElement;

      fireEvent.change(regStartInput, {
        target: { name: "reg_start", value: "2026-06-01T12:00" },
      });
      expect(regStartInput.value).toBe("2026-06-01T12:00");
    });

    it("parses max_teams as a number", async () => {
      const { user } = renderModal();
      const maxTeamsInput = document.querySelector(
        'input[name="max_teams"]',
      ) as HTMLInputElement;

      await user.clear(maxTeamsInput);
      await user.type(maxTeamsInput, "32");
      expect(maxTeamsInput.value).toBe("32");
    });
  });

  // --- Closing Mechanisms (Small) ---

  describe("Closing Mechanisms", () => {
    it("triggers onClose when clicking the top right close icon", async () => {
      const { user } = renderModal();
      await user.click(screen.getByText("✕"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("triggers onClose when clicking the cancel button", async () => {
      const { user } = renderModal();
      await user.click(screen.getByText("СКАСУВАТИ"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("triggers onClose when clicking the backdrop", async () => {
      renderModal();
      fireEvent.click(getBackdrop());
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // --- Form Submission (Large) ---

  describe("Form Submission", () => {
    const fillValidForm = async (user: any) => {
      const titleInput = screen.getByPlaceholderText("Введіть круту назву...");
      const descInput = screen.getByPlaceholderText("Про що цей турнір?");
      const maxTeamsInput = document.querySelector(
        'input[name="max_teams"]',
      ) as HTMLInputElement;
      const regStartInput = document.querySelector(
        'input[name="reg_start"]',
      ) as HTMLInputElement;
      const regEndInput = document.querySelector(
        'input[name="reg_end"]',
      ) as HTMLInputElement;
      const startDateInput = document.querySelector(
        'input[name="start_date"]',
      ) as HTMLInputElement;

      await user.type(titleInput, "Valid Tournament");
      await user.type(descInput, "Valid Description");
      await user.clear(maxTeamsInput);
      await user.type(maxTeamsInput, "16");

      fireEvent.change(regStartInput, {
        target: { name: "reg_start", value: "2026-05-01T10:00" },
      });
      fireEvent.change(regEndInput, {
        target: { name: "reg_end", value: "2026-05-15T10:00" },
      });
      fireEvent.change(startDateInput, {
        target: { name: "start_date", value: "2026-05-20T10:00" },
      });
    };

    it("submits the form successfully with correct data formatting", async () => {
      const { user } = renderModal();
      await fillValidForm(user);

      fireEvent.submit(getForm());

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledTimes(1);
      });

      expect(mockOnCreate).toHaveBeenCalledWith({
        title: "Valid Tournament",
        description: "Valid Description",
        reg_start: new Date("2026-05-01T10:00").toISOString(),
        reg_end: new Date("2026-05-15T10:00").toISOString(),
        start_date: new Date("2026-05-20T10:00").toISOString(),
        max_teams: 16,
      });
    });

    it("trims whitespace from title and description before submitting", async () => {
      const { user } = renderModal();

      const titleInput = screen.getByPlaceholderText("Введіть круту назву...");
      const descInput = screen.getByPlaceholderText("Про що цей турнір?");
      await user.type(titleInput, "   Spaced Title   ");
      await user.type(descInput, "   Spaced Desc   ");

      const regStartInput = document.querySelector(
        'input[name="reg_start"]',
      ) as HTMLInputElement;
      const regEndInput = document.querySelector(
        'input[name="reg_end"]',
      ) as HTMLInputElement;
      const startDateInput = document.querySelector(
        'input[name="start_date"]',
      ) as HTMLInputElement;

      fireEvent.change(regStartInput, {
        target: { name: "reg_start", value: "2026-05-01T10:00" },
      });
      fireEvent.change(regEndInput, {
        target: { name: "reg_end", value: "2026-05-15T10:00" },
      });
      fireEvent.change(startDateInput, {
        target: { name: "start_date", value: "2026-05-20T10:00" },
      });

      fireEvent.submit(getForm());

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Spaced Title",
            description: "Spaced Desc",
          }),
        );
      });
    });

    it("calls onClose after a successful submission", async () => {
      const { user } = renderModal();
      await fillValidForm(user);

      fireEvent.submit(getForm());

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it("resets form state after a successful submission", async () => {
      const { user, rerender } = renderModal();
      await fillValidForm(user);

      fireEvent.submit(getForm());

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });

      rerender(
        <CreateTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />,
      );

      const titleInput = screen.getByPlaceholderText("Введіть круту назву...");
      expect(titleInput).toHaveValue("");
    });
  });

  // --- Loading and Error States (Large) ---

  describe("Loading and Error States", () => {
    it("disables inputs and buttons while submission is in progress", async () => {
      let resolvePromise: any;
      mockOnCreate.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      renderModal();

      const regStartInput = document.querySelector(
        'input[name="reg_start"]',
      ) as HTMLInputElement;
      const regEndInput = document.querySelector(
        'input[name="reg_end"]',
      ) as HTMLInputElement;
      const startDateInput = document.querySelector(
        'input[name="start_date"]',
      ) as HTMLInputElement;

      fireEvent.change(regStartInput, {
        target: { name: "reg_start", value: "2026-05-01T10:00" },
      });
      fireEvent.change(regEndInput, {
        target: { name: "reg_end", value: "2026-05-15T10:00" },
      });
      fireEvent.change(startDateInput, {
        target: { name: "start_date", value: "2026-05-20T10:00" },
      });

      fireEvent.submit(getForm());

      expect(screen.getByText("СТВОРЕННЯ...")).toBeInTheDocument();

      const submitBtn = screen.getByText("СТВОРЕННЯ...") as HTMLButtonElement;
      const cancelBtn = screen.getByText("СКАСУВАТИ") as HTMLButtonElement;

      expect(submitBtn).toBeDisabled();
      expect(cancelBtn).toBeDisabled();

      resolvePromise();

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it("logs error to console and stops loading if onCreate throws", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockOnCreate.mockRejectedValue(new Error("Network Error"));

      renderModal();

      const regStartInput = document.querySelector(
        'input[name="reg_start"]',
      ) as HTMLInputElement;
      const regEndInput = document.querySelector(
        'input[name="reg_end"]',
      ) as HTMLInputElement;
      const startDateInput = document.querySelector(
        'input[name="start_date"]',
      ) as HTMLInputElement;

      fireEvent.change(regStartInput, {
        target: { name: "reg_start", value: "2026-05-01T10:00" },
      });
      fireEvent.change(regEndInput, {
        target: { name: "reg_end", value: "2026-05-15T10:00" },
      });
      fireEvent.change(startDateInput, {
        target: { name: "start_date", value: "2026-05-20T10:00" },
      });

      fireEvent.submit(getForm());

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Помилка при створенні турніру:",
          expect.any(Error),
        );
      });

      expect(screen.getByText("СТВОРИТИ ТУРНІР")).toBeInTheDocument();
      const submitBtn = screen.getByText(
        "СТВОРИТИ ТУРНІР",
      ) as HTMLButtonElement;
      expect(submitBtn).not.toBeDisabled();

      expect(mockOnClose).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
