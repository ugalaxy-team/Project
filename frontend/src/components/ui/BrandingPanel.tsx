import React from "react";
import { cn } from "../../utils/cn";

interface BrandingPanelProps {
  position?: "left" | "right";
  width?: "half" | "44%";
  children?: React.ReactNode;
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
  position = "left",
  width = "half",
  children,
}) => {
  const isRight = position === "right";

  return (
    <div
      className={cn(
        "hidden md:flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-hero-from to-hero-to",
        width === "44%" ? "md:w-[44%]" : "md:w-1/2",
      )}
    >
      <div className="absolute top-[15%] left-0 right-0 overflow-hidden pointer-events-none">
        <div className="flex w-max font-quicksand font-extrabold text-[17vw] leading-[0.88] text-white/5 whitespace-nowrap select-none animate-marquee">
          <span>UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★&nbsp;</span>
          <span>UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★&nbsp;</span>
        </div>
      </div>

      <div className="absolute bottom-[15%] left-0 right-0 overflow-hidden pointer-events-none">
        <div className="flex w-max font-quicksand font-extrabold text-[17vw] leading-[0.88] text-white/5 whitespace-nowrap select-none animate-marquee-reverse">
          <span>STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★&nbsp;</span>
          <span>STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★&nbsp;</span>
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center">{children}</div>

      <div
        className={cn(
          "absolute top-0 w-[6vw] h-full z-10 text-bg-body pointer-events-none transition-colors duration-500",
          isRight ? "-left-[1px] rotate-180" : "-right-[1px]",
        )}
      >
        <svg
          viewBox="0 0 100 1440"
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <path
            fill="currentColor"
            d="M80,0 C65,320 65,420 80,720 C95,1020 95,1120 80,1440 L100,1440 L100,0 Z"
          />
        </svg>
      </div>
    </div>
  );
};
