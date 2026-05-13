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
        <h1 className="font-nunito font-extrabold text-[32px] text-text-main tracking-[-0.02em] mb-2 transition-colors">
          {t("step_1.title")}
        </h1>
        <div className="text-[15px] text-text-muted font-medium flex items-center flex-wrap gap-1.5 transition-colors">
          <span>{t("step_1.subtitle")}</span>
          <span className="text-primary font-bold transition-colors">
            {cfg.title}
          </span>
        </div>
      </div>

      {isMixedFormat && (
        <div className="mb-7">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-nunito mb-3.5 transition-colors">
            {t("step_1.format.label")}
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
                    {f === "team" ? (
                      <Icon.Team size={18} />
                    ) : (
                      <Icon.Solo size={18} />
                    )}
                    {f === "team"
                      ? t("step_1.format.team")
                      : t("step_1.format.solo")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-7">
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-nunito mb-3.5 transition-colors">
          {isSolo
            ? t("step_1.team_name.label_solo")
            : t("step_1.team_name.label")}
        </div>
        <div>
          <FieldInput
            {...register("teamName")}
            placeholder={
              isSolo
                ? t("step_1.team_name.placeholder_solo")
                : t("step_1.team_name.placeholder")
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

      <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-nunito mb-3.5 mt-8 transition-colors">
        {t("step_1.captain.label")}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 flex gap-3 items-start text-[13px] text-text-main leading-relaxed mb-5 transition-colors">
        <span className="shrink-0 mt-[1px] text-primary">
          <Icon.Info size={16} />
        </span>
        <span className="opacity-80 font-medium">
          {t("step_1.captain.info")}
        </span>
      </div>

      <div className="bg-bg-card border-2 border-primary/20 rounded-[20px] p-5 flex items-center gap-4 mb-6 transition-colors shadow-sm">
        <div className="w-[48px] h-[48px] bg-primary rounded-full flex items-center justify-center font-nunito font-extrabold text-xl text-white shrink-0">
          {captainDisplayName[0]?.toUpperCase() ?? "А"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-nunito font-bold text-[16px] text-text-main transition-colors mb-0.5">
            {captainDisplayName}
          </div>
          <div className="text-[13px] text-text-muted font-mono truncate transition-colors">
            {captainEmail}
          </div>
        </div>
        <div className="bg-primary/10 text-primary font-nunito text-[12px] font-bold px-3.5 py-1.5 rounded-full shrink-0 transition-colors">
          {t("step_1.captain.badge")}
        </div>
      </div>

      <div className="mb-5">
        <label className="block font-nunito text-sm font-bold text-text-main mb-2.5 transition-colors">
          {t("step_1.captain.full_name_label")}{" "}
          <span className="text-text-muted font-semibold text-xs ml-1">
            {t("step_1.captain.if_different")}
          </span>
        </label>
        <FieldInput
          {...register("captainFullName")}
          placeholder={t("step_1.captain.full_name_placeholder")}
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
              className={`font-nunito text-sm font-bold flex items-center gap-2.5 transition-colors ${
                optOpen
                  ? "text-primary"
                  : "text-text-muted group-hover:text-text-main"
              }`}
            >
              <Icon.Info size={16} /> {t("step_1.additional.title")}
            </span>
            <motion.span
              animate={{ rotate: optOpen ? 180 : 0 }}
              className={`transition-colors ${optOpen ? "text-primary" : "text-text-muted"}`}
            >
              <Icon.ChevronDown size={18} />
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
                        <label className="block font-nunito text-sm font-bold text-text-main mb-2.5 transition-colors">
                          {field.label}{" "}
                          {field.required ? (
                            <span className="text-primary">*</span>
                          ) : (
                            <span className="text-text-muted text-xs ml-1">
                              {t("step_1.additional.optional")}
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
            {isSolo ? t("step_1.next.confirm") : t("step_1.next.members")}
          </span>
          <Icon.ChevronRight size={18} strokeWidth={2.5} />
        </BtnNext>
      </div>
    </div>
  );
};
