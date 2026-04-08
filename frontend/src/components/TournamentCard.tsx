import React from "react";
import { type Tournament } from "../data/mockTournaments";

const STATUS_CFG = {
  registration: {
    label: "Реєстрація",
    badgeBg: "bg-[#dcfce7]",
    badgeText: "text-[#15803d]",
    dot: "bg-[#22c55e]",
    gradFrom: "#34d399",
    gradTo: "#059669",
    icon: <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />,
    btnText: "Подати заявку",
    btnClass: "bg-primary text-white hover:bg-indigo-600 shadow-sm",
  },
  active: {
    label: "В процесі",
    badgeBg: "bg-[#fdf2f8]",
    badgeText: "text-[#be185d]",
    dot: "bg-pink-400",
    gradFrom: "#c084fc",
    gradTo: "#ec4899",
    icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    btnText: "Спостерігати",
    btnClass:
      "bg-transparent border-2 border-primary text-primary hover:bg-indigo-50",
  },
  completed: {
    label: "Завершено",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-500",
    dot: "bg-slate-400",
    gradFrom: "#94a3b8",
    gradTo: "#475569",
    icon: (
      <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
    ),
    btnText: "Переглянути результати",
    btnClass:
      "bg-slate-50 text-slate-400 border border-slate-200 cursor-default",
  },
};

const TAG_COLORS = {
  accent: "bg-[#fef3c7] text-[#92400e]",
  primary: "bg-indigo-50 text-primary",
  pink: "bg-pink-50 text-pink-700",
  light: "bg-slate-100 text-slate-500",
};

export const TournamentCard = ({
  status,
  title,
  tags,
  desc,
  teams,
  max,
  deadline,
}: Tournament) => {
  const cfg = STATUS_CFG[status];
  const pct = Math.min(100, Math.round((teams / max) * 100));
  const isFull = teams >= max;
  const gradId = `grad-${title.replace(/\s+/g, "-")}`;

  return (
    <div className="h-full bg-white rounded-[28px] border-[1.5px] border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="p-7 flex flex-col h-full">
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="shrink-0 w-11 h-11 flex items-center justify-center relative drop-shadow-md group-hover:rotate-6 transition-transform duration-300">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={cfg.gradFrom} />
                  <stop offset="100%" stopColor={cfg.gradTo} />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${gradId})`}
                d="M12 2l2.4 2.3 3.3-.4.8 3.2 2.9 1.7-1.8 2.8 1.8 2.8-2.9 1.7-.8 3.2-3.3-.4L12 22l-2.4-2.3-3.3.4-.8-3.2-2.9-1.7 1.8-2.8-1.8-2.8 2.9-1.7.8-3.2 3.3.4L12 2z"
              />
            </svg>
            <svg
              className="relative z-10 w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {cfg.icon}
            </svg>
          </div>
          <h3 className="font-quicksand text-[22px] font-extrabold leading-[1.2] flex-1 text-slate-900 line-clamp-2 min-h-[53px]">
            {title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3.5 h-[28px]">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-extrabold ${TAG_COLORS[tag.type]}`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        <p
          className="text-[15px] text-slate-500 leading-relaxed font-semibold mb-6 line-clamp-3 min-h-[68px]"
          title={desc}
        >
          {desc}
        </p>

        <div className="mt-auto">
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Команди
              </span>
              <span className="font-quicksand text-[20px] font-extrabold text-slate-900">
                {teams}{" "}
                <span className="text-[13px] text-slate-400">/ {max}</span>
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-accent" : "bg-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t-[1.5px] border-slate-100 mb-5">
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-500">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                className="w-4 h-4 opacity-65"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              До {deadline}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold shadow-sm ${cfg.badgeBg} ${cfg.badgeText}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          <button
            disabled={status === "completed"}
            className={`w-full py-3.5 rounded-xl font-quicksand text-[16px] font-extrabold transition-all duration-200 ${cfg.btnClass}`}
          >
            {cfg.btnText}
          </button>
        </div>
      </div>
    </div>
  );
};
