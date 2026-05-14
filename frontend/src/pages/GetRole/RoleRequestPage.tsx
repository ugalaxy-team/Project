import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify"; // Змінено на react-toastify для сумісності з App.tsx
import { Info, AlertTriangle, Check, CheckCircle2 } from "lucide-react";
import { useSelector } from "react-redux";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion, AnimatePresence } from "framer-motion";

import starAnimation from "../../../public/star-sing.json";
import type { RootState } from "@/store";
import { requestRole } from "@/api/requests/requestRole";
import { auth } from "@/firebase";
import { roleByName } from "@/config/appConfig";
import { Button } from "@/components/ui/Button";
import { BrandingPanel } from "@/components/ui/BrandingPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/utils/cn";

const roleRequestSchema = z.object({
  fullName: z.string().min(3, "form_errors.too_short"),
  contact: z.string().min(5, "form_errors.too_short"),
  age: z.string().min(1, "form_errors.required"),
  experience: z.string().min(10, "form_errors.too_short_text"),
  reason: z.string().min(10, "form_errors.too_short_text"),
  plans: z.string().min(10, "form_errors.too_short_text"),
});

type RoleRequestFormData = z.infer<typeof roleRequestSchema>;
type RoleOptionName =
  | "fullName"
  | "contact"
  | "age"
  | "experience"
  | "reason"
  | "plans";

interface RoleRequestOption {
  option_name: RoleOptionName;
  value: string;
}

interface MutationParams {
  role: string;
  currentUser: any;
  userId: number;
  info: RoleRequestOption[];
}

