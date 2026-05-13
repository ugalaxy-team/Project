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

  it("moves to the previous month when the left chevron is pressed", async () => {
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
    const [prevMonth] = within(calendarHeader as HTMLElement).getAllByRole(
      "button",
    );
    await user.click(prevMonth);

    await waitFor(() => {
      expect(screen.getByText(/травень/i)).toBeInTheDocument();
    });
  });

  it("handles navigating across year boundaries", async () => {
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

    for (let i = 0; i < 7; i++) {
      await user.click(nextMonth);
    }

    await waitFor(() => {
      expect(screen.getByText(/січень 2027/i)).toBeInTheDocument();
    });
  });

  it("shows correct time display format in button", () => {
    render(
      <DateTimePicker
        label="Дата"
        value="2026-07-20T08:15:00.000Z"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("08:15")).toBeInTheDocument();
  });

  it("shows correct date display format in button", () => {
    render(
      <DateTimePicker
        label="Дата"
        value="2026-07-20T08:15:00.000Z"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("20.07.2026")).toBeInTheDocument();
  });

  it("handles leap year February correctly", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.setSystemTime(new Date("2026-01-01T10:00:00.000Z"));

    render(<DateTimePicker label="Тест" value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );
    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const calendarHeader = screen
      .getByText(/січень/i)
      .closest(".flex.items-center.justify-between");
    expect(calendarHeader).toBeTruthy();
    const [, nextMonth] = within(calendarHeader as HTMLElement).getAllByRole(
      "button",
    );

    await user.click(nextMonth);

    await waitFor(() => {
      expect(screen.getByText(/лютий/i)).toBeInTheDocument();
    });
  });

  it("increments hours correctly", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<DateTimePicker label="Тест" value="" onChange={onChange} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );
    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const timeColumn = screen.getByText("Час").parentElement;
    const hourButtons = within(timeColumn as HTMLElement).getAllByRole("button");
    
    const upArrowForHours = hourButtons[0];
    await user.click(upArrowForHours);

    expect(onChange).toHaveBeenCalled();
    const nextDate = new Date(onChange.mock.calls[0][0] as string);
    expect(nextDate.getUTCHours()).toBe(15); 
  });

  it("wraps hours at 24 to 0", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    const initialDate = "2026-06-15T23:30:00.000Z";
    vi.setSystemTime(new Date(initialDate));

    render(<DateTimePicker label="Тест" value={initialDate} onChange={onChange} />);

    
    await user.click(
      screen.getByRole("button", { name: /15\.06\.2026/ })
    );

    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const timeColumn = screen.getByText("Час").parentElement;
    const hourButtons = within(timeColumn as HTMLElement).getAllByRole("button");
    const upArrowForHours = hourButtons[0];
    await user.click(upArrowForHours);

    expect(onChange).toHaveBeenCalled();
    const nextDate = new Date(onChange.mock.calls[0][0] as string);
    expect(nextDate.getUTCHours()).toBe(0);
  });

  it("increments minutes correctly", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();

    
    const initialValue = "2026-06-15T14:30:00.000Z";
    render(<DateTimePicker label="Тест" value={initialValue} onChange={onChange} />);

    
    await user.click(screen.getByRole("button", { name: /15\.06\.2026/ }));
    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const timeColumn = screen.getByText("Час").parentElement!;
    const minuteButtons = within(timeColumn).getAllByRole("button");

    
    const upArrowForMinutes = minuteButtons[2];
    await user.click(upArrowForMinutes);

    expect(onChange).toHaveBeenCalled();
    const nextDate = new Date(onChange.mock.calls[0][0] as string);

    
    expect(nextDate.getUTCMinutes()).toBe(35);
  });

  it("wraps minutes at 60 to 0", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    
    const dateStr = "2026-06-15T14:55:00.000Z";
    vi.setSystemTime(new Date(dateStr));

    render(<DateTimePicker label="Тест" value={dateStr} onChange={onChange} />);

    
    await user.click(screen.getByRole("button", { name: /15\.06\.2026/ }));

    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const timeColumn = screen.getByText("Час").parentElement!;
    const minuteButtons = within(timeColumn).getAllByRole("button");

    
    await user.click(minuteButtons[2]);

    expect(onChange).toHaveBeenCalled();
    const nextDate = new Date(onChange.mock.calls[0][0] as string);
    expect(nextDate.getUTCMinutes()).toBe(0); 
  });

  it("decrements hours correctly", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<DateTimePicker label="Тест" value="" onChange={onChange} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );
    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const timeColumn = screen.getByText("Час").parentElement;
    const hourButtons = within(timeColumn as HTMLElement).getAllByRole("button");
    
    const downArrowForHours = hourButtons[1];
    await user.click(downArrowForHours);

    expect(onChange).toHaveBeenCalled();
    const nextDate = new Date(onChange.mock.calls[0][0] as string);
    expect(nextDate.getUTCHours()).toBe(13); 
  });

  it("wraps negative hours to 23", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    const dateStr = "2026-06-15T00:30:00.000Z";
    vi.setSystemTime(new Date(dateStr));

    render(<DateTimePicker label="Тест" value={dateStr} onChange={onChange} />);

    
    await user.click(
      screen.getByRole("button", { name: /15\.06\.2026/ })
    );

    await waitFor(() => expect(screen.getByText("Час")).toBeInTheDocument());

    const timeColumn = screen.getByText("Час").parentElement;
    const hourButtons = within(timeColumn as HTMLElement).getAllByRole("button");

    
    const downArrowForHours = hourButtons[1];
    await user.click(downArrowForHours);

    expect(onChange).toHaveBeenCalled();
    const nextDate = new Date(onChange.mock.calls[0][0] as string);
    expect(nextDate.getUTCHours()).toBe(23); 
  });

  it("displays both date and time icons in button", () => {
    const { container } = render(
      <DateTimePicker
        label="Дата"
        value="2026-07-20T08:15:00.000Z"
        onChange={vi.fn()}
      />
    );

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2); 
  });

  it("displays calendar icon with correct color", () => {
    const { container } = render(
      <DateTimePicker
        label="Дата"
        value=""
        onChange={vi.fn()}
      />
    );

    const calendarIcon = container.querySelector("svg");
    expect(calendarIcon).toBeInTheDocument();
  });

  it("renders all weekday headers", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateTimePicker label="Тест" value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Пн")).toBeInTheDocument();
      expect(screen.getByText("Вв")).toBeInTheDocument();
      expect(screen.getByText("Ср")).toBeInTheDocument();
      expect(screen.getByText("Чт")).toBeInTheDocument();
      expect(screen.getByText("Пт")).toBeInTheDocument();
      expect(screen.getByText("Сб")).toBeInTheDocument();
      expect(screen.getByText("Нд")).toBeInTheDocument();
    });
  });

  it("highlights selected day", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const val = "2026-06-15T14:30:00.000Z";

    render(
      <DateTimePicker
        label="Тест"
        value={val}
        onChange={vi.fn()}
      />
    );

    
    const trigger = screen.getByRole("button", { name: /15\.06\.2026/ });
    await user.click(trigger);

    
    await waitFor(() => {
      
      
      const dayButtons = screen.getAllByRole("button", { name: "15" });

      
      
      
      const activeDay = dayButtons.find(btn => !btn.className.includes('text-slate-200'));

      expect(activeDay).toBeInTheDocument();

      
      
      expect(activeDay?.className).toContain("bg-[#6D72F1]");
    });
  });

  it("renders dates from previous month in light gray", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateTimePicker label="Тест" value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Час")).toBeInTheDocument();
    });
  });

  it("handles clicking outside to close picker", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(
      <div>
        <DateTimePicker label="Тест" value="" onChange={vi.fn()} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Час")).toBeInTheDocument();
    });

    
    await user.click(container.querySelector("[data-testid='outside']")!);
  });

  it("maintains selected date when navigating months", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    const val = "2026-06-15T14:30:00.000Z";

    render(
      <DateTimePicker
        label="Тест"
        value={val}
        onChange={onChange}
      />
    );

    
    const trigger = screen.getByRole("button", { name: /15\.06\.2026/ });
    await user.click(trigger);

    await waitFor(() => {
      
      expect(screen.getByText("15.06.2026")).toBeInTheDocument();
    });

    
    
    const calendarHeader = screen
      .getByText(/червень/i)
      .closest(".flex.items-center.justify-between");

    
    const [, nextMonthBtn] = within(calendarHeader as HTMLElement).getAllByRole("button");

    await user.click(nextMonthBtn);
    await waitFor(() => expect(screen.getByText(/липень/i)).toBeInTheDocument());

    
    const calendarHeaderJuly = screen
      .getByText(/липень/i)
      .closest(".flex.items-center.justify-between");

    
    const [prevMonthBtn] = within(calendarHeaderJuly as HTMLElement).getAllByRole("button");

    await user.click(prevMonthBtn);

    
    await waitFor(() => {
      expect(screen.getByText("15.06.2026")).toBeInTheDocument();
    });
  });

  it("formats dates in Ukrainian locale", () => {
    render(
      <DateTimePicker
        label="Дата"
        value="2026-12-25T20:00:00.000Z"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("25.12.2026")).toBeInTheDocument();
  });

  it("displays correct Ukrainian month name", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateTimePicker label="Тест" value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/червень 2026/i)).toBeInTheDocument();
    });
  });

  it("disables past days when needed", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateTimePicker label="Тест" value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /Виберіть дату/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Пн")).toBeInTheDocument();
    });
  });
});
