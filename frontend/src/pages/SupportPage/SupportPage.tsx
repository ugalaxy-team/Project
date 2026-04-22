import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Heart, Handshake, Users2 } from "lucide-react";
import { Hero } from "../../components/Hero";
import { Button } from "../../components/ui/Button";

export const SupportPage: React.FC = () => {
  const { t } = useTranslation("support");

  const supportOptions = [
    {
      badge: t("options.donate.badge"),
      title: t("options.donate.title"),
      description: t("options.donate.description"),
      buttonText: t("options.donate.button"),
      link: "https://www.sflua.org/uk/donate-1",
      icon: <Heart className="w-7 h-7" strokeWidth={2.5} />,
    },
    {
      badge: t("options.partnership.badge"),
      title: t("options.partnership.title"),
      description: t("options.partnership.description"),
      buttonText: t("options.partnership.button"),
      link: "mailto:team@starforlife.org.ua?subject=Potential%20partnership",
      icon: <Handshake className="w-7 h-7" strokeWidth={2.5} />,
    },
    {
      badge: t("options.volunteer.badge"),
      title: t("options.volunteer.title"),
      description: t("options.volunteer.description"),
      buttonText: t("options.volunteer.button"),
      link: "https://www.sflua.org/uk/volunteer",
      icon: <Users2 className="w-7 h-7" strokeWidth={2.5} />,
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
        {/* Сітка карток (Адаптивна) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-bg-card rounded-[32px] p-8 shadow-sm border border-border flex flex-col justify-between transition-colors duration-300"
            >
              <div>
                <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full mb-6 text-[13px] uppercase tracking-wide">
                  {option.badge}
                </span>

                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  {option.icon}
                </div>

                <h3 className="text-[24px] font-extrabold text-text-main mb-4 leading-tight">
                  {option.title}
                </h3>

                <p className="text-text-muted text-[16px] leading-relaxed mb-8 font-medium italic">
                  {option.description}
                </p>
              </div>

              <a href={option.link} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  className="w-full py-4 text-[16px] font-bold"
                >
                  {option.buttonText}
                </Button>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Фінальна плашка (Адаптивна) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary/5 rounded-[32px] p-8 md:p-12 border border-primary/20 text-center transition-colors duration-300"
        >
          <p className="text-text-muted font-bold text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
            {t("footer_note")}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
