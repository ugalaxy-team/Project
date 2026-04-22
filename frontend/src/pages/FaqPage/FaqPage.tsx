import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Plus, Minus } from "lucide-react";
import { Hero } from "../../components/Hero";

export const FaqPage: React.FC = () => {
  const { t } = useTranslation("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t("q1", "Хто ми і що це за платформа?"),
      answer: t(
        "a1",
        "Це платформа від благодійного фонду Star for Life Ukraine. Ми допомагаємо молоді розвиватися через освіту, менторство та практику. Тут можна брати участь у турнірах, знайомитися з однодумцями та прокачувати свої навички.",
      ),
    },
    {
      question: t("q2", "Чому все безкоштовно?"),
      answer: t(
        "a2",
        "Жодного підступу 🙂 Участь безкоштовна, бо платформу підтримують партнери та донори. Наша мета — дати рівні можливості кожному.",
      ),
    },
    {
      question: t("q3", "Які тут турніри?"),
      answer: t(
        "a3",
        "Є IT-турніри, кіберспорт, дизайн, математика, творчі конкурси та інші напрямки. Кожен знайде щось для себе.",
      ),
    },
    {
      question: t("q4", "Як взяти участь у турнірі?"),
      answer: t(
        "a4",
        "Все просто: зареєструйся, обери турнір у розділі «Турніри» та натисни «Взяти участь». У деяких турнірах потрібна команда — її можна створити або приєднатися до існуючої.",
      ),
    },
    {
      question: t("q5", "Що я отримаю від участі?"),
      answer: t(
        "a5",
        "Практичний досвід, розвиток навичок, роботу в команді та нові знайомства. Також є можливість виграти призи: гаджети, курси, менторство або мерч.",
      ),
    },
    {
      question: t("q6", "Як змінити роль на платформі?"),
      answer: t(
        "a6",
        "Спочатку всі мають роль «Користувач». Щоб отримати іншу роль, подай заявку на сторінці «Отримання ролі» — ми її перевіримо.",
      ),
    },
    {
      question: t("q7", "Що робити, якщо виникла проблема?"),
      answer: t(
        "a7",
        "Якщо щось не працює (реєстрація, команда тощо) — звернись у підтримку через розділ «Контакти». Ми обов'язково допоможемо.",
      ),
    },
    {
      question: t("q8", "Чи є обмеження за віком?"),
      answer: t(
        "a8",
        "Більшість турнірів орієнтовані на підлітків і студентів, але умови можуть відрізнятися. Перевіряй опис конкретного турніру.",
      ),
    },
    {
      question: t("q9", "Чи можна брати участь самому (без команди)?"),
      answer: t(
        "a9",
        "Так. У багатьох турнірах можна брати участь індивідуально або знайти команду вже на платформі.",
      ),
    },
    {
      question: t("q10", "Чи можна брати участь у кількох турнірах одночасно?"),
      answer: t(
        "a10",
        "Так, якщо графік не перетинається і ти встигаєш брати повноцінну участь у всіх обраних змаганнях.",
      ),
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#F8FAFC] font-inter pb-24">
      {/* 1. Наш ідеальний Hero */}
      <Hero
        bgText={t("hero.bg_text", "FAQ")}
        title={t("hero.title", "Часті Питання")}
        description={t(
          "hero.description",
          "Зібрали для вас відповіді на найпопулярніші запитання. Не знайшли свого? Напишіть нам у підтримку!",
        )}
      />

      {/* 2. Контейнер контенту (звужений до max-w-3xl для зручного читання) */}
      <div className="flex-grow w-full max-w-3xl mx-auto px-6 -mt-[80px] relative z-20">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                // Дизайн карток чітко за вашою дизайн-системою
                className={`bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#6366F1]/30 shadow-[0_8px_30px_rgba(99,102,241,0.08)]"
                    : "border-slate-100 hover:border-slate-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none group"
                >
                  <span
                    className={`font-quicksand font-bold text-[18px] md:text-[20px] pr-6 transition-colors duration-300 ${
                      isOpen
                        ? "text-[#6366F1]"
                        : "text-slate-900 group-hover:text-[#6366F1]"
                    }`}
                  >
                    {faq.question}
                  </span>

                  {/* Кнопка розгортання з іконками */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-[#6366F1] text-white rotate-180"
                        : "bg-slate-50 text-slate-400 group-hover:bg-[#6366F1]/10 group-hover:text-[#6366F1]"
                    }`}
                  >
                    {isOpen ? (
                      <Minus size={20} strokeWidth={2.5} />
                    ) : (
                      <Plus size={20} strokeWidth={2.5} />
                    )}
                  </div>
                </button>

                {/* Плавна анімація відкриття через Framer Motion */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                        <div className="w-full h-[1px] bg-slate-100 mb-6"></div>
                        <p className="text-slate-500 text-[16px] leading-relaxed font-medium">
                          {faq.answer}
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
    </div>
  );
};
