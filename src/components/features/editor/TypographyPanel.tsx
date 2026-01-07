import React, { useState } from 'react';

import type { BannerElement } from '@/types';
import { FONT_OPTIONS_CATEGORIZED, FONT_CATEGORY_LABELS, type FontCategory } from '@/constants';

type TypographyPanelProps = {
  selectedElement: BannerElement | null;
  onUpdate: (updates: Partial<BannerElement>) => void;
};

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'SemiBold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'ExtraBold' },
  { value: '900', label: 'Black' },
];

const TEXT_TRANSFORMS = [
  { value: 'none', label: 'None', icon: 'Aa' },
  { value: 'uppercase', label: 'Uppercase', icon: 'AA' },
  { value: 'lowercase', label: 'Lowercase', icon: 'aa' },
  { value: 'capitalize', label: 'Capitalize', icon: 'Aa' },
] as const;

const TEXT_ALIGNS = [
  { value: 'left', icon: '⬅', label: 'Left' },
  { value: 'center', icon: '↔', label: 'Center' },
  { value: 'right', icon: '➡', label: 'Right' },
] as const;

const STROKE_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
] as const;

// Group fonts by category for dropdown
const groupedFonts = FONT_OPTIONS_CATEGORIZED.reduce(
  (acc, font) => {
    if (!acc[font.category]) acc[font.category] = [];
    acc[font.category].push(font.name);
    return acc;
  },
  {} as Record<FontCategory, string[]>,
);

