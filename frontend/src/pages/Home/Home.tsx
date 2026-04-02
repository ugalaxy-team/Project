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
          circularText: "★ ЗНАЙДИ КОМАНДУ ★ ПРОЯВИ СЕБЕ",
          lottieSrc: "/star.json",
          buttonText: "Долучитись",
          buttonLink: "/register",
        }}
      />
      <TournamentSlider />
    </>
  );
};
