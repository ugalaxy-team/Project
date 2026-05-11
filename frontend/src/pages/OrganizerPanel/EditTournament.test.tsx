import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditTournamentModal } from "./EditTournamentModal";

describe("EditTournamentModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const mockTournament = {
    id: 123,
    title: "Initial Tournament Title",
    description: "Initial Description",
    start_date: "2026-06-01T10:00:00.000Z",
    end_date: "2026-06-05T18:00:00.000Z",
    reg_start: "2026-05-01T09:00:00.000Z",
    reg_end: "2026-05-20T23:59:00.000Z",
    max_teams: 16,
  };

  const emptyTournament = {
    id: 999,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering & Initialization ---

  describe("Rendering & Initialization", () => {
    it("returns null and does not render when isOpen is false", () => {
      const { container } = render(
        <EditTournamentModal
          isOpen={false}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders the modal and displays the tournament ID when isOpen is true", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );
      expect(screen.getByText("РЕДАГУВАТИ")).toBeInTheDocument();
      expect(screen.getByText("ТУРНІР #123")).toBeInTheDocument();
    });

    it("populates the form fields with the provided tournament data", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText(
        "Наприклад: Хакатон 2026...",
      );
      const descInput = screen.getByPlaceholderText("Короткий опис турніру...");
      const maxTeamsInput = document.querySelector(
        'input[name="max_teams"]',
      ) as HTMLInputElement;
      const dateInputs = document.querySelectorAll(
        'input[type="datetime-local"]',
      ) as NodeListOf<HTMLInputElement>;

      expect(titleInput).toHaveValue("Initial Tournament Title");
      expect(descInput).toHaveValue("Initial Description");
      expect(maxTeamsInput.value).toBe("16");

      expect(dateInputs[0]).toHaveValue("2026-05-01T09:00");
      expect(dateInputs[1]).toHaveValue("2026-05-20T23:59");
      expect(dateInputs[2]).toHaveValue("2026-06-01T10:00");
    });

    it("handles missing tournament data properties gracefully", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={emptyTournament}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText(
        "Наприклад: Хакатон 2026...",
      );
      const maxTeamsInput = document.querySelector(
        'input[name="max_teams"]',
      ) as HTMLInputElement;
      const dateInputs = document.querySelectorAll(
        'input[type="datetime-local"]',
      ) as NodeListOf<HTMLInputElement>;

      expect(titleInput).toHaveValue("");
      expect(maxTeamsInput.value).toBe("2");
      expect(dateInputs[0]).toHaveValue("");
    });
  });

  // --- Lifecycle & Edge Cases ---

  // --- User Interactions ---

  describe("User Interactions", () => {
    it("updates text and textarea state on user input", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText(
        "Наприклад: Хакатон 2026...",
      );
      const descInput = screen.getByPlaceholderText("Короткий опис турніру...");

      fireEvent.change(titleInput, {
        target: { name: "title", value: "Updated Title" },
      });
      fireEvent.change(descInput, {
        target: {
          name: "description",
          value: "Updated Description\nSecond Line",
        },
      });

      expect(titleInput).toHaveValue("Updated Title");
      expect(descInput).toHaveValue("Updated Description\nSecond Line");
    });

    it("updates max_teams state as a number type", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const maxTeamsInput = document.querySelector(
        'input[name="max_teams"]',
      ) as HTMLInputElement;
      fireEvent.change(maxTeamsInput, {
        target: { name: "max_teams", value: "32" },
      });

      expect(maxTeamsInput.value).toBe("32");
    });

    it("updates date state on user input", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const dateInputs = document.querySelectorAll(
        'input[type="datetime-local"]',
      );
      const startRegInput = dateInputs[0];

      fireEvent.change(startRegInput, {
        target: { name: "reg_start", value: "2026-07-15T12:30" },
      });

      expect(startRegInput).toHaveValue("2026-07-15T12:30");
    });
  });

  // --- Closing Mechanisms ---

  describe("Closing Mechanisms", () => {
    it("triggers onClose when the close icon is clicked", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const closeIcon = screen.getByText("✕");
      fireEvent.click(closeIcon);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("triggers onClose when the cancel button is clicked", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const cancelButton = screen.getByText("СКАСУВАТИ");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("triggers onClose when clicking on the backdrop", () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const backdrop = document.querySelector(
        ".backdrop-blur-sm",
      ) as HTMLElement;
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // --- Form Submission ---

  describe("Form Submission", () => {
    it("submits original data if no fields were manually changed", async () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const submitButton = screen.getByText("ЗБЕРЕГТИ");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(123, {
          title: "Initial Tournament Title",
          description: "Initial Description",
          start_date: new Date("2026-06-01T10:00").toISOString(),
          reg_start: new Date("2026-05-01T09:00").toISOString(),
          reg_end: new Date("2026-05-20T23:59").toISOString(),
          max_teams: 16,
        });
      });
    });

    it("calls onSave with correct formatted data on submit after changes", async () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText(
        "Наприклад: Хакатон 2026...",
      );
      fireEvent.change(titleInput, {
        target: { name: "title", value: "New Title 2026" },
      });

      const submitButton = screen.getByText("ЗБЕРЕГТИ");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          123,
          expect.objectContaining({
            title: "New Title 2026",
          }),
        );
      });
    });

    it("converts empty date fields to null on submit", async () => {
      const tournamentWithEmptyDates = {
        id: 999,
        title: "Valid Title To Pass Required",
      };

      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={tournamentWithEmptyDates}
          onSave={mockOnSave}
        />,
      );

      const submitButton = screen.getByText("ЗБЕРЕГТИ");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(999, {
          title: "Valid Title To Pass Required",
          description: "",
          start_date: null,
          reg_start: null,
          reg_end: null,
          max_teams: 2,
        });
      });
    });

    it("calls onClose immediately after successful save", async () => {
      mockOnSave.mockResolvedValueOnce(undefined);

      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const submitButton = screen.getByText("ЗБЕРЕГТИ");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it("sets loading state and disables buttons during submission", async () => {
      let resolvePromise: any;
      mockOnSave.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const submitButton = screen.getByText("ЗБЕРЕГТИ");
      const cancelButton = screen.getByText("СКАСУВАТИ");

      fireEvent.click(submitButton);

      expect(screen.getByText("ЗБЕРЕЖЕННЯ...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      resolvePromise();

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it("handles errors gracefully without calling onClose", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockOnSave.mockRejectedValueOnce(new Error("Network Error"));

      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={mockTournament}
          onSave={mockOnSave}
        />,
      );

      const submitButton = screen.getByText("ЗБЕРЕГТИ");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          "Помилка при збереженні",
          expect.any(Error),
        );
      });

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(submitButton).not.toBeDisabled();
      expect(screen.getByText("ЗБЕРЕГТИ")).toBeInTheDocument();

      errorSpy.mockRestore();
    });

    it("does nothing on submit if tournament object is missing", async () => {
      render(
        <EditTournamentModal
          isOpen={true}
          onClose={mockOnClose}
          tournament={null}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText(
        "Наприклад: Хакатон 2026...",
      );
      fireEvent.change(titleInput, {
        target: { name: "title", value: "Some Title" },
      });

      const submitButton = screen.getByText("ЗБЕРЕГТИ");
      fireEvent.click(submitButton);

      await new Promise((r) => setTimeout(r, 0));

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
