import { describe, it, expect } from "vitest";
import reducer, { setUser, setDisplayName, type UserData } from "./user";

describe("user slice", () => {
  const initialState = {
    user: undefined,
  };

  const mockUserData: UserData = {
    uid: "abc-123",
    email: "test@test.com",
    displayName: "Original Name",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    id: 1,
    roles: [],
    notifications: [],
    role_requests: [],
    created_tournaments: [],
  };

  it("should return the initial state when passed an empty action", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setUser with a user object", () => {
    const nextState = reducer(initialState, setUser(mockUserData));
    
    expect(nextState.user).toEqual(mockUserData);
    expect(nextState.user?.uid).toBe("abc-123");
  });

  it("should handle setUser with null (logout)", () => {
    const stateWithUser = { user: mockUserData };
    const nextState = reducer(stateWithUser, setUser(null));
    
    expect(nextState.user).toBeNull();
  });


  it("should update displayName if user exists", () => {
    const stateWithUser = { user: { ...mockUserData } };
    const nextState = reducer(stateWithUser, setDisplayName("New Cool Name"));
    
    expect(nextState.user?.displayName).toBe("New Cool Name");
    expect(nextState.user?.uid).toBe("abc-123");
  });

  it("should do nothing on setDisplayName if user is undefined", () => {
    const nextState = reducer(initialState, setDisplayName("New Name"));
    
    expect(nextState.user).toBeUndefined();
  });

  it("should do nothing on setDisplayName if user is null", () => {
    const stateNullUser = { user: null };
    const nextState = reducer(stateNullUser, setDisplayName("New Name"));
    
    expect(nextState.user).toBeNull();
  });

  it("should not mutate the original state object", () => {
    const state = { user: mockUserData };
    reducer(state, setDisplayName("Changed"));
    
    expect(state.user.displayName).toBe("Original Name");
  });
});