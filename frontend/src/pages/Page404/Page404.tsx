import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const NotoEmoji = ({ code }: { code: string }) => (
  <img
    src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/emoji.svg`}
    alt="emoji"
    draggable={false}
    className="w-6 h-6 select-none"
  />
);

const EMOJIS = [
  "1f937",
  "1f440",
  "1f573",
  "1f446",
  "1f92f",
  "1f355",
  "1f5fa",
  "1f6a8",
  "1f6b6",
  "1f6ab",
  "1f643",
  "1f680",
  "1f4a1",
  "1f525",
  "1f3af",
  "1f914",
  "1f631",
];

const COLORS = [
  "bg-dark-theme text-white",
  "bg-accent text-slate-900",
  "bg-pink-accent text-white",
  "bg-primary text-white",
];

const generateRandomSticker = () => ({
  id: Date.now() + Math.random(),
  top: `${Math.random() * 90 + 5}%`,
  left: `${Math.random() * 90 + 5}%`,
  rotate: Math.random() * 60 - 30,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  code: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
  textIndex: Math.floor(Math.random() * 11),
});

export const Page404 = () => {
  const { t } = useTranslation("common");

  const [stickers, setStickers] = useState(() =>
    Array.from({ length: 5 }).map(generateRandomSticker),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setStickers((prev) => {
        const newSticker = generateRandomSticker();
        return [...prev, newSticker].slice(-45);
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-bg-body text-text-main relative overflow-hidden font-inter transition-colors duration-500">
      <div className="absolute font-extrabold text-[35vw] text-text-main/[0.03] select-none z-0 flex items-center justify-center w-full h-full pointer-events-none overflow-hidden leading-none tracking-tighter">
        404
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {stickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: sticker.rotate }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`absolute px-5 py-2.5 rounded-full font-extrabold flex items-center gap-2 shadow-xl ${sticker.color}`}
              style={{ top: sticker.top, left: sticker.left }}
            >
              <NotoEmoji code={sticker.code} />
              <span className="text-[14px] md:text-[16px] whitespace-nowrap">
                {t(`errors.404.stickers.${sticker.textIndex}`)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-50 text-center flex flex-col items-center px-4 w-full pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-[120px] md:text-[200px] leading-none font-inter font-extrabold text-primary mb-2 drop-shadow-[0_0_40px_rgba(99,102,241,0.3)] select-none"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center w-full"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-main mb-6 tracking-tight leading-tight uppercase drop-shadow-md">
            {t("errors.404.title")}
          </h2>

          <p className="text-lg md:text-xl text-text-muted mb-12 font-medium max-w-xl mx-auto drop-shadow-sm">
            {t("errors.404.description")}
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-12 py-5 rounded-full font-inter font-bold text-[18px] bg-primary text-white hover:-translate-y-1 hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all duration-300 pointer-events-auto"
          >
            {t("errors.404.go_home")}
          </Link>
        </motion.div>
      </div>
    </main>
  );
};
