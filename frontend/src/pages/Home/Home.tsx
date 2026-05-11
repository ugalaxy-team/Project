import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Hero } from "../../components/Hero";
import { TournamentSlider } from "./components/TournamentSlider";
import { toast } from "react-toastify"; // Змінили імпорт

const NotoEmoji = ({ code }: { code: string }) => (
  <img
    src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/emoji.svg`}
    alt="emoji"
    draggable={false}
    className="w-6 h-6 select-none"
  />
);

export const Home = () => {
  const { t } = useTranslation("home");

  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-body transition-colors duration-500">
      <Hero
        bgText="STAR FOR LIFE"
        title={
          <>
            {t("hero.title_1", "Твори.")}
            <br />
            {t("hero.title_2", "Дій.")}
            <br />
            {t("hero.title_3", "Перемагай.")}
          </>
        }
        description={t(
          "hero.description",
          "Платформа для твоїх найсміливіших ідей. Від написання коду та дизайну до мистецтва й креативу — збирай команду, розкривай свій талант, ділися досвідом, набувай його і рухайся до вершини!",
        )}
        badges={[
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f525" /> {/* 🔥 Fire */}
                {t("hero.badges.express", "Прояви себе!")}
              </span>
            ),
            className:
              "bottom-[35%] left-[2vw] xl:left-[10vw] bg-dark-theme text-white -rotate-6 hover:rotate-0 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f4a1" /> {/* 💡 Light bulb */}
                {t("hero.badges.idea", "Твоя ідея змінить світ")}
              </span>
            ),
            className:
              "top-[15%] right-[2vw] xl:right-[8vw] bg-accent text-slate-900 rotate-3 text-[22px] hover:-rotate-3 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f680" /> {/* 🚀 Rocket */}
                {t("hero.badges.act", "Дій зараз")}
              </span>
            ),
            className:
              "bottom-[20%] right-[4vw] xl:right-[12vw] bg-pink-accent text-white -rotate-3 hover:scale-105 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f355" /> {/* 🍕 Pizza */}
                {t("hero.badges.pizza", "Піца, код, перемога")}
              </span>
            ),
            className:
              "top-[25%] left-[5vw] xl:left-[12vw] bg-primary text-white rotate-6 border-2 border-white/20 hover:scale-105 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f918" /> {/* 🤘 Sign of the horns */}
                {t("hero.badges.be_yourself", "Будь собою!")}
              </span>
            ),
            className:
              "bottom-[50%] right-[1vw] xl:right-[5vw] bg-bg-card text-text-main -rotate-12 transition-all duration-300 hover:rotate-0 hover:scale-110",
          },
        ]}
        mascot={{
          circularText: t(
            "hero.mascot.circular",
            "★ЗНАЙДИ КОМАНДУ ★ ПРОЯВИ СЕБЕ ",
          ),
          lottieSrc: "/star.json",
          buttonText: t("hero.mascot.button", "Всі турніри"),
          buttonLink: "/tournaments",
        }}
      />

      <TournamentSlider />

      {/* ТИМЧАСОВА КНОПКА ДЛЯ ТЕСТУ ТОСТІВ (видали потім!) */}
      <button
        onClick={() => {
          toast.success("Команду успішно зареєстровано!");

          setTimeout(() => {
            toast.error("Ой, сервер втомився і впав :(");
          }, 300);

          setTimeout(() => {
            // В react-toastify для складного тексту передаємо React-вузол
            toast.info(
              <div>
                <div className="font-bold mb-1">
                  Турнір розпочнеться за 5 хвилин
                </div>
                <div className="text-[13px] opacity-90 leading-tight">
                  Не забудьте зібратися в Discord каналі.
                </div>
              </div>,
            );
          }, 600);
        }}
        className="fixed bottom-10 left-10 z-[100] bg-primary text-white font-bold px-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        Тест Тостів 🍞
      </button>

      <div className="flex-grow w-full max-w-[1320px] mx-auto px-4 md:px-6 pb-16 md:pb-25 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full bg-gradient-to-r from-hero-from to-hero-to rounded-[1.5rem] md:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden group transition-colors duration-500"
        >
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
          <div className="absolute right-20 -bottom-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl transition-colors duration-300"></div>

          <div className="relative z-10 text-center lg:text-left flex-1">
            <span className="inline-block bg-white/20 text-white backdrop-blur-sm border border-white/30 text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 md:mb-5">
              {t("cta.badge", "Нові можливості")}
            </span>
            <h3 className="font-quicksand text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 md:mb-4 leading-tight transition-colors duration-500">
              {t("cta.title", "Хочеш більше впливу на платформі?")}
            </h3>
            <p className="text-white/90 font-medium text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
              {t(
                "cta.description",
                "Подай заявку на отримання нової ролі та розблокуй додатковий функціонал для себе та своєї команди.",
              )}
            </p>
          </div>

          <div className="relative z-10 shrink-0 mt-2 md:mt-0 w-full sm:w-auto">
            <Link
              to="/role-request-form"
              className="flex sm:inline-flex items-center justify-center w-full sm:w-auto bg-bg-card text-primary font-quicksand font-bold text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-bg-body hover:-translate-y-1 shadow-lg hover:shadow-xl transition-all duration-300 dark:border dark:border-white/5 group"
            >
              {t("cta.button", "Отримати роль")}
              <svg
                className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
