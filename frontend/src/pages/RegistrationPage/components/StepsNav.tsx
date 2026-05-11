import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { StepCircle } from "./FormUI";

interface StepsNavProps {
  step: number;
  isSolo: boolean;
}

export const StepsNav: React.FC<StepsNavProps> = ({ step, isSolo }) => {
  const { t } = useTranslation("registration");

  const stepState = (n: number): "active" | "done" | "idle" =>
    step === n ? "active" : step > n ? "done" : "idle";

  const steps = [
    { id: 1, label: t("nav.step_1"), actualStep: 1, visualNum: 1 },
    ...(!isSolo
      ? [
          {
            id: 2,
            label: t("nav.step_2"),
            actualStep: 2,
            visualNum: 2,
          },
        ]
      : []),
    {
      id: 3,
      label: t("nav.step_3"),
      actualStep: 3,
      visualNum: isSolo ? 2 : 3,
    },
  ];

  return (
    <div className="w-full px-6 lg:px-11 pt-7 pb-10 shrink-0">
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
        <AnimatePresence mode="popLayout">
          {steps.map((s, idx) => {
            const isLast = idx === steps.length - 1;
            const state = stepState(s.actualStep);

            return [
              <motion.div
                key={`step-${s.id}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center shrink-0 z-10"
              >
                <StepCircle num={s.visualNum} state={state} />

                <span
                  className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 whitespace-nowrap hidden sm:block font-nunito text-[15px] font-extrabold tracking-wide transition-colors duration-300 ${
                    state === "active"
                      ? "text-primary"
                      : state === "done"
                        ? "text-emerald-500"
                        : "text-text-muted/60"
                  }`}
                >
                  {s.label}
                </span>
              </motion.div>,

              !isLast && (
                <motion.div
                  key={`line-${s.id}`}
                  layout
                  className="flex-1 h-1 mx-3 sm:mx-4 rounded-full overflow-hidden bg-border relative min-w-[20px]"
                >
                  <motion.div
                    className="absolute inset-0 bg-emerald-500 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step > s.actualStep ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  />
                </motion.div>
              ),
            ];
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
