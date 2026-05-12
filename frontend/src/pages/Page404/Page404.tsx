import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const Page404 = () => {
  const { t } = useTranslation("common");

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-bg-body text-text-main relative overflow-hidden font-inter transition-colors duration-500">
      {/* Масивний статичний фон 404 для глибини */}
      <div className="absolute font-nunito font-extrabold text-[35vw] text-text-main/[0.02] select-none z-0 flex items-center justify-center w-full h-full pointer-events-none overflow-hidden leading-none tracking-tighter">
        404
      </div>

      <div className="relative z-10 text-center flex flex-col items-center px-4 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Акцентний заголовок Nunito */}
          <h1 className="text-[120px] md:text-[180px] leading-none font-nunito font-extrabold text-primary mb-2 drop-shadow-[0_0_40px_rgba(99,102,241,0.15)] select-none">
            404
          </h1>

          <h2 className="text-3xl md:text-5xl font-nunito font-extrabold text-text-main mb-5 tracking-tight uppercase">
            {t("errors.404.title")}
          </h2>

          {/* Основний текст Inter */}
          <p className="text-[16px] md:text-[18px] text-text-muted mb-12 font-medium max-w-lg mx-auto leading-relaxed">
            {t("errors.404.description")}
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-12 py-4 rounded-full font-nunito font-extrabold text-[16px] bg-primary text-white hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(99,102,241,0.35)] active:scale-95 transition-all duration-300"
          >
            {t("errors.404.go_home")}
          </Link>
        </motion.div>
      </div>
    </main>
  );
};
