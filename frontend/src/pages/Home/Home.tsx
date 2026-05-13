import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Hero } from "../../components/Hero";
import { TournamentSlider } from "./components/TournamentSlider";

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
            {t("hero.title_1")}
            <br />
            {t("hero.title_2")}
            <br />
            {t("hero.title_3")}
          </>
        }
        description={t("hero.description")}
        badges={[
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f525" />
                {t("hero.badges.express")}
              </span>
            ),
            className:
              "bottom-[35%] left-[2vw] xl:left-[10vw] bg-dark-theme text-white -rotate-6 hover:rotate-0 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f4a1" />
                {t("hero.badges.idea")}
              </span>
            ),
            className:
              "top-[15%] right-[2vw] xl:right-[8vw] bg-accent text-slate-900 rotate-3 text-[22px] hover:-rotate-3 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f680" />
                {t("hero.badges.act")}
              </span>
            ),
            className:
              "bottom-[20%] right-[4vw] xl:right-[12vw] bg-pink-accent text-white -rotate-3 hover:scale-105 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f355" />
                {t("hero.badges.pizza")}
              </span>
            ),
            className:
              "top-[25%] left-[5vw] xl:left-[12vw] bg-primary text-white rotate-6 border-2 border-white/20 hover:scale-105 transition-transform duration-300",
          },
          {
            text: (
              <span className="flex items-center gap-2 font-bold group">
                <NotoEmoji code="1f918" />
                {t("hero.badges.be_yourself")}
              </span>
            ),
            className:
              "bottom-[50%] right-[1vw] xl:right-[5vw] bg-bg-card text-text-main -rotate-12 transition-all duration-300 hover:rotate-0 hover:scale-110",
          },
        ]}
        mascot={{
          circularText: t("hero.mascot.circular"),
          lottieSrc: "/star.json",
          buttonText: t("hero.mascot.button"),
          buttonLink: "/tournaments",
        }}
      />

      <TournamentSlider />

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
              {t("cta.badge")}
            </span>
            <h3 className="font-inter text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 md:mb-4 leading-tight transition-colors duration-500">
              {t("cta.title")}
            </h3>
            <p className="text-white/90 font-medium text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
              {t("cta.description")}
            </p>
          </div>

          <div className="relative z-10 shrink-0 mt-2 md:mt-0 w-full sm:w-auto">
            <Link
              to="/role-request-form"
              className="flex sm:inline-flex items-center justify-center w-full sm:w-auto bg-bg-card text-primary font-inter font-bold text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-bg-body hover:-translate-y-1 shadow-lg hover:shadow-xl transition-all duration-300 dark:border dark:border-white/5 group"
            >
              {t("cta.button")}
              <ArrowRight
                className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
