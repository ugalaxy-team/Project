import { type ReactNode } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { Link } from "react-router-dom";

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
  bgText: string;
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
    <section className="relative bg-primary pt-[60px] pb-[200px] flex flex-col items-center text-center px-5">
      <div className="absolute top-[10%] left-0 flex gap-8 text-[22vw] font-quicksand font-extrabold whitespace-nowrap pointer-events-none text-white/5 z-0 leading-[0.8] animate-marquee">
        <span>
          {bgText} ★ {bgText} ★&nbsp;
        </span>
        <span>
          {bgText} ★ {bgText} ★&nbsp;
        </span>
      </div>

      {badges.map((badge, index) => (
        <div
          key={index}
          className={`hidden lg:flex absolute z-20 px-7 py-3.5 rounded-[20px] font-quicksand font-extrabold text-[26px] whitespace-nowrap transition-transform duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:scale-110 hover:rotate-0 hover:cursor-default ${badge.className}`}
        >
          {badge.text}
        </div>
      ))}

      <div className="relative w-full max-w-[1320px] mx-auto px-5 flex flex-col items-center">
        <h1 className="relative z-10 leading-[1] uppercase tracking-[-0.04em] font-quicksand font-extrabold text-[clamp(60px,10vw,140px)] text-white mt-10">
          {title}
        </h1>

        <p className="relative z-10 text-[22px] font-medium max-w-[800px] mx-auto my-10 opacity-90 text-white font-inter">
          {description}
        </p>
      </div>

      {mascot && (
        <div className="absolute -bottom-[80px] left-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-accent rounded-full flex flex-col items-center justify-center z-20 shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-[8px] border-primary">
          <div className="absolute w-full h-full animate-[spin_15s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                id="circlePath"
                d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
                fill="none"
              />
              <text className="font-quicksand font-extrabold text-[10px] tracking-[2px] fill-dark-theme">
                <textPath href="#circlePath">{mascot.circularText}</textPath>
              </text>
            </svg>
          </div>

          <Player
            autoplay
            loop
            src={mascot.lottieSrc}
            style={{
              width: "140px",
              height: "140px",
              zIndex: 10,
              marginBottom: "10px",
            }}
          />

          <Link
            to={mascot.buttonLink}
            className="btn btn-primary absolute -bottom-6 px-8 py-3 text-base shadow-xl bg-primary text-white rounded-full font-quicksand font-bold hover:-translate-y-1 transition-transform"
          >
            {mascot.buttonText}
          </Link>
        </div>
      )}

      <div className="absolute -bottom-[1px] left-0 w-full leading-[0] z-0">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block h-[100px] w-[calc(100%+1.3px)]"
        >
          <path
            fill="var(--color-bg-body)"
            d="M0,50 C320,0 420,0 720,50 C1020,100 1120,100 1440,50 L1440,100 L0,100 Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};
