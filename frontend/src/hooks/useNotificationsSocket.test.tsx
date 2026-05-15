import { renderHook, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useNotificationsSocket } from "./useNotificationsSocket";
import { useDispatch } from "react-redux";

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
}));

describe("useNotificationsSocket", () => {
  let mockDispatch: any;
  let mockSocket: any;

  beforeEach(() => {
    mockDispatch = vi.fn();
    (useDispatch as any).mockReturnValue(mockDispatch);

    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should not subscribe if socket is null", () => {
    renderHook(() => useNotificationsSocket(null));
    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  it("should subscribe to 'notification' event when socket is provided", () => {
    renderHook(() => useNotificationsSocket(mockSocket));
    expect(mockSocket.on).toHaveBeenCalledWith(
      "notification",
      expect.any(Function),
    );
  });

  it("should unsubscribe (off) when unmounting", () => {
    const { unmount } = renderHook(() => useNotificationsSocket(mockSocket));
    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith(
      "notification",
      expect.any(Function),
    );
  });

  it("should dispatch addNotification when a socket event is received", () => {
    renderHook(() => useNotificationsSocket(mockSocket));

    const handleNewNotification = mockSocket.on.mock.calls[0][1];

    const mockData = { body: "Тестове повідомлення", id: "123" };
    handleNewNotification(mockData);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "notifications/addNotification",
      payload: {
        id: "123",
        body: "Тестове повідомлення",
        isRead: false,
      },
    });
  });

  it("should generate a random UUID if id is missing in data", () => {
    const uuidSpy = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("mocked-uuid");

    renderHook(() => useNotificationsSocket(mockSocket));
    const handleNewNotification = mockSocket.on.mock.calls[0][1];

    handleNewNotification({ body: "Без ID" });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          id: "mocked-uuid",
          body: "Без ID",
        }),
      }),
    );

    uuidSpy.mockRestore();
  });

  it("should resubscribe if socket instance changes", () => {
    const { rerender } = renderHook(
      ({ socket }) => useNotificationsSocket(socket),
      {
        initialProps: { socket: mockSocket },
      },
    );

    const newMockSocket = { on: vi.fn(), off: vi.fn() };
    rerender({ socket: newMockSocket });
    expect(mockSocket.off).toHaveBeenCalled();
    expect(newMockSocket.on).toHaveBeenCalledWith(
      "notification",
      expect.any(Function),
    );
  });
});
