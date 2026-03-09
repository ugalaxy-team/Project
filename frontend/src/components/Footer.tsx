import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className="bg-bg-body w-full">
      <footer className="bg-dark-theme text-white pt-20 pb-10 px-5 rounded-t-[60px] relative z-10 w-full -mt-10">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 md:gap-[60px] mb-16">
            <div>
              <Link
                to="/"
                className="font-quicksand text-[36px] font-extrabold text-accent mb-3 block no-underline"
              >
                UGalaxy x Star for Life
              </Link>
              <p className="text-slate-400 text-[18px] leading-[1.6] max-w-[300px]">
                Місце, де народжуються найкращі ідеї. Твори, навчайся,
                перемагай.
              </p>
            </div>

            <div className="flex flex-col">
              <h4 className="font-quicksand font-extrabold text-[20px] mb-3 text-slate-400">
                Платформа
              </h4>
              <ul className="list-none space-y-2">
                <li>
                  <Link
                    to="/tasks"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    Всі завдання
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rating"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    Рейтинг учасників
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rules"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    Правила
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <h4 className="font-quicksand font-extrabold text-[20px] mb-3 text-slate-400">
                Спільнота
              </h4>
              <ul className="list-none space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    Discord сервер
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    Telegram канал
                  </a>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    Про нас
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacts"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    Контакти
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-slate-400">
            <p>&copy; 2026 UGalaxy x Star for Life. Всі права захищено.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
