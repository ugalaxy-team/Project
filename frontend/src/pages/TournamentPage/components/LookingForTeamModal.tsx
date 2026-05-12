import { useEffect } from "react";
import { createPortal } from "react-dom";

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
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="bg-[#6D72F1] p-8 text-white relative">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <svg 
                className="w-7 h-7" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              Пошук команди
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-10 bg-[#FBFBFF] text-center">
          <div className="w-20 h-20 bg-[#6D72F1]/10 text-[#6D72F1] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 uppercase mb-4 tracking-tight">
            Шукаєш команду?
          </h3>
          
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Зв'яжись з нами — ми допоможемо тобі знайти однодумців та приєднатися до турніру вже сьогодні!
          </p>
          <div className="space-y-3">
            <a
              href="/contact"
              className="block w-full py-4 bg-[#6D72F1] text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] shadow-lg shadow-[#6D72F1]/25 transition-all hover:brightness-110 active:scale-[0.98] text-center"
            >
              Перейти на сторінку контактів
            </a>
            
            <button
              onClick={onClose}
              className="w-full py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
            >
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};