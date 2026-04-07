import React from 'react';

const ContactPage: React.FC = () => {
  const socials = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/starforlifeukraine',
      color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/starforlifeua',
      color: 'bg-blue-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/starforlifeua',
      color: 'bg-blue-800',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@starforlifeua',
      color: 'bg-red-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="relative bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] pt-24 pb-40 px-6 overflow-hidden flex flex-col items-center">

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 text-center tracking-tight relative z-10">
          КОНТАКТИ
        </h1>
        <p className="text-white/80 text-lg md:text-xl text-center max-w-2xl relative z-10">
          Маєш питання, ідеї або просто хочеш привітатись? Ми завжди відкриті до спілкування. Обирай зручний спосіб!
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-shadow">
            <div>
              <span className="inline-block bg-slate-100 text-slate-600 text-sm font-semibold px-4 py-1 rounded-full mb-6">
                Організація
              </span>
              <h2 className="text-3xl font-bold text-slate-800 mb-8">Наші дані</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#eff1ff] flex items-center justify-center text-[#5c68ff] group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Електронна пошта</p>
                    <a href="mailto:team@starforlife.org.ua" className="text-lg md:text-xl font-bold text-slate-800 hover:text-[#5c68ff] transition-colors">
                      team@starforlife.org.ua
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#eff1ff] flex items-center justify-center text-[#5c68ff] group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">ЄДРПОУ / Реєстрація</p>
                    <p className="text-lg md:text-xl font-bold text-slate-800">44977372</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#eff1ff] flex items-center justify-center text-[#5c68ff] group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Дата заснування</p>
                    <p className="text-lg md:text-xl font-bold text-slate-800">30.01.2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-[2rem] p-8 md:p-10 shadow-xl flex flex-col hover:shadow-2xl transition-shadow relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#334155] rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10">
              <span className="inline-block bg-[#334155] text-white text-sm font-semibold px-4 py-1 rounded-full mb-6">
                Ком'юніті
              </span>
              <h2 className="text-3xl font-bold text-white mb-8">Ми в соцмережах</h2>
              <p className="text-slate-300 mb-8">
                Підписуйся, щоб не пропустити нові турніри, челенджі та корисний контент для твого розвитку.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform shadow-lg hover:shadow-xl`}
                  >
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                      {social.icon}
                    </div>
                    <span className="text-white font-bold">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export { ContactPage };