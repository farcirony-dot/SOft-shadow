import React, { useRef } from 'react';
import { UploadCloud, Trash2, CheckCircle2, Clock, AlertCircle, RefreshCw, Layers, X } from 'lucide-react';
import { ImageItem } from '../types';

interface LeftPanelProps {
  images: ImageItem[];
  activeImageId: string | null;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onClearAll: () => void;
  onFilesSelected: (files: FileList | File[]) => void;
  isProcessingBatch: boolean;
  onProcessAll: () => void;
  onCancelBatch: () => void;
  batchProgress: { total: number; completed: number; failed: number };
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  images,
  activeImageId,
  onSelectImage,
  onRemoveImage,
  onClearAll,
  onFilesSelected,
  isProcessingBatch,
  onProcessAll,
  onCancelBatch,
  batchProgress,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-selecting the same file works
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const completedCount = images.filter((img) => img.status === 'ready').length;

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-neutral-200 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Upload Dropzone Section */}
      <div className="p-4 border-b border-neutral-100 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/60 hover:bg-neutral-50 rounded-xl p-5 text-center cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform text-neutral-700">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-neutral-800">
            Click or drag PNG images here
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Batch support up to 100 images · Transparent & white backgrounds
          </div>
        </div>

        {/* Batch Status Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span>
              {images.length} {images.length === 1 ? 'image' : 'images'}
              {images.length > 0 && ` (${completedCount} ready)`}
            </span>
          </div>

          {images.length > 0 && (
            <button
              onClick={onClearAll}
              disabled={isProcessingBatch}
              className="text-neutral-400 hover:text-red-600 transition-colors text-[11px] flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Batch Action Buttons */}
        {images.length > 1 && (
          <div className="mt-2.5 flex items-center gap-2">
            {!isProcessingBatch ? (
              <button
                onClick={onProcessAll}
                className="flex-1 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Process All ({images.length})</span>
              </button>
            ) : (
              <button
                onClick={onCancelBatch}
                className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3 h-3" />
                <span>Cancel Processing</span>
              </button>
            )}
          </div>
        )}

        {/* Overall Batch Progress Bar if active */}
        {isProcessingBatch && (
          <div className="mt-3 pt-2 border-t border-neutral-100">
            <div className="flex justify-between text-[11px] font-medium text-neutral-600 mb-1">
              <span>Batch Queue Progress</span>
              <span className="font-mono tabular-nums">
                {batchProgress.completed + batchProgress.failed} / {batchProgress.total}
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 h-full transition-all duration-300"
                style={{
                  width: `${
                    batchProgress.total > 0
                      ? ((batchProgress.completed + batchProgress.failed) / batchProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Image List Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-neutral-100/50">
        {images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <Layers className="w-8 h-8 stroke-1 text-neutral-300 mb-2" />
            <p className="text-xs font-medium text-neutral-600">No images loaded</p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
              Drop your transparent plant, leaf, or artwork PNGs to generate authentic sunlight shadows.
            </p>
          </div>
        ) : (
          images.map((item, index) => {
            const isActive = item.id === activeImageId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectImage(item.id)}
                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'hover:bg-neutral-100/80 text-neutral-800'
                }`}
              >
                {/* Thumbnail */}
                <div
                  className={`w-11 h-11 rounded-md shrink-0 border overflow-hidden flex items-center justify-center ${
                    isActive
                      ? 'border-neutral-700 bg-neutral-800'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <img
                    src={item.originalDataUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      title={item.name}
                      className={`text-xs font-medium truncate ${
                        isActive ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono tabular-nums shrink-0 ${
                        isActive ? 'text-neutral-400' : 'text-neutral-400'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-[11px] mt-0.5 ${
                      isActive ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    <span className="font-mono tabular-nums">
                      {item.width}×{item.height}
                    </span>
                    <span>·</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    {item.status === 'processing' && (
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        <span>Rendering {item.progress}%</span>
                      </span>
                    )}
                    {item.status === 'ready' && (
                      <span
                        className={`flex items-center gap-1 ${
                          isActive ? 'text-emerald-400' : 'text-emerald-600'
                        } font-medium`}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Processed</span>
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span
                        className={`flex items-center gap-1 ${
                          isActive ? 'text-neutral-400' : 'text-neutral-400'
                        }`}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>Pending</span>
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Error</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove item button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(item.id);
                  }}
                  title="Remove image"
                  className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive
                      ? 'hover:bg-neutral-800 text-neutral-400 hover:text-red-400'
                      : 'hover:bg-neutral-200 text-neutral-400 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
