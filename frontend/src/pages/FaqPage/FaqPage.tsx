import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Plus, Minus } from "lucide-react";
import { Hero } from "../../components/Hero";

const FaqPageComponent: React.FC = () => {
  const { t } = useTranslation("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqIndexes = Array.from({ length: 10 }, (_, i) => i + 1);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-body text-text-main pb-20 font-inter transition-colors duration-300">
      <Hero
        bgText={t("hero.bg_text")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <div className="flex-grow w-full max-w-[900px] mx-auto px-6 -mt-[90px] relative z-20 space-y-6">
        {faqIndexes.map((num) => {
          const index = num - 1;
          const isOpen = openIndex === index;
          const questionKey = `q${num}`;
          const answerKey = `a${num}`;

          return (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`bg-bg-card rounded-[32px] shadow-sm border transition-colors duration-300 overflow-hidden ${
                isOpen
                  ? "border-primary"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none group"
              >
                <span
                  className={`font-nunito font-extrabold text-[20px] md:text-[24px] pr-6 transition-colors duration-300 leading-[1.2] ${
                    isOpen
                      ? "text-primary"
                      : "text-text-main group-hover:text-primary"
                  }`}
                >
                  {t(questionKey)}
                </span>

                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                    isOpen
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  {isOpen ? (
                    <Minus size={24} strokeWidth={2.5} />
                  ) : (
                    <Plus size={24} strokeWidth={2.5} />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                      <p className="text-text-muted text-[17px] leading-relaxed font-medium">
                        {t(answerKey)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const FaqPage = FaqPageComponent;
