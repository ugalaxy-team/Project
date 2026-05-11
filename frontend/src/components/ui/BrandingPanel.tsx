import React from "react";

interface BrandingPanelProps {
  children?: React.ReactNode;
  className?: string;
  wavePosition?: "left" | "right";
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
  children,
  className = "",
  wavePosition = "left",
}) => {
  const isLeft = wavePosition === "left";

  return (
    <div
      className={`w-[44%] hidden md:flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-hero-from to-hero-to transition-colors duration-500 ${className}`}
    >
      <div className="absolute top-[8%] left-0 right-0 pointer-events-none overflow-hidden">
        <div className="flex w-max font-quicksand font-extrabold text-[130px] leading-[0.88] text-white/[0.05] whitespace-nowrap animate-marquee tracking-[-0.04em] select-none">
          <span>UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★&nbsp;</span>
          <span>UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★&nbsp;</span>
        </div>
      </div>

      <div className="absolute bottom-[8%] left-0 right-0 pointer-events-none overflow-hidden">
        <div className="flex w-max font-quicksand font-extrabold text-[130px] leading-[0.88] text-white/[0.05] whitespace-nowrap animate-marquee-reverse tracking-[-0.04em] select-none">
          <span>STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★&nbsp;</span>
          <span>STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★&nbsp;</span>
        </div>
      </div>

      <div
        className={`absolute top-0 w-[5vw] h-full z-10 pointer-events-none text-bg-body transition-colors duration-500 ${
          isLeft ? "-left-[1px]" : "-right-[1px]"
        }`}
      >
        <svg
          viewBox="0 0 100 1440"
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <path
            fill="currentColor"
            d={
              isLeft
                ? "M50,0 C70,320 70,420 50,720 C30,1020 30,1120 50,1440 L0,1440 L0,0 Z"
                : "M50,0 C30,320 30,420 50,720 C70,1020 70,1120 50,1440 L100,1440 L100,0 Z"
            }
          />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {children}
      </div>
    </div>
  );
};
