import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Smile, ShieldCheck, Users, Lock, Sparkles } from "lucide-react";
import { Hero } from "../../components/Hero";
import { Button } from "../../components/ui/Button";

export const RulesPage: React.FC = () => {
  const { t } = useTranslation("rules");

  const rules = [
    {
      id: "01",
      title: t("rules.r1.title"),
      description: t("rules.r1.desc"),
      textColor: "text-primary",
      bgColor: "bg-primary/10",
      hoverBorder: "hover:border-primary/30",
      icon: <Smile className="w-8 h-8" strokeWidth={2} />,
    },
    {
      id: "02",
      title: t("rules.r2.title"),
      description: t("rules.r2.desc"),
      textColor: "text-accent",
      bgColor: "bg-accent/10",
      hoverBorder: "hover:border-accent/30",
      icon: <ShieldCheck className="w-8 h-8" strokeWidth={2} />,
    },
    {
      id: "03",
      title: t("rules.r3.title"),
      description: t("rules.r3.desc"),
      textColor: "text-pink-accent",
      bgColor: "bg-pink-accent/10",
      hoverBorder: "hover:border-pink-accent/30",
      icon: <Users className="w-8 h-8" strokeWidth={2} />,
    },
    {
      id: "04",
      title: t("rules.r4.title"),
      description: t("rules.r4.desc"),
      textColor: "text-primary",
      bgColor: "bg-primary/10",
      hoverBorder: "hover:border-primary/30",
      icon: <Lock className="w-8 h-8" strokeWidth={2} />,
    },
    {
      id: "05",
      title: t("rules.r5.title"),
      description: t("rules.r5.desc"),
      textColor: "text-accent",
      bgColor: "bg-accent/10",
      hoverBorder: "hover:border-accent/30",
      icon: <Sparkles className="w-8 h-8" strokeWidth={2} />,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-body font-inter pb-24 transition-colors duration-500 overflow-x-hidden">
      <Hero
        bgText={t("hero.bg_text")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <div className="max-w-[1000px] mx-auto px-6 -mt-[80px] relative z-20 space-y-6">
        {rules.map((rule, index) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={`bg-bg-card rounded-[2rem] p-8 md:p-12 shadow-sm border border-border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${rule.hoverBorder} group`}
          >
            <div className="absolute -right-6 -bottom-10 text-[180px] font-nunito font-extrabold text-text-muted opacity-5 dark:opacity-10 select-none">
              {rule.id}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-2xl ${rule.bgColor} ${rule.textColor} flex items-center justify-center`}
              >
                {rule.icon}
              </div>

              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span
                    className={`text-xl font-nunito font-extrabold ${rule.textColor}`}
                  >
                    {rule.id}.
                  </span>
                  <h2 className="text-2xl md:text-3xl font-nunito font-bold text-text-main">
                    {rule.title}
                  </h2>
                </div>
                <p className="text-text-muted text-[17px] leading-relaxed max-w-3xl">
                  {rule.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-hero-from to-hero-to rounded-[2.5rem] p-10 md:p-14 mt-16 shadow-xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <h2 className="text-3xl md:text-4xl font-nunito font-extrabold text-white mb-6 relative z-10">
            {t("cta.title")}
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto relative z-10 text-[17px] font-medium">
            {t("cta.desc")}
          </p>

          <div className="relative z-10 flex justify-center">
            <Link to="/tournaments">
              <Button
                size="lg"
                className="bg-bg-card text-primary hover:bg-bg-body"
              >
                {t("cta.button")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
