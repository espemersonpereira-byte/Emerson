import React from 'react';
import { Check, Palette } from 'lucide-react';
import { ACCENT_COLOR_PRESETS, resolveAccentShades } from '../utils/themeColors';

interface AppColorPickerProps {
  currentAccent?: string;
  onSelectAccent: (colorIdOrHex: string) => void;
  compact?: boolean;
}

export const AppColorPicker: React.FC<AppColorPickerProps> = ({
  currentAccent = 'orange',
  onSelectAccent,
  compact = false,
}) => {
  const activeShades = resolveAccentShades(currentAccent);
  const isCustomHex =
    currentAccent.startsWith('#') &&
    !ACCENT_COLOR_PRESETS.some(
      (p) => p.hex.toLowerCase() === currentAccent.toLowerCase()
    );

  return (
    <div className="space-y-2.5">
      <div
        className={`grid ${
          compact ? 'grid-cols-4 gap-2' : 'grid-cols-2 sm:grid-cols-4 gap-2.5'
        }`}
      >
        {ACCENT_COLOR_PRESETS.map((preset) => {
          const isSelected =
            currentAccent === preset.id ||
            currentAccent.toLowerCase() === preset.hex.toLowerCase();
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectAccent(preset.id)}
              className={`min-h-[44px] px-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-500/10 text-slate-900 dark:text-white ring-2 ring-orange-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              title={preset.name}
            >
              <span
                className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center shadow-sm"
                style={{ backgroundColor: preset.hex }}
              >
                {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </span>
              {!compact && <span className="truncate">{preset.name}</span>}
            </button>
          );
        })}
      </div>

      {/* Custom Hex Color Picker */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: activeShades[500] }}
          >
            <Palette className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Cor Personalizada Livre
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Escolha qualquer tonalidade para todo o aplicativo
            </div>
          </div>
        </div>

        <label className="min-h-[36px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono-num font-bold flex items-center gap-2 cursor-pointer shrink-0 hover:border-orange-500 transition-colors">
          <input
            type="color"
            value={activeShades[500]}
            onChange={(e) => onSelectAccent(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
          />
          <span>{isCustomHex ? currentAccent.toUpperCase() : 'Escolher'}</span>
        </label>
      </div>
    </div>
  );
};
