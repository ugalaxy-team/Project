import { Link, NavLink } from "react-router-dom";

export const Header = () => {
  const navItems = [
    { path: "/tournaments", label: "Турніри" },
    { path: "/projects", label: "Проєкти" },
    { path: "/join", label: "Як долучитись" },
    { path: "/rating", label: "Рейтинг" },
  ];

  return (
    <div className="w-full bg-primary relative z-50">
      <header className="max-w-[1320px] mx-auto flex justify-between items-center px-5 py-6">
        <Link
          to="/"
          className="font-quicksand text-[28px] font-extrabold text-white no-underline flex items-center gap-2"
        >
          UGalaxy x Star for Life
        </Link>

        <nav className="hidden md:flex gap-10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative font-semibold text-[16px] py-2 transition-colors duration-300 ${
                  isActive ? "text-accent" : "text-white hover:text-accent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <Link to="/auth" className="btn btn-outline py-2.5 px-7 text-base">
          Увійти
        </Link>
      </header>
    </div>
  );
};
