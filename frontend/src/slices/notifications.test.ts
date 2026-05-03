import { describe, it, expect } from "vitest";
import reducer, { addNotification, clearNotifications, type AppNotification } from "./notifications";
import { setUser } from "./user";

describe("notifications slice", () => {
  const initialState = { items: [] };

  const mockNotification: AppNotification = {
    id: "1",
    body: "Test notification",
    isRead: false,
  };

  it("should return the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should add a new notification to the beginning of the list (unshift)", () => {
    const stateWithOne = { items: [mockNotification] };
    const newNotification = { id: "2", body: "Newer notification" };
    
    const nextState = reducer(stateWithOne, addNotification(newNotification));

    expect(nextState.items).toHaveLength(2);
    expect(nextState.items[0]).toEqual(newNotification);
  });

  it("should NOT add a notification if the ID already exists", () => {
    const stateWithOne = { items: [mockNotification] };
    
    const nextState = reducer(stateWithOne, addNotification(mockNotification));

    expect(nextState.items).toHaveLength(1);
  });

  it("should clear all notifications", () => {
    const dirtyState = { items: [mockNotification, { id: "2", body: "Another" }] };
    const nextState = reducer(dirtyState, clearNotifications());

    expect(nextState.items).toHaveLength(0);
  });


  describe("extraReducers - setUser", () => {
    it("should populate notifications when user is set with data", () => {
      const userPayload = {
        uid: "123",
        notifications: [
          { id: "100", body: "Welcome back!" },
          { id: "101", body: "New tournament started" }
        ]
      } as any;

      const nextState = reducer(initialState, setUser(userPayload));

      expect(nextState.items).toHaveLength(2);
      expect(nextState.items[0].id).toBe("101");
    });

    it("should not change state if user has no notifications field", () => {
      const userPayload = { uid: "123" } as any;
      const nextState = reducer(initialState, setUser(userPayload));

      expect(nextState.items).toEqual([]);
    });

    it("should not change state if user is null (logout)", () => {
      const stateWithItems = { items: [mockNotification] };
      const nextState = reducer(stateWithItems, setUser(null));

      expect(nextState.items).toHaveLength(1); 
    });
  });
});