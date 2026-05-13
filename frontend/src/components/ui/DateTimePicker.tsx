import React, { useState, Fragment } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  setHours,
  setMinutes,
  parseISO,
} from "date-fns";
import { uk } from "date-fns/locale";
import { Popover, Transition } from "@headlessui/react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";

interface DateTimePickerProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
}) => {
  const dateValue = value ? parseISO(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(dateValue));

  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: "end" }),
      shift({ padding: 10 }),
    ],
  });

  const updateDateTime = (newDate: Date) => {
    onChange(newDate.toISOString());
  };

  const handleDateClick = (day: Date) => {
    const nextDate = new Date(day);
    nextDate.setHours(dateValue.getHours());
    nextDate.setMinutes(dateValue.getMinutes());
    updateDateTime(nextDate);
  };

  const adjustTime = (type: "hours" | "minutes", amount: number) => {
    let nextDate = new Date(dateValue);
    if (type === "hours") {
      const newHours = (nextDate.getHours() + amount + 24) % 24;
      nextDate = setHours(nextDate, newHours);
    } else {
      const newMinutes = (nextDate.getMinutes() + amount + 60) % 60;
      nextDate = setMinutes(nextDate, newMinutes);
    }
    updateDateTime(nextDate);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let day = startDate;

    while (day <= endDate) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected = isSameDay(day, dateValue);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <button
            key={day.toString()}
            type="button"
            onClick={() => handleDateClick(cloneDay)}
            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all
              ${!isCurrentMonth ? "text-slate-200" : isSelected ? "bg-[#6D72F1] text-white shadow-lg shadow-[#6D72F1]/30" : "text-slate-600 hover:bg-slate-50 hover:text-[#6D72F1]"}
            `}
          >
            {format(day, "d")}
          </button>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>,
      );
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="relative pt-2">
      <span className="absolute top-0 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase z-10">
        {label}
      </span>

      <Popover className="relative">
        <Popover.Button
          ref={refs.setReference}
          className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none outline-none hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-left">
            <CalendarIcon size={14} className="text-[#6D72F1] shrink-0" />
            <span className="truncate">
              {value ? format(dateValue, "dd.MM.yyyy") : "Виберіть дату"}
            </span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 shrink-0">
            <Clock size={14} className="text-slate-400" />
            <span>{format(dateValue, "HH:mm")}</span>
          </div>
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-[210] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col md:flex-row min-w-max overflow-hidden"
          >
            <div className="p-4 min-w-[240px] bg-white relative z-10">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest capitalize">
                  {format(currentMonth, "LLLL yyyy", { locale: uk })}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Пн", "Вв", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
                  <div
                    key={d}
                    className="text-[9px] font-black text-slate-300 text-center uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {renderCalendar()}
            </div>

            <div className="p-5 bg-slate-50 flex flex-col items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 min-w-[140px]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Час
              </span>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => adjustTime("hours", 1)}
                    className="p-1 text-slate-300 hover:text-[#6D72F1] transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <div className="w-10 h-12 bg-white rounded-xl flex items-center justify-center text-lg font-black text-[#6D72F1] shadow-sm border border-slate-100">
                    {format(dateValue, "HH")}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustTime("hours", -1)}
                    className="p-1 text-slate-300 hover:text-[#6D72F1] transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <span className="text-slate-300 font-bold mb-1">:</span>

                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => adjustTime("minutes", 5)}
                    className="p-1 text-slate-300 hover:text-[#6D72F1] transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <div className="w-10 h-12 bg-white rounded-xl flex items-center justify-center text-lg font-black text-[#6D72F1] shadow-sm border border-slate-100">
                    {format(dateValue, "mm")}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustTime("minutes", -5)}
                    className="p-1 text-slate-300 hover:text-[#6D72F1] transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-1">
                {[9, 12, 18].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() =>
                      updateDateTime(
                        setMinutes(setHours(new Date(dateValue), h), 0),
                      )
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 hover:border-[#6D72F1] hover:text-[#6D72F1] transition-all"
                  >
                    {h}:00
                  </button>
                ))}
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
};

export default DateTimePicker;
