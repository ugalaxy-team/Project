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
        <Icon.Check size={36} strokeWidth={2.5} className="text-emerald-500" />
      </div>

      <h1 className="font-nunito font-extrabold text-[30px] sm:text-[36px] text-text-main tracking-[-0.02em] mb-4 transition-colors leading-tight">
        {isSolo ? t("success.title_solo") : t("success.title")}
      </h1>

      <p className="text-[16px] text-text-muted max-w-[440px] mx-auto mb-12 leading-relaxed font-medium transition-colors">
        {t("success.desc")}
      </p>

      <div className="w-full flex justify-center">
        <BtnNext
          onClick={onHome}
          className="w-full sm:w-auto sm:min-w-[280px] sm:px-12"
        >
          {t("success.home_btn")}{" "}
          <Icon.ChevronRight size={18} strokeWidth={2.5} />
        </BtnNext>
      </div>
    </motion.div>
  );
};
