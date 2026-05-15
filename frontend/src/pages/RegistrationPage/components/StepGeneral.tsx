import React from "react";
import { useFormContext } from "react-hook-form";
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
    formState: { errors },
  } = useFormContext<RegFormData>();

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

      <div className="mb-7">
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-nunito mb-3.5 transition-colors">
          {t("step_1.team_name.label")}
        </div>
        <div>
          <FieldInput
            {...register("teamName")}
            placeholder={t("step_1.team_name.placeholder")}
            hasError={!!errors.teamName}
          />
          {errors.teamName && (
            <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
              {errors.teamName.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-7">
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-nunito mb-3.5 transition-colors">
          {t("step_1.team_phone.label")} <span className="text-primary">*</span>
        </div>
        <div>
          <FieldInput
            {...register("teamPhone")}
            placeholder={t("step_1.team_phone.placeholder")}
            type="tel"
            hasError={!!errors.teamPhone}
          />
          {errors.teamPhone && (
            <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
              {errors.teamPhone.message}
            </p>
          )}
        </div>
      </div>

      <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-nunito mb-3.5 mt-8 transition-colors">
        {t("step_1.captain.label")}
      </div>

      <div className="bg-bg-card border-2 border-primary/20 rounded-[20px] p-5 flex items-center gap-4 mb-6 transition-colors shadow-sm">
        <div className="w-[48px] h-[48px] bg-primary rounded-full flex items-center justify-center font-nunito font-extrabold text-xl text-white shrink-0">
          {captainDisplayName[0]?.toUpperCase() ?? "U"}
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

      <div className="space-y-5">
        <div>
          <label className="block font-nunito text-sm font-bold text-text-main mb-2.5 transition-colors">
            {t("step_1.captain.full_name_label")}
          </label>
          <FieldInput
            {...register("captainFullName")}
            placeholder={t("step_1.captain.full_name_placeholder")}
            hasError={!!errors.captainFullName}
          />
          {errors.captainFullName && (
            <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
              {errors.captainFullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-nunito text-sm font-bold text-text-main mb-2.5 transition-colors">
            {t("step_1.captain.telegram_label")}{" "}
            <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Icon.Telegram className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <FieldInput
              {...register("captainTelegram")}
              placeholder={t("step_1.captain.telegram_placeholder")}
              className="pl-12"
              hasError={!!errors.captainTelegram}
            />
          </div>
          {errors.captainTelegram && (
            <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
              {errors.captainTelegram.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-nunito text-sm font-bold text-text-main mb-2.5 transition-colors">
            {t("step_1.captain.institution_label")}{" "}
            <span className="text-primary">*</span>
          </label>
          <FieldInput
            {...register("captainInstitution")}
            placeholder={t("step_1.captain.institution_placeholder")}
            hasError={!!errors.captainInstitution}
          />
          {errors.captainInstitution && (
            <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
              {errors.captainInstitution.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex mt-10">
        <BtnNext onClick={onNext}>
          <span>{t("step_1.next.members")}</span>
          <Icon.ChevronRight size={18} strokeWidth={2.5} />
        </BtnNext>
      </div>
    </div>
  );
};
