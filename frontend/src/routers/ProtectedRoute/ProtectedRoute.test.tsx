import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import userReducer, { type UserData } from "@/slices/user";
import notificationsReducer from "@/slices/notifications";

const mockUser: UserData = {
  uid: "u-1",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  id: 1,
  roles: [],
  notifications: [],
  role_requests: [],
  created_tournaments: [],
  is_jury: false,
  evaluates_in: [],
};

const buildStore = (user: UserData | null | undefined) =>
  configureStore({
    reducer: {
      user: userReducer,
      notifications: notificationsReducer,
    },
    preloadedState: {
      user: { user },
      notifications: { items: [] },
    },
  });

describe("ProtectedRoute", () => {
  it("shows loading while user state is unresolved", () => {
    const store = buildStore(undefined);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<ProtectedRoute />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to auth page", () => {
    const store = buildStore(null);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<ProtectedRoute />} />
            <Route path="/auth" element={<div>Auth Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText("Auth Page")).toBeInTheDocument();
  });

  it("renders children for authenticated users", () => {
    const store = buildStore(mockUser);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>Private Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText("Private Content")).toBeInTheDocument();
  });

  it("renders outlet when no children are passed", () => {
    const store = buildStore(mockUser);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route index element={<div>Dashboard Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText("Dashboard Home")).toBeInTheDocument();
  });
});
