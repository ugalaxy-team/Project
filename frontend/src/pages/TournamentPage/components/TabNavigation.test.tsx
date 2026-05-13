import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabNavigation } from "./TabNavigation";

describe("TabNavigation", () => {
  it("renders all configured tabs", () => {
    const onTabChange = vi.fn();
    render(
      <TabNavigation activeTab="desc" onTabChange={onTabChange} />,
    );
    expect(
      screen.getByRole("button", { name: "Опис турінра" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Опис завдання" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Команди" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Календар" }),
    ).toBeInTheDocument();
  });

  it("calls onTabChange with tab id when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <TabNavigation activeTab="desc" onTabChange={onTabChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Команди" }));
    expect(onTabChange).toHaveBeenCalledWith("teams");
  });

  it("highlights active tab with primary text class", () => {
    const onTabChange = vi.fn();
    const { rerender } = render(
      <TabNavigation activeTab="desc" onTabChange={onTabChange} />,
    );
    expect(screen.getByRole("button", { name: "Опис турінра" })).toHaveClass(
      "text-primary",
    );
    rerender(
      <TabNavigation activeTab="teams" onTabChange={onTabChange} />,
    );
    expect(screen.getByRole("button", { name: "Команди" })).toHaveClass(
      "text-primary",
    );
  });

  it("fires onTabChange for calendar tab", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <TabNavigation activeTab="desc" onTabChange={onTabChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Календар" }));
    expect(onTabChange).toHaveBeenCalledWith("calendar");
  });

  it("fires onTabChange for task description tab", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <TabNavigation activeTab="desc" onTabChange={onTabChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Опис завдання" }));
    expect(onTabChange).toHaveBeenCalledWith("task_desc");
  });
});