export function TypographyPanel({ selectedElement, onUpdate }: TypographyPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    font: true,
    effects: true,
    spacing: false,
  });

  if (!selectedElement || selectedElement.type !== 'text') {
    return (
      <div className="glass-panel p-4 rounded-2xl text-center">
        <p className="text-sm text-white/60">Select a text element to edit typography</p>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleBold = () => {
    const currentWeight = selectedElement.fontWeight || '400';
    const newWeight = parseInt(currentWeight) >= 700 ? '400' : '700';
    onUpdate({ fontWeight: newWeight });
  };

  const toggleItalic = () => {
    onUpdate({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' });
  };

  const toggleUnderline = () => {
    const current = selectedElement.textDecoration || 'none';
    if (current === 'none') {
      onUpdate({ textDecoration: 'underline' });
    } else if (current === 'underline') {
      onUpdate({ textDecoration: 'none' });
    } else {
      onUpdate({ textDecoration: current.includes('underline') ? 'line-through' : 'underline' });
    }
  };

  const toggleShadow = () => {
    if (selectedElement.textShadowBlur && selectedElement.textShadowBlur > 0) {
      onUpdate({ textShadowBlur: 0, textShadowOffsetX: 0, textShadowOffsetY: 0 });
    } else {
      onUpdate({
        textShadowBlur: 10,
        textShadowOffsetX: 2,
        textShadowOffsetY: 2,
        textShadowColor: '#000000',
      });
    }
  };

  const toggleStroke = () => {
    if (selectedElement.textStrokeWidth && selectedElement.textStrokeWidth > 0) {
      onUpdate({ textStrokeWidth: 0 });
    } else {
      onUpdate({
        textStrokeWidth: 2,
        textStrokeColor: '#000000',
        textStrokeStyle: 'solid',
      });
    }
  };

  const isBold = parseInt(selectedElement.fontWeight || '400') >= 700;
  const isItalic = selectedElement.fontStyle === 'italic';
  const isUnderlined = (selectedElement.textDecoration || 'none').includes('underline');
  const hasShadow = (selectedElement.textShadowBlur || 0) > 0;
  const hasStroke = (selectedElement.textStrokeWidth || 0) > 0;

  return (
    <div className="glass-panel p-4 space-y-4 rounded-2xl">
      <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
        <span className="text-lg">✍️</span> Typography
      </h3>

      {/* Font Selection Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection('font')}
          className="w-full flex items-center justify-between text-xs font-medium text-white/70 hover:text-white/90 transition-colors"
        >
          <span>Font & Style</span>
          <span className="transform transition-transform" style={{ transform: expandedSections.font ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>

        {expandedSections.font && (
          <div className="space-y-3 pl-2">
            {/* Font Family */}
            <div>
              <label htmlFor="font-family" className="text-xs text-white/60 mb-1 block">Font Family</label>
              <select
                id="font-family"
                value={selectedElement.fontFamily || 'Inter'}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                {(Object.keys(groupedFonts) as FontCategory[]).map((category) => (
                  <optgroup key={category} label={FONT_CATEGORY_LABELS[category]}>
                    {groupedFonts[category].map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="font-size" className="text-xs text-white/60">Size (px)</label>
                <input
                  type="number"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 12 })}
                  className="w-16 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white text-right"
                />
              </div>
              <input
                id="font-size"
                type="range"
                min={12}
                max={200}
                value={selectedElement.fontSize || 16}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>

            {/* Font Weight */}
            <div>
              <label htmlFor="font-weight" className="text-xs text-white/60 mb-1 block">Weight</label>
              <select
                id="font-weight"
                value={selectedElement.fontWeight || '400'}
                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                {FONT_WEIGHTS.map((weight) => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Toggles */}
            <div>
              <label className="text-xs text-white/60 mb-2 block">Style</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleBold}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                    isBold
                      ? 'bg-purple-500/30 text-white border-2 border-purple-400/50'
                      : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10'
                  }`}
                  aria-label="Toggle bold"
                  aria-pressed={isBold}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={toggleItalic}
                  className={`flex-1 px-3 py-2 rounded-lg italic text-sm transition-all ${
                    isItalic
                      ? 'bg-purple-500/30 text-white border-2 border-purple-400/50'
                      : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10'
                  }`}
                  aria-label="Toggle italic"
                  aria-pressed={isItalic}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={toggleUnderline}
                  className={`flex-1 px-3 py-2 rounded-lg underline text-sm transition-all ${
                    isUnderlined
                      ? 'bg-purple-500/30 text-white border-2 border-purple-400/50'
                      : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10'
                  }`}
                  aria-label="Toggle underline"
                  aria-pressed={isUnderlined}
                >
                  U
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color & Opacity Section */}
      <div className="space-y-3">
        <div>
          <label htmlFor="text-color" className="text-xs text-white/60 mb-1 block">Color</label>
          <div className="flex gap-2">
            <input
              id="text-color"
              type="color"
              value={selectedElement.color || '#ffffff'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer border-2 border-white/20"
            />
            <input
              type="text"
              value={selectedElement.color || '#ffffff'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="#ffffff"
              aria-label="Color hex value"
            />
          </div>
        </div>

        <div>
          <label htmlFor="text-opacity" className="text-xs text-white/60 mb-1 block">
            Opacity: {selectedElement.opacity || 100}%
          </label>
          <input
            id="text-opacity"
            type="range"
            min={0}
            max={100}
            value={selectedElement.opacity || 100}
            onChange={(e) => onUpdate({ opacity: parseInt(e.target.value) })}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>
      </div>

      {/* Text Effects Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection('effects')}
          className="w-full flex items-center justify-between text-xs font-medium text-white/70 hover:text-white/90 transition-colors"
        >
          <span>Effects</span>
          <span className="transform transition-transform" style={{ transform: expandedSections.effects ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>

        {expandedSections.effects && (
          <div className="space-y-3 pl-2">
            {/* Shadow Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/60">Shadow</label>
                <button
                  type="button"
                  onClick={toggleShadow}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    hasShadow
                      ? 'bg-purple-500/30 text-white border border-purple-400/50'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {hasShadow ? 'On' : 'Off'}
                </button>
              </div>

              {hasShadow && (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedElement.textShadowColor || '#000000'}
                      onChange={(e) => onUpdate({ textShadowColor: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer border-2 border-white/20"
                    />
                    <input
                      type="text"
                      value={selectedElement.textShadowColor || '#000000'}
                      onChange={(e) => onUpdate({ textShadowColor: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50">Blur: {selectedElement.textShadowBlur || 0}px</label>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={selectedElement.textShadowBlur || 0}
                      onChange={(e) => onUpdate({ textShadowBlur: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-white/50">X: {selectedElement.textShadowOffsetX || 0}px</label>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={selectedElement.textShadowOffsetX || 0}
                        onChange={(e) => onUpdate({ textShadowOffsetX: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Y: {selectedElement.textShadowOffsetY || 0}px</label>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={selectedElement.textShadowOffsetY || 0}
                        onChange={(e) => onUpdate({ textShadowOffsetY: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stroke Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/60">Stroke</label>
                <button
                  type="button"
                  onClick={toggleStroke}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    hasStroke
                      ? 'bg-purple-500/30 text-white border border-purple-400/50'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {hasStroke ? 'On' : 'Off'}
                </button>
              </div>

              {hasStroke && (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedElement.textStrokeColor || '#000000'}
                      onChange={(e) => onUpdate({ textStrokeColor: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer border-2 border-white/20"
                    />
                    <input
                      type="text"
                      value={selectedElement.textStrokeColor || '#000000'}
                      onChange={(e) => onUpdate({ textStrokeColor: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50">Width: {selectedElement.textStrokeWidth || 0}px</label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={selectedElement.textStrokeWidth || 0}
                      onChange={(e) => onUpdate({ textStrokeWidth: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Style</label>
                    <select
                      value={selectedElement.textStrokeStyle || 'solid'}
                      onChange={(e) => onUpdate({ textStrokeStyle: e.target.value as 'solid' | 'dashed' | 'dotted' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      {STROKE_STYLES.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacing & Transform Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection('spacing')}
          className="w-full flex items-center justify-between text-xs font-medium text-white/70 hover:text-white/90 transition-colors"
        >
          <span>Spacing & Position</span>
          <span className="transform transition-transform" style={{ transform: expandedSections.spacing ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>

        {expandedSections.spacing && (
          <div className="space-y-3 pl-2">
            {/* Numeric Positioning */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pos-x" className="text-xs text-white/60 mb-1 block">X Position</label>
                <input
                  id="pos-x"
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label htmlFor="pos-y" className="text-xs text-white/60 mb-1 block">Y Position</label>
                <input
                  id="pos-y"
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Letter Spacing */}
            <div>
              <label htmlFor="letter-spacing" className="text-xs text-white/60 mb-1 block">
                Letter Spacing: {selectedElement.letterSpacing || 0}px
              </label>
              <input
                id="letter-spacing"
                type="range"
                min={-10}
                max={50}
                value={selectedElement.letterSpacing || 0}
                onChange={(e) => onUpdate({ letterSpacing: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>

            {/* Text Transform */}
            <div>
              <label className="text-xs text-white/60 mb-2 block">Transform</label>
              <div className="grid grid-cols-4 gap-2">
                {TEXT_TRANSFORMS.map((transform) => (
                  <button
                    key={transform.value}
                    type="button"
                    onClick={() => onUpdate({ textTransform: transform.value })}
                    className={`px-2 py-2 rounded-lg text-xs transition-all ${
                      (selectedElement.textTransform || 'none') === transform.value
                        ? 'bg-purple-500/30 text-white border-2 border-purple-400/50'
                        : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10'
                    }`}
                    aria-label={transform.label}
                    title={transform.label}
                  >
                    {transform.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="text-xs text-white/60 mb-2 block">Alignment</label>
              <div className="grid grid-cols-3 gap-2">
                {TEXT_ALIGNS.map((align) => (
                  <button
                    key={align.value}
                    type="button"
                    onClick={() => onUpdate({ textAlign: align.value })}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      (selectedElement.textAlign || 'left') === align.value
                        ? 'bg-purple-500/30 text-white border-2 border-purple-400/50'
                        : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10'
                    }`}
                    aria-label={align.label}
                    title={align.label}
                  >
                    {align.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accessibility Note */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
        <p className="text-xs text-blue-200/80">
          💡 Tip: Ensure sufficient color contrast for readability (WCAG AA: 4.5:1 for normal text)
        </p>
      </div>
    </div>
  );
}
