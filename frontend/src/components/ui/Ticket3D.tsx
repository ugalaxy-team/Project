import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "../../utils/cn";

interface TicketProps {
  eventTitle: string;
  format: string;
  teamName: string;
  captainName: string;
  members: { firstName: string }[];
}

export const Ticket3D: React.FC<TicketProps> = ({
  eventTitle,
  format,
  teamName,
  captainName,
  members,
}) => {
  const { t } = useTranslation("registration");
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 25, stiffness: 300 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      className="relative z-10 w-[88%] max-w-[390px] [perspective:900px]"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
        }}
        className={cn(
          // bg-bg-card замість bg-white
          "bg-bg-card rounded-[28px] shadow-2xl [transform-style:preserve-3d] transition-colors duration-300",
          !isHovered && "animate-[float_5s_ease-in-out_infinite]",
        )}
      >
        <div className="p-7 pb-5 bg-bg-card rounded-t-[28px] transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors duration-300">
                {t("ticket.event")}
              </div>
              <div className="text-primary font-bold text-[13px] transition-colors duration-300">
                {eventTitle}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors duration-300">
                {t("ticket.format")}
              </div>
              <div className="text-text-main font-bold text-[13px] transition-colors duration-300">
                {format === "team"
                  ? t("step1.formats.team")
                  : t("step1.formats.solo")}
              </div>
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 transition-colors duration-300">
            {t("ticket.team")}
          </div>
          <div
            className={cn(
              "text-[22px] font-extrabold leading-tight transition-colors duration-300",
              !teamName ? "text-text-muted/50" : "text-text-main",
            )}
          >
            {teamName || t("ticket.empty_team")}
          </div>
        </div>

        <div className="relative h-0.5 border-t border-dashed border-border mx-7 transition-colors duration-300">
          {/* bg-bg-body для дірок робить ефект "прозорості" */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-body rounded-full transition-colors duration-300" />
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-body rounded-full transition-colors duration-300" />
        </div>

        <div className="p-7 py-5 bg-bg-body transition-colors duration-300">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3 transition-colors duration-300">
            {t("ticket.composition")}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 px-3 bg-bg-card border border-border rounded-xl transition-colors duration-300">
              {/* Прозорі фони для беджів */}
              <span className="text-[10px] font-bold px-2 py-0.5 bg-accent/10 text-amber-600 dark:text-accent rounded-full transition-colors duration-300">
                {t("ticket.captain")}
              </span>
              <span className="text-[13px] font-bold text-text-main truncate transition-colors duration-300">
                {captainName}
              </span>
            </div>
            {members.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 px-3 bg-bg-card border border-border rounded-xl animate-in fade-in zoom-in-95 duration-300 transition-colors"
              >
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full transition-colors duration-300">
                  {t("ticket.member")}
                </span>
                <span className="text-[13px] font-bold text-text-main truncate transition-colors duration-300">
                  {m.firstName || "..."}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-7 py-4 bg-bg-card border-t border-border rounded-b-[28px] flex justify-between items-center transition-colors duration-300">
          <div className="w-12 h-12 bg-text-main/10 rounded-sm transition-colors duration-300" />
          <div className="font-quicksand font-extrabold text-text-main transition-colors duration-300">
            UGalaxy
          </div>
        </div>
      </motion.div>
    </div>
  );
};
