import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Page404 = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    // Додано text-text-main та transition-colors
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-body text-text-main px-6 text-center relative overflow-hidden transition-colors duration-500">
      {/* РОЗУМНИЙ ФОН: використовує поточний колір тексту (чорний у світлій, білий у темній) з прозорістю 5% */}
      <div className="absolute inset-0 -z-10 opacity-5 bg-[radial-gradient(circle_at_center,currentColor_2px,transparent_2px)] bg-[size:24px_24px] transition-colors duration-500"></div>

      <div className="space-y-6 max-w-2xl relative z-10">
        <h1 className="text-[120px] md:text-[150px] leading-none font-quicksand font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-pink-accent select-none drop-shadow-sm">
          404
        </h1>

        <div className="space-y-4">
          {/* Змінено з text-dark-theme на text-text-main */}
          <h2 className="text-3xl md:text-4xl font-quicksand font-bold text-text-main transition-colors duration-500">
            {t("errors.404.title")}
          </h2>
          {/* Змінено з text-slate-600 на text-text-muted */}
          <p className="text-lg text-text-muted max-w-md mx-auto font-inter transition-colors duration-500">
            {t("errors.404.description")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={() => navigate(-1)}
            // bg-primary/5 замінено на bg-bg-card для адаптивності при ховері
            className="w-full sm:w-auto px-8 py-3.5 font-quicksand font-bold text-[18px] rounded-full border-2 border-primary text-primary hover:bg-bg-card hover:border-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/20 active:scale-95 transition-all"
          >
            ← {t("errors.404.back")}
          </button>

          <Link
            to="/"
            // Тінь спрощена до стандартного Tailwind синтаксису, щоб уникнути багів з var()
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 font-quicksand font-bold text-[18px] rounded-full bg-primary text-white hover:-translate-y-1 shadow-lg shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/30 active:scale-95 transition-all"
          >
            {t("errors.404.go_home")}
          </Link>
        </div>
      </div>
    </main>
  );
};
