import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, HeartPulse, ShieldAlert } from "lucide-react";
import { Hero } from "../../components/Hero";

export const AboutUs: React.FC = () => {
  const { t } = useTranslation("about");

  const pillars = [
    {
      title: t("what_we_do.pillars.educational.title"),
      description: t("what_we_do.pillars.educational.description"),
      icon: <BookOpen className="w-7 h-7" strokeWidth={2.5} />,
    },
    {
      title: t("what_we_do.pillars.mental.title"),
      description: t("what_we_do.pillars.mental.description"),
      icon: <HeartPulse className="w-7 h-7" strokeWidth={2.5} />,
    },
    {
      title: t("what_we_do.pillars.humanitarian.title"),
      description: t("what_we_do.pillars.humanitarian.description"),
      icon: <ShieldAlert className="w-7 h-7" strokeWidth={2.5} />,
    },
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-body text-text-main pb-20 font-quicksand transition-colors duration-300">
      <Hero
        bgText={t("hero.bg_text")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <div className="flex-grow w-full max-w-[1320px] mx-auto px-6 -mt-[90px] relative z-20 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-bg-card rounded-[32px] p-8 md:p-14 shadow-sm border border-border transition-colors duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full mb-6 text-[14px]">
                {t("history.badge")}
              </span>
              <h2 className="font-extrabold text-[32px] md:text-[42px] text-text-main mb-6 leading-[1.1]">
                {t("history.title")}
              </h2>
              <div className="flex gap-4">
                <div className="w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-primary"></div>
                <p className="text-[18px] text-text-muted font-medium italic leading-relaxed">
                  {t("history.quote")}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 font-inter text-text-muted text-[17px] leading-relaxed">
              <p>{t("history.p1")}</p>
              <p>{t("history.p2")}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dark-theme text-white rounded-[40px] md:rounded-[60px] p-8 md:p-14 md:pb-20 relative z-10 shadow-xl transition-colors duration-300"
        >
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-extrabold text-[32px] md:text-[42px] text-white mb-6">
              {t("what_we_do.title")}
            </h2>
            <p className="text-slate-300 text-[18px] leading-relaxed">
              {t("what_we_do.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/[0.08]"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                  {pillar.icon}
                </div>
                <h3 className="text-[22px] font-extrabold text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-slate-300 text-[15px] leading-relaxed font-medium">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
