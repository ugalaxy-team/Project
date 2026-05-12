import { ClockIcon } from "../../icons";

export const PlaceholderTab = () => (
  <div className="animate-[fadeIn_0.4s_ease_forwards] flex flex-col items-center justify-center text-center py-16">
    <div className="w-[100px] h-[100px] bg-slate-50/80 rounded-full flex justify-center items-center text-slate-300 mb-8 shadow-inner">
      <ClockIcon />
    </div>
    <h2 className="text-[28px] md:text-[32px] mb-4 text-dark-theme font-quicksand font-bold">
      В розробці...
    </h2>
    <p className="max-w-[420px] text-slate-500 text-[17px] leading-relaxed">
      Інформація для цього розділу наразі готується. Повертайтеся трохи згодом,
      ми вже працюємо над цим!
    </p>
  </div>
);
