import { type FC, useState, useEffect, useMemo } from 'react';
import { MOCK_NEWS, type NewsArticle } from './newsData';

interface ArticleReaderProps {
  article: NewsArticle;
  onClose: () => void;
}

interface NewsCardProps {
  article: NewsArticle;
  onClick: (id: string) => void;
}

const InteractiveGarland: FC = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [screenWidth, setScreenWidth] = useState(1000);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setScreenWidth(window.innerWidth);

    const handleResize = () => setScreenWidth(window.innerWidth);
    const handleMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });

    let animationFrame: number;

    const animate = () => {
      setTime((t) => t + 1);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMove);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  const stars = useMemo(() => {
    const glowingIndices = new Set([3, 7, 12, 15, 19, 23, 28, 31, 35, 39]);

    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      leftPercent: i * 2.5 + 1.25,
      stringHeight: 25 + Math.sin(i * 1.5) * 15 + Math.random() * 35,
      size: 10 + (i % 3) * 4 + Math.random() * 4,
      sensitivity: 0.6 + Math.random() * 0.4,
      canGlow: glowingIndices.has(i),
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-72 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => {
        const starX = (star.leftPercent / 100) * screenWidth;
        const starY = star.stringHeight;

        const dx = mousePos.x - starX;
        const dy = mousePos.y - starY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const radius = 160;
        
        let mouseTilt = 0;

        if (distance < radius) {
        const force = Math.pow((radius - distance) / radius, 1.5);
        mouseTilt = -(dx / radius) * force * 50 * star.sensitivity;
        }
        const weightFactor = star.stringHeight / 80;

        const idleSwing = Math.sin(time * (0.04 + weightFactor * 0.03) + star.phase) * (10 + weightFactor * 8);
        const finalTilt = idleSwing + mouseTilt;

        const isHovered = distance < 60;

        return (
          <div
            key={star.id}
            className="absolute top-0 flex flex-col items-center"
            style={{
              left: `${star.leftPercent}%`,
              transform: `rotate(${finalTilt}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s linear',
            }}
          >
            <div
              className="w-[1px] bg-gradient-to-b from-slate-400 via-slate-300 to-transparent opacity-30"
              style={{ height: `${star.stringHeight}px` }}
            />

            <svg
              width={star.size}
              height={star.size}
              viewBox="0 0 24 24"
              className={`transition-all duration-500 ${
                star.canGlow && isHovered
                  ? 'drop-shadow-[0_0_16px_rgba(139,92,246,0.9)] fill-[#8B5CF6] scale-125'
                  : 'drop-shadow-[0_0_6px_rgba(91,99,246,0.3)] fill-[#5B63F6] scale-100 opacity-80'
              }`}
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export const ArticleReader: FC<ArticleReaderProps> = ({ article, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-500">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] bg-white rounded-[40px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-700 overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-slate-50 hover:bg-[#5B63F6] hover:text-white rounded-full flex items-center justify-center text-slate-400 transition-all duration-300 z-20 hover:rotate-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto px-6 py-12 md:px-16 md:py-16 scrollbar-hide relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${article.categoryColor}`}>
                {article.category}
              </span>
              <span className="text-sm text-slate-400 font-medium">{article.date}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] mb-8 leading-tight">{article.title}</h1>
            <div className="w-16 h-1.5 bg-[#5B63F6] rounded-full mb-10"></div>
            <div className="prose prose-lg md:prose-xl text-slate-700 max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const NewsCard: FC<NewsCardProps> = ({ article, onClick }) => {
  return (
    <article 
      onClick={() => onClick(article.id)}
      className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(91,99,246,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer p-8 md:p-10"
    >
      <div className="flex items-center gap-4 mb-6">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${article.categoryColor}`}>{article.category}</span>
        <span className="text-sm text-gray-400 font-medium">{article.date}</span>
      </div>
      <h3 className="font-black text-[#1E293B] mb-4 group-hover:text-[#5B63F6] transition-colors leading-tight text-2xl">{article.title}</h3>
      <p className="text-gray-500 mb-8 leading-relaxed line-clamp-3 flex-grow">{article.excerpt}</p>
      <div className="flex items-center gap-2 mt-auto text-[#5B63F6] font-bold text-sm uppercase tracking-wide group-hover:gap-4 transition-all">
        Читати повністю
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </div>
    </article>
  );
};

export const NewsPage: FC = () => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const activeArticle = MOCK_NEWS.find(a => a.id === selectedArticleId);

  return (
    <div className="min-h-screen bg-[#F4F7FF] font-sans pb-24 relative overflow-x-hidden">
      <InteractiveGarland />

      <header className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center relative z-10 pointer-events-none">
        <h1 className="text-5xl md:text-7xl font-black text-[#1E293B] mb-6 tracking-tight pointer-events-auto inline-block">
          Журнал <span className="text-[#5B63F6]">Подій</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto pointer-events-auto">
          Найважливіше зі світу UGalaxy. Анонси турнірів, історії волонтерів та оновлення платформи.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_NEWS.map((article) => (
            <NewsCard key={article.id} article={article} onClick={setSelectedArticleId} />
          ))}
        </div>
      </main>

      {activeArticle && <ArticleReader article={activeArticle} onClose={() => setSelectedArticleId(null)} />}
    </div>
  );
};