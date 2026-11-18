import React from 'react';
import {
  RotateCcw,
  Sliders,
  Sun,
  Maximize,
  Move,
  Palette,
  Check,
  Scissors,
  FlipHorizontal,
  FlipVertical,
  CheckCheck,
  Grid,
} from 'lucide-react';
import { ShadowSettings, ExportSettings, PresetStyle } from '../types';
import { PRESET_STYLES, DEFAULT_SHADOW_SETTINGS } from '../utils/presets';

interface RightPanelProps {
  settings: ShadowSettings;
  onUpdateSettings: (newSettings: Partial<ShadowSettings>) => void;
  onResetSettings: () => void;
  onApplyToAll: () => void;
  exportSettings: ExportSettings;
  onUpdateExportSettings: (newExport: Partial<ExportSettings>) => void;
  activeImageDimensions?: { width: number; height: number };
}

export const RightPanel: React.FC<RightPanelProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onApplyToAll,
  exportSettings,
  onUpdateExportSettings,
  activeImageDimensions,
}) => {
  const handlePresetSelect = (preset: PresetStyle) => {
    onUpdateSettings(preset.settings);
  };

  const handleCustomWidthChange = (w: number) => {
    if (exportSettings.lockAspectRatio && activeImageDimensions) {
      const ratio = activeImageDimensions.height / activeImageDimensions.width;
      onUpdateExportSettings({
        customWidth: w,
        customHeight: Math.round(w * ratio),
      });
    } else {
      onUpdateExportSettings({ customWidth: w });
    }
  };

  const handleCustomHeightChange = (h: number) => {
    if (exportSettings.lockAspectRatio && activeImageDimensions) {
      const ratio = activeImageDimensions.width / activeImageDimensions.height;
      onUpdateExportSettings({
        customHeight: h,
        customWidth: Math.round(h * ratio),
      });
    } else {
      onUpdateExportSettings({ customHeight: h });
    }
  };

  return (
    <aside className="w-full lg:w-88 bg-white border-l border-neutral-200 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Header with Title & Reset Button */}
      <div className="p-3.5 border-b border-neutral-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-neutral-800" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
            Shadow & Optics Controls
          </h2>
        </div>
        <button
          onClick={onResetSettings}
          title="Reset to Reference Defaults"
          className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Scrollable controls panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-neutral-700">
        {/* 1. Reference Style Presets */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
            Reference Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_STYLES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className="text-left p-2 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-100/60 transition-all group"
              >
                <div className="font-medium text-neutral-900 group-hover:text-black">
                  {preset.name}
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Shadow Optical Properties */}
        <div className="space-y-3.5 pt-2 border-t border-neutral-100">
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Shadow Optics & Blur
          </label>

          {/* Shadow Blur */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Shadow Blur (Penumbra)</span>
              <span className="font-mono tabular-nums text-neutral-500">{settings.blur} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.blur}
              onChange={(e) => onUpdateSettings({ blur: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Edge Softness */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Edge Softness (Diffusion)</span>
              <span className="font-mono tabular-nums text-neutral-500">{settings.edgeSoftness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.edgeSoftness}
              onChange={(e) => onUpdateSettings({ edgeSoftness: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Shadow Opacity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Shadow Opacity</span>
              <span className="font-mono tabular-nums text-neutral-500">{settings.opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.opacity}
              onChange={(e) => onUpdateSettings({ opacity: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Shadow Intensity / Core Density */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Core Density (Gamma)</span>
              <span className="font-mono tabular-nums text-neutral-500">{settings.intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.intensity}
              onChange={(e) => onUpdateSettings({ intensity: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Shadow Color */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-medium">Shadow Color</span>
              <span className="font-mono text-[11px] text-neutral-500 uppercase">{settings.shadowColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.shadowColor}
                onChange={(e) => onUpdateSettings({ shadowColor: e.target.value })}
                className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5"
              />
              <div className="flex items-center gap-1.5 flex-1">
                {[
                  { hex: '#404448', label: 'Neutral Gray' },
                  { hex: '#2e3135', label: 'Deep Slate' },
                  { hex: '#45403c', label: 'Warm Umber' },
                  { hex: '#3d4349', label: 'Cool Charcoal' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => onUpdateSettings({ shadowColor: color.hex })}
                    title={color.label}
                    className={`flex-1 h-6 rounded border transition-transform ${
                      settings.shadowColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'border-neutral-900 scale-105 shadow-2xs ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Geometry & Transform */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Geometry & Placement
            </label>
            <button
              onClick={() =>
                onUpdateSettings({
                  positionX: 0,
                  positionY: 0,
                  rotation: 0,
                  scale: 100,
                  flipH: false,
                  flipV: false,
                })
              }
              className="text-[10px] text-neutral-400 hover:text-neutral-800"
            >
              Center Transform
            </button>
          </div>

          {/* Scale */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Scale</span>
              <span className="font-mono tabular-nums text-neutral-500">{settings.scale}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              value={settings.scale}
              onChange={(e) => onUpdateSettings({ scale: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Rotation</span>
              <span className="font-mono tabular-nums text-neutral-500">{settings.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={settings.rotation}
              onChange={(e) => onUpdateSettings({ rotation: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Offset X & Y */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Offset X</span>
                <span className="font-mono tabular-nums text-neutral-500">{Math.round(settings.positionX)}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={settings.positionX}
                onChange={(e) => onUpdateSettings({ positionX: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Offset Y</span>
                <span className="font-mono tabular-nums text-neutral-500">{Math.round(settings.positionY)}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={settings.positionY}
                onChange={(e) => onUpdateSettings({ positionY: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Flips */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onUpdateSettings({ flipH: !settings.flipH })}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                settings.flipH
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip Horizontal</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ flipV: !settings.flipV })}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                settings.flipV
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span>Flip Vertical</span>
            </button>
          </div>
        </div>

        {/* 4. Background Settings */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Canvas Background
            </label>
            <span className="text-[10px] text-neutral-400">
              {settings.backgroundMode === 'transparent' ? 'Transparent Alpha' : 'Solid Color'}
            </span>
          </div>

          {/* Mode switch */}
          <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => onUpdateSettings({ backgroundMode: 'transparent' })}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                settings.backgroundMode === 'transparent'
                  ? 'bg-white text-neutral-900 shadow-2xs ring-1 ring-neutral-900/10'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-neutral-600" />
              <span>Transparent PNG</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ backgroundMode: 'solid' })}
              className={`py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                settings.backgroundMode === 'solid'
                  ? 'bg-white text-neutral-900 shadow-2xs ring-1 ring-neutral-900/10'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>Solid Color</span>
            </button>
          </div>

          {settings.backgroundMode === 'transparent' ? (
            <div className="p-2.5 bg-neutral-50 border border-neutral-200/80 rounded-lg text-neutral-600 text-[11px] flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-800">100% Transparent Background:</span>
                <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">
                  Exported PNGs will contain zero background — only the natural soft shadow with smooth feathered alpha transparency.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-medium">Solid Background Color</span>
                <span className="font-mono text-[11px] text-neutral-500 uppercase">
                  {settings.backgroundColor}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5"
                />
                <div className="flex items-center gap-1.5 flex-1">
                  {[
                    { hex: '#ffffff', label: 'Clean White' },
                    { hex: '#fbf9f5', label: 'Soft Linen' },
                    { hex: '#f4f5f7', label: 'Pale Gray' },
                    { hex: '#26292e', label: 'Dark Slate' },
                  ].map((bg) => (
                    <button
                      key={bg.hex}
                      onClick={() => onUpdateSettings({ backgroundColor: bg.hex })}
                      title={bg.label}
                      className={`flex-1 h-6 rounded border transition-transform ${
                        settings.backgroundColor.toLowerCase() === bg.hex.toLowerCase()
                          ? 'border-neutral-900 ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: bg.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Solid Background Removal (Chroma/Color keying for non-transparent uploads) */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Background Removal Keyer
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.removeBackground}
                onChange={(e) => onUpdateSettings({ removeBackground: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-neutral-900"></div>
            </label>
          </div>

          <p className="text-[11px] text-neutral-400">
            Enable if your artwork has a solid white or colored background instead of alpha transparency.
          </p>

          {settings.removeBackground && (
            <div className="space-y-2.5 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium">Color to Remove</span>
                <input
                  type="color"
                  value={settings.bgKeyColor}
                  onChange={(e) => onUpdateSettings({ bgKeyColor: e.target.value })}
                  className="w-6 h-6 rounded border border-neutral-300 cursor-pointer p-0"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[11px]">
                  <span>Tolerance</span>
                  <span className="font-mono tabular-nums">{settings.bgTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={settings.bgTolerance}
                  onChange={(e) => onUpdateSettings({ bgTolerance: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[11px]">
                  <span>Edge Feather</span>
                  <span className="font-mono tabular-nums">{settings.bgFeather}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.bgFeather}
                  onChange={(e) => onUpdateSettings({ bgFeather: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* 6. Export Resolution & Quality */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Export Resolution & Format
          </label>

          {/* Format selection */}
          <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => onUpdateExportSettings({ format: 'png' })}
              className={`py-1 rounded text-xs font-medium transition-all ${
                exportSettings.format === 'png'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              PNG (Lossless)
            </button>
            <button
              onClick={() => onUpdateExportSettings({ format: 'jpg' })}
              className={`py-1 rounded text-xs font-medium transition-all ${
                exportSettings.format === 'jpg'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              JPG (Print 300 DPI)
            </button>
          </div>

          {/* Resolution mode */}
          <div className="grid grid-cols-4 gap-1">
            {(['1x', '2x', '4x', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdateExportSettings({ resolutionMode: mode })}
                className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                  exportSettings.resolutionMode === mode
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {mode === '1x' ? '1× (Orig)' : mode === 'custom' ? 'Custom' : `${mode}`}
              </button>
            ))}
          </div>

          {/* Custom dimensions if active */}
          {exportSettings.resolutionMode === 'custom' && (
            <div className="space-y-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-500 block mb-1">Width (px)</span>
                  <input
                    type="number"
                    value={exportSettings.customWidth}
                    onChange={(e) => handleCustomWidthChange(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white border border-neutral-300 rounded font-mono"
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1">Height (px)</span>
                  <input
                    type="number"
                    value={exportSettings.customHeight}
                    onChange={(e) => handleCustomHeightChange(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white border border-neutral-300 rounded font-mono"
                  />
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-neutral-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={exportSettings.lockAspectRatio}
                  onChange={(e) => onUpdateExportSettings({ lockAspectRatio: e.target.checked })}
                  className="rounded text-neutral-900"
                />
                <span>Maintain aspect ratio</span>
              </label>
            </div>
          )}

          {/* JPEG Quality Slider if JPG */}
          {exportSettings.format === 'jpg' && (
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px]">
                <span>JPEG Quality</span>
                <span className="font-mono tabular-nums">{exportSettings.jpegQuality}%</span>
              </div>
              <input
                type="range"
                min="90"
                max="100"
                value={exportSettings.jpegQuality}
                onChange={(e) => onUpdateExportSettings({ jpegQuality: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* 300 DPI Metadata Badge */}
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-emerald-800 text-[11px] flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-900">Embedded 300 DPI Resolution</div>
              <div className="text-[10px] text-emerald-700 leading-normal mt-0.5">
                Physical PNG pHYs (11,811 ppm) & JPEG APP0 JFIF density metadata will be encoded for printing.
              </div>
            </div>
          </div>
        </div>

        {/* 7. Batch Sync Button */}
        <div className="pt-2 border-t border-neutral-100">
          <button
            onClick={onApplyToAll}
            className="w-full py-2 px-3 rounded-lg border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Apply Current Settings to All Images</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
