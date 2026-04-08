import React from 'react';

const AboutUs: React.FC = () => {
  const pillars = [
    {
      title: 'Освітня',
      description: 'Розширюємо знання та навички для наступного покоління.',
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-500',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      title: 'Ментальна',
      description: 'Виховуємо стійкість, впевненість та благополуччя.',
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-500',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      title: 'Гуманітарна',
      description: 'Підтримуємо дітей України у найскрутніші часи.',
      color: 'bg-teal-500',
      lightBg: 'bg-teal-50',
      textColor: 'text-teal-500',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5v6.75V15m6-6v6.75m0-6.75V15m6-6v6.75m0-6.75V15m-15 3h18M3 8.25h18M3 18.75h18M3 12h18" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="relative bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] pt-24 pb-40 px-6 overflow-hidden flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 text-center tracking-tight relative z-10">
          ХТО МИ
        </h1>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-10 max-w-4xl relative z-10 text-center shadow-2xl">
          <span className="uppercase tracking-widest text-white/80 text-sm font-bold mb-4 block">Наше Бачення</span>
          <p className="text-white text-xl md:text-3xl font-medium leading-tight md:leading-snug">
            Майбутнє, де кожна дитина з малозабезпечених сімей в Україні матиме <span className="text-yellow-300">рівний доступ до можливостей</span>, що змінюють життя, через ІТ-освіту, емоційну стійкість та творчий розвиток.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <span className="inline-block bg-[#eff1ff] text-[#5c68ff] text-sm font-semibold px-4 py-1 rounded-full mb-6">
                Наша Історія
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Від сміливого бачення до реальних дій</h2>
              <div className="flex gap-4 mb-6">
                <div className="w-1.5 rounded-full bg-gradient-to-b from-[#6b73ff] to-[#4c51bf]"></div>
                <p className="text-lg text-slate-600 font-medium italic">
                  У 2022 році, серед викликів та негараздів, з якими зіткнулася Україна, народилася ініціатива – Star for Life Ukraine.
                </p>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-5 text-slate-600 text-lg">
              <p>
                Те, що починалося як бачення, швидко перетворилося на дії, і до початку 2023 року ми перетворилися на повноцінний благодійний фонд. Наше коріння сягає світового бренду <strong>«Star for Life»</strong>, що був заснований у 2005 році з метою розширення можливостей дітей у всьому світі. Маючи представництва на різних континентах, ініціатива позитивно вплинула на життя <strong>понад 500 000 дітей</strong>.
              </p>
              <p>
                Наша подорож в Україні розпочалася з нагальної потреби підтримати молодих людей, які постраждали від постійних викликів у регіоні. Оскільки <strong>понад 5 мільйонів дітей</strong> потребують підтримки, наша місія була чіткою: забезпечити їх інструментами, освітою та можливостями, на які вони заслуговують. З наших скромних початків ми перетворилися на силу, яка змінює життя кожної дитини крок за кроком.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1e293b] rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-700 relative overflow-hidden">
          <div className="absolute -left-20 top-20 w-64 h-64 bg-[#6b73ff] rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute -right-20 bottom-0 w-64 h-64 bg-teal-400 rounded-full blur-[100px] opacity-10"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-12">
             <span className="inline-block bg-slate-800 text-slate-300 border border-slate-600 text-sm font-semibold px-4 py-1 rounded-full mb-6">
                Діяльність
              </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Що Ми Робимо</h2>
            <p className="text-slate-300 text-lg">
              Тисячі дітей з малозабезпечених сімей в Україні, особливо ті, хто постраждав від війни, не мають доступу до якісної освіти. <strong>«Star for Life Ukraine»</strong> працює над тим, щоб змінити це, кидаючи виклик системам та забезпечуючи кожній дитині безпечний розвиток.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {pillars.map((pillar, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-16 h-16 rounded-2xl ${pillar.color} flex items-center justify-center mb-6 shadow-lg`}>
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{pillar.title}</h3>
                <p className="text-slate-400 font-medium">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export { AboutUs };