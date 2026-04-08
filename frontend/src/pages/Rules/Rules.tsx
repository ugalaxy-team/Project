import React from 'react';
import { Link } from 'react-router-dom';

const RulesPage: React.FC = () => {
  const rules = [
    {
      id: '01',
      title: 'Взаємоповага — понад усе',
      description: 'Ми створюємо безпечне середовище для кожного. Будьте ввічливими, поважайте думку інших учасників, менторів та організаторів. Дискримінація, булінг чи хейт тут неприпустимі.',
      color: 'text-purple-500',
      bgHover: 'hover:shadow-purple-500/20',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )
    },
    {
      id: '02',
      title: 'Чесна гра (Fair Play)',
      description: 'Всі турніри та завдання повинні виконуватися самостійно або разом із вашою командою. Плагіат, використання чужих робіт без дозволу або шахрайство призводять до дискваліфікації.',
      color: 'text-blue-500',
      bgHover: 'hover:shadow-blue-500/20',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: '03',
      title: 'Командна робота та підтримка',
      description: 'UGalaxy x Star for Life — це про співпрацю. Допомагайте одне одному, діліться знаннями та працюйте як єдиний механізм. Разом ви здатні на більше!',
      color: 'text-teal-500',
      bgHover: 'hover:shadow-teal-500/20',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    {
      id: '04',
      title: 'Безпека в інтернеті',
      description: 'Бережіть свої персональні дані. Не діліться паролями, адресами чи іншою конфіденційною інформацією у відкритих чатах. Якщо помітили щось підозріле — одразу пишіть модераторам.',
      color: 'text-amber-500',
      bgHover: 'hover:shadow-amber-500/20',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )
    },
    {
      id: '05',
      title: 'Креативність без меж',
      description: 'Не бійтеся експериментувати! Ми цінуємо нестандартні ідеї, сміливі рішення та креативний підхід до виконання завдань. Головне правило — виходьте за рамки звичного!',
      color: 'text-pink-500',
      bgHover: 'hover:shadow-pink-500/20',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <div className="relative bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] pt-24 pb-48 px-6 overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#ff6b6b]/20 rounded-full blur-3xl"></div>

        <span className="inline-block bg-white/20 text-white backdrop-blur-sm border border-white/30 text-sm font-semibold px-5 py-1.5 rounded-full mb-6 relative z-10 uppercase tracking-wider">
          Конституція Платформи
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 text-center tracking-tight relative z-10">
          ПРАВИЛА
        </h1>
        <p className="text-white/90 text-lg md:text-xl text-center max-w-2xl relative z-10 font-medium">
          Щоб перебування на платформі було комфортним та продуктивним для всіх, ми просимо дотримуватися кількох простих, але важливих правил.
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-6 -mt-28 relative z-20 space-y-8">
        {rules.map((rule, index) => (
          <div 
            key={rule.id} 
            className={`bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${rule.bgHover} group`}
          >
            <div className={`absolute -right-6 -bottom-10 text-[180px] font-extrabold opacity-5 select-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${rule.color}`}>
              {rule.id}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center shadow-inner ${rule.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {rule.icon}
              </div>
              
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className={`text-xl font-black ${rule.color}`}>
                    {rule.id}.
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                    {rule.title}
                  </h2>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                  {rule.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-[#1e293b] rounded-[2rem] p-10 md:p-14 mt-16 shadow-2xl text-center relative overflow-hidden border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6b73ff]/20 to-transparent opacity-50"></div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 relative z-10">
            Згодні з правилами? Тоді вперед до перемог! 🚀
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto relative z-10 text-lg">
            Обирай свій перший турнір, збирай команду мрії та покажи, на що ти здатен.
          </p>
          
          <Link 
            to="/tournaments" 
            className="inline-flex relative z-10 bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] text-white font-bold text-lg px-10 py-4 rounded-xl hover:shadow-[#6b73ff]/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Перейти до турнірів
          </Link>
        </div>
      </div>
    </div>
  );
};

export { RulesPage };