import { useState, useEffect } from 'react';
import ColorSchemeGrid from './ColorSchemeGrid';
import { COLOR_SCHEMES } from '../../context/ThemeContext';
import { toast } from './Toast';

export default function AccentColorPicker({ 
  accentColor, 
  colorScheme, 
  onAccentChange, 
  onSchemeChange 
}) {
  const [customColor, setCustomColor] = useState(accentColor);

  // Sync customColor with accentColor prop when it changes
  useEffect(() => {
    setCustomColor(accentColor);
  }, [accentColor]);

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    
    // Validate hex color format
    const isValidHex = /^#[0-9A-F]{6}$/i.test(color);
    if (!isValidHex) {
      return;
    }
    
    onAccentChange(color);
    onSchemeChange('custom');
  };

  return (
    <div className="space-y-6">
      {/* Current Theme Preview */}
      <div className="p-4 rounded-xl border-2 border-stone/20 dark:border-zinc-800 bg-sand/20 dark:bg-zinc-900/50">
        <p className="text-xs font-medium text-drift dark:text-zinc-400 mb-2">Current Accent Color</p>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl shadow-md border-2 border-white dark:border-zinc-800" 
            style={{ backgroundColor: accentColor }}
          />
          <div>
            <p className="text-sm font-semibold text-char dark:text-zinc-200">
              {colorScheme === 'custom' ? 'Custom' : COLOR_SCHEMES[colorScheme]?.name || 'Default'}
            </p>
            <p className="text-xs text-drift dark:text-zinc-500 font-mono">{accentColor}</p>
          </div>
        </div>
      </div>

      {/* Color Scheme Presets */}
      <div>
        <label className="text-sm font-medium text-char dark:text-zinc-200 mb-3 block">
          Color Scheme
        </label>
        <p className="text-xs text-drift dark:text-zinc-500 mb-4">
          Choose a preset color scheme or create your own
        </p>
        <ColorSchemeGrid value={colorScheme} onChange={onSchemeChange} />
      </div>
      
      {/* Custom Color Input */}
      <div>
        <label 
          htmlFor="custom-accent-color"
          className="text-sm font-medium text-char dark:text-zinc-200 mb-2 block"
        >
          Custom Accent Color
        </label>
        <p className="text-xs text-drift dark:text-zinc-500 mb-3">
          Pick a custom color to personalize your theme
        </p>
        <div className="flex items-center gap-3">
          <input
            id="custom-accent-color"
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-16 h-12 rounded-xl cursor-pointer border-2 border-stone/20 
                       dark:border-zinc-800 hover:border-stone/40 dark:hover:border-zinc-700
                       transition-colors duration-200"
            aria-label="Select custom accent color"
          />
          <div className="flex-1">
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                const value = e.target.value;
                setCustomColor(value);
                if (/^#[0-9A-F]{6}$/i.test(value)) {
                  onAccentChange(value);
                  onSchemeChange('custom');
                }
              }}
              placeholder="#000000"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-stone/20 
                         dark:border-zinc-800 bg-white dark:bg-zinc-900
                         text-sm text-char dark:text-zinc-200
                         focus:outline-none focus:border-obsidian dark:focus:border-zinc-600
                         transition-colors duration-200"
              aria-label="Custom accent color hex code"
            />
          </div>
        </div>
        {colorScheme === 'custom' && (
          <p className="text-xs text-drift dark:text-zinc-500 mt-2">
            Using custom color: {customColor}
          </p>
        )}
      </div>
    </div>
  );
}
