import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProfile } from "@/api/requests/updateProfile";
import apiClient from "@/api/client";

describe("updateProfile API helper", () => {
  const mockFirebaseUser = {
    getIdToken: vi.fn().mockResolvedValue("mock-jwt-token-123"),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches token and sends PATCH request with correct headers and data", async () => {
    const mockResponse = { data: { success: true, full_name: "Тестер" } };
    const patchSpy = vi
      .spyOn(apiClient, "patch")
      .mockResolvedValue(mockResponse);

    const updateData = { full_name: "Тестер", telegram: "@tester" };

    const result = await updateProfile(mockFirebaseUser, updateData);
    expect(mockFirebaseUser.getIdToken).toHaveBeenCalledTimes(1);
    expect(patchSpy).toHaveBeenCalledWith("/profile/", updateData, {
      headers: {
        Authorization: "Bearer mock-jwt-token-123",
      },
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("throws an error if request fails", async () => {
    const error = new Error("Network Error");

    vi.spyOn(apiClient, "patch").mockRejectedValue(error);

    await expect(updateProfile(mockFirebaseUser, {})).rejects.toThrow(
      "Network Error",
    );
  });
});
