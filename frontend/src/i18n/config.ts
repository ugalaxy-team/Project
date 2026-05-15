import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ukCommon from "../locales/uk/common.json";
import ukAuth from "../locales/uk/auth.json";
import ukRegistration from "../locales/uk/registration.json";
import ukHome from "../locales/uk/home.json";
import ukAbout from "../locales/uk/about.json";
import ukFaq from "../locales/uk/faq.json";
import ukSupport from "../locales/uk/support.json";
import ukContact from "../locales/uk/contact.json";
import ukTournaments from "../locales/uk/tournaments.json";
import ukRules from "../locales/uk/rules.json";
import ukProfile from "../locales/uk/profile.json";
import ukRoleRequest from "../locales/uk/roleRequest.json";
import ukJury from "../locales/uk/jury.json";
import ukNews from "../locales/uk/news.json";
import ukModals from "../locales/uk/modals.json";
import ukTournament from "../locales/uk/tournament.json";

import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enRegistration from "../locales/en/registration.json";
import enHome from "../locales/en/home.json";
import enAbout from "../locales/en/about.json";
import enFaq from "../locales/en/faq.json";
import enSupport from "../locales/en/support.json";
import enContact from "../locales/en/contact.json";
import enTournaments from "../locales/en/tournaments.json";
import enRules from "../locales/en/rules.json";
import enProfile from "../locales/en/profile.json";
import enRoleRequest from "../locales/en/roleRequest.json";
import enJury from "../locales/en/jury.json";
import enModals from "../locales/en/modals.json";
import enNews from "../locales/en/news.json";
import enTournament from "../locales/en/tournament.json";

const resources = {
  uk: {
    common: ukCommon,
    auth: ukAuth,
    registration: ukRegistration,
    home: ukHome,
    about: ukAbout,
    faq: ukFaq,
    support: ukSupport,
    contact: ukContact,
    tournaments: ukTournaments,
    rules: ukRules,
    profile: ukProfile,
    roleRequest: ukRoleRequest,
    jury: ukJury,
    news: ukNews,
    modals: ukModals,
    tournament: ukTournament,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    registration: enRegistration,
    home: enHome,
    about: enAbout,
    faq: enFaq,
    support: enSupport,
    contact: enContact,
    tournaments: enTournaments,
    rules: enRules,
    profile: enProfile,
    roleRequest: enRoleRequest,
    jury: enJury,
    modals: enModals,
    news: enNews,
    tournament: enTournament,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "uk",
    supportedLngs: ["uk", "en"],
    ns: [
      "common",
      "auth",
      "registration",
      "home",
      "about",
      "faq",
      "support",
      "contact",
      "tournaments",
      "rules",
      "profile",
      "roleRequest",
      "jury",
      "modals",
      "news",
      "tournament",
    ],
    defaultNS: "common",
    debug: import.meta.env.DEV,
    interpolation: { escapeValue: false },
  });

export default i18n;