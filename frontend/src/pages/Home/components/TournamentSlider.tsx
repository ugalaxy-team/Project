import React, { useEffect, useRef, useCallback } from "react";
import { TournamentCard } from "../../../components/TournamentCard";

const CARDS_DATA = [
  {
    title: "Турнір бравл старс",
    description:
      "Бла-бла-бла, леон бравл старс, мільйон гемів і т.д. БАГААААААААТО ТЕКСТУУУУУУУУУУУУУУУ",
    buttonText: "Показати скіл",
    buttonClass: "btn-primary",
    tags: [
      { label: "Битва", type: "accent" as const },
      { label: "Екшин", type: "pink" as const },
    ],
  },
  {
    title: "24 години челендж",
    description:
      "Любите поїсти? Ми пропонуємо турнір, протягом 24 годин ви повинні з'їсти 100 пачок картоплі фрі.",
    buttonText: "ням-ням",
    buttonClass: "btn-outline",
    buttonStyle: {
      color: "var(--color-primary)",
      borderColor: "var(--color-primary)",
    },
    tags: [
      {
        label: "Їжа",
        type: "custom" as const,
        customStyle: { background: "var(--color-primary)", color: "white" },
      },
      { label: "Макдональдс", type: "light" as const },
    ],
  },
  {
    title: "Бокс у костюмах динозаврів",
    description:
      "Звичайні бойові мистецтва це надто серйозно. А от вийти на ринг, будучи двометровим надувним тиранозавром весело, вхвххв",
    buttonText: "Ррррр!",
    buttonClass: "btn-accent",
    cardStyle: { backgroundColor: "#14532d", color: "white" },
    tags: [
      {
        label: "Спорт",
        type: "custom" as const,
        customStyle: { background: "rgba(255, 255, 255, 0.2)", color: "white" },
      },
      { label: "T-Rex", type: "accent" as const },
    ],
  },
  {
    title: "Забіг синіх їжаків",
    description:
      "Одягаємо колючі сині перуки, червоні кросівки і біжимо на впередки, збираючи розкидані металеві кільця. Головне правило - не врізатися в дерева на надзвуковій швидкості, на страховку грошей нема.",
    buttonText: "ГААААЗУЙ",
    buttonClass: "btn-primary",
    cardStyle: {
      backgroundColor: "#1e3a8a",
      color: "white",
      border: "2px solid #fbbf24",
    },
    tags: [
      { label: "Біг", type: "accent" as const },
      { label: "Розваги", type: "light" as const },
    ],
  },
  {
    title: "Екстремальний продаж",
    description:
      "Ви на міському ярмарку. Ваша мета - продати багато плетених вушиків за дві години людям, які прийшли 'просто подивитися'. Дозволено використовувати будь-які методи переконання.",
    buttonText: "Підписатись",
    buttonClass: "btn-outline",
    buttonStyle: {
      color: "#d97706",
      borderColor: "#d97706",
    },
    tags: [
      {
        label: "Бізнес",
        type: "custom" as const,
        customStyle: { background: "#d97706", color: "white" },
      },
      { label: "Нерви", type: "pink" as const },
    ],
  },
  {
    title: "Лабораторія геніальних сестер",
    description:
      "Вас замикають у кімнаті з купою незрозумілих хімікатів, дивними винаходами та собакою, що розмовляє. Завдання: зробити зілля перетворення на халка і втекти",
    buttonText: "В путь",
    buttonClass: "btn-primary",
    tags: [
      { label: "Хімія", type: "pink" as const },
      { label: "Веселощі", type: "accent" as const },
    ],
  },
  {
    title: "Ідей більше нема",
    description:
      "Ех, мені лінь далі думати, просто текст на відчепись, аби було гарно і красиво, усьо",
    buttonText: "Реєстрація",
    buttonClass: "btn-primary",
    tags: [
      { label: "Ідеї", type: "light" as const },
      { label: "Думи", type: "light" as const },
    ],
  },
];

export const TournamentSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const isPaused = useRef(false);
  const progressRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const DURATION = 5000;
  const GAP = 24;

  const getScrollAmount = useCallback(() => {
    if (!sliderRef.current) return 0;
    const card = sliderRef.current.querySelector(".tournament-card-wrapper");
    if (!card) return 434;
    return card.clientWidth + GAP;
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollAmount = getScrollAmount();

    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 20) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
    progressRef.current = 0;
  }, [getScrollAmount]);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollAmount = getScrollAmount();

    if (slider.scrollLeft <= 10) {
      slider.scrollTo({ left: slider.scrollWidth, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
    progressRef.current = 0;
  }, [getScrollAmount]);

  useEffect(() => {
    const updateAnimation = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPaused.current) {
        progressRef.current += (deltaTime / DURATION) * 100;
        if (progressRef.current >= 100) {
          handleNext();
          progressRef.current = 0;
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progressRef.current}%`;
        }
      }
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    requestRef.current = requestAnimationFrame(updateAnimation);
    return () => cancelAnimationFrame(requestRef.current);
  }, [handleNext]);

  return (
    <section className="bg-bg-body text-dark-theme relative py-[100px] w-full overflow-hidden">
      <div className="w-full max-w-[1320px] mx-auto px-5 relative z-10">
        <div className="mb-14 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6">
          <h2 className="text-[32px] md:text-[52px] lg:text-[64px] leading-[1.1] uppercase font-quicksand font-extrabold text-dark-theme whitespace-nowrap">
            Обери свій напрямок
          </h2>
          <button className="btn btn-dark shrink-0 mb-2">Всі завдання</button>
        </div>

        <div
          className="group relative mt-14"
          onMouseEnter={() => (isPaused.current = true)}
          onMouseLeave={() => (isPaused.current = false)}
        >
          <button
            onClick={handlePrev}
            className="absolute -left-4 xl:-left-20 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white shadow-2xl text-primary rounded-full hidden md:flex items-center justify-center transition-all hover:scale-110 border border-slate-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-6 h-6 pr-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <div
            className="w-full overflow-x-auto no-scrollbar snap-x snap-mandatory py-10 -my-10"
            ref={sliderRef}
          >
            <div className="flex gap-6 w-max px-2">
              {CARDS_DATA.map((card, index) => (
                <div
                  key={index}
                  className="tournament-card-wrapper shrink-0 snap-start w-[85vw] md:w-[45vw] lg:w-[408px] transition-all duration-300 hover:-translate-y-6"
                >
                  <TournamentCard {...card} />
                </div>
              ))}
              <div className="w-10 md:w-20 shrink-0"></div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute -right-4 xl:-right-20 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white shadow-2xl text-primary rounded-full hidden md:flex items-center justify-center transition-all hover:scale-110 border border-slate-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-6 h-6 pl-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mt-12">
          <div className="w-full max-w-[240px] h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              ref={progressBarRef}
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100 ease-linear"
              style={{ width: "0%" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};
