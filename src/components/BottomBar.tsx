import React, { useState } from 'react';
import { Download, Archive, Play, Loader2, FileImage, ChevronDown } from 'lucide-react';
import { ImageItem } from '../types';

interface BottomBarProps {
  activeImage: ImageItem | null;
  totalImages: number;
  isTransparent: boolean;
  onDownloadActive: (format: 'png' | 'jpg') => void;
  onDownloadBatchZip: (format: 'png' | 'jpg') => void;
  onDownloadSequential: (format: 'png' | 'jpg') => void;
  isDownloading: boolean;
  downloadProgressText: string;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeImage,
  totalImages,
  isTransparent,
  onDownloadActive,
  onDownloadBatchZip,
  onDownloadSequential,
  isDownloading,
  downloadProgressText,
}) => {
  const [showBatchMenu, setShowBatchMenu] = useState(false);

  return (
    <footer className="h-14 bg-white border-t border-neutral-200 px-4 lg:px-6 flex items-center justify-between gap-3 shrink-0 select-none z-20">
      {/* Left: Active Image Export Controls (Single) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 hidden sm:inline font-medium">
          Active Image:
        </span>

        {/* 100% Guaranteed PNG Download Button */}
        <button
          onClick={() => onDownloadActive('png')}
          disabled={!activeImage || isDownloading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title={isTransparent ? 'Download as Transparent PNG (no background)' : 'Download PNG with solid background'}
        >
          <Download className="w-3.5 h-3.5 text-neutral-200" />
          <span>{isTransparent ? 'Download Transparent PNG (300 DPI)' : 'Download PNG (300 DPI)'}</span>
        </button>

        {/* Guaranteed JPG Download Button */}
        <button
          onClick={() => onDownloadActive('jpg')}
          disabled={!activeImage || isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg transition-colors border border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Download current processed image as 300 DPI JPG"
        >
          <FileImage className="w-3.5 h-3.5 text-neutral-500" />
          <span>Download JPG</span>
        </button>
      </div>

      {/* Center: Live Download Progress message */}
      {isDownloading && (
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-800 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full animate-pulse max-w-sm truncate">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
          <span className="truncate">{downloadProgressText}</span>
        </div>
      )}

      {/* Right: Batch Export Controls (ZIP & Sequential for PNG & JPG) */}
      <div className="flex items-center gap-2">
        {totalImages > 0 && (
          <>
            {/* Batch PNG ZIP Download (Primary Batch Action) */}
            <button
              onClick={() => onDownloadBatchZip('png')}
              disabled={isDownloading}
              title={isTransparent ? 'Download all images as Transparent PNG in a ZIP' : 'Download all images as PNG in a ZIP'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isTransparent ? 'Download All Transparent PNG (ZIP)' : 'Download All PNG (ZIP)'}</span>
            </button>

            {/* Batch JPG ZIP Download */}
            <button
              onClick={() => onDownloadBatchZip('jpg')}
              disabled={isDownloading}
              title="Download all processed images as high-res JPGs in a ZIP archive"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg border border-neutral-300 transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              <Archive className="w-3.5 h-3.5 text-neutral-600" />
              <span>Download All JPG (ZIP)</span>
            </button>

            {/* Sequential Download dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBatchMenu(!showBatchMenu)}
                disabled={isDownloading}
                title="More batch download options"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg border border-neutral-200 transition-colors disabled:opacity-40"
              >
                <Play className="w-3 h-3 text-neutral-500" />
                <span className="hidden md:inline">Sequential</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showBatchMenu && (
                <div
                  className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-30 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowBatchMenu(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Sequential Individual Downloads
                  </div>
                  <button
                    onClick={() => {
                      setShowBatchMenu(false);
                      onDownloadSequential('png');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center justify-between"
                  >
                    <span>Download Each as PNG</span>
                    <span className="text-[10px] text-neutral-400">.png</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowBatchMenu(false);
                      onDownloadSequential('jpg');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center justify-between"
                  >
                    <span>Download Each as JPG</span>
                    <span className="text-[10px] text-neutral-400">.jpg</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </footer>
  );
};