export const RoleRequestPage = () => {
  const { t } = useTranslation("roleRequest");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // Стан для екрану успіху

  const ORGANIZER_ROLE = roleByName.organizer;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RoleRequestFormData>({
    resolver: zodResolver(roleRequestSchema),
    defaultValues: {
      fullName: "",
      contact: "",
      age: "",
      experience: "",
      reason: "",
      plans: "",
    },
  });

  const expLen = watch("experience")?.length || 0;
  const reasonLen = watch("reason")?.length || 0;
  const plansLen = watch("plans")?.length || 0;

  const mutation = useMutation({
    mutationFn: ({ role, currentUser, userId, info }: MutationParams) =>
      requestRole(role, currentUser, userId, info),
    onSuccess: () => {
      setIsSubmitted(true); // Показуємо екран успіху замість редіректу
      toast.success(t("messages.success"), { toastId: "role-submit" });
    },
    onError: (error: any) => {
      if (
        error.response?.status === 400 &&
        error.response.data?.detail === "Role requests already exists!"
      ) {
        setSubmitError(t("messages.already_exists"));
      } else {
        setSubmitError(t("messages.error"));
      }
    },
  });

  const onSubmit = (data: RoleRequestFormData) => {
    setSubmitError(null);

    if (!user || !auth.currentUser) {
      setSubmitError(t("messages.no_user"));
      return;
    }

    const info: RoleRequestOption[] = [
      { option_name: "fullName", value: data.fullName },
      { option_name: "contact", value: data.contact },
      { option_name: "age", value: data.age },
      { option_name: "experience", value: data.experience },
      { option_name: "reason", value: data.reason },
      { option_name: "plans", value: data.plans },
    ];

    mutation.mutate({
      role: ORGANIZER_ROLE.name,
      currentUser: auth.currentUser,
      userId: user.id as number,
      info,
    });
  };

  const renderCharCounter = (len: number, min: number = 10) => {
    if (len === 0) {
      return (
        <span className="text-text-muted/50 font-medium">
          {t("form.min_chars")}
        </span>
      );
    }
    if (len < min) {
      return (
        <span className="text-amber-500 font-bold">
          {len} / {min} {t("form.min_suffix")}
        </span>
      );
    }
    return (
      <span className="text-primary font-bold flex items-center gap-1">
        {len} {t("form.chars_suffix")} <Check size={14} strokeWidth={3} />
      </span>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-body text-text-main font-inter transition-colors duration-300">
      <BrandingPanel wavePosition="right">
        <div className="relative z-20 flex flex-col items-center justify-center px-6">
          <Player
            autoplay
            loop
            src={starAnimation}
            style={{
              width: "240px",
              height: "240px",
              filter: "drop-shadow(0 16px 40px rgba(0, 0, 0, 0.25))",
            }}
          />

          <div className="text-center mt-2">
            <div className="font-nunito font-extrabold text-[64px] text-white leading-none tracking-tight">
              UGalaxy
            </div>
            <div className="text-accent font-extrabold text-[24px] leading-none my-1">
              ×
            </div>
            <div className="font-nunito font-bold text-[21px] text-white/85 tracking-widest uppercase">
              Star for Life
            </div>
          </div>

          <div className="mt-10 text-center max-w-[340px]">
            <p className="text-[15px] text-white/85 leading-relaxed mb-5">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </BrandingPanel>

      <div className="flex-1 relative flex items-center justify-center p-6 pt-20 md:p-8 overflow-y-auto">
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-3 z-20">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <motion.div
          className="bg-bg-card w-full max-w-[480px] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border transition-colors duration-300 mt-12 md:mt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              /* ЕКРАН УСПІХУ (Success State) */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
                <h2 className="font-nunito font-extrabold text-[32px] text-text-main mb-4 leading-tight">
                  {t("messages.success_title", "Заявку прийнято!")}
                </h2>
                <p className="text-[15px] text-text-muted mb-8 leading-relaxed px-4">
                  {t(
                    "messages.success_description",
                    "Дякуємо за твій інтерес. Ми ретельно розглянемо заявку і надішлемо відповідь найближчим часом.",
                  )}
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  {t("buttons.back_home", "На головну")}
                </Button>
              </motion.div>
            ) : (
              /* ФОРМА ЗАЯВКИ */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-6">
                  <h2 className="font-nunito font-extrabold text-[28px] md:text-[34px] text-text-main leading-[1.1] transition-colors">
                    {t("title")}
                  </h2>
                </div>

                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3 transition-colors">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[14px] text-primary font-bold leading-tight">
                    {t("info_banner")}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="mb-4">
                    <label
                      htmlFor="fullName"
                      className="font-nunito font-bold text-[14px] text-text-main block mb-2 transition-colors"
                    >
                      {t("form.fullName")}
                    </label>
                    <input
                      id="fullName"
                      className={cn(
                        "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-full outline-none transition-all",
                        errors.fullName
                          ? "border-red-500"
                          : "border-border focus:border-primary",
                      )}
                      type="text"
                      placeholder={t("form.placeholders.fullName")}
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <span className="text-red-500 text-[12px] mt-1 block px-2">
                        {t(errors.fullName.message as string)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="contact"
                        className="font-nunito font-bold text-[14px] text-text-main block mb-2 transition-colors"
                      >
                        {t("form.contact")}
                      </label>
                      <input
                        id="contact"
                        className={cn(
                          "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-full outline-none transition-all",
                          errors.contact
                            ? "border-red-500"
                            : "border-border focus:border-primary",
                        )}
                        type="text"
                        placeholder={t("form.placeholders.contact")}
                        {...register("contact")}
                      />
                      {errors.contact && (
                        <span className="text-red-500 text-[12px] mt-1 block px-2">
                          {t(errors.contact.message as string)}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="age"
                        className="font-nunito font-bold text-[14px] text-text-main block mb-2 transition-colors"
                      >
                        {t("form.age")}
                      </label>
                      <input
                        id="age"
                        className={cn(
                          "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-full outline-none transition-all",
                          errors.age
                            ? "border-red-500"
                            : "border-border focus:border-primary",
                        )}
                        type="number"
                        placeholder={t("form.placeholders.age")}
                        {...register("age")}
                      />
                      {errors.age && (
                        <span className="text-red-500 text-[12px] mt-1 block px-2">
                          {t(errors.age.message as string)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="experience"
                        className="font-nunito font-bold text-[14px] text-text-main transition-colors"
                      >
                        {t("form.experience")}
                      </label>
                      <div className="text-[12px] transition-colors">
                        {renderCharCounter(expLen)}
                      </div>
                    </div>
                    <textarea
                      id="experience"
                      rows={2}
                      className={cn(
                        "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-[24px] outline-none transition-all resize-y min-h-[60px]",
                        errors.experience
                          ? "border-red-500"
                          : "border-border focus:border-primary",
                      )}
                      placeholder={t("form.placeholders.experience")}
                      {...register("experience")}
                    />
                    {errors.experience && (
                      <span className="text-red-500 text-[12px] mt-1 block px-2">
                        {t(errors.experience.message as string)}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="reason"
                        className="font-nunito font-bold text-[14px] text-text-main transition-colors"
                      >
                        {t("form.reason")}
                      </label>
                      <div className="text-[12px] transition-colors">
                        {renderCharCounter(reasonLen)}
                      </div>
                    </div>
                    <textarea
                      id="reason"
                      rows={2}
                      className={cn(
                        "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-[24px] outline-none transition-all resize-y min-h-[80px]",
                        errors.reason
                          ? "border-red-500"
                          : "border-border focus:border-primary",
                      )}
                      placeholder={t("form.placeholders.reason")}
                      {...register("reason")}
                    />
                    {errors.reason && (
                      <span className="text-red-500 text-[12px] mt-1 block px-2">
                        {t(errors.reason.message as string)}
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="plans"
                        className="font-nunito font-bold text-[14px] text-text-main transition-colors"
                      >
                        {t("form.plans")}
                      </label>
                      <div className="text-[12px] transition-colors">
                        {renderCharCounter(plansLen)}
                      </div>
                    </div>
                    <textarea
                      id="plans"
                      rows={2}
                      className={cn(
                        "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-[24px] outline-none transition-all resize-y min-h-[80px]",
                        errors.plans
                          ? "border-red-500"
                          : "border-border focus:border-primary",
                      )}
                      placeholder={t("form.placeholders.plans")}
                      {...register("plans")}
                    />
                    {errors.plans && (
                      <span className="text-red-500 text-[12px] mt-1 block px-2">
                        {t(errors.plans.message as string)}
                      </span>
                    )}
                  </div>

                  {submitError && (
                    <div className="text-red-500 text-[13px] text-center mb-4 font-medium bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 flex items-center gap-2 justify-center transition-colors">
                      <AlertTriangle size={16} />
                      {submitError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={mutation.isPending}
                  >
                    {mutation.isPending
                      ? t("buttons.submitting")
                      : t("buttons.submit")}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
