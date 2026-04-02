import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-500 text-white shadow-[0_12px_28px_rgba(99,102,241,0.35)] hover:bg-indigo-600 hover:shadow-[0_16px_32px_rgba(99,102,241,0.4)] border-2 border-transparent",
  accent:
    "bg-amber-400 text-slate-900 shadow-[0_12px_28px_rgba(251,191,36,0.3)] hover:bg-amber-500 hover:shadow-[0_16px_32px_rgba(251,191,36,0.4)] border-2 border-transparent",
  outline:
    "bg-transparent border-2 border-slate-200 text-slate-900 hover:border-indigo-200 hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)]",
  ghost:
    "bg-transparent border-2 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-5 text-[14px]",
  md: "py-3.5 px-6 text-[15px]",
  lg: "py-4 px-10 text-[17px]",
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      disabled={isDisabled}
      className={`
        relative flex items-center justify-center gap-2.5 font-quicksand font-bold rounded-full transition-colors duration-200
        disabled:opacity-70 disabled:pointer-events-none outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </motion.button>
  );
};
