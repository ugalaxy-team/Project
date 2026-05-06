import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { sendPasswordResetEmail } from "firebase/auth";
import type { FirebaseError } from "firebase/app";

import { auth } from "../../firebase";
import { Button } from "../../components/ui";

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
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (email: string) => sendPasswordResetEmail(auth, email),
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (e: FirebaseError) => {
      setFirebaseError(
        e.code === "auth/user-not-found"
          ? "Користувача з таким email не знайдено."
          : "Сталася помилка. Спробуйте ще раз.",
      );
    },
  });

  const onSubmit = (data: ResetFormData) => {
    setFirebaseError(null);
    mutation.mutate(data.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 font-inter p-6 text-slate-900">
      <motion.div
        className="bg-white/80 backdrop-blur-xl w-full max-w-[440px] rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] border border-white/20 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-400 hover:text-indigo-500 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Повернутися до входу
        </Link>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 shadow-inner">
                <KeyRound size={28} strokeWidth={2.5} />
              </div>

              <h2 className="font-quicksand font-extrabold text-[32px] text-slate-900 leading-[1.1] mb-3">
                Забули пароль?
              </h2>
              <p className="text-[15px] font-medium text-slate-500 mb-8 leading-relaxed">
                Не хвилюйтесь! Введіть email, пов'язаний з вашим акаунтом, і ми
                надішлемо вам посилання.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="font-quicksand font-bold text-[14px] text-slate-900 block mb-2 px-1">
                    Email адреса
                  </label>
                  <div className="relative group">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                        errors.email
                          ? "text-red-400"
                          : "text-slate-400 group-focus-within:text-indigo-500"
                      }`}
                      size={20}
                    />
                    <input
                      className={`w-full pl-12 pr-5 py-3.5 bg-white border-2 rounded-full outline-none transition-all ${
                        errors.email
                          ? "border-red-500 focus:ring-4 ring-red-50"
                          : "border-slate-100 focus:border-indigo-500 focus:ring-4 ring-indigo-50"
                      }`}
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
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[14px] text-center font-medium bg-red-50 p-3 rounded-2xl border border-red-100"
                  >
                    {firebaseError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98]"
                  isLoading={mutation.isPending}
                >
                  Надіслати посилання
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
                  className="absolute inset-0 bg-green-200 rounded-full"
                />
                <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100 shadow-sm">
                  <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="font-quicksand font-extrabold text-[28px] text-slate-900 mb-3">
                Лист відправлено!
              </h2>
              <p className="text-[15px] font-medium text-slate-500 mb-8 leading-relaxed">
                Перевірте пошту (і папку "Спам" про всяк випадок). Ми вже все
                надіслали!
              </p>

              <Link to="/auth" className="block w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-slate-200 hover:bg-slate-50"
                >
                  Повернутися до входу
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
