import { Link, useNavigate } from "react-router-dom";

export const Page404 = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-body px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-[0.03] bg-[radial-gradient(circle_at_center,#000_2px,transparent_2px)] bg-[size:24px_24px]"></div>

      <div className="space-y-6 max-w-2xl relative z-10">
        <h1 className="text-[120px] md:text-[150px] leading-none font-quicksand font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-pink-accent select-none drop-shadow-sm">
          404
        </h1>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-quicksand font-bold text-dark-theme">
            Ви вийшли за межі системи 👾
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto font-inter">
            Сторінку, яку ви шукаєте, було видалено, або вона існує лише в
            паралельному всесвіті. Давайте повернемося на безпечну територію.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3.5 font-quicksand font-bold text-[18px] rounded-full border-2 border-primary text-primary hover:bg-primary/5 focus:outline-none focus:ring-4 focus:ring-primary/20 active:scale-95 transition-all"
          >
            ← Назад
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 font-quicksand font-bold text-[18px] rounded-full bg-primary text-white hover:-translate-y-1 shadow-[0_10px_20px_var(--color-primary)] shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/30 active:scale-95 transition-all"
          >
            На головну
          </Link>
        </div>
      </div>
    </main>
  );
};
