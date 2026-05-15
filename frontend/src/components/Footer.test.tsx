import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "./Footer";

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe("Footer", () => {
  it("renders brand link to home", () => {
    renderFooter();
    const brand = screen.getByRole("link", { name: /UGalaxy x Star for Life/ });
    expect(brand).toHaveAttribute("href", "/");
  });

  it("links to tournaments list", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Всі турніри" })).toHaveAttribute(
      "href",
      "/tournaments",
    );
  });

  it("links to rules page", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Правила" })).toHaveAttribute(
      "href",
      "/rules",
    );
  });

  it("links to faq page", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "/faq",
    );
  });

  it("shows platform section heading", () => {
    renderFooter();
    expect(screen.getByText("Платформа")).toBeInTheDocument();
  });

  it("shows information section heading", () => {
    renderFooter();
    expect(screen.getByText("Інформація")).toBeInTheDocument();
  });

  it("links to about page", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Про нас" })).toHaveAttribute(
      "href",
      "/about-us",
    );
  });

  it("links to contact page", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Контакти" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("links to news page", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Новини" })).toHaveAttribute(
      "href",
      "/news",
    );
  });

  it("shows copyright year", () => {
    renderFooter();
    expect(
      screen.getByText(/2026 UGalaxy x Star for Life/),
    ).toBeInTheDocument();
  });

  it("renders mission copy", () => {
    renderFooter();
    expect(
      screen.getByText(/Місце, де народжуються найкращі ідеї/),
    ).toBeInTheDocument();
  });
});
