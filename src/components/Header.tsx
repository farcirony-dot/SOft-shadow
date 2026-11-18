import React from 'react';
import { Layers, Download, Sparkles, HelpCircle, FileImage } from 'lucide-react';

interface HeaderProps {
  totalImages: number;
  readyImages: number;
  onOpenHelp: () => void;
  onQuickExportPng: () => void;
  onQuickExportJpg: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalImages,
  readyImages,
  onOpenHelp,
  onQuickExportPng,
  onQuickExportJpg,
  isProcessing,
}) => {
  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-4 lg:px-6 flex items-center justify-between gap-6 shrink-0 select-none">
      {/* Zone 1: Single Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
          <Layers className="w-4 h-4 text-neutral-100" />
        </div>
        <div>
          <span className="font-semibold text-base tracking-tight text-neutral-900">
            Umbra
          </span>
          <span className="ml-2 text-xs text-neutral-400 font-medium tracking-wide">
            Soft Shadow Studio
          </span>
        </div>
      </div>

      {/* Zone 2: Informational / Feature Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600">
        <span className="flex items-center gap-1.5 text-neutral-800">
          <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
          <span>Realistic Sunlight Penumbra</span>
        </span>
        <span className="text-neutral-300" aria-hidden="true">·</span>
        <span className="text-neutral-500">
          300 DPI Print-Ready Embed
        </span>
        <span className="text-neutral-300" aria-hidden="true">·</span>
        <span className="text-neutral-500">
          Lossless PNG & 100% Quality JPG
        </span>
      </nav>

      {/* Zone 3: Quick Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenHelp}
          title="Guide & Reference Match Tips"
          className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {totalImages > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onQuickExportPng}
              disabled={isProcessing || totalImages === 0}
              title="Download active image as 300 DPI PNG"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PNG</span>
            </button>
            <button
              onClick={onQuickExportJpg}
              disabled={isProcessing || totalImages === 0}
              title="Download active image as 300 DPI JPG"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg border border-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <FileImage className="w-3.5 h-3.5 text-neutral-500" />
              <span>JPG</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
