import { describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import userReducer, { type UserData } from "@/slices/user";
import notificationsReducer from "@/slices/notifications";
import { Header } from "./Header";

vi.mock("./ProfileDropdown", () => ({
  ProfileDropdown: () => <div>Mock Profile Dropdown</div>,
}));

vi.mock("./NotificationsDropdown", () => ({
  NotificationsDropdown: () => <div>Mock Notifications Dropdown</div>,
}));

const mockUser: UserData = {
  uid: "u-100",
  email: "anna@example.com",
  displayName: "Anna",
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  id: 3,
  roles: [],
  notifications: [],
  role_requests: [],
  created_tournaments: [],
  is_jury: false,
  evaluates_in: [],
};

const renderHeader = (user: UserData | null | undefined) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      notifications: notificationsReducer,
    },
    preloadedState: {
      user: { user },
      notifications: { items: [] },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>,
  );
};

describe("Header", () => {
  it("shows auth CTA for unauthenticated users", () => {
    renderHeader(null);

    expect(screen.getByRole("link", { name: "Увійти" })).toBeInTheDocument();
    expect(screen.queryByText("Mock Profile Dropdown")).not.toBeInTheDocument();
  });

  it("shows profile and notifications for authenticated users", () => {
    renderHeader(mockUser);

    expect(screen.getByText("Mock Profile Dropdown")).toBeInTheDocument();
    expect(screen.getByText("Mock Notifications Dropdown")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Увійти" })).not.toBeInTheDocument();
  });

  it("toggles mobile menu and closes it after nav click", async () => {
    const user = userEvent.setup();
    renderHeader(null);

    const menuButton = screen.getByRole("button");
    await user.click(menuButton);

    const mobileLink = screen.getAllByRole("link", { name: "Турніри" })[1];
    expect(mobileLink).toBeInTheDocument();

    await user.click(mobileLink);
    expect(screen.queryAllByRole("link", { name: "Турніри" })).toHaveLength(1);
  });
});
