import React from "react";

const SupportPage: React.FC = () => {
  const supportOptions = [
    {
      title: "Задонатити",
      description:
        "Твій фінансовий внесок безпосередньо допомагає забезпечувати дітей якісною освітою, психологічною підтримкою та необхідними ресурсами.",
      buttonText: "Зробити внесок",
      link: "https://www.sflua.org/uk/donate-1",
      gradient: "from-rose-400 to-pink-500",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      btnHover: "hover:shadow-rose-500/30",
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
      title: "Партнерство",
      description:
        "Стань нашим партнером! Разом ми зможемо реалізувати масштабні проекти, залучити більше ресурсів та створити сталі зміни в суспільстві.",
      buttonText: "Стати партнером",
      link: "mailto:team@starforlife.org.ua?subject=Potential%20partnership",
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      btnHover: "hover:shadow-blue-500/30",
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
            d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
    },
    {
      title: "Волонтерство",
      description:
        "Поділися своїм часом, знаннями та навичками. Твоя особиста участь та підтримка можуть стати вирішальними для майбутнього дитини.",
      buttonText: "Стати волонтером",
      link: "https://www.sflua.org/uk/volunteer", // TODO: Встав сюди посилання на анкету волонтера
      gradient: "from-emerald-400 to-teal-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      btnHover: "hover:shadow-emerald-500/30",
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
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="relative bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] pt-24 pb-48 px-6 overflow-hidden flex flex-col items-center">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

        <span className="inline-block bg-white/20 text-white backdrop-blur-sm border border-white/30 text-sm font-semibold px-5 py-1.5 rounded-full mb-6 relative z-10">
          Твоя підтримка важлива
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 text-center tracking-tight relative z-10">
          ПІДТРИМАТИ НАС
        </h1>
        <p className="text-white/90 text-lg md:text-xl text-center max-w-2xl relative z-10 font-medium">
          Ось кілька способів, як ви можете нас підтримати та долучитися до
          створення кращого майбутнього для дітей України.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-28 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
            >
              <div>
                <div
                  className={`w-16 h-16 rounded-2xl ${option.iconBg} ${option.iconColor} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}
                >
                  {option.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {option.title}
                </h3>
                <p className="text-slate-500 leading-relaxed mb-8">
                  {option.description}
                </p>
              </div>
              <a
                href={option.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full block text-center py-4 px-6 rounded-xl text-white font-bold text-lg bg-gradient-to-r ${option.gradient} shadow-lg ${option.btnHover} hover:-translate-y-1 transition-all duration-300`}
              >
                {option.buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-20 text-center">
        <div className="bg-slate-200/50 rounded-3xl p-8 border border-slate-200">
          <p className="text-slate-600 font-medium text-lg">
            Кожна гривня, кожна година вашого часу та кожна спільна ініціатива
            наближають нас до мети.{" "}
            <span className="font-bold text-slate-800">
              Дякуємо, що ви з нами!
            </span>{" "}
            💙💛
          </p>
        </div>
      </div>
    </div>
  );
};

export { SupportPage };
