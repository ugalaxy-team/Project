import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PLATFORM_LINKS, INFO_LINKS } from "../config/navigation";

export const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <div className="bg-bg-body w-full transition-colors duration-300">
      <footer className="bg-dark-theme text-white pt-16 md:pt-20 pb-8 md:pb-10 px-5 rounded-t-[40px] md:rounded-t-[60px] relative z-10 w-full -mt-10 transition-colors duration-300">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-[60px] mb-12 md:mb-16">
            <div className="sm:col-span-2 md:col-span-1">
              <Link
                to="/"
                className="font-nunito text-[28px] md:text-[36px] font-extrabold text-accent mb-3 block no-underline transition-colors"
              >
                UGalaxy x Star for Life
              </Link>
              <p className="text-white/70 text-[16px] md:text-[18px] leading-[1.6] max-w-full md:max-w-[300px]">
                {t("footer.description")}
              </p>
            </div>

            <div className="flex flex-col">
              <h4 className="font-nunito font-extrabold text-[18px] md:text-[20px] mb-3 text-white/70">
                {t("footer.platform_title")}
              </h4>
              <ul className="list-none space-y-2">
                {PLATFORM_LINKS.map(({ to, key }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors"
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col">
              <h4 className="font-nunito font-extrabold text-[18px] md:text-[20px] mb-3 text-white/70">
                {t("footer.info_title")}
              </h4>
              <ul className="list-none space-y-2">
                {INFO_LINKS.map(({ to, key }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors"
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 md:pt-8 text-center text-white/50 text-sm md:text-base transition-colors">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
