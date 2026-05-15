import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import JuryPanel from "./JuryPanel";
import { getJuryTasks } from "@/api/requests";
import { createMockTask } from "./testFixtures";
import { renderWithJuryProviders } from "./testUtils";

vi.mock("@/api/requests", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/requests")>();
  return {
    ...actual,
    getJuryTasks: vi.fn(),
  };
});

const { authState, queryTestState } = vi.hoisted(() => ({
  authState: {
    currentUser: { uid: "jury-user" } as { uid: string } | null,
  },
  queryTestState: { forceEnabled: false },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: (options: Parameters<typeof actual.useQuery>[0]) =>
      actual.useQuery({
        ...options,
        enabled: queryTestState.forceEnabled ? true : options?.enabled,
      }),
  };
});

vi.mock("@/firebase", () => ({
  auth: authState,
}));

vi.mock("@/components/Hero", () => ({
  Hero: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("@/components/Stars", () => ({
  Stars: () => null,
}));

describe("JuryPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.currentUser = { uid: "jury-user" };
    queryTestState.forceEnabled = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading skeleton while tasks are fetched", () => {
    vi.mocked(getJuryTasks).mockReturnValue(new Promise(() => undefined));

    renderWithJuryProviders(<JuryPanel />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("renders task cards on success", async () => {
    vi.mocked(getJuryTasks).mockResolvedValue([
      createMockTask({ id: 1, title: "Round One" }),
      createMockTask({ id: 2, title: "Round Two" }),
    ]);

    renderWithJuryProviders(<JuryPanel />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Round One" })).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "Round Two" })).toBeInTheDocument();
  });

  it("shows empty state when there are no tasks", async () => {
    vi.mocked(getJuryTasks).mockResolvedValue([]);

    renderWithJuryProviders(<JuryPanel />);

    await waitFor(() => {
      expect(screen.getByText("Поки немає призначень журі")).toBeInTheDocument();
    });
  });

  it("shows error UI when the jury user is not authenticated", async () => {
    queryTestState.forceEnabled = true;
    authState.currentUser = null;

    renderWithJuryProviders(<JuryPanel />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Не вдалося завантажити завдання журі");
    });
  });

  it("shows error UI when the fetch fails", async () => {
    vi.mocked(getJuryTasks).mockRejectedValue(new Error("Network down"));

    renderWithJuryProviders(<JuryPanel />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Не вдалося завантажити завдання журі");
    });
    expect(screen.queryByRole("link", { name: "Відкрити раунд" })).not.toBeInTheDocument();
  });
});
