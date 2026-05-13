import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./MainLayout";

vi.mock("./Header", () => ({
  Header: () => <header>Mock Header</header>,
}));

vi.mock("./Footer", () => ({
  Footer: () => <footer>Mock Footer</footer>,
}));

describe("MainLayout", () => {
  it("renders header, footer and route outlet content", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<div>Home Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Mock Header")).toBeInTheDocument();
    expect(screen.getByText("Home Content")).toBeInTheDocument();
    expect(screen.getByText("Mock Footer")).toBeInTheDocument();
  });
});
