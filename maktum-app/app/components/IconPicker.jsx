'use client';

import { useState, useEffect } from 'react';
import { getIcons } from '@/app/actions/icons';

export default function IconPicker({ value, onChange }) {
  const [icons, setIcons] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getIcons().then(setIcons);
  }, []);

  const selectedIcon = icons.find(i => i.name === value);
  const filtered = icons.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.label && i.label.includes(search))
  );

  return (
    <div className="relative font-sans">
      {/* دکمه انتخاب آیکون فعلی */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 bg-[#080c16] rounded-xl text-white hover:border-[#06b6d4] transition-colors"
      >
        <span className="text-sm text-gray-300">
          {selectedIcon ? (selectedIcon.label || selectedIcon.name) : 'انتخاب آیکون...'}
        </span>
        {selectedIcon ? (
          <div className="w-6 h-6 text-[#06b6d4] [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: selectedIcon.svgCode }} />
        ) : (
          <span className="text-xs text-gray-500">کلیک کنید</span>
        )}
      </button>

      {/* مدال / پاپ‌آپ لیست آیکون‌ها */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 w-full bg-[#0b0f19] rounded-xl p-4 shadow-2xl max-h-60 overflow-y-auto">
          <input
            type="text"
            placeholder="جستجوی آیکون..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-3 bg-[#080c16] rounded-lg p-2 text-xs text-white outline-none focus:border-[#06b6d4]"
          />
          <div className="grid grid-cols-5 gap-2">
            {filtered.map((icon) => (
              <button
                key={icon.id}
                type="button"
                onClick={() => {
                  onChange(icon.name); // ذخیره شناسه آیکون
                  setIsOpen(false);
                }}
                title={icon.label || icon.name}
                className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                  value === icon.name ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4]' : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: icon.svgCode }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}