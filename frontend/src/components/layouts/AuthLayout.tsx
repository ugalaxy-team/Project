import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import { useTranslation } from "react-i18next";
import { BrandingPanel } from "../ui/BrandingPanel";
import starAnimation from "../../../public/star.json";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { t } = useTranslation("auth");

  return (
    <div className="flex h-screen overflow-hidden bg-bg-body text-text-main font-inter transition-colors duration-300">
      <BrandingPanel position="left">
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
          <div className="text-accent font-extrabold text-[24px] leading-none">
            ×
          </div>
          <div className="font-quicksand font-bold text-[21px] text-white/85 tracking-widest uppercase">
            Star for Life
          </div>
        </div>
        <p className="mt-5 text-[15px] font-medium text-white/60 text-center max-w-[290px] leading-relaxed">
          {t("slogan")}
        </p>
      </BrandingPanel>

      <div className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
        <motion.div
          className="bg-bg-card w-full max-w-[460px] rounded-[32px] p-8 md:p-11 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
