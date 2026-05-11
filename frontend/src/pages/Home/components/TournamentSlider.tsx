import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Dices, ArrowLeft, ArrowRight } from "lucide-react";
import { TournamentCard } from "../../../components/TournamentCard";
import { TOURNAMENTS_DATA } from "../../../data/mockTournaments";
import { Button } from "../../../components/ui/Button";

const CORNERS = [
  "-top-[2px] -left-[2px] border-t-[3px] border-l-[3px] rounded-tl-[28px]",
  "-top-[2px] -right-[2px] border-t-[3px] border-r-[3px] rounded-tr-[28px]",
  "-bottom-[2px] -left-[2px] border-b-[3px] border-l-[3px] rounded-bl-[28px]",
  "-bottom-[2px] -right-[2px] border-b-[3px] border-r-[3px] rounded-br-[28px]",
];

const WinnerCrosshair = () => (
  <motion.div
    initial={{ opacity: 0, scale: 1.04 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="absolute inset-0 z-50 pointer-events-none"
  >
    <motion.div
      className="absolute -inset-[2px] rounded-[30px] border border-primary/30"
      animate={{ opacity: [0.35, 0.85, 0.35] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    />
    {CORNERS.map((cls, i) => (
      <motion.div
        key={i}
        className={`absolute w-9 h-9 border-primary ${cls}`}
        initial={{ opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: i * 0.05,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    ))}
  </motion.div>
);

export const TournamentSlider = () => {
  const { t } = useTranslation("home");
  const sliderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const isPaused = useRef(false);
  const progressRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const DURATION = 5000;
  const GAP = 24;

  const activeTournaments = useMemo(() => {
    return TOURNAMENTS_DATA.filter((t) => t.status === "registration");
  }, []);

  const getScrollAmount = useCallback(() => {
    if (!sliderRef.current) return 0;
    const card = sliderRef.current.querySelector(".tournament-card-wrapper");
    if (!card) return 434;
    return card.clientWidth + GAP;
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current || isSpinning) return;
    const slider = sliderRef.current;
    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 20) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
    }
    progressRef.current = 0;
  }, [getScrollAmount, isSpinning]);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current || isSpinning) return;
    const slider = sliderRef.current;
    if (slider.scrollLeft <= 10) {
      slider.scrollTo({ left: slider.scrollWidth, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
    }
    progressRef.current = 0;
  }, [getScrollAmount, isSpinning]);

  useEffect(() => {
    const updateAnimation = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPaused.current && !isSpinning && !winnerId) {
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
  }, [handleNext, isSpinning, winnerId]);

  const startRoulette = () => {
    if (!sliderRef.current || isSpinning || activeTournaments.length === 0)
      return;
    setIsSpinning(true);
    setWinnerId(null);
    progressRef.current = 0;
    if (progressBarRef.current) progressBarRef.current.style.width = "0%";

    const slider = sliderRef.current;
    const cards = Array.from(
      slider.querySelectorAll(".tournament-card-wrapper"),
    ) as HTMLElement[];
    if (cards.length === 0) return;

    let jumps = 0;
    const maxJumps = 12;

    const jumpInterval = setInterval(() => {
      const randomScroll =
        Math.random() * (slider.scrollWidth - slider.clientWidth);
      slider.scrollTo({ left: randomScroll, behavior: "auto" });
      jumps++;

      if (jumps >= maxJumps) {
        clearInterval(jumpInterval);

        const winnerIndex = Math.floor(
          Math.random() * activeTournaments.length,
        );
        const winnerCard = cards[winnerIndex];
        const winnerData = activeTournaments[winnerIndex];

        const centerPos =
          winnerCard.offsetLeft -
          slider.clientWidth / 2 +
          winnerCard.clientWidth / 2;

        const startScroll = slider.scrollLeft;
        const distance = centerPos - startScroll;
        const startTime = performance.now();
        const duration = 2800;

        const animateSlowDown = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 5);

          slider.scrollLeft = startScroll + distance * easeProgress;

          if (progress < 1) {
            requestAnimationFrame(animateSlowDown);
          } else {
            setIsSpinning(false);
            setWinnerId(winnerData.id.toString());
          }
        };
        requestAnimationFrame(animateSlowDown);
      }
    }, 120);
  };

  if (activeTournaments.length === 0) {
    return null;
  }

  return (
    <section className="bg-bg-body text-text-main relative pt-[120px] pb-[60px] md:pt-[10px] md:pb-[100px] w-full overflow-hidden transition-colors duration-500">
      <div
        className={`absolute inset-0 bg-bg-body/70 backdrop-blur-[2px] z-10 transition-all duration-700 pointer-events-none ${
          isSpinning || winnerId ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      <div className="w-full max-w-[1320px] mx-auto px-4 md:px-5 relative z-20">
        <div className="mb-8 md:mb-14 flex flex-col lg:flex-row justify-between items-center gap-6">
          <h2 className="text-[28px] sm:text-[32px] md:text-[52px] lg:text-[64px] leading-[1.1] uppercase font-inter font-extrabold text-text-main text-center lg:text-left transition-colors duration-500">
            {winnerId ? t("slider.winner_title") : t("slider.title")}
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative z-30">
            <Button
              variant={winnerId ? "outline" : "primary"}
              size="lg"
              className="w-full sm:w-auto min-w-[240px] transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={winnerId ? () => setWinnerId(null) : startRoulette}
              isLoading={isSpinning}
              leftIcon={
                !isSpinning && !winnerId ? (
                  <Dices strokeWidth={2} className="w-5 h-5" />
                ) : undefined
              }
            >
              <span className="w-full text-center">
                {isSpinning
                  ? t("slider.button.spinning")
                  : winnerId
                    ? t("slider.button.reset")
                    : t("slider.button.random")}
              </span>
            </Button>
          </div>
        </div>

        <div
          className="relative mt-8 md:mt-14"
          onMouseEnter={() => (isPaused.current = true)}
          onMouseLeave={() => (isPaused.current = false)}
          onTouchStart={() => (isPaused.current = true)}
          onTouchEnd={() => (isPaused.current = false)}
        >
          <button
            onClick={handlePrev}
            className={`absolute -left-4 xl:-left-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-bg-card shadow-lg shadow-primary/10 text-primary rounded-full md:flex items-center justify-center transition-all hover:scale-110 border border-border hidden ${
              isSpinning || winnerId
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            <ArrowLeft strokeWidth={2.5} className="w-6 h-6 pr-0.5" />
          </button>

          <div
            className={`w-full overflow-x-auto no-scrollbar snap-x py-10 -my-10 transition-all duration-700 relative z-30 ${
              isSpinning ? "pointer-events-none" : "snap-mandatory"
            }`}
            ref={sliderRef}
          >
            <div className="flex gap-6 w-max px-2 pt-4 pb-12">
              {activeTournaments.map((card) => {
                const isWinner = winnerId === card.id.toString();
                const isLoser = winnerId && !isWinner;

                return (
                  <div
                    key={card.id}
                    className={`relative group tournament-card-wrapper shrink-0 snap-center snap-always md:snap-start w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[408px] transition-all duration-700 ease-out origin-center
                      ${
                        isSpinning
                          ? "-skew-x-2 scale-[0.98] opacity-60 blur-[1px]"
                          : ""
                      }
                      ${
                        isLoser
                          ? "opacity-20 blur-[3px] scale-90 pointer-events-none grayscale"
                          : ""
                      }
                      ${isWinner ? "scale-105 z-30" : ""}
                    `}
                  >
                    <div
                      className={`relative h-full rounded-[28px] transition-all duration-500 bg-bg-card border border-transparent
                      ${
                        !winnerId && !isSpinning
                          ? "group-hover:-translate-y-3 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                          : ""
                      }
                      ${
                        isWinner
                          ? "shadow-[0_0_60px_rgba(var(--color-primary),0.35)] ring-2 ring-primary ring-offset-4 ring-offset-bg-body"
                          : ""
                      }
                    `}
                    >
                      <TournamentCard {...card} />
                      {isWinner && <WinnerCrosshair />}
                    </div>
                  </div>
                );
              })}
              <div className="w-6 md:w-20 shrink-0"></div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className={`absolute -right-4 xl:-right-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-bg-card shadow-lg shadow-primary/10 text-primary rounded-full md:flex items-center justify-center transition-all hover:scale-110 border border-border hidden ${
              isSpinning || winnerId
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            <ArrowRight strokeWidth={2.5} className="w-6 h-6 pl-0.5" />
          </button>
        </div>

        <div
          className={`flex justify-center mt-4 transition-opacity duration-500 relative z-30 ${
            isSpinning || winnerId
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <div className="w-full max-w-[240px] h-1.5 bg-border rounded-full overflow-hidden relative">
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
