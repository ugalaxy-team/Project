import { type ReactNode } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

interface Badge {
  text: string;
  className: string;
}

interface MascotProps {
  circularText: string;
  lottieSrc: string;
  buttonText: string;
  buttonLink: string;
}

interface HeroProps {
  bgText?: string;
  title: ReactNode;
  description: string;
  badges?: Badge[];
  mascot?: MascotProps;
}

export const Hero = ({
  bgText,
  title,
  description,
  badges = [],
  mascot,
}: HeroProps) => {
  return (
    <section
      className={cn(
        "relative bg-gradient-to-br from-hero-from to-hero-to flex flex-col items-center justify-center text-center px-5 transition-all duration-500",
        mascot
          ? "pt-[140px] md:pt-[200px] pb-[180px] md:pb-[160px] mb-[80px] md:mb-[150px] min-h-[400px] overflow-x-clip"
          : "pt-[110px] md:pt-[150px] pb-[70px] md:pb-[100px] mb-[40px] md:mb-[80px] min-h-[260px] overflow-hidden",
      )}
    >
      {bgText && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 flex gap-4 md:gap-8 text-[40vw] sm:text-[35vw] md:text-[25vw] lg:text-[22vw] font-nunito font-extrabold whitespace-nowrap pointer-events-none text-white/5 z-0 leading-[0.8] animate-marquee select-none">
          <span>
            {bgText} ★ {bgText} ★&nbsp;
          </span>
          <span>
            {bgText} ★ {bgText} ★&nbsp;
          </span>
          <span>
            {bgText} ★ {bgText} ★&nbsp;
          </span>
        </div>
      )}

      {badges.map((badge, index) => {
        const posClasses = badge.className
          .split(" ")
          .filter((c) => c.match(/^(top|bottom|left|right|xl:|lg:)/))
          .join(" ");
        const styleClasses = badge.className
          .split(" ")
          .filter((c) => !c.match(/^(top|bottom|left|right|xl:|lg:)/))
          .join(" ");

        return (
          <div
            key={index}
            className={cn(
              "hidden lg:block absolute z-20 group cursor-default",
              posClasses,
            )}
          >
            <div
              className={cn(
                "px-7 py-3.5 rounded-[22px] font-nunito font-extrabold text-[26px] whitespace-nowrap shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out",
                "group-hover:scale-110 group-hover:-translate-y-5 group-hover:rotate-0 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.2)]",
                styleClasses,
              )}
            >
              {badge.text}
            </div>
          </div>
        );
      })}

      <div className="relative w-full max-w-[1320px] mx-auto px-2 md:px-5 flex flex-col items-center z-10">
        <h1 className="leading-[1.1] md:leading-[1] uppercase tracking-[-0.04em] font-nunito font-extrabold text-[clamp(42px,10vw,140px)] text-white drop-shadow-sm transition-all duration-500">
          {title}
        </h1>
        <p className="text-[16px] md:text-[22px] font-medium max-w-[800px] mx-auto mt-6 mb-10 md:mb-12 opacity-90 text-white font-inter px-2 transition-all duration-500">
          {description}
        </p>
      </div>

      {mascot && (
        <div className="absolute -bottom-[70px] md:-bottom-[80px] left-1/2 -translate-x-1/2 w-[220px] h-[220px] md:w-[280px] md:h-[280px] bg-accent rounded-full flex flex-col items-center justify-center z-30 shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] border-[6px] md:border-[8px] border-hero-from transition-all duration-500 group">
          <div className="absolute w-full h-full animate-[spin_15s_linear_infinite] select-none pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                id="circlePath"
                d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
                fill="none"
              />
              <text className="font-nunito font-extrabold text-[10px] tracking-[2.2px] fill-dark-theme/80">
                <textPath href="#circlePath">{mascot.circularText}</textPath>
              </text>
            </svg>
          </div>
          <div className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] z-10 mb-2 md:mb-3 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-110">
            <Player
              autoplay
              loop
              src={mascot.lottieSrc}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <Link
            to={mascot.buttonLink}
            className="absolute -bottom-5 md:-bottom-6 px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base shadow-xl hover:shadow-primary/40 bg-primary text-white rounded-full font-nunito font-bold hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap z-40"
          >
            {mascot.buttonText}
          </Link>
        </div>
      )}

      <div className="absolute -bottom-[1px] left-0 w-full leading-[0] z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block h-[60px] md:h-[100px] w-[calc(100%+1.3px)]"
        >
          <path
            fill="var(--color-bg-body)"
            d="M0,50 C320,0 420,0 720,50 C1020,100 1120,100 1440,50 L1440,100 L0,100 Z"
            className="transition-all duration-500"
          />
        </svg>
      </div>
    </section>
  );
};
