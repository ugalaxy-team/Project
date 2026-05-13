import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Hero } from "../../components/Hero";
import { TournamentCard } from "../../components/TournamentCard";
import {
  TOURNAMENTS_DATA,
  type TournamentStatus,
} from "../../data/mockTournaments";
import { cn } from "../../utils/cn";

const PER_PAGE = 15;

const FILTER_IDS: { id: TournamentStatus | "all"; dotColor?: string }[] = [
  { id: "all" },
  { id: "draft", dotColor: "bg-amber-500" },
  { id: "registration", dotColor: "bg-green-500" },
  { id: "running", dotColor: "bg-pink-accent" },
  { id: "finished", dotColor: "bg-text-muted" },
];

export const TournamentsPage = () => {
  const { t } = useTranslation("tournaments");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TournamentStatus | "all">("all");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    return TOURNAMENTS_DATA.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesFilter = filter === "all" || item.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [query, filter]);

  const totalPages = Math.ceil(filteredData.length / PER_PAGE);
  const currentData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredData.slice(start, start + PER_PAGE);
  }, [filteredData, page]);

  const handleFilterChange = (newFilter: TournamentStatus | "all") => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-body font-inter text-text-main transition-colors duration-300">
      <Hero
        bgText={t("hero.bg_text")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <div className="flex-grow w-full max-w-[1320px] mx-auto px-4 md:px-6 -mt-[50px] md:-mt-[70px] mb-20 relative z-30">
        <div className="mb-7 relative z-40">
          <div className="bg-bg-card border-[1.5px] border-border rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-colors duration-300">
            <div className="relative shrink-0 w-full md:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none transition-colors duration-300" />
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder={t("search.placeholder")}
                className="w-full md:w-[260px] pl-[44px] pr-4 py-3 bg-bg-body border-[1.5px] border-border rounded-xl text-[15px] text-text-main font-bold outline-none focus:border-primary focus:bg-bg-card transition-all placeholder:text-text-muted/60 placeholder:font-semibold"
              />
            </div>

            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              {FILTER_IDS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange(option.id)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-2 grow sm:grow-0",
                    filter === option.id
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-bg-body text-text-muted hover:bg-bg-card hover:text-text-main border-[1px] border-border",
                  )}
                >
                  {option.dotColor && (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors duration-300 shrink-0",
                        option.dotColor,
                      )}
                    />
                  )}
                  <span className="whitespace-nowrap">
                    {t(`filters.${option.id}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 text-[15px] font-bold text-text-muted transition-colors duration-300 px-1">
          {t("results.found")}{" "}
          <strong className="text-primary">{filteredData.length}</strong>{" "}
          {filteredData.length === 1
            ? t("results.tournaments_one")
            : t("results.tournaments_many")}
        </div>

        <AnimatePresence mode="wait">
          {currentData.length > 0 ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {currentData.map((tournament) => (
                <motion.div
                  key={tournament.id}
                  variants={itemVariants}
                  className="h-full"
                >
                  <TournamentCard {...tournament} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="py-24 text-center col-span-full bg-bg-card rounded-3xl border border-border transition-colors duration-300 mx-2 md:mx-0"
            >
              <span className="text-[52px] block mb-4 opacity-50">🔍</span>
              <h3 className="font-nunito text-[24px] text-text-main font-extrabold mb-2 transition-colors duration-300">
                {t("empty.title")}
              </h3>
              <p className="text-[16px] font-semibold text-text-muted transition-colors duration-300 px-4">
                {t("empty.subtitle")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="mt-14 flex flex-col items-center gap-5">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 1}
                className="flex items-center gap-1.5 font-nunito font-extrabold text-[15px] text-text-muted hover:text-primary disabled:opacity-30 disabled:hover:text-text-muted transition-colors duration-300"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:block">{t("pagination.prev")}</span>
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={cn(
                        "w-[40px] h-[40px] rounded-xl flex items-center justify-center font-bold text-[15px] transition-all duration-300 border-[1.5px]",
                        page === p
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-transparent text-text-muted border-transparent hover:bg-bg-card hover:border-border hover:text-text-main hover:shadow-sm",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 font-nunito font-extrabold text-[15px] text-text-muted hover:text-primary disabled:opacity-30 disabled:hover:text-text-muted transition-colors duration-300"
              >
                <span className="hidden sm:block">{t("pagination.next")}</span>
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="font-nunito text-[14px] font-extrabold text-text-muted transition-colors duration-300">
              {t("pagination.page")}{" "}
              <strong className="text-primary">{page}</strong>{" "}
              {t("pagination.of")} {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
