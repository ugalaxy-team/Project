import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Повністю переписано на дизайн-змінні
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 border-2 border-transparent",
  accent:
    "bg-accent text-slate-900 shadow-lg shadow-accent/30 hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/40 border-2 border-transparent", // Жовта кнопка завжди має чорний текст для контрасту
  outline:
    "bg-transparent border-2 border-border text-text-main hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/15",
  ghost:
    "bg-transparent border-2 border-transparent text-text-muted hover:text-text-main hover:bg-border/50",
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
  className,
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
      className={cn(
        "relative flex items-center justify-center gap-2.5 font-quicksand font-bold rounded-full transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-70 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </motion.button>
  );
};
