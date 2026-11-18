import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, SplitSquareVertical, Eye, Image as ImageIcon, Grid, Move } from 'lucide-react';
import { ImageItem, ShadowSettings } from '../types';
import { renderShadowToCanvas, loadImage } from '../utils/shadowEngine';

interface CenterPreviewProps {
  activeImage: ImageItem | null;
  settings: ShadowSettings;
  onUpdatePosition: (deltaX: number, deltaY: number) => void;
}

export const CenterPreview: React.FC<CenterPreviewProps> = ({
  activeImage,
  settings,
  onUpdatePosition,
}) => {
  const [viewMode, setViewMode] = useState<'result' | 'split' | 'original'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100% or fit
  const [isFitToScreen, setIsFitToScreen] = useState<boolean>(true);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [showCheckerboard, setShowCheckerboard] = useState<boolean>(settings.backgroundMode === 'transparent');
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const isSplitDraggingRef = useRef<boolean>(false);

  // Sync checkerboard default with settings.backgroundMode
  useEffect(() => {
    if (settings.backgroundMode === 'transparent') {
      setShowCheckerboard(true);
    }
  }, [settings.backgroundMode]);

  // Load the active image into an HTMLImageElement
  useEffect(() => {
    let isCancelled = false;
    if (!activeImage) {
      loadedImageRef.current = null;
      return;
    }

    loadImage(activeImage.originalDataUrl)
      .then((img) => {
        if (!isCancelled) {
          loadedImageRef.current = img;
          drawCanvases();
        }
      })
      .catch((err) => console.error('Failed to load image for preview:', err));

    return () => {
      isCancelled = true;
    };
  }, [activeImage?.id, activeImage?.originalDataUrl]);

  // Redraw whenever settings change
  const drawCanvases = useCallback(async () => {
    const img = loadedImageRef.current;
    if (!img) return;

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    // Draw original
    if (originalCanvasRef.current) {
      const origCanvas = originalCanvasRef.current;
      origCanvas.width = w;
      origCanvas.height = h;
      const ctx = origCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        if (settings.backgroundMode === 'solid') {
          ctx.fillStyle = settings.backgroundColor;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0);
      }
    }

    // Draw processed shadow
    if (processedCanvasRef.current) {
      await renderShadowToCanvas(img, settings, w, h, processedCanvasRef.current);
    }
  }, [settings]);

  useEffect(() => {
    drawCanvases();
  }, [drawCanvases]);

  // Fit to screen calculation
  const handleFitToScreen = () => {
    setIsFitToScreen(true);
    setZoomLevel(1);
  };

  const handleZoom = (delta: number) => {
    setIsFitToScreen(false);
    setZoomLevel((prev) => Math.max(0.2, Math.min(4, +(prev + delta).toFixed(2))));
  };

  // Split handle dragging
  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isSplitDraggingRef.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isSplitDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSplitPos(percentage);
    };

    const onMouseUp = () => {
      isSplitDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Drag on preview to adjust position
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isSplitDraggingRef.current) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStart && !setDragStart) return;
      // We calculate drag delta in percentage
      const dx = moveEvent.movementX * 0.2;
      const dy = moveEvent.movementY * 0.2;
      onUpdatePosition(dx, dy);
    };

    const onMouseUp = () => {
      setIsDraggingCanvas(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!activeImage) {
    return (
      <main className="flex-1 bg-neutral-100 flex flex-col items-center justify-center p-8 text-neutral-400 select-none">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <ImageIcon className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="text-base font-semibold text-neutral-800">
            No Image Selected
          </h2>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
            Upload or select a PNG image from the left panel to generate a realistic soft monochromatic sunlight shadow.
          </p>
          <div className="mt-4 p-3 bg-white/70 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 text-left space-y-1">
            <div className="font-semibold text-neutral-700">Supported for best results:</div>
            <div>• Transparent PNG silhouettes (botanicals, leaves, palms, branches)</div>
            <div>• White background artwork (automatic background removal included)</div>
            <div>• Batch processing of up to 100 images simultaneously</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-neutral-100/90 flex flex-col min-w-0 overflow-hidden relative select-none">
      {/* Top Viewport Control Strip */}
      <div className="h-11 bg-white border-b border-neutral-200 px-4 flex items-center justify-between shrink-0 z-10">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'split'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Compare</span>
          </button>
          <button
            onClick={() => setViewMode('result')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'result'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Shadow Result</span>
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'original'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Original Artwork</span>
          </button>
        </div>

        {/* Center: Interactive Pan Tip */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Move className="w-3 h-3 text-neutral-400" />
          <span>Click & drag canvas to shift shadow</span>
        </div>

        {/* Right: Zoom & Backdrop Controls */}
        <div className="flex items-center gap-2">
          {/* Transparency Checkerboard Toggle */}
          <button
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            title="Toggle Checkerboard Background"
            className={`p-1.5 rounded-md text-xs font-medium border transition-colors ${
              showCheckerboard
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-200" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 text-xs text-neutral-600">
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-12 text-center tabular-nums">
              {isFitToScreen ? 'Fit' : `${Math.round(zoomLevel * 100)}%`}
            </span>
            <button
              onClick={() => handleZoom(0.2)}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitToScreen}
              className={`p-1 rounded ${
                isFitToScreen ? 'text-neutral-900 bg-neutral-100' : 'text-neutral-500 hover:bg-neutral-100'
              }`}
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-6 ${
          showCheckerboard ? 'bg-checkerboard' : 'bg-neutral-200/60'
        } ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Aspect Ratio Box with Canvases */}
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75 shadow-lg border border-neutral-300/60 rounded-xs overflow-hidden ${
            showCheckerboard ? 'bg-checkerboard' : 'bg-white'
          }`}
          style={{
            transform: isFitToScreen ? 'scale(1)' : `scale(${zoomLevel})`,
            maxWidth: '92%',
            maxHeight: '92%',
            aspectRatio: activeImage ? `${activeImage.width} / ${activeImage.height}` : 'auto',
          }}
        >
          {/* Base Layer: Original Image (Shown in split or original mode) */}
          <canvas
            ref={originalCanvasRef}
            className={`w-full h-full object-contain ${
              viewMode === 'result' ? 'hidden' : 'block'
            }`}
          />

          {/* Top Layer: Processed Shadow Canvas */}
          <div
            className={`absolute inset-0 overflow-hidden ${
              viewMode === 'original' ? 'hidden' : 'block'
            }`}
            style={{
              clipPath:
                viewMode === 'split'
                  ? `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`
                  : 'none',
            }}
          >
            <canvas
              ref={processedCanvasRef}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Split Mode Handle Line */}
          {viewMode === 'split' && (
            <div
              onMouseDown={handleSplitMouseDown}
              className="absolute top-0 bottom-0 z-20 flex items-center justify-center cursor-ew-resize select-none"
              style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
            >
              {/* Vertical line */}
              <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
              {/* Center handle pill */}
              <div className="absolute w-7 h-7 rounded-full bg-white text-neutral-900 border border-neutral-300 shadow-md flex items-center justify-center">
                <SplitSquareVertical className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>
          )}

          {/* Mode Badges */}
          {viewMode === 'split' && (
            <>
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                Original
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                Soft Shadow
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Canvas Meta Footer */}
      <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs border border-neutral-200/80 px-3 py-1.5 rounded-lg text-[11px] text-neutral-600 flex items-center gap-2 shadow-xs">
        <span className="font-medium text-neutral-800">{activeImage.name}</span>
        <span className="text-neutral-300">·</span>
        <span className="font-mono tabular-nums">{activeImage.width} × {activeImage.height} px</span>
        <span className="text-neutral-300">·</span>
        <span>Position ({Math.round(settings.positionX)}%, {Math.round(settings.positionY)}%)</span>
        <span className="text-neutral-300">·</span>
        <span>Scale {Math.round(settings.scale)}%</span>
      </div>
    </main>
  );
};
