import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Hero } from "../../components/Hero";
import { TournamentCard } from "../../components/TournamentCard";
import {
  TOURNAMENTS_DATA,
  type TournamentStatus,
} from "../../data/mockTournaments";

const PER_PAGE = 15;

const FILTER_OPTIONS: {
  id: TournamentStatus | "all";
  label: string;
  dotColor?: string;
}[] = [
  { id: "all", label: "Всі події" },
  { id: "registration", label: "Реєстрація", dotColor: "bg-green-500" },
  { id: "active", label: "В процесі", dotColor: "bg-pink-500" },
  { id: "completed", label: "Архів", dotColor: "bg-slate-400" },
];

export const TournamentsPage = () => {
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
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
    <div className="w-full flex flex-col min-h-screen bg-bg-body font-nunito text-slate-900">
      <Hero
        bgText="ТУРНІРИ"
        title="Усі турніри"
        description="Знайди івент, який підходить саме тобі. Від коду до дизайну — збирай команду та перемагай."
      />

      <div className="flex-grow w-full max-w-[1320px] mx-auto px-6 -mt-[90px] mb-20 relative z-10">
        <div className="mb-7 relative z-40">
          <div className="bg-white border-[1.5px] border-slate-200 rounded-2xl p-3.5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Пошук турніру…"
                className="w-full md:w-[240px] pl-[38px] pr-4 py-2.5 bg-slate-50 border-[1.5px] border-slate-200 rounded-xl text-[14px] font-bold outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-slate-300 placeholder:font-semibold"
              />
            </div>

            <div className="flex gap-1 flex-wrap">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange(option.id)}
                  className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-all flex items-center gap-1.5 ${
                    filter === option.id
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {option.dotColor && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${option.dotColor}`}
                    />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-5 text-[14px] font-bold text-slate-500">
          Знайдено:{" "}
          <strong className="text-primary">{filteredData.length}</strong>{" "}
          турнірів
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="py-20 text-center col-span-full"
            >
              <span className="text-[52px] block mb-3">🔍</span>
              <h3 className="font-quicksand text-[22px] font-extrabold mb-1">
                Нічого не знайдено
              </h3>
              <p className="text-[15px] font-semibold text-slate-500">
                Спробуй змінити фільтр або запит
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="flex items-center gap-5">
              <button
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 1}
                className="flex items-center gap-1 font-quicksand font-extrabold text-[14px] text-slate-500 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                Назад
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
                      className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center font-bold text-[15px] transition-all duration-200 border-[1.5px] ${
                        page === p
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-transparent text-slate-500 border-transparent hover:bg-white hover:border-slate-200 hover:text-slate-900 hover:shadow-sm"
                      }`}
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
                className="flex items-center gap-1 font-quicksand font-extrabold text-[14px] text-slate-500 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
              >
                Вперед
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="font-quicksand text-[14px] font-extrabold text-slate-500">
              Сторінка <strong className="text-primary">{page}</strong> з{" "}
              {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
