import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className="bg-bg-body w-full">
      <footer className="bg-dark-theme text-white pt-16 md:pt-20 pb-8 md:pb-10 px-5 rounded-t-[40px] md:rounded-t-[60px] relative z-10 w-full -mt-10">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-[60px] mb-12 md:mb-16">
            <div className="sm:col-span-2 md:col-span-1">
              <Link
                to="/"
                className="font-quicksand text-[28px] md:text-[36px] font-extrabold text-accent mb-3 block no-underline"
              >
                UGalaxy x Star for Life
              </Link>
              <p className="text-slate-400 text-[16px] md:text-[18px] leading-[1.6] max-w-full md:max-w-[300px]">
                Місце, де народжуються найкращі ідеї. Твори, навчайся,
                перемагай.
              </p>
            </div>

            <div className="flex flex-col">
              <h4 className="font-quicksand font-extrabold text-[18px] md:text-[20px] mb-3 text-slate-400">
                Платформа
              </h4>
              <ul className="list-none space-y-2">
                <li>
                  <Link to="/tournaments" className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors">
                    Всі турніри
                  </Link>
                </li>
                <li>
                  <Link to="/rules" className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors">
                    Правила
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <h4 className="font-quicksand font-extrabold text-[18px] md:text-[20px] mb-3 text-slate-400">
                Інформація
              </h4>
              <ul className="list-none space-y-2">
                <li>
                  <Link to="/about-us" className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors">
                    Про нас
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors">
                    Контакти
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="text-white hover:text-accent text-sm md:text-base font-medium transition-colors">
                    Новини
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 md:pt-8 text-center text-slate-400 text-sm md:text-base">
            <p>&copy; 2026 UGalaxy x Star for Life. Всі права захищено.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};