import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

import { Page404 } from "./Page404";

const render404 = () =>
  render(
    <MemoryRouter initialEntries={["/missing"]}>
      <Routes>
        <Route path="/missing" element={<Page404 />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Page404", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("uses main landmark for the page shell", () => {
    render404();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders large 404 heading", () => {
    render404();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders Ukrainian title and body copy", () => {
    render404();
    expect(
      screen.getByRole("heading", { name: /Ви вийшли за межі системи/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Сторінку, яку ви шукаєте, було видалено, або вона існує лише в/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Давайте повернемося на безпечну територію\./),
    ).toBeInTheDocument();
  });

  it("exposes home navigation as a link to root", () => {
    render404();
    const home = screen.getByRole("link", { name: "На головну" });
    expect(home).toHaveAttribute("href", "/");
    expect(home).toHaveClass("bg-primary");
  });

  it("calls navigate(-1) when the back button is pressed", async () => {
    const user = userEvent.setup();
    render404();
    await user.click(screen.getByRole("button", { name: /Назад/i }));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("keeps primary actions in a horizontal-capable flex group", () => {
    const { container } = render404();
    const actions = screen.getByRole("button", { name: /Назад/i }).parentElement;
    expect(actions).toBeTruthy();
    expect(actions?.className).toMatch(/flex-col/);
    expect(actions?.className).toMatch(/sm:flex-row/);
    expect(container.querySelector("main")?.className).toMatch(/min-h-\[100dvh\]/);
  });
});
