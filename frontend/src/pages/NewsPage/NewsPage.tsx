import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

import { getNews, type NewsArticle } from "@/api/requests/getNews";
import { Hero } from "@/components/Hero"; // Переконайся, що шлях правильний
import { cn } from "@/utils/cn";

interface ArticleReaderProps {
  article: NewsArticle;
  onClose: () => void;
}

interface NewsCardProps {
  article: NewsArticle;
  onClick: (id: string) => void;
  index: number;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  article,
  onClose,
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] bg-bg-card border border-border rounded-[40px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-700 overflow-hidden transition-colors duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-bg-body hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-text-muted transition-all duration-300 z-20 hover:rotate-90 border border-border shadow-sm"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>

        <div className="overflow-y-auto px-6 py-12 md:px-16 md:py-16 scrollbar-hide relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${article.categoryColor}`}
              >
                {article.category}
              </span>
              <span className="text-sm text-text-muted font-medium">
                {article.date}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-text-main mb-8 leading-tight transition-colors">
              {article.title}
            </h1>
            <div className="w-16 h-1.5 bg-primary rounded-full mb-10"></div>
            <div
              className="prose prose-lg md:prose-xl dark:prose-invert text-text-muted max-w-none transition-colors"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onClick,
  index,
}) => {
  const { t } = useTranslation("news");

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={() => onClick(article.id)}
      className="group bg-bg-card rounded-[32px] overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer p-8 md:p-10"
    >
      <div className="flex items-center gap-4 mb-6">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${article.categoryColor}`}
        >
          {article.category}
        </span>
        <span className="text-sm text-text-muted font-medium">
          {article.date}
        </span>
      </div>
      <h3 className="font-black text-text-main mb-4 group-hover:text-primary transition-colors leading-tight text-2xl">
        {article.title}
      </h3>
      <p className="text-text-muted mb-8 leading-relaxed line-clamp-3 flex-grow transition-colors">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-2 mt-auto text-primary font-bold text-sm uppercase tracking-wide group-hover:gap-4 transition-all">
        {t("read_more")}
        <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
      </div>
    </motion.article>
  );
};

export const NewsPage: React.FC = () => {
  const { t } = useTranslation("news");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then(setNewsArticles)
      .catch(() => {
        // Fallback to mock data on error
      })
      .finally(() => setLoading(false));
  }, []);

  const activeArticle = newsArticles.find((a) => a.id === selectedArticleId);

  return (
    <div className="w-full flex flex-col min-h-screen bg-bg-body text-text-main pb-20 font-inter transition-colors duration-300">
      <Hero
        bgText={t("hero.bg_text")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <div className="flex-grow w-full max-w-[1320px] mx-auto px-6 -mt-[90px] relative z-20">
        {loading ? (
          <div className="bg-bg-card rounded-[32px] p-12 text-center border border-border shadow-sm">
            <p className="text-text-muted font-medium text-lg animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : newsArticles.length === 0 ? (
          <div className="bg-bg-card rounded-[32px] p-12 text-center border border-border shadow-sm">
            <p className="text-text-muted font-medium text-lg">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article, idx) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={setSelectedArticleId}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>

      {activeArticle && (
        <ArticleReader
          article={activeArticle}
          onClose={() => setSelectedArticleId(null)}
        />
      )}
    </div>
  );
};
