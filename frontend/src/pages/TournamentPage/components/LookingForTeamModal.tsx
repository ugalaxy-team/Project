import { useEffect } from "react";

interface LookingForTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LookingForTeamModal = ({
  isOpen,
  onClose,
}: LookingForTeamModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[32px] shadow-2xl max-w-[500px] w-full p-8 md:p-10 animate-[fadeIn_0.3s_ease_forwards]">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-[28px] md:text-[32px] font-quicksand font-bold text-dark-theme text-center mb-4">
              Шукаєш команду?
            </h2>
          </div>

          <p className="text-center text-slate-600 text-[17px] leading-relaxed mb-8">
            Звяжись з нами — ми допоможемо тобі знайти команду та приєднатися до турніру!
          </p>

          <div className="space-y-3 mb-8">
            <a
              href="/contacts"
              className="w-full block text-center bg-primary text-dark-theme font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Перейти на сторінку контактів
            </a>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 text-dark-theme font-semibold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors duration-300"
            >
              Закрити
            </button>
          </div>

          <p className="text-center text-slate-500 text-[14px]">
            Наша команда готова допомогти тобі 24/7
          </p>
        </div>
      </div>
    </>
  );
};
