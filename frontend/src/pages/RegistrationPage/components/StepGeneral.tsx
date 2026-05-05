import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icons";
import { FieldInput, BtnNext } from "./FormUI";
import type { RegFormData, TournamentConfig } from "../types";

interface StepGeneralProps {
  cfg: TournamentConfig;
  captainDisplayName: string;
  captainEmail: string;
  onNext: () => void;
}

export const StepGeneral: React.FC<StepGeneralProps> = ({
  cfg,
  captainDisplayName,
  captainEmail,
  onNext,
}) => {
  const { t } = useTranslation("registration");
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RegFormData>();
  const [optOpen, setOptOpen] = useState(false);

  const format = watch("format");
  const isSolo = format === "solo";

  const isMixedFormat = cfg.minMembers === 1 && cfg.maxMembers > 1;

  const handleNextClick = () => {
    if (errors.customFields && !optOpen) setOptOpen(true);
    onNext();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-quicksand font-extrabold text-[32px] text-text-main tracking-[-0.02em] mb-2 transition-colors">
          {t("step1.title", "Ваша команда")}
        </h1>
        <div className="text-[15px] text-text-muted font-medium flex items-center flex-wrap gap-1.5 transition-colors">
          <span>{t("step1.subtitle", "для участі в турнірі:")}</span>
          <span className="text-primary font-bold transition-colors">
            {cfg.title}
          </span>
        </div>
      </div>

      {isMixedFormat && (
        <div className="mb-7">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-quicksand mb-3.5 transition-colors">
            {t("step1.format.label", "Формат участі")}
          </div>

          <div className="flex items-center bg-primary/5 border border-primary/10 p-1.5 rounded-[20px] transition-colors duration-300">
            {(["team", "solo"] as const).map((f) => {
              const isActive = format === f;

              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setValue("format", f)}
                  className={`relative flex-1 flex items-center justify-center h-[42px] rounded-xl text-[14px] font-bold tracking-wide transition-colors duration-300 select-none border-0 bg-transparent cursor-pointer z-10 ${
                    isActive
                      ? "text-text-main"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFormatBg"
                      className="absolute inset-0 bg-bg-card rounded-xl shadow-sm border border-black/5 dark:border-white/5"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-20 flex items-center gap-2 pt-[2px]">
                    {f === "team" ? <Icon.Team /> : <Icon.Solo />}
                    {f === "team"
                      ? t("step1.format.team", "Команда")
                      : t("step1.format.solo", "Соло")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-7">
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-quicksand mb-3.5 transition-colors">
          {isSolo
            ? t("step1.teamName.labelSolo", "Ваш ігровий нік / Назва")
            : t("step1.teamName.label", "Назва команди")}
        </div>
        <div>
          <FieldInput
            {...register("teamName")}
            placeholder={
              isSolo
                ? t(
                    "step1.teamName.placeholderSolo",
                    "Наприклад, T-Rex Destroyer",
                  )
                : t("step1.teamName.placeholder", "Наприклад, Космічні коти")
            }
            hasError={!!errors.teamName}
          />
          {errors.teamName && (
            <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
              {errors.teamName.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-quicksand mb-3.5 mt-8 transition-colors">
        {t("step1.captain.label", "Капітан")}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 flex gap-3 items-start text-[13px] text-text-main leading-relaxed mb-5 transition-colors">
        <span className="shrink-0 mt-[1px] text-primary">
          <Icon.Info />
        </span>
        <span className="opacity-80 font-medium">
          {t(
            "step1.captain.info",
            "Дані імпортовано з Google-акаунту. Ви можете оновити їх у налаштуваннях для автоматичного заповнення в майбутньому.",
          )}
        </span>
      </div>

      <div className="bg-bg-card border-2 border-primary/20 rounded-[20px] p-5 flex items-center gap-4 mb-6 transition-colors shadow-sm">
        <div className="w-[48px] h-[48px] bg-primary rounded-full flex items-center justify-center font-quicksand font-extrabold text-xl text-white shrink-0">
          {captainDisplayName[0]?.toUpperCase() ?? "А"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-quicksand font-bold text-[16px] text-text-main transition-colors mb-0.5">
            {captainDisplayName}
          </div>
          <div className="text-[13px] text-text-muted font-mono truncate transition-colors">
            {captainEmail}
          </div>
        </div>
        <div className="bg-primary/10 text-primary font-quicksand text-[12px] font-bold px-3.5 py-1.5 rounded-full shrink-0 transition-colors">
          {t("step1.captain.badge", "Капітан")}
        </div>
      </div>

      <div className="mb-5">
        <label className="block font-quicksand text-sm font-bold text-text-main mb-2.5 transition-colors">
          {t("step1.captain.fullNameLabel", "Повне ім'я (ПІБ)")}{" "}
          <span className="text-text-muted font-semibold text-xs ml-1">
            {t("step1.captain.ifDifferent", "(якщо відрізняється)")}
          </span>
        </label>
        <FieldInput
          {...register("captainFullName")}
          placeholder={t(
            "step1.captain.fullNamePlaceholder",
            "Андрій Іванченко",
          )}
        />
      </div>

      {cfg.customFields && cfg.customFields.length > 0 && (
        <div
          className={`bg-bg-card border-2 rounded-[20px] overflow-hidden mt-3 transition-all duration-300 ${
            optOpen ? "border-primary/30 shadow-sm" : "border-border"
          }`}
        >
          <button
            type="button"
            onClick={() => setOptOpen(!optOpen)}
            className="w-full px-5 py-[18px] flex items-center justify-between group cursor-pointer border-none bg-transparent outline-none"
          >
            <span
              className={`font-quicksand text-sm font-bold flex items-center gap-2.5 transition-colors ${
                optOpen
                  ? "text-primary"
                  : "text-text-muted group-hover:text-text-main"
              }`}
            >
              <Icon.Info />{" "}
              {t("step1.additional.title", "Додаткова інформація")}
            </span>
            <motion.span
              animate={{ rotate: optOpen ? 180 : 0 }}
              className={`transition-colors ${optOpen ? "text-primary" : "text-text-muted"}`}
            >
              <Icon.ChevronDown />
            </motion.span>
          </button>

          <AnimatePresence>
            {optOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-6 pt-1 space-y-5">
                  {cfg.customFields.map((field) => {
                    const fieldError =
                      errors.customFields?.[
                        field.id as keyof typeof errors.customFields
                      ];

                    return (
                      <div key={field.id}>
                        <label className="block font-quicksand text-sm font-bold text-text-main mb-2.5 transition-colors">
                          {field.label}{" "}
                          {field.required ? (
                            <span className="text-primary">*</span>
                          ) : (
                            <span className="text-text-muted text-xs ml-1">
                              {t(
                                "step1.additional.optional",
                                "(необов'язково)",
                              )}
                            </span>
                          )}
                        </label>
                        <FieldInput
                          {...register(`customFields.${field.id}` as any)}
                          placeholder={field.placeholder || ""}
                          hasError={!!fieldError}
                        />
                        {fieldError && (
                          <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
                            {fieldError.message as string}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex mt-10">
        <BtnNext onClick={handleNextClick}>
          <span>
            {isSolo
              ? t("step1.next.confirm", "Далі — Підтвердження")
              : t("step1.next.members", "Далі — Учасники")}
          </span>
          <Icon.ChevronRight />
        </BtnNext>
      </div>
    </div>
  );
};
