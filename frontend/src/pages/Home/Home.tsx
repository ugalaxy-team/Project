import { Link } from "react-router-dom";
import { Hero } from "../../components/Hero";
import { TournamentSlider } from "./components/TournamentSlider";

export const Home = () => {
  return (
    <>
      <Hero
        bgText="STAR FOR LIFE"
        title={
          <>
            Твори.
            <br />
            Дій.
            <br />
            Перемагай.
          </>
        }
        description="Платформа для твоїх найсміливіших ідей. Від написання коду та дизайну до мистецтва й креативу — збирай команду, розкривай свій талант, ділися досвідом, набувай його і рухайся до вершини!"
        badges={[
          {
            text: "🔥 Прояви себе!",
            className:
              "bottom-[35%] left-[2vw] xl:left-[10vw] bg-dark-theme text-white -rotate-6",
          },
          {
            text: "💡 Твоя ідея змінить світ",
            className:
              "top-[15%] right-[2vw] xl:right-[8vw] bg-accent text-slate-900 rotate-3 text-[22px]",
          },
          {
            text: "🚀 Дій зараз",
            className:
              "bottom-[20%] right-[4vw] xl:right-[12vw] bg-pink-accent text-white -rotate-3",
          },
          {
            text: "🍕 Піца, код, перемога",
            className:
              "top-[25%] left-[5vw] xl:left-[12vw] bg-primary text-white rotate-6 border-2 border-white/20",
          },
          {
            text: "🤘 Будь собою!",
            className:
              "bottom-[50%] right-[1vw] xl:right-[5vw] bg-white text-dark-theme -rotate-12",
          },
        ]}
        mascot={{
          circularText: "★ЗНАЙДИ КОМАНДУ ★ ПРОЯВИ СЕБЕ ",
          lottieSrc: "/star.json",
          buttonText: "Долучитись",
          buttonLink: "/tournaments",
        }}
      />

      <TournamentSlider />

      <div className="w-full px-5 pt-0 pb-25 bg-transparent">
        <div className="max-w-[1320px] mx-auto bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
          <div className="absolute right-20 -bottom-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 text-center md:text-left flex-1">
            <span className="inline-block bg-white/20 text-white backdrop-blur-sm border border-white/30 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              Нові можливості
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Хочеш більше впливу на платформі?
            </h3>
            <p className="text-white/90 font-medium text-lg max-w-2xl">
              Подай заявку на отримання нової ролі та розблокуй додатковий функціонал для себе та своєї команди.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0 mt-4 md:mt-0">
            <Link 
              to="/RoleRequestForm" 
              className="inline-flex items-center justify-center bg-white text-[#5c68ff] font-bold text-lg px-8 py-4 rounded-xl hover:bg-slate-50 hover:-translate-y-1 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Отримати роль
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};