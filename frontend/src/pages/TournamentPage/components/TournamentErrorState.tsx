import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const TournamentErrorState = () => {
  const { t } = useTranslation("tournament");

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center bg-bg-body text-text-main relative overflow-hidden font-inter transition-colors duration-500">
      <div className="absolute font-nunito font-extrabold text-[20vw] md:text-[25vw] text-text-main/[0.02] select-none z-0 flex items-center justify-center w-full h-full pointer-events-none overflow-hidden leading-none tracking-tighter">
        ERROR
      </div>

      <div className="relative z-10 text-center flex flex-col items-center px-4 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <h2 className="text-3xl md:text-5xl font-nunito font-extrabold text-text-main mb-5 tracking-tight uppercase">
            {t("error_state.title")}
          </h2>

          <p className="text-[16px] md:text-[18px] text-text-muted font-medium max-w-lg mx-auto leading-relaxed">
            {t("error_state.description")}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
