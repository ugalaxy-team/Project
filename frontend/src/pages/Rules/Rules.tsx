import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Hero } from "../../components/Hero";
import { Button } from "../../components/ui/Button";

const RulesPageComponent: React.FC = () => {
  const { t } = useTranslation("rules");

  const rules = [
    {
      id: "01",
      title: t("rules.r1.title", "Взаємоповага — понад усе"),
      description: t(
        "rules.r1.desc",
        "Ми створюємо безпечне середовище для кожного. Будьте ввічливими, поважайте думку інших учасників, менторів та організаторів. Дискримінація, булінг чи хейт тут неприпустимі.",
      ),
      textColor: "text-primary",
      bgColor: "bg-primary/10",
      hoverBorder: "hover:border-primary/30",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ),
    },
    {
      id: "02",
      title: t("rules.r2.title", "Чесна гра (Fair Play)"),
      description: t(
        "rules.r2.desc",
        "Всі турніри та завдання повинні виконуватися самостійно або разом із вашою командою. Плагіат, використання чужих робіт без дозволу або шахрайство призводять до дискваліфікації.",
      ),
      textColor: "text-accent",
      bgColor: "bg-accent/10",
      hoverBorder: "hover:border-accent/30",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "03",
      title: t("rules.r3.title", "Командна робота та підтримка"),
      description: t(
        "rules.r3.desc",
        "UGalaxy x Star for Life — це про співпрацю. Допомагайте одне одному, діліться знаннями та працюйте як єдиний механізм. Разом ви здатні на більше!",
      ),
      textColor: "text-pink-accent",
      bgColor: "bg-pink-accent/10",
      hoverBorder: "hover:border-pink-accent/30",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      ),
    },
    {
      id: "04",
      title: t("rules.r4.title", "Безпека в інтернеті"),
      description: t(
        "rules.r4.desc",
        "Бережіть свої персональні дані. Не діліться паролями, адресами чи іншою конфіденційною інформацією у відкритих чатах. Якщо помітили щось підозріле — одразу пишіть модераторам.",
      ),
      textColor: "text-primary",
      bgColor: "bg-primary/10",
      hoverBorder: "hover:border-primary/30",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
    },
    {
      id: "05",
      title: t("rules.r5.title", "Креативність без меж"),
      description: t(
        "rules.r5.desc",
        "Не бійтеся експериментувати! Ми цінуємо нестандартні ідеї, сміливі рішення та креативний підхід до виконання завдань. Головне правило — виходьте за рамки звичного!",
      ),
      textColor: "text-accent",
      bgColor: "bg-accent/10",
      hoverBorder: "hover:border-accent/30",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-body font-inter pb-24 transition-colors duration-500 overflow-x-hidden">
      <Hero
        bgText={t("hero.bg_text", "КОНСТИТУЦІЯ")}
        title={t("hero.title", "ПРАВИЛА")}
        description={t(
          "hero.description",
          "Щоб перебування на платформі було комфортним та продуктивним для всіх, ми просимо дотримуватися кількох простих, але важливих правил.",
        )}
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
            <div className="absolute -right-6 -bottom-10 text-[180px] font-quicksand font-extrabold text-text-muted opacity-5 dark:opacity-10 select-none">
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
                    className={`text-xl font-quicksand font-extrabold ${rule.textColor}`}
                  >
                    {rule.id}.
                  </span>
                  <h2 className="text-2xl md:text-3xl font-quicksand font-bold text-text-main">
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

          <h2 className="text-3xl md:text-4xl font-quicksand font-extrabold text-white mb-6 relative z-10">
            {t("cta.title", "Згодні з правилами? Тоді вперед до перемог! 🚀")}
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto relative z-10 text-[17px] font-medium">
            {t(
              "cta.desc",
              "Обирай свій перший турнір, збирай команду мрії та покажи, на що ти здатен.",
            )}
          </p>

          <div className="relative z-10 flex justify-center">
            <Link to="/tournaments">
              <Button
                size="lg"
                className="bg-bg-card text-primary hover:bg-bg-body"
              >
                {t("cta.button", "Перейти до турнірів")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const RulesPage = RulesPageComponent;
