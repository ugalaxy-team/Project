import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { useTranslation } from "react-i18next";

interface Ticket3DProps {
  eventTitle: string;
  format: "team" | "solo";
  teamName: string;
  captainName: string;
  members: { name: string }[];
}

const QR_PATTERN = [
  1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0,
  0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
];

export const Ticket3D: React.FC<Ticket3DProps> = ({
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

  const springCfg = { damping: 20, stiffness: 250 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);

  const rotateX = useTransform(smoothY, [0, 1], [10, -10]);
  const rotateY = useTransform(smoothX, [0, 1], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const isEmpty = !teamName;
  const isSolo = format === "solo";

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      className="relative z-10 w-[88%] max-w-[390px]"
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: "preserve-3d",
          filter:
            "drop-shadow(0 0 1px var(--color-border)) drop-shadow(0 20px 30px rgba(0,0,0,0.2)) drop-shadow(0 4px 10px rgba(0,0,0,0.1))",
        }}
        animate={isHovered ? {} : { y: [0, -10, 0] }}
        transition={
          isHovered
            ? { type: "spring", damping: 20, stiffness: 250 }
            : { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="rounded-[28px] relative overflow-hidden flex flex-col bg-transparent">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px",
              opacity: 0.04,
            }}
          />

          <div className="px-7 pt-7 pb-[10px] bg-bg-card relative z-10 transition-colors duration-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted mb-[3px] font-nunito transition-colors">
                  {t("ticket.label.event")}
                </div>
                <div className="font-bold text-[13px] text-primary font-nunito leading-snug max-w-[160px] transition-colors">
                  {eventTitle || "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted mb-[3px] font-nunito transition-colors">
                  {t("ticket.label.format")}
                </div>
                <div className="font-bold text-[13px] text-text-main font-nunito transition-colors">
                  {isSolo ? t("ticket.value.solo") : t("ticket.value.team")}
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted mb-1 font-nunito transition-colors">
              {isSolo ? t("ticket.label.player") : t("ticket.label.team")}
            </div>
            <div
              className={`font-nunito font-extrabold text-[22px] leading-tight tracking-[-0.02em] break-words min-h-[28px] transition-colors duration-300 ${
                isEmpty ? "text-text-muted/50" : "text-text-main"
              }`}
            >
              {teamName || t("ticket.value.empty")}
            </div>
          </div>

          <div className="relative h-[26px] w-full z-0">
            <div className="absolute left-0 top-0 bottom-0 w-[51%] overflow-hidden">
              <div className="absolute left-[-13px] top-0 w-[26px] h-[26px] rounded-full bg-transparent shadow-[0_0_0_999px_var(--color-bg-card)] transition-shadow duration-500" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[51%] overflow-hidden">
              <div className="absolute right-[-13px] top-0 w-[26px] h-[26px] rounded-full bg-transparent shadow-[0_0_0_999px_var(--color-bg-card)] transition-shadow duration-500" />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-7 right-7 border-t-[2px] border-dashed border-border/80 z-20 transition-colors duration-500" />
          </div>

          <div className="px-7 pt-[10px] pb-[18px] bg-bg-card relative z-10 transition-colors duration-500">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted mb-2.5 font-nunito transition-colors">
              {isSolo
                ? t("ticket.label.participant")
                : t("ticket.label.roster")}
            </div>
            <div className="flex flex-col gap-[7px]">
              <div className="flex items-center gap-2.5 bg-bg-body border border-border rounded-xl py-[9px] px-[13px] transition-colors duration-500">
                <span
                  className={`text-[10px] font-bold px-2 py-[3px] rounded-full font-nunito tracking-[0.06em] shrink-0 transition-colors ${
                    isSolo
                      ? "bg-primary/10 text-primary"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {isSolo ? t("ticket.badge.solo") : t("ticket.badge.captain")}
                </span>
                <span className="font-nunito font-bold text-[13px] text-text-main truncate transition-colors">
                  {captainName || "—"}
                </span>
              </div>

              {!isSolo && (
                <AnimatePresence>
                  {members.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2.5 bg-bg-body border border-border rounded-xl py-[9px] px-[13px] transition-colors duration-500"
                    >
                      <span className="text-[10px] font-bold px-2 py-[3px] rounded-full bg-primary/10 text-primary font-nunito tracking-[0.06em] shrink-0 transition-colors">
                        {t("ticket.badge.member")}
                      </span>
                      <span
                        className={`font-nunito font-bold text-[13px] truncate transition-colors ${
                          m.name ? "text-text-main" : "text-text-muted/60"
                        }`}
                      >
                        {m.name || t("ticket.value.waiting")}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          <div className="px-7 py-[14px] bg-bg-card relative z-10 transition-colors duration-500">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none transition-colors duration-500" />
            <div className="absolute top-0 left-0 right-0 border-t border-border/50 transition-colors duration-500" />

            <div className="relative z-10 flex justify-between items-center w-full">
              <div
                className="text-text-main transition-colors duration-500"
                style={{
                  width: 52,
                  height: 52,
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gridTemplateRows: "repeat(7, 1fr)",
                  gap: "1.5px",
                  opacity: 0.75,
                }}
              >
                {QR_PATTERN.map((on, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 1,
                      background: on ? "currentColor" : "transparent",
                    }}
                  />
                ))}
              </div>
              <div className="font-nunito font-extrabold text-[15px] text-text-main tracking-[-0.01em] transition-colors duration-500">
                {t("brand")}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
