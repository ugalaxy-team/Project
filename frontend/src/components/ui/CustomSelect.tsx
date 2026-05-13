import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check, type LucideIcon } from 'lucide-react';
import { useFloating, offset, flip, shift, autoUpdate, size } from '@floating-ui/react';

interface Option {
  id: string | number;
  label: string;
}

interface GroupedOption {
  category: string;
  items: Option[];
}

interface CustomSelectProps {
  options: GroupedOption[];
  value: Option | null;
  onChange: (value: Option) => void;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label, icon: Icon, disabled }) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 10 }),
      shift({ padding: 10 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight - 20, 300)}px`,
          });
        },
      }),
    ],
  });

  return (
    <div className={`relative pt-2 w-full ${disabled ? 'opacity-60' : ''}`}>
      <span className="absolute top-0 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase z-10 tracking-widest">
        {label}
      </span>

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            ref={refs.setReference}
            className="group w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none outline-none hover:bg-slate-100 transition-all text-left"
          >
            <div className="flex items-center gap-2 truncate">
              {Icon && <Icon size={14} className="text-[#6D72F1] shrink-0" />}
              <span className="truncate">{value?.label || 'Виберіть варіант'}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400 transition-transform duration-200 ui-open:rotate-180" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-[220] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 focus:outline-none p-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
            >
              {options.map((group) => (
                <div key={group.category} className="mb-2 last:mb-0">
                  <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 rounded-lg mb-1">
                    {group.category}
                  </div>
                  {group.items.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      value={option}
                      className={({ active, selected }) => `
                        relative cursor-pointer select-none py-2 px-3 rounded-xl transition-all mb-0.5 last:mb-0
                        ${active ? 'bg-slate-50 text-[#6D72F1]' : 'text-slate-600'}
                        ${selected ? 'bg-[#6D72F1]/5 text-[#6D72F1]' : ''}
                      `}
                    >
                      {({ selected }) => (
                        <div className="flex items-center justify-between">
                          <span className={`block truncate text-xs ${selected ? 'font-black' : 'font-bold'}`}>
                            {option.label}
                          </span>
                          {selected && (
                            <Check size={12} className="text-[#6D72F1]" strokeWidth={3} />
                          )}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </div>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default CustomSelect;