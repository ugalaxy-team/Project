import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";

import { auth, google, syncUser } from "../../firebase";
import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/layouts/AuthLayout";
import { cn } from "../../utils/cn";
import { GoogleIcon } from "../../components/icons/BrandIcons";

const authSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    displayName: z.string().optional(),
    email: z.string().email("errors.email_invalid"),
    password: z.string().min(8, "errors.pass_short"),
  })
  .superRefine((data, ctx) => {
    if (
      data.mode === "register" &&
      (!data.displayName || data.displayName.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.nick_required",
        path: ["displayName"],
      });
    }
  });

type AuthFormData = z.infer<typeof authSchema>;

export const AuthPage = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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
      mode: "login",
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
        await updateProfile(cred.user, {
          displayName: data.displayName?.trim(),
        });
        await syncUser(cred.user);
      }
      navigate("/");
    } catch (e) {
      const err = e as FirebaseError;
      setFirebaseError(
        err.code === "auth/email-already-in-use"
          ? t("errors.email_in_use")
          : err.code === "auth/invalid-credential"
            ? t("errors.invalid_creds")
            : t("errors.unknown"),
      );
    }
  };

  const handleGoogleLogin = async () => {
    setFirebaseError(null);
    try {
      const cred = await signInWithPopup(auth, google);

      await syncUser(cred.user);

      navigate("/");
    } catch (e) {
      const err = e as FirebaseError;
      if (err.code !== "auth/popup-closed-by-user") {
        setFirebaseError(t("errors.unknown"));
        console.error("Google Auth Error:", err);
      }
    }
  };

  return (
    <AuthLayout>
      <div className="mb-4 min-h-[76px]">
        <h2 className="font-nunito font-extrabold text-[34px] text-text-main leading-[1.1] mb-1.5 transition-colors">
          {isLogin ? t("title_login") : t("title_register")}
        </h2>
        <p className="text-[15px] font-medium text-text-muted transition-colors">
          {isLogin ? t("subtitle_login") : t("subtitle_register")}
        </p>
      </div>

      <div
        role="tablist"
        className="flex bg-border/50 rounded-full p-1.5 relative mb-3 transition-colors"
      >
        <motion.div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-bg-card rounded-full shadow-sm z-0"
          animate={{ x: isLogin ? "100%" : "0%" }}
        />
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          className={cn(
            "flex-1 py-3 font-nunito font-bold text-[14px] rounded-full relative z-10 transition-colors",
            !isLogin ? "text-text-main" : "text-text-muted",
          )}
          onClick={() => toggleMode("register")}
        >
          {t("tabs.register")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          className={cn(
            "flex-1 py-3 font-nunito font-bold text-[14px] rounded-full relative z-10 transition-colors",
            isLogin ? "text-text-main" : "text-text-muted",
          )}
          onClick={() => toggleMode("login")}
        >
          {t("tabs.login")}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AnimatePresence initial={false}>
          {!isLogin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div className="mb-4">
                <label
                  htmlFor="displayName"
                  className="font-nunito font-bold text-[14px] text-text-main block mb-2 transition-colors"
                >
                  {t("fields.nickname.label")}
                </label>
                <input
                  id="displayName"
                  className={cn(
                    "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-full outline-none transition-all",
                    errors.displayName
                      ? "border-red-500"
                      : "border-border focus:border-primary",
                  )}
                  type="text"
                  placeholder={t("fields.nickname.placeholder")}
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <span className="text-red-500 text-[12px] mt-1 block px-2">
                    {t(errors.displayName.message as string)}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="font-nunito font-bold text-[14px] text-text-main block mb-2 transition-colors"
          >
            {t("fields.email.label")}
          </label>
          <input
            id="email"
            className={cn(
              "w-full px-5 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-full outline-none transition-all",
              errors.email
                ? "border-red-500"
                : "border-border focus:border-primary",
            )}
            type="email"
            placeholder={t("fields.email.placeholder")}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-[12px] mt-1 block px-2">
              {t(errors.email.message as string)}
            </span>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="password"
              className="font-nunito font-bold text-[14px] text-text-main transition-colors"
            >
              {t("fields.password.label")}
            </label>
            <Link
              to="/auth/forgot-password"
              className={cn(
                "text-[13px] font-semibold text-primary transition-opacity hover:underline",
                isLogin ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              {t("fields.password.forgot")}
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              id="password"
              className={cn(
                "w-full pl-5 pr-12 py-3.5 bg-bg-body text-text-main placeholder:text-text-muted/50 border-2 rounded-full outline-none transition-all",
                errors.password || (passwordValue && !isPasswordValid)
                  ? "border-red-500"
                  : "border-border focus:border-primary",
              )}
              type={showPassword ? "text" : "password"}
              placeholder={t("fields.password.placeholder")}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-4 text-text-muted hover:text-text-main transition-colors p-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-500 text-[12px] mt-1 block px-2">
              {t(errors.password.message as string)}
            </span>
          )}
        </div>

        {firebaseError && (
          <div className="text-red-500 text-[13px] text-center mb-4 font-medium bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
            {firebaseError}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          isLoading={isSubmitting}
        >
          {isLogin ? t("submit.login") : t("submit.register")}
        </Button>

        <div className="flex items-center gap-3.5 my-5" aria-hidden="true">
          <div className="flex-1 h-[1.5px] bg-border transition-colors" />
          <span className="text-[12px] font-semibold text-text-muted tracking-widest uppercase transition-colors">
            {t("submit.or")}
          </span>
          <div className="flex-1 h-[1.5px] bg-border transition-colors" />
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          leftIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
        >
          {t("submit.google")}
        </Button>

        <p className="text-center text-[12px] text-text-muted font-medium mt-5 leading-relaxed transition-colors">
          {t("footer.agree")}{" "}
          <Link to="/rules" className="text-primary hover:underline">
            {t("footer.terms")}
          </Link>
          <br />
          {t("footer.and")}{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            {t("footer.privacy")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
