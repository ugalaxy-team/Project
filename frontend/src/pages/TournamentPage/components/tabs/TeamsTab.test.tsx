import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamsTab } from "./TeamsTab";
import type { Team } from "../../types";

const sampleTeam: Team = {
  name: "Alpha",
  team_email: "alpha@team.dev",
  contact_info: "Discord: alpha",
  members: [
    {
      full_name: "Alex Doe",
      email: "alex@team.dev",
      educational_institution: "Uni",
    },
  ],
};

describe("TeamsTab", () => {
  it("shows empty state when teams array is empty", () => {
    render(<TeamsTab teams={[]} />);
    expect(screen.getByText("Команд ще немає")).toBeInTheDocument();
  });

  it("omits institution line when member has none", () => {
    const team: Team = {
      name: "Solo",
      team_email: "solo@x.com",
      contact_info: "—",
      members: [{ full_name: "Sam", email: "sam@x.com" }],
    };
    render(<TeamsTab teams={[team]} />);
    expect(screen.queryByText("Uni")).not.toBeInTheDocument();
  });

  it("renders team name and email link", () => {
    render(<TeamsTab teams={[sampleTeam]} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    const mail = screen.getByRole("link", { name: "alpha@team.dev" });
    expect(mail).toHaveAttribute("href", "mailto:alpha@team.dev");
  });

  it("renders contact line", () => {
    render(<TeamsTab teams={[sampleTeam]} />);
    expect(screen.getByText(/Контакт: Discord: alpha/)).toBeInTheDocument();
  });

  it("lists member names and participant count", () => {
    render(<TeamsTab teams={[sampleTeam]} />);
    expect(screen.getByText("Alex Doe")).toBeInTheDocument();
    expect(screen.getByText(/Учасники \(1\)/)).toBeInTheDocument();
  });

  it("shows institution when member provides it", () => {
    render(<TeamsTab teams={[sampleTeam]} />);
    expect(screen.getByText("Uni")).toBeInTheDocument();
  });

  it("renders multiple teams", () => {
    const second: Team = {
      name: "Beta",
      team_email: "beta@team.dev",
      contact_info: "TG",
      members: [{ full_name: "Bee", email: "bee@team.dev" }],
    };
    render(<TeamsTab teams={[sampleTeam, second]} />);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});
