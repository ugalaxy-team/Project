import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icons";

export const StepCircle = ({
  num,
  state,
}: {
  num: number;
  state: "active" | "done" | "idle";
}) => (
  <div
    className={`w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full border-2 flex items-center justify-center font-nunito font-extrabold text-[15px] sm:text-[18px] shrink-0 transition-all duration-300 ${
      state === "active"
        ? "border-primary bg-primary text-white ring-4 ring-primary/20 sm:ring-[5px] scale-110"
        : state === "done"
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-border bg-bg-card text-text-muted/60"
    }`}
  >
    {state === "done" ? <Icon.Check size={20} strokeWidth={3} /> : num}
  </div>
);

export const FieldInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    hasError?: boolean;
    isValid?: boolean;
  }
>(({ hasError, isValid, className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-5 py-[13px] bg-bg-card border-2 rounded-[16px] font-inter text-[15px] font-medium text-text-main outline-none placeholder:text-text-muted placeholder:font-normal transition-all duration-300 focus:border-primary focus:bg-bg-body focus:shadow-[0_0_0_4px_rgba(var(--color-primary),0.12)] disabled:bg-bg-body disabled:text-text-muted disabled:cursor-not-allowed ${
      hasError
        ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
        : ""
    } ${isValid ? "border-emerald-500" : ""} ${!hasError && !isValid ? "border-border hover:border-border/80" : ""} ${className}`}
    {...props}
  />
));
FieldInput.displayName = "FieldInput";

export const BtnNext = ({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <motion.button
    type={onClick ? "button" : "submit"}
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={`flex-1 py-[15px] px-6 bg-primary text-white rounded-full font-nunito text-[16px] font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer ${className}`}
  >
    {children}
  </motion.button>
);

export const BtnBack = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation("registration");
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="py-[15px] px-[22px] bg-transparent border-2 border-border rounded-full font-nunito text-[15px] font-bold text-text-muted flex items-center gap-1.5 transition-all duration-300 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <Icon.ChevronLeft size={18} strokeWidth={2.5} /> {t("pagination.prev")}
    </motion.button>
  );
};
