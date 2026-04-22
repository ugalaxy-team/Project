import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import type { FirebaseError } from "firebase/app";

import { auth } from "../../firebase";
import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { cn } from "../../utils/cn";

const resetSchema = z.object({
  email: z.string().email("Некоректний формат email"),
});

type ResetFormData = z.infer<typeof resetSchema>;

export const ForgotPassword = () => {
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
          ? "Користувача з таким email не знайдено."
          : "Сталася помилка. Спробуйте ще раз.",
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
            {/* Кнопка повернення тепер на своєму місці в потоці */}
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-400 hover:text-indigo-500 transition-colors mb-6 group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Повернутися до входу
            </Link>

            <div className="mb-6">
              <h2 className="font-quicksand font-extrabold text-[34px] text-slate-900 leading-[1.1] mb-2">
                Забули пароль?
              </h2>
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
                Введіть ваш email, і ми надішлемо посилання для відновлення
                доступу.
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
                  className="font-quicksand font-bold text-[14px] text-slate-900 block mb-2 px-1"
                >
                  Email адреса
                </label>
                <div className="relative group">
                  <Mail
                    className={cn(
                      "absolute left-5 top-1/2 -translate-y-1/2 transition-colors",
                      errors.email
                        ? "text-red-400"
                        : "text-slate-400 group-focus-within:text-indigo-500",
                    )}
                    size={20}
                  />
                  <input
                    id="reset-email"
                    className={cn(
                      "w-full pl-[52px] pr-5 py-3.5 bg-slate-50 border-2 rounded-full outline-none transition-all",
                      errors.email
                        ? "border-red-500"
                        : "border-slate-200 focus:border-indigo-500",
                    )}
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <span className="text-red-500 text-[12px] mt-2 block px-4 font-medium italic">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {firebaseError && (
                <div className="text-red-500 text-[14px] text-center font-medium bg-red-50 p-3 rounded-2xl border border-red-100">
                  {firebaseError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Надіслати посилання
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-2"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>

            <h2 className="font-quicksand font-extrabold text-[30px] text-slate-900 mb-3">
              Лист відправлено!
            </h2>
            <p className="text-[15px] font-medium text-slate-600 mb-8 leading-relaxed">
              Перевірте пошту. Ми надіслали посилання для відновлення пароля на
              вашу адресу.
            </p>

            <Link to="/auth" className="block w-full">
              <Button variant="outline" size="lg" className="w-full">
                Повернутися до входу
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
