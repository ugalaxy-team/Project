import React from 'react';
import { Trash2, Calendar, Clock, AlignLeft, Type } from 'lucide-react';

export const TaskItem = ({ task, index, onUpdate, onRemove }: any) => {
  const handleChange = (e: any) => onUpdate(index, { ...task, [e.target.name]: e.target.value });

  return (
    <div className="group relative bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-b-full transition-all group-hover:w-24" />
      
      <button 
        onClick={() => onRemove(index)} 
        className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={18} />
      </button>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-200">
            {index + 1}
          </div>
          <div className="relative flex-1">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300">
              <Type size={16} />
            </div>
            <input 
              name="title" 
              value={task.title} 
              onChange={handleChange} 
              placeholder="Назва завдання..." 
              className="w-full bg-transparent pl-7 pr-4 py-2 text-slate-800 font-semibold text-lg outline-none border-b-2 border-slate-50 focus:border-indigo-500/40 transition-colors" 
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-4 text-slate-400">
            <AlignLeft size={16} />
          </div>
          <textarea 
            name="description" 
            value={task.description} 
            onChange={handleChange} 
            placeholder="Опис завдання та критерії..." 
            rows={2} 
            className="w-full bg-slate-50/80 pl-11 pr-4 py-3 rounded-2xl text-sm text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 border border-transparent focus:border-indigo-100 transition-all resize-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="group/input space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              <Clock size={12} className="text-indigo-400" />
              Старт
            </label>
            <input 
              type="datetime-local" 
              name="start_time" 
              value={task.start_time} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-medium text-slate-700 outline-none focus:border-indigo-300 focus:bg-white transition-all cursor-pointer" 
            />
          </div>
          
          <div className="group/input space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              <Calendar size={12} className="text-purple-400" />
              Дедлайн
            </label>
            <input 
              type="datetime-local" 
              name="end_time" 
              value={task.end_time} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-medium text-slate-700 outline-none focus:border-purple-300 focus:bg-white transition-all cursor-pointer" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};