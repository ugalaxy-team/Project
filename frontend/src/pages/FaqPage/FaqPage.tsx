import React, { useState } from "react";

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Хто ми і що це за платформа?",
      answer:
        "Це платформа від благодійного фонду Star for Life Ukraine. Ми допомагаємо молоді розвиватися через освіту, менторство та практику. Тут можна брати участь у турнірах, знайомитися з однодумцями та прокачувати свої навички.",
    },
    {
      question: "Чому все безкоштовно?",
      answer:
        "Жодного підступу 🙂 Участь безкоштовна, бо платформу підтримують партнери та донори. Наша мета — дати рівні можливості кожному.",
    },
    {
      question: "Які тут турніри?",
      answer:
        "Є IT-турніри, кіберспорт, дизайн, математика, творчі конкурси та інші напрямки. Кожен знайде щось для себе.",
    },
    {
      question: "Як взяти участь у турнірі?",
      answer:
        "Все просто: зареєструйся, обери турнір у розділі «Турніри» та натисни «Взяти участь». У деяких турнірах потрібна команда — її можна створити або приєднатися до існуючої.",
    },
    {
      question: "Що я отримаю від участі?",
      answer:
        "Практичний досвід, розвиток навичок, роботу в команді та нові знайомства. Також є можливість виграти призи: гаджети, курси, менторство або мерч.",
    },
    {
      question: "Як змінити роль на платформі?",
      answer:
        "Спочатку всі мають роль «Користувач». Щоб отримати іншу роль, подай заявку на сторінці «Отримання ролі» — ми її перевіримо.",
    },
    {
      question: "Що робити, якщо виникла проблема?",
      answer:
        "Якщо щось не працює (реєстрація, команда тощо) — звернись у підтримку через розділ «Контакти». Ми обов'язково допоможемо.",
    },
    {
      question: "Чи є обмеження за віком?",
      answer:
        "Більшість турнірів орієнтовані на підлітків і студентів, але умови можуть відрізнятися. Перевіряй опис конкретного турніру.",
    },
    {
      question: "Чи можна брати участь самому (без команди)?",
      answer:
        "Так. У багатьох турнірах можна брати участь індивідуально або знайти команду вже на платформі.",
    },
    {
      question: "Чи можна брати участь у кількох турнірах одночасно?",
      answer:
        "Так, якщо графік не перетинається і ти встигаєш брати повноцінну участь у всіх обраних змаганнях.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="relative bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] pt-24 pb-48 px-6 overflow-hidden flex flex-col items-center">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>

        <span className="inline-block bg-white/20 text-white backdrop-blur-sm border border-white/30 text-sm font-semibold px-5 py-1.5 rounded-full mb-6 relative z-10">
          Допомога та відповіді
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 text-center tracking-tight relative z-10">
          ЧАСТІ ПИТАННЯ
        </h1>
        <p className="text-white/90 text-lg md:text-xl text-center max-w-2xl relative z-10 font-medium">
          Зібрали для вас відповіді на найпопулярніші запитання. Не знайшли
          свого? Напишіть нам у підтримку!
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-28 relative z-20">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg border transition-colors duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#6b73ff] shadow-[#6b73ff]/10"
                    : "border-slate-100 hover:border-[#6b73ff]/50"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
                >
                  <span
                    className={`text-lg font-bold pr-6 transition-colors duration-300 ${isOpen ? "text-[#5c68ff]" : "text-slate-800 group-hover:text-[#5c68ff]"}`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? "bg-[#5c68ff] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#eff1ff] group-hover:text-[#5c68ff]"}`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      {isOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 12H4"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      )}
                    </svg>
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { FaqPage };
