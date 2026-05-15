import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncUser } from "./firebase";
import { store } from "./store";
import { queryClient } from "./api/queryClient";
import { getProfile } from "./api/requests/getProfile";

vi.mock("./store", () => ({
  store: { dispatch: vi.fn() },
}));

vi.mock("./api/queryClient", () => ({
  queryClient: { fetchQuery: vi.fn() },
}));

vi.mock("./api/requests/getProfile", () => ({
  getProfile: vi.fn(),
}));

vi.mock("./slices/user", () => ({
  setUser: vi.fn((val) => ({ type: "setUser", payload: val })),
}));

describe("syncUser logic", () => {
  const mockFirebaseUser = {
    uid: "123",
    email: "test@example.com",
    displayName: "John Doe",
    photoURL: "http://photo.com",
    emailVerified: true,
    isAnonymous: false,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should dispatch null if user is null (logout)", async () => {
    await syncUser(null);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "setUser",
      payload: null,
    });
  });

  it("should sync combined Firebase and API data on success", async () => {
    const mockApiData = { id: 10, roles: ["admin"] };
    (queryClient.fetchQuery as any).mockResolvedValue(mockApiData);

    await syncUser(mockFirebaseUser);

    expect(store.dispatch).toHaveBeenCalledWith({
      type: "setUser",
      payload: expect.objectContaining({
        uid: "123",
        id: 10,
        roles: ["admin"],
        displayName: "John Doe",
      }),
    });
  });

  it("should fallback to Firebase data only if API fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (queryClient.fetchQuery as any).mockRejectedValue(new Error("API Down"));

    await syncUser(mockFirebaseUser);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "setUser",
      payload: expect.objectContaining({
        uid: "123",
        id: -1,
      }),
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should use email as displayName if displayName is missing", async () => {
    const userNoName = {
      ...mockFirebaseUser,
      displayName: null,
      email: "fallback@mail.com",
    };
    (queryClient.fetchQuery as any).mockResolvedValue({});

    await syncUser(userNoName);

    expect(store.dispatch).toHaveBeenCalledWith({
      type: "setUser",
      payload: expect.objectContaining({
        displayName: "fallback@mail.com",
      }),
    });
  });

  it("should call getProfile with correct user object", async () => {
    (queryClient.fetchQuery as any).mockImplementation(({ queryFn }: any) =>
      queryFn(),
    );

    await syncUser(mockFirebaseUser);

    expect(getProfile).toHaveBeenCalledWith(mockFirebaseUser);
  });
});
