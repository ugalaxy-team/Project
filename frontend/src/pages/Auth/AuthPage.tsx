import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth, google, syncUser } from "../../firebase";

import starAnimation from "../../../public/star.json";

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.1-1.92 3.31-4.74 3.31-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.58-2.77c-.98.66-2.23 1.06-3.7 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const authSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    displayName: z.string().optional(),
    email: z.string().email("Некоректний формат email"),
    password: z.string().min(8, "Мінімум 8 символів"),
  })
  .superRefine((data, ctx) => {
    if (
      data.mode === "register" &&
      (!data.displayName || data.displayName.length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Нікнейм обов'язковий (мінімум 2 символи)",
        path: ["displayName"],
      });
    }
  });

type AuthFormData = z.infer<typeof authSchema>;

export const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: "register",
      displayName: "",
      email: "",
      password: "",
    },
  });

  const passwordValue = watch("password");
  const isPasswordValid = passwordValue?.length >= 8;

  const toggleMode = (mode: "login" | "register") => {
    setIsLogin(mode === "login");
    setValue("mode", mode);
    setFirebaseError(null);
  };

  const onSubmit = async (data: AuthFormData) => {
    setFirebaseError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );
        await updateProfile(cred.user, { displayName: data.displayName });
        await syncUser(cred.user);
      }
      navigate("/");
    } catch (e) {
      const err = e as FirebaseError;
      if (err.code === "auth/email-already-in-use")
        setFirebaseError("Цей email вже використовується.");
      else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      )
        setFirebaseError("Невірний email або пароль.");
      else setFirebaseError("Сталася помилка. Спробуйте ще раз.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, google);
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 50s linear infinite; }
        .animate-marquee-reverse { animation: marquee 60s linear infinite reverse; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-inter">
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center relative overflow-hidden bg-indigo-500">
          <div className="absolute top-[15%] left-0 right-0 overflow-hidden pointer-events-none">
            <div className="flex w-max font-quicksand font-extrabold text-[17vw] leading-[0.88] text-white/5 whitespace-nowrap select-none animate-marquee">
              <span>
                UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★&nbsp;
              </span>
              <span>
                UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★&nbsp;
              </span>
            </div>
          </div>
          <div className="absolute bottom-[15%] left-0 right-0 overflow-hidden pointer-events-none">
            <div className="flex w-max font-quicksand font-extrabold text-[17vw] leading-[0.88] text-white/5 whitespace-nowrap select-none animate-marquee-reverse">
              <span>
                STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★&nbsp;
              </span>
              <span>
                STAR FOR LIFE ★ UGALAXY ★ STAR FOR LIFE ★ UGALAXY ★&nbsp;
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
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
            <div className="text-center mt-1">
              <div className="font-quicksand font-extrabold text-[64px] text-white leading-none tracking-tight">
                UGalaxy
              </div>
              <div className="text-yellow-400 font-extrabold text-[24px] leading-none">
                ×
              </div>
              <div className="font-quicksand font-bold text-[21px] text-white/85 tracking-widest uppercase">
                Star for Life
              </div>
            </div>
            <p className="mt-5 text-[15px] font-medium text-white/60 text-center max-w-[290px] leading-relaxed">
              Твоя історія починається тут. Створюй, втілюй, змінюй світ.
            </p>
          </div>

          {/* Легка, м'яка хвилька */}
          <div className="absolute top-0 -right-[1px] w-[6vw] h-full z-10 text-slate-50 pointer-events-none">
            <svg
              viewBox="0 0 100 1440"
              preserveAspectRatio="none"
              className="w-full h-full block"
            >
              <path
                fill="currentColor"
                d="M80,0 C65,320 65,420 80,720 C95,1020 95,1120 80,1440 L100,1440 L100,0 Z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
          <motion.div
            className="bg-white w-full max-w-[460px] rounded-[32px] p-8 md:p-11 shadow-[0_10px_40px_-8px_rgba(15,23,42,0.1)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 min-h-[76px]">
              <h2 className="font-quicksand font-extrabold text-[34px] text-slate-900 leading-[1.1] mb-1.5">
                {isLogin ? "З поверненням!" : "Створити акаунт"}
              </h2>
              <p className="text-[15px] font-medium text-slate-600">
                {isLogin
                  ? "Продовжуйте свій шлях в UGalaxy"
                  : "Готовий до нових челенджів?"}
              </p>
            </div>

            <div className="flex bg-slate-100 rounded-full p-1.5 relative mb-7">
              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm z-0"
                animate={{ x: isLogin ? "100%" : "0%" }}
              />
              <button
                type="button"
                className={`flex-1 py-3 font-quicksand font-bold text-[14px] rounded-full relative z-10 ${!isLogin ? "text-slate-900" : "text-slate-500"}`}
                onClick={() => toggleMode("register")}
              >
                Реєстрація
              </button>
              <button
                type="button"
                className={`flex-1 py-3 font-quicksand font-bold text-[14px] rounded-full relative z-10 ${isLogin ? "text-slate-900" : "text-slate-500"}`}
                onClick={() => toggleMode("login")}
              >
                Вхід
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="mb-4">
                      <label className="font-quicksand font-bold text-[14px] text-slate-900 block mb-2">
                        Нікнейм
                      </label>
                      <input
                        className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-full outline-none transition-all ${errors.displayName ? "border-red-500" : "border-slate-200 focus:border-indigo-500"}`}
                        type="text"
                        placeholder="Наприклад, izachoc"
                        {...register("displayName")}
                      />
                      {errors.displayName && (
                        <span className="text-red-500 text-[12px] mt-1 block px-2">
                          {errors.displayName.message}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-4">
                <label className="font-quicksand font-bold text-[14px] text-slate-900 block mb-2">
                  Email
                </label>
                <input
                  className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-full outline-none transition-all ${errors.email ? "border-red-500" : "border-slate-200 focus:border-indigo-500"}`}
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-red-500 text-[12px] mt-1 block px-2">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-quicksand font-bold text-[14px] text-slate-900">
                    Пароль
                  </label>
                  <Link
                    to="/forgot-password"
                    className={`text-[13px] font-semibold text-indigo-500 ${isLogin ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  >
                    Забули пароль?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <input
                    className={`w-full pl-5 pr-12 py-3.5 bg-slate-50 border-2 rounded-full outline-none transition-all ${errors.password ? "border-red-500" : passwordValue ? (isPasswordValid ? "border-indigo-500" : "border-red-500") : "border-slate-200 focus:border-indigo-500"}`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Мінімум 8 символів"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-4 text-slate-400 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-[12px] mt-1 block px-2">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {firebaseError && (
                <div className="text-red-500 text-[14px] text-center mb-4 font-medium">
                  {firebaseError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                {isLogin ? "Увійти" : "Зареєструватись"}
              </Button>

              <div className="flex items-center gap-3.5 my-5">
                <div className="flex-1 h-[1.5px] bg-slate-200"></div>
                <span className="text-[12px] font-semibold text-slate-400 tracking-widest uppercase">
                  або
                </span>
                <div className="flex-1 h-[1.5px] bg-slate-200"></div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full"
                leftIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
              >
                Вхід через Google
              </Button>

              <p className="text-center text-[12px] text-slate-400 font-medium mt-5">
                {isLogin ? "Входячи" : "Реєструючись"}, ти погоджуєшся з <br />
                <a
                  href="#"
                  className="text-indigo-500 font-semibold hover:underline"
                >
                  Умовами використання
                </a>{" "}
                та{" "}
                <a
                  href="#"
                  className="text-indigo-500 font-semibold hover:underline"
                >
                  Політикою конфіденційності
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};
