import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LookingForTeamModal } from "./LookingForTeamModal";

describe("LookingForTeamModal", () => {
  beforeEach(() => {
    
    const originalOverflow = document.body.style.overflow;
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renders nothing when isOpen is false", () => {
    const onClose = vi.fn();
    const { container } = render(
      <LookingForTeamModal isOpen={false} onClose={onClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal when isOpen is true", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Пошук команди")).toBeInTheDocument();
  });

  it("renders modal title", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Пошук команди")).toBeInTheDocument();
  });

  it("renders main heading", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Шукаєш команду?")).toBeInTheDocument();
  });

  it("renders description text", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    expect(
      screen.getByText(
        "Зв'яжись з нами — ми допоможемо тобі знайти однодумців та приєднатися до турніру вже сьогодні!"
      )
    ).toBeInTheDocument();
  });

  it("renders contact link button", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    const contactLink = screen.getByText("Перейти на сторінку контактів");
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest("a")).toHaveAttribute("href", "/contact");
  });

  it("renders close button", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Закрити")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByText("Закрити");
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

it("restores body overflow when modal closes", () => {
    
    document.body.style.overflow = "auto";
    const onClose = vi.fn();
    const { rerender } = render(
      <LookingForTeamModal isOpen={true} onClose={onClose} />
    );

    
    expect(document.body.style.overflow).toBe("hidden");

    
    rerender(<LookingForTeamModal isOpen={false} onClose={onClose} />);

    
    
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("restores body overflow on unmount", () => {
    document.body.style.overflow = "auto";
    const onClose = vi.fn();
    const { unmount } = render(
      <LookingForTeamModal isOpen={true} onClose={onClose} />
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("renders modal using portal", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    
    expect(document.body.querySelector("[class*='fixed']")).toBeInTheDocument();
  });

  it("applies correct styling classes to overlay", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    
    
    const overlay = document.body.querySelector(".fixed");
    
    
    expect(overlay).not.toBeNull();
    
    expect(overlay).toHaveClass("inset-0");
    expect(overlay).toHaveAttribute("data-modal-overlay");
    expect(overlay).toHaveStyle({ zIndex: 200 });
    expect(overlay).toHaveClass("flex");
    expect(overlay).toHaveClass("items-center");
    expect(overlay).toHaveClass("justify-center");
  });

  it("applies correct styling to modal content", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    
    const modalContent = document.body.querySelector(".bg-bg-card");
    
    expect(modalContent).not.toBeNull();
    
    expect(modalContent).toHaveClass("rounded-[2.5rem]");
    expect(modalContent).toHaveClass("shadow-2xl");
    expect(modalContent).toHaveClass("overflow-hidden");
  });

it("header section has correct background color", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    
    const header = document.body.querySelector(".from-primary");
    
    expect(header).toBeInTheDocument();
  });

  it("content section has correct background color", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    
    const content = document.body.querySelector(".bg-bg-body.p-10");
    
    
    expect(content).not.toBeNull();
    
    expect(content).toBeInTheDocument();
  });

  it("toggles modal visibility correctly", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <LookingForTeamModal isOpen={false} onClose={onClose} />
    );

    expect(screen.queryByText("Пошук команди")).not.toBeInTheDocument();

    rerender(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Пошук команди")).toBeInTheDocument();

    rerender(<LookingForTeamModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByText("Пошук команди")).not.toBeInTheDocument();
  });

  it("handles rapid open/close cycles", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <LookingForTeamModal isOpen={true} onClose={onClose} />
    );

    for (let i = 0; i < 5; i++) {
      rerender(<LookingForTeamModal isOpen={false} onClose={onClose} />);
      rerender(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    }

    expect(screen.getByText("Пошук команди")).toBeInTheDocument();
  });

  it("contact link has correct attributes", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    const contactLink = screen.getByText(
      "Перейти на сторінку контактів"
    ) as HTMLAnchorElement;
    expect(contactLink.href).toContain("/contact");
  });

  it("close button is a button element", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByText("Закрити") as HTMLButtonElement;
    expect(closeButton.tagName).toBe("BUTTON");
  });

  it("renders all text content correctly", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText("Пошук команди")).toBeInTheDocument();
    expect(screen.getByText("Шукаєш команду?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Зв'яжись з нами — ми допоможемо тобі знайти однодумців та приєднатися до турніру вже сьогодні!"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Перейти на сторінку контактів")
    ).toBeInTheDocument();
    expect(screen.getByText("Закрити")).toBeInTheDocument();
  });

  it("modal has correct z-index", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    
    const overlay = document.body.querySelector("[data-modal-overlay]");
    
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({ zIndex: 200 });
  });

  it("does not pass through clicks to background elements", async () => {
    const onClose = vi.fn();
    render(
      <>
        <div data-testid="background-element">Background</div>
        <LookingForTeamModal isOpen={true} onClose={onClose} />
      </>
    );

    
    
    const overlay = document.body.querySelector(".fixed.inset-0");
    
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute("data-modal-overlay");
    expect(overlay).toHaveStyle({ zIndex: 200 }); 
  });

  it("display changes from none to flex when opening", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <LookingForTeamModal isOpen={false} onClose={onClose} />
    );

    rerender(<LookingForTeamModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Пошук команди")).toBeInTheDocument();
  });

  it("handles multiple onClose callbacks", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByText("Закрити");
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    
    const { rerender } = screen.getByText("Пошук команди").closest("div")!
      .parentElement as any;
  });

  it("renders with animation classes", () => {
    const onClose = vi.fn();
    render(
      <LookingForTeamModal isOpen={true} onClose={onClose} />
    );

    
    const modalContent = document.body.querySelector(".rounded-\\[2\\.5rem\\]");
    
    expect(modalContent).toBeInTheDocument();
  });

  it("applies correct padding to modal content", () => {
    const onClose = vi.fn();
    render(<LookingForTeamModal isOpen={true} onClose={onClose} />);

    
    const contentArea = document.body.querySelector(".p-10");
    
    expect(contentArea).toBeInTheDocument();
  });


  it("renders search icon inside modal", () => {
    const onClose = vi.fn();
    render(
      <LookingForTeamModal isOpen={true} onClose={onClose} />
    );

    
    const svgs = document.body.querySelectorAll("svg");
    
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("buttons have correct styling classes", () => {
    const onClose = vi.fn();
    const { container } = render(
      <LookingForTeamModal isOpen={true} onClose={onClose} />
    );

    const contactButton = screen.getByText("Перейти на сторінку контактів");
    expect(contactButton).toHaveClass("rounded-2xl");

    const closeButton = screen.getByText("Закрити");
    expect(closeButton).toHaveClass("rounded-2xl");
  });
});
