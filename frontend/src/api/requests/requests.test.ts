import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuth } from "firebase/auth";
import apiClient from "../client";
import { getAllUsers } from "./getAllUsers";
import { createTournament, type TournamentData } from "./createTournament";
import { updateTask, type TaskUpdateData } from "./updateTask";
import { requestRole } from "./requestRole";

vi.mock("../client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
}));

type TokenUser = {
  getIdToken: () => Promise<string>;
};

describe("API request wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuth).mockReturnValue({ currentUser: null } as never);
  });

  describe("getAllUsers", () => {
    it("returns response data on success", async () => {
      const users = [{ id: 1 }, { id: 2 }];
      vi.mocked(apiClient.get).mockResolvedValue({ data: users });

      await expect(getAllUsers()).resolves.toEqual(users);
      expect(apiClient.get).toHaveBeenCalledWith("/users");
    });

    it("rethrows and logs when request fails", async () => {
      const error = new Error("network failed");
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getAllUsers()).rejects.toThrow("network failed");
      expect(errorSpy).toHaveBeenCalledWith("Error occurred:", error);

      errorSpy.mockRestore();
    });
  });

  describe("createTournament", () => {
    const payload: TournamentData = {
      title: "Test",
      description: "Desc",
      start_date: "2026-06-01T00:00:00Z",
      reg_start: "2026-05-01T00:00:00Z",
      reg_end: "2026-05-20T00:00:00Z",
      min_people_in_team: 2,
      max_people_in_team: 4,
      max_teams: 32,
    };

    it("sends authorized POST request and returns data", async () => {
      const user: TokenUser = {
        getIdToken: vi.fn().mockResolvedValue("token-123"),
      };
      vi.mocked(getAuth).mockReturnValue({ currentUser: user } as never);
      vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 44 } });

      await expect(createTournament(payload)).resolves.toEqual({ id: 44 });
      expect(apiClient.post).toHaveBeenCalledWith("/tournaments", payload, {
        headers: { Authorization: "Bearer token-123" },
      });
    });

    it("throws when user is not authenticated", async () => {
      vi.mocked(getAuth).mockReturnValue({ currentUser: null } as never);

      await expect(createTournament(payload)).rejects.toThrow(
        "Користувач не авторизований",
      );
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("updateTask", () => {
    const taskPayload: TaskUpdateData = {
      title: "New title",
      requirements: ["README"],
    };

    it("sends authorized PATCH request and returns data", async () => {
      const user: TokenUser = {
        getIdToken: vi.fn().mockResolvedValue("task-token"),
      };
      vi.mocked(getAuth).mockReturnValue({ currentUser: user } as never);
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { ok: true } });

      await expect(updateTask(10, 99, taskPayload)).resolves.toEqual({ ok: true });
      expect(apiClient.patch).toHaveBeenCalledWith(
        "/tournaments/10/tasks/99",
        taskPayload,
        {
          headers: { Authorization: "Bearer task-token" },
        },
      );
    });

    it("throws when current user is missing", async () => {
      vi.mocked(getAuth).mockReturnValue({ currentUser: null } as never);

      await expect(updateTask(1, 2, {})).rejects.toThrow(
        "Користувач не авторизований",
      );
      expect(apiClient.patch).not.toHaveBeenCalled();
    });
  });

  describe("requestRole", () => {
    it("posts role request with bearer token and returns status", async () => {
      const user = {
        getIdToken: vi.fn().mockResolvedValue("role-token"),
      };
      vi.mocked(apiClient.post).mockResolvedValue({ status: 201 });

      const status = await requestRole("organizer", user as never, 100, [
        { option_name: "github", value: "anna-dev" },
      ]);

      expect(status).toBe(201);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/role-requests/",
        {
          role_name: "organizer",
          user_id: 100,
          info: [{ option_name: "github", value: "anna-dev" }],
        },
        {
          headers: { Authorization: "Bearer role-token" },
        },
      );
    });
  });
});
