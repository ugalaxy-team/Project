import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store";

import { ProfileDropdown } from "./ProfileDropdown"; 
import { NotificationsDropdown } from "./NotificationsDropdown"; 

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/tournaments", label: "Турніри" },
    { path: "/aboutUs", label: "Про нас" },
    { path: "/support", label: "Чим ви можете допомогти" },
    { path: "/contact", label: "Контакти" },
  ];
  
  const user = useSelector((s: RootState) => s.user.user);

  return (
    <div className="w-full bg-primary relative z-50">
      <header className="max-w-[1320px] mx-auto flex justify-between items-center px-5 py-4 md:py-6">
        <Link
          to="/"
          className="font-quicksand text-[22px] md:text-[28px] font-extrabold text-white no-underline flex items-center gap-2"
        >
          UGalaxy x Star for Life
        </Link>

        <nav className="hidden lg:flex gap-8 xl:gap-10">
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

        <div className="flex items-center gap-3 md:gap-4">
          {user?.uid ? (
            <div className="flex items-center gap-2 md:gap-4">
              <NotificationsDropdown />
              <ProfileDropdown />
            </div>
          ) : (
            <Link to="/auth" className="btn btn-outline py-2 px-5 md:py-2.5 md:px-7 text-sm md:text-base hidden sm:flex">
              Увійти
            </Link>
          )}

          <button 
            className="lg:hidden text-white p-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-primary shadow-2xl border-t border-white/10 flex flex-col px-5 py-4 gap-4 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block font-semibold text-[18px] py-2 transition-colors duration-300 ${
                  isActive ? "text-accent" : "text-white hover:text-accent"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {!user?.uid && (
            <Link 
              to="/auth" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-outline py-2 px-5 mt-2 text-center sm:hidden"
            >
              Увійти
            </Link>
          )}
        </div>
      )}
    </div>
  );
};