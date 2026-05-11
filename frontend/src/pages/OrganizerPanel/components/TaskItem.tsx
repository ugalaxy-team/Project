import React from 'react';

export const TaskItem = ({ task, index, onUpdate, onRemove }: any) => {
  const handleChange = (e: any) => onUpdate(index, { ...task, [e.target.name]: e.target.value });

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#6366f1]" />
      
      <button onClick={() => onRemove(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black italic">#{index + 1}</span>
          <input name="title" value={task.title} onChange={handleChange} placeholder="Назва завдання..." className="flex-1 bg-transparent text-slate-900 font-bold outline-none border-b border-transparent focus:border-[#6366f1]/30 pb-1" />
        </div>

        <textarea name="description" value={task.description} onChange={handleChange} placeholder="Опис завдання та критерії..." rows={2} className="w-full bg-slate-50/50 p-4 rounded-xl text-sm text-slate-600 outline-none focus:bg-white transition-all resize-none border border-transparent focus:border-[#6366f1]/10" />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Старт</label>
            <input type="datetime-local" name="start_time" value={task.start_time} onChange={handleChange} className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-800 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Дедлайн</label>
            <input type="datetime-local" name="end_time" value={task.end_time} onChange={handleChange} className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-800 outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
};