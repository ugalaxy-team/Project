import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Icon } from "./Icons";
import { BtnNext, BtnBack } from "./FormUI";
import type { RegFormData, TournamentConfig } from "../types";

interface StepConfirmProps {
  cfg: TournamentConfig;
  capName: string;
  captainEmail: string;
  onBack: () => void;
  isSubmitting?: boolean;
  serverError?: string;
  formErrors?: any;
}

export const StepConfirm: React.FC<StepConfirmProps> = ({
  cfg,
  capName,
  captainEmail,
  onBack,
  isSubmitting,
  serverError,
  formErrors = {},
}) => {
  const { t } = useTranslation("registration");
  const { watch } = useFormContext<RegFormData>();
  const formValues = watch();

  const hasValidationErrors = Object.keys(formErrors).length > 0;

  return (
    <div>
      <h1 className="font-nunito font-extrabold text-[30px] text-text-main tracking-[-0.02em] mb-[5px] transition-colors">
        {t("step_3.title")}
      </h1>
      <p className="text-[15px] text-text-muted font-medium mb-6 transition-colors">
        {t("step_3.subtitle")}
      </p>

      {hasValidationErrors && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[14px] font-medium p-5 rounded-2xl mb-6">
          <div className="flex items-center gap-2 font-bold mb-2">
            <Icon.Warning size={18} />
            <span>{t("step_3.validation_summary")}</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 opacity-90">
            {Object.entries(formErrors).map(([key, value]: [string, any]) => (
              <li key={key}>
                <span className="font-bold">{key}:</span>{" "}
                {value?.message || t("step_3.invalid_value")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-medium p-4 rounded-2xl mb-5 flex items-center gap-3">
          <span className="shrink-0">
            <Icon.Warning size={16} />
          </span>
          {serverError}
        </div>
      )}

      <div className="bg-bg-card border-2 border-border rounded-[24px] overflow-hidden mb-5 transition-colors shadow-sm">
        <div className="bg-indigo-950 px-7 pt-7 pb-6 text-white relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-20px] font-nunito text-[60px] font-extrabold text-white/[0.03] tracking-[-0.03em] pointer-events-none select-none uppercase">
            {t("brand")}
          </div>
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase opacity-60 mb-1.5 font-nunito relative z-10">
            {cfg.title}
          </div>
          <div className="font-nunito font-extrabold text-[24px] tracking-[-0.01em] leading-tight relative z-10">
            {formValues.teamName || capName}
          </div>
        </div>

        <div className="px-7 py-2">
          <div className="py-4 border-b border-border last:border-b-0 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="text-primary">
                <Icon.User size={16} />
              </div>
              <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-text-muted font-nunito">
                {t("step_3.labels.captain")}
              </div>
            </div>
            <div className="ml-7 text-sm font-semibold text-text-main">
              {capName}{" "}
              <span className="text-text-muted font-normal mx-1.5">•</span>{" "}
              {captainEmail}
            </div>
          </div>

          {(formValues.members?.length ?? 0) > 0 && (
            <div className="py-4 border-b border-border last:border-b-0 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-primary">
                  <Icon.Users size={16} />
                </div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-text-muted font-nunito">
                  {t("step_3.labels.members")}
                </div>
              </div>

              <div className="ml-7 space-y-4">
                {formValues.members?.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="text-sm font-semibold text-text-main">
                      {m.name}{" "}
                      <span className="text-text-muted font-normal mx-1.5">
                        •
                      </span>{" "}
                      {m.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 flex gap-3 items-start text-[13px] text-text-main leading-relaxed mb-8 transition-colors">
        <span className="shrink-0 mt-[1px] text-primary">
          <Icon.Info size={16} />
        </span>
        <span className="opacity-80 font-medium">{t("step_3.warning")}</span>
      </div>

      <div className="flex gap-3 mt-10">
        <BtnBack onClick={onBack} disabled={isSubmitting} />
        <BtnNext disabled={isSubmitting || hasValidationErrors}>
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Icon.Check size={20} strokeWidth={3} />
          )}
          {isSubmitting ? t("step_3.submitting") : t("step_3.submit_btn")}
        </BtnNext>
      </div>
    </div>
  );
};
