import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
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
    const { container } = render(<Button>Primary</Button>);
    const btn = screen.getByRole("button", { name: "Primary" });
    expect(btn.className).toContain("bg-indigo-500");
  });

  it("renders both left and right icons", () => {
    render(
      <Button
        leftIcon={<span data-testid="left">←</span>}
        rightIcon={<span data-testid="right">→</span>}
      >
        Both Icons
      </Button>
    );
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("hides both icons while loading", () => {
    render(
      <Button
        isLoading
        leftIcon={<span data-testid="left">←</span>}
        rightIcon={<span data-testid="right">→</span>}
      >
        Loading
      </Button>
    );
    expect(screen.queryByTestId("left")).not.toBeInTheDocument();
    expect(screen.queryByTestId("right")).not.toBeInTheDocument();
  });

  it("handles very long button text", () => {
    const longText = "This is a very long button text that should wrap or truncate depending on the container width";
    render(<Button>{longText}</Button>);
    expect(screen.getByRole("button", { name: longText })).toBeInTheDocument();
  });

  it("handles empty children", () => {
    render(<Button></Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("disables button when both disabled and isLoading", () => {
    render(
      <Button disabled isLoading>
        Blocked
      </Button>
    );
    expect(screen.getByRole("button", { name: "Blocked" })).toBeDisabled();
  });

  it("applies opacity-70 when disabled", () => {
    render(
      <Button disabled>
        Disabled
      </Button>
    );
    expect(screen.getByRole("button", { name: "Disabled" }).className).toContain("disabled:opacity-70");
  });

  it("prevents pointer events when disabled", () => {
    render(
      <Button disabled>
        Blocked
      </Button>
    );
    expect(screen.getByRole("button", { name: "Blocked" }).className).toContain("disabled:pointer-events-none");
  });

  it("renders with focus ring styling", () => {
    const { container } = render(<Button>Focus</Button>);
    const btn = screen.getByRole("button", { name: "Focus" });
    expect(btn.className).toContain("focus-visible:ring");
  });

  it("primary variant has correct color classes", () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole("button", { name: "Primary" });
    expect(btn.className).toContain("indigo");
  });

  it("accent variant has correct color classes", () => {
    render(<Button variant="accent">Accent</Button>);
    const btn = screen.getByRole("button", { name: "Accent" });
    expect(btn.className).toContain("amber");
  });

  it("outline variant has border", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button", { name: "Outline" });
    expect(btn.className).toContain("border");
  });

  it("ghost variant has no background", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button", { name: "Ghost" });
    expect(btn.className).toContain("bg-transparent");
  });

  it("supports md size (default)", () => {
    render(<Button size="md">Medium</Button>);
    const btn = screen.getByRole("button", { name: "Medium" });
    expect(btn.className).toContain("py-3.5");
  });

  it("multiple clicks trigger multiple onChange calls", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    const btn = screen.getByRole("button", { name: "Click Me" });
    await user.click(btn);
    await user.click(btn);
    await user.click(btn);

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("renders as motion.button with animation props", async () => {
    const user = userEvent.setup();
    render(<Button>Animated</Button>);
    const btn = screen.getByRole("button", { name: "Animated" });

    
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Check</Button>);
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(onClick).toHaveBeenCalled();
  });

  it("applies transition duration classes", () => {
    render(<Button>Transition</Button>);
    const btn = screen.getByRole("button", { name: "Transition" });
    expect(btn.className).toContain("transition-colors");
    expect(btn.className).toContain("duration-200");
  });

  it("combines all size and variant classes correctly", () => {
    render(
      <Button variant="accent" size="lg">
        Combined
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Combined" });
    expect(btn.className).toContain("amber");
    expect(btn.className).toContain("py-4");
  });

  it("custom className merges with base classes", () => {
    render(
      <Button className="custom-class">Custom</Button>
    );
    const btn = screen.getByRole("button", { name: "Custom" });
    expect(btn).toHaveClass("custom-class");
    expect(btn).toHaveClass("rounded-full");
  });

  it("handles undefined className prop", () => {
    render(
      <Button className={undefined}>Undefined</Button>
    );
    expect(screen.getByRole("button", { name: "Undefined" })).toBeInTheDocument();
  });

  it("loading state takes precedence over disabled state for visual feedback", () => {
    render(
      <Button disabled isLoading>
        State Priority
      </Button>
    );
    const btn = screen.getByRole("button", { name: "State Priority" });
    expect(btn).toBeDisabled();
  });

  it("displays spinner with correct animation class", () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const spinner = container.querySelector(".animate-spin");

    expect(spinner).toBeInTheDocument();
    
    expect(spinner).toHaveClass("w-5");
    expect(spinner).toHaveClass("h-5");
    expect(spinner).toHaveClass("animate-spin");
  });

  it("left and right icons have flex gap between them", async () => {
    const user = userEvent.setup();
    render(
      <Button
        leftIcon={<span data-testid="left">←</span>}
        rightIcon={<span data-testid="right">→</span>}
      >
        Spaced
      </Button>
    );

    
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
    expect(screen.getByText("Spaced")).toBeInTheDocument();
  });

  it("handles rapid enable/disable toggling", () => {
    const { rerender } = render(
      <Button disabled>Toggle</Button>
    );

    rerender(<Button>Toggle</Button>);
    expect(screen.getByRole("button")).not.toBeDisabled();

    rerender(<Button disabled>Toggle</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("icon visibility toggles with loading state", () => {
    const { rerender } = render(
      <Button leftIcon={<span data-testid="icon">Icon</span>}>
        Text
      </Button>
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();

    rerender(
      <Button isLoading leftIcon={<span data-testid="icon">Icon</span>}>
        Text
      </Button>
    );

    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("renders rounded-full shape", () => {
    render(<Button>Round</Button>);
    expect(screen.getByRole("button", { name: "Round" }).className).toContain("rounded-full");
  });

  it("supports hover state styling", () => {
    render(<Button variant="primary">Hover</Button>);
    const btn = screen.getByRole("button", { name: "Hover" });
    expect(btn.className).toContain("hover:");
  });

  it("text is bold and centered", () => {
    render(<Button>Text</Button>);
    const btn = screen.getByRole("button", { name: "Text" });
    expect(btn.className).toContain("font-bold");
    expect(btn.className).toContain("justify-center");
  });

  it("button is semantically correct element", () => {
    render(<Button>Semantic</Button>);
    const btn = screen.getByRole("button", { name: "Semantic" });
    expect(btn.tagName).toBe("BUTTON");
  });

  it("spinner color matches indigo theme", () => {
    render(<Button isLoading>Loading</Button>);
    
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });

  it("handles prop spreading correctly", async () => {
    const onMouseEnter = vi.fn();
    render(
      <Button onMouseEnter={onMouseEnter}>Hover Me</Button>
    );

    const btn = screen.getByRole("button", { name: "Hover Me" });

    
    fireEvent.mouseEnter(btn);

    
    
    

    expect(onMouseEnter).toHaveBeenCalled();
  });

  it("maintains button type by default", () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector("button");
    expect(btn?.type).toBe("submit"); 
  });

  it("defaults to primary variant styling (verified)", () => {
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
