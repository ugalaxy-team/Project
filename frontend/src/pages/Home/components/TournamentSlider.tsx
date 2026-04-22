import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TournamentCard } from "../../../components/TournamentCard";
import { TOURNAMENTS_DATA } from "../../../data/mockTournaments";
import { Button } from "../../../components/ui/Button"; // Підключаємо наш еталонний компонент

export const TournamentSlider = () => {
  const { t } = useTranslation("home"); // Додано локалізацію
  const sliderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    // Змінено bg-bg-body та text-text-main для адаптивності
    <section className="bg-bg-body text-text-main relative pt-[120px] pb-[60px] md:pt-[10px] md:pb-[100px] w-full overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-[1320px] mx-auto px-4 md:px-5 relative z-10">
        <div className="mb-8 md:mb-14 flex flex-col md:flex-row justify-between items-center md:items-end gap-4 md:gap-6">
          <h2 className="text-[28px] sm:text-[32px] md:text-[52px] lg:text-[64px] leading-[1.1] uppercase font-quicksand font-extrabold text-text-main whitespace-normal md:whitespace-nowrap text-center md:text-left transition-colors duration-300">
            {t("slider.title", "Знайди свій турнір")}
          </h2>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => navigate("/tournaments")}
          >
            {t("slider.all_tournaments", "Всі турніри")}
          </Button>
        </div>

        <div
          className="relative mt-8 md:mt-14"
          onMouseEnter={() => (isPaused.current = true)}
          onMouseLeave={() => (isPaused.current = false)}
          onTouchStart={() => (isPaused.current = true)}
          onTouchEnd={() => (isPaused.current = false)}
        >
          {/* Стрілки переведені на bg-bg-card та border-border */}
          <button
            onClick={handlePrev}
            className="absolute -left-4 xl:-left-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-bg-card shadow-lg shadow-primary/10 text-primary rounded-full hidden md:flex items-center justify-center transition-all hover:scale-110 hover:shadow-primary/20 border border-border"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-5 h-5 md:w-6 md:h-6 pr-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <div
            className="w-full overflow-x-auto no-scrollbar snap-x snap-mandatory py-6 md:py-10 -my-6 md:-my-10"
            ref={sliderRef}
          >
            <div className="flex gap-6 w-max px-2 pt-2">
              {TOURNAMENTS_DATA.map((card) => (
                <div
                  key={card.id}
                  // ДОДАНО group: Це вирішує проблему дьоргання мишки!
                  className="group tournament-card-wrapper shrink-0 snap-center md:snap-start w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[408px]"
                >
                  {/* Підстрибує внутрішній блок, а зовнішній (group) залишається нерухомим і тримає hover */}
                  <div className="h-full transition-transform duration-300 ease-out group-hover:-translate-y-2 md:group-hover:-translate-y-4">
                    <TournamentCard {...card} />
                  </div>
                </div>
              ))}
              <div className="w-6 md:w-20 shrink-0"></div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute -right-4 xl:-right-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-bg-card shadow-lg shadow-primary/10 text-primary rounded-full hidden md:flex items-center justify-center transition-all hover:scale-110 hover:shadow-primary/20 border border-border"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-5 h-5 md:w-6 md:h-6 pl-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mt-8 md:mt-12">
          {/* Трек прогрес-бару тепер bg-border */}
          <div className="w-full max-w-[180px] md:max-w-[240px] h-1.5 bg-border rounded-full overflow-hidden relative transition-colors duration-300">
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
