import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("calls onClick when clicked and not disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Blocked
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Blocked" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} isLoading>
        Wait
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Wait" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables button while loading", () => {
    render(<Button isLoading>Busy</Button>);
    expect(screen.getByRole("button", { name: "Busy" })).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    const { container } = render(<Button isLoading>Busy</Button>);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders left icon when not loading", () => {
    render(
      <Button leftIcon={<span data-testid="left">L</span>}>With icon</Button>,
    );
    expect(screen.getByTestId("left")).toBeInTheDocument();
  });

  it("renders right icon when not loading", () => {
    render(
      <Button rightIcon={<span data-testid="right">R</span>}>With icon</Button>,
    );
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("hides icons while loading", () => {
    render(
      <Button isLoading leftIcon={<span data-testid="left">L</span>}>
        X
      </Button>,
    );
    expect(screen.queryByTestId("left")).not.toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(
      <Button className="extra-class">Styled</Button>,
    );
    expect(screen.getByRole("button", { name: "Styled" })).toHaveClass(
      "extra-class",
    );
  });

  it("supports accent variant class tokens", () => {
    render(<Button variant="accent">Accent</Button>);
    const btn = screen.getByRole("button", { name: "Accent" });
    expect(btn.className).toContain("amber");
  });

  it("supports outline variant class tokens", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button", { name: "Outline" });
    expect(btn.className).toContain("border-slate-200");
  });

  it("supports ghost variant class tokens", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button", { name: "Ghost" });
    expect(btn.className).toContain("text-slate-500");
  });

  it("applies large size padding classes", () => {
    render(
      <Button size="lg">Large</Button>,
    );
    expect(screen.getByRole("button", { name: "Large" }).className).toMatch(
      /py-4/,
    );
  });

  it("applies small size padding classes", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button", { name: "Small" }).className).toMatch(
      /py-2/,
    );
  });

  it("defaults to primary variant styling", () => {
    render(<Button>Primary default</Button>);
    expect(screen.getByRole("button", { name: "Primary default" }).className).toMatch(
      /indigo/,
    );
  });

  it("forwards native attributes such as title and type", () => {
    render(
      <Button type="submit" title="Submit form">
        Send
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Send" });
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toHaveAttribute("title", "Submit form");
  });

  it("forwards data-testid for integration tests", () => {
    render(<Button data-testid="submit-btn">OK</Button>);
    expect(screen.getByTestId("submit-btn")).toBeInTheDocument();
  });
});
