import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ukCommon from "../locales/uk/common.json";
import ukAuth from "../locales/uk/auth.json";
import ukRegistration from "../locales/uk/registration.json";
import ukHome from "../locales/uk/home.json";

import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enRegistration from "../locales/en/registration.json";
import enHome from "../locales/en/home.json";

const resources = {
  uk: {
    common: ukCommon,
    auth: ukAuth,
    registration: ukRegistration,
    home: ukHome,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    registration: enRegistration,
    home: enHome,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "uk",
    supportedLngs: ["uk", "en"],
    ns: ["common", "auth", "registration", "home"],
    defaultNS: "common",

    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
