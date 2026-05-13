import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import userReducer from "@/slices/user";
import notificationsReducer, {
  type AppNotification,
} from "@/slices/notifications";
import { NotificationsDropdown } from "./NotificationsDropdown";

const renderWithStore = (notifications: AppNotification[]) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      notifications: notificationsReducer,
    },
    preloadedState: {
      user: { user: undefined },
      notifications: { items: notifications },
    },
  });

  return render(
    <Provider store={store}>
      <NotificationsDropdown />
    </Provider>,
  );
};

describe("NotificationsDropdown", () => {
  it("shows empty-state message when there are no notifications", async () => {
    const user = userEvent.setup();
    renderWithStore([]);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Сповіщення")).toBeInTheDocument();
    expect(screen.getByText("Немає нових сповіщень")).toBeInTheDocument();
    expect(screen.getByText("0 нових")).toBeInTheDocument();
  });

  it("renders unread badge and notifications list", async () => {
    const user = userEvent.setup();
    renderWithStore([
      { id: "n1", body: "Перше сповіщення" },
      { id: "n2", body: "Друге сповіщення" },
    ]);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("2 нових")).toBeInTheDocument();
    expect(screen.getByText("Перше сповіщення")).toBeInTheDocument();
    expect(screen.getByText("Друге сповіщення")).toBeInTheDocument();
  });

  it("closes dropdown when user clicks outside", async () => {
    const user = userEvent.setup();
    renderWithStore([{ id: "n1", body: "Нове повідомлення" }]);

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Сповіщення")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("Сповіщення")).not.toBeInTheDocument();
  });
});
