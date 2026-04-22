import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, FileText, Calendar, Send, MessageCircle } from "lucide-react";
import { Hero } from "../../components/Hero";

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const LinkedinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const ContactPage: React.FC = () => {
  const { t } = useTranslation("contact");

  const socials = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/starforlifeukraine",
      color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
      icon: <InstagramIcon />,
    },
    {
      name: "Telegram",
      url: "https://t.me/starforlifeukraine",
      color: "bg-[#229ED9]",
      icon: <Send size={24} />, // Це стандартна іконка повідомлення, вона залишається в lucide
    },
    {
      name: "Discord",
      url: "https://discord.gg/JQ9B7NgCM7",
      color: "bg-[#5865F2]",
      icon: <MessageCircle size={24} />, // Це також стандартна іконка чату
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/starforlifeua",
      color: "bg-[#1877F2]",
      icon: <FacebookIcon />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/starforlifeua",
      color: "bg-[#0077B5]",
      icon: <LinkedinIcon />,
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@starforlifeua",
      color: "bg-[#FF0000]",
      icon: <YoutubeIcon />,
    },
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-body text-text-main pb-20 font-quicksand transition-colors duration-300">
      <Hero
        bgText={t("hero.bg_text")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <div className="flex-grow w-full max-w-[1320px] mx-auto px-6 -mt-[90px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Картка 1: Організація (Адаптивна) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-bg-card rounded-[32px] p-8 md:p-12 shadow-sm border border-border flex flex-col justify-between transition-colors duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-10">
                <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-[13px] uppercase tracking-wide">
                  {t("org.badge")}
                </span>
                <div className="w-1.5 h-10 bg-gradient-to-b from-indigo-400 to-primary rounded-full"></div>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-10 tracking-tight">
                {t("org.title")}
              </h2>

              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                    <Mail size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-tight mb-1">
                      {t("org.email_label")}
                    </p>
                    <a
                      href="mailto:team@starforlife.org.ua"
                      className="text-lg md:text-xl font-extrabold text-text-main hover:text-primary transition-colors"
                    >
                      team@starforlife.org.ua
                    </a>
                  </div>
                </div>

                {/* ЄДРПОУ */}
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                    <FileText size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-tight mb-1">
                      {t("org.id_label")}
                    </p>
                    <p className="text-lg md:text-xl font-extrabold text-text-main tracking-wider">
                      44977372
                    </p>
                  </div>
                </div>

                {/* Дата */}
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                    <Calendar size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-tight mb-1">
                      {t("org.date_label")}
                    </p>
                    <p className="text-lg md:text-xl font-extrabold text-text-main">
                      30.01.2023
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Картка 2: Соцмережі (Темна, акцентна) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-dark-theme rounded-[32px] p-8 md:p-12 shadow-xl flex flex-col justify-between relative overflow-hidden text-white transition-colors duration-300"
          >
            {/* Блюр */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <span className="inline-block bg-white/10 text-white font-bold px-4 py-1.5 rounded-full text-[13px] uppercase tracking-wide border border-white/10">
                  {t("social.badge")}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
                {t("social.title")}
              </h2>
              <p className="text-slate-300 text-lg mb-10 leading-relaxed font-medium">
                {t("social.description")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-black/20 group`}
                  >
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md transition-transform group-hover:scale-110 text-white">
                      {social.icon}
                    </div>
                    <span className="text-white font-bold text-[16px]">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/10 text-slate-400 text-sm italic">
              Star for Life Ukraine © 2026
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
