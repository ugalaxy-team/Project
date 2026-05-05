import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { Icon } from "./Icons";
import { BtnNext } from "./FormUI";
import type { RegFormData } from "../types";

interface StepSuccessProps {
  onHome: () => void;
}

export const StepSuccess: React.FC<StepSuccessProps> = ({ onHome }) => {
  const { t } = useTranslation("registration");
  const { watch } = useFormContext<RegFormData>();

  const isSolo = watch("format") === "solo";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-[60px] sm:py-[80px] px-5 flex flex-col items-center justify-center min-h-[400px]"
    >
      <div className="w-[80px] h-[80px] bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="font-quicksand font-extrabold text-[30px] sm:text-[36px] text-text-main tracking-[-0.02em] mb-4 transition-colors leading-tight">
        {isSolo
          ? t("success.titleSolo", "Ви успішно зареєстровані!")
          : t("success.title", "Команду зареєстровано!")}
      </h1>

      <p className="text-[16px] text-text-muted max-w-[440px] mx-auto mb-12 leading-relaxed font-medium transition-colors">
        {t(
          "success.desc",
          "Ваша заявка успішно надіслана. Очікуйте підтвердження на пошту або перевірте статус турніру в особистому кабінеті.",
        )}
      </p>

      <div className="w-full flex justify-center">
        <BtnNext
          onClick={onHome}
          className="w-full sm:w-auto sm:min-w-[280px] sm:px-12"
        >
          {t("success.homeBtn", "Повернутися на головну")} <Icon.ChevronRight />
        </BtnNext>
      </div>
    </motion.div>
  );
};
