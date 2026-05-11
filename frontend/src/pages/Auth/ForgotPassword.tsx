import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sendPasswordResetEmail } from "firebase/auth";
import type { FirebaseError } from "firebase/app";

import { auth } from "../../firebase";
import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { cn } from "../../utils/cn";

const resetSchema = z.object({
  email: z.string().email("errors.email_invalid"), // Ключ для перекладу
});

type ResetFormData = z.infer<typeof resetSchema>;

export const ForgotPassword = () => {
  const { t } = useTranslation("auth"); // Підключаємо твій словник
  const [isSuccess, setIsSuccess] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ResetFormData) => {
    setFirebaseError(null);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsSuccess(true);
    } catch (e) {
      const err = e as FirebaseError;
      setFirebaseError(
        err.code === "auth/user-not-found"
          ? t("errors.user_not_found", "Користувача з таким email не знайдено.")
          : t("errors.unknown", "Сталася помилка. Спробуйте ще раз."),
      );
    }
  };

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-text-muted hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              {t("forgot.back_to_login", "Повернутися до входу")}
            </Link>

            <div className="mb-6">
              <h2 className="font-quicksand font-extrabold text-[34px] text-text-main leading-[1.1] mb-2 transition-colors">
                {t("forgot.title", "Забули пароль?")}
              </h2>
              <p className="text-[15px] font-medium text-text-muted leading-relaxed transition-colors">
                {t(
                  "forgot.subtitle",
                  "Введіть ваш email, і ми надішлемо посилання для відновлення доступу.",
                )}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="font-quicksand font-bold text-[14px] text-text-main block mb-2 px-1 transition-colors"
                >
                  {t("fields.email.label", "Email адреса")}
                </label>
                <div className="relative group">
                  <Mail
                    className={cn(
                      "absolute left-5 top-1/2 -translate-y-1/2 transition-colors",
                      errors.email
                        ? "text-red-500"
                        : "text-text-muted group-focus-within:text-primary",
                    )}
                    size={20}
                  />
                  <input
                    id="reset-email"
                    className={cn(
                      "w-full pl-[52px] pr-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-full outline-none transition-all",
                      errors.email
                        ? "border-red-500"
                        : "border-border focus:border-primary",
                    )}
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <span className="text-red-500 text-[12px] mt-2 block px-4 font-medium">
                    {t(errors.email.message as string)}
                  </span>
                )}
              </div>

              {firebaseError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-[14px] text-center font-medium bg-red-500/10 p-3 rounded-2xl border border-red-500/20"
                >
                  {firebaseError}
                </motion.div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full shadow-lg transition-all active:scale-[0.98]"
                isLoading={isSubmitting}
              >
                {t("forgot.submit", "Надіслати посилання")}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="relative w-20 h-20 mx-auto mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-green-500/20 rounded-full"
              />
              <div className="relative w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 border border-green-500/20 shadow-sm">
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
            </div>

            <h2 className="font-quicksand font-extrabold text-[28px] text-text-main mb-3 transition-colors">
              {t("forgot.success_title", "Лист відправлено!")}
            </h2>
            <p className="text-[15px] font-medium text-text-muted mb-8 leading-relaxed transition-colors">
              {t(
                "forgot.success_desc",
                'Перевірте пошту (і папку "Спам" про всяк випадок). Ми вже все надіслали!',
              )}
            </p>

            <Link to="/auth" className="block w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full"
              >
                {t("forgot.back_to_login", "Повернутися до входу")}
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
