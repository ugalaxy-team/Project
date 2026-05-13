import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateTimePicker from "./DateTimePicker";

describe("DateTimePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-15T14:30:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the floating label", () => {
    render(
      <DateTimePicker label="Початок" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Початок")).toBeInTheDocument();
  });

  it("shows placeholder when value is empty", () => {
    render(<DateTimePicker label="Дата" value="" onChange={vi.fn()} />);
    expect(screen.getByText("Виберіть дату")).toBeInTheDocument();
  });

  it("shows formatted date when value is a valid ISO string", () => {
    render(
      <DateTimePicker
        label="Дата"
        value="2026-07-20T08:15:00.000Z"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("20.07.2026")).toBeInTheDocument();
  });

  it("shows weekday header inside the calendar panel when opened", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateTimePicker label="Тест" value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );
    await waitFor(() => {
      expect(screen.getByText("Пн")).toBeInTheDocument();
      expect(screen.getByText("Нд")).toBeInTheDocument();
    });
  });

  it("calls onChange with a date on the picked calendar day while preserving UTC time-of-day", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<DateTimePicker label="Тест" value="" onChange={onChange} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );
    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const panel = screen.getByText("Пн").closest(".min-w-\\[240px\\]");
    expect(panel).toBeTruthy();
    await user.click(
      within(panel as HTMLElement).getByRole("button", { name: "20" }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    const iso = onChange.mock.calls[0][0] as string;
    const next = new Date(iso);
    expect(next.getUTCDate()).toBe(20);
    expect(next.getUTCHours()).toBe(14);
    expect(next.getUTCMinutes()).toBe(30);
  });

  it("applies quick preset hour buttons", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<DateTimePicker label="Тест" value="" onChange={onChange} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );
    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const timeColumn = screen.getByText("Час").parentElement;
    expect(timeColumn).toBeTruthy();
    await user.click(
      within(timeColumn as HTMLElement).getByRole("button", {
        name: "12:00",
      }),
    );

    expect(onChange).toHaveBeenCalled();
    const next = new Date(onChange.mock.calls[0][0] as string);
    expect(next.getHours()).toBe(12);
    expect(next.getMinutes()).toBe(0);
  });

  it("moves to the next month when the right chevron is pressed", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateTimePicker label="Тест" value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );
    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const calendarHeader = screen
      .getByText(/червень/i)
      .closest(".flex.items-center.justify-between");
    expect(calendarHeader).toBeTruthy();
    const [, nextMonth] = within(calendarHeader as HTMLElement).getAllByRole(
      "button",
    );
    await user.click(nextMonth);

    await waitFor(() => {
      expect(screen.getByText(/липень/i)).toBeInTheDocument();
    });
  });
});
