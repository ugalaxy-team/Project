import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatItem } from "./StatItem";

describe("StatItem", () => {
  it("renders value and uppercase label", () => {
    render(<StatItem value="12 днів" label="До старту" />);
    expect(screen.getByText("12 днів")).toBeInTheDocument();
    expect(screen.getByText("До старту")).toBeInTheDocument();
  });

  it("renders label text with uppercase styling", () => {
    render(<StatItem value="1" label="Test label" />);
    expect(screen.getByText("Test label")).toHaveClass("uppercase");
  });

  it("renders numeric-like values", () => {
    render(<StatItem value="0 годин" label="Ліміт" />);
    expect(screen.getByText("0 годин")).toBeInTheDocument();
  });

  it("supports long labels", () => {
    render(
      <StatItem value="OK" label="Дуже довгий підпис для перевірки" />,
    );
    expect(
      screen.getByText("Дуже довгий підпис для перевірки"),
    ).toBeInTheDocument();
  });
});
