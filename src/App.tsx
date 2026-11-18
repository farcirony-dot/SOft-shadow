import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { CenterPreview } from './components/CenterPreview';
import { RightPanel } from './components/RightPanel';
import { BottomBar } from './components/BottomBar';
import { HelpModal } from './components/HelpModal';
import { ImageItem, ShadowSettings, ExportSettings } from './types';
import { DEFAULT_SHADOW_SETTINGS } from './utils/presets';
import { loadImage, exportProcessedImage } from './utils/shadowEngine';

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ShadowSettings>(DEFAULT_SHADOW_SETTINGS);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    resolutionMode: '1x',
    customWidth: 1920,
    customHeight: 1080,
    lockAspectRatio: true,
    jpegQuality: 100,
    embedDpi: 300,
  });

  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ total: number; completed: number; failed: number }>({
    total: 0,
    completed: 0,
    failed: 0,
  });
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgressText, setDownloadProgressText] = useState<string>('');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const cancelBatchRef = useRef<boolean>(false);

  // Active image getter
  const activeImage = images.find((img) => img.id === activeImageId) || images[0] || null;

  // Handle file uploads (PNG, JPG, JPEG, WebP up to 100 images)
  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    const validFiles = rawFiles.filter(
      (f) => f.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(f.name)
    );

    if (validFiles.length === 0) {
      alert('Please upload PNG or image files.');
      return;
    }

    const availableSlots = 100 - images.length;
    if (availableSlots <= 0) {
      alert('Maximum limit of 100 images reached.');
      return;
    }

    const filesToProcess = validFiles.slice(0, availableSlots);
    const newItems: ImageItem[] = [];

    for (const file of filesToProcess) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const img = await loadImage(dataUrl);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        const item: ImageItem = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          width: w,
          height: h,
          originalDataUrl: dataUrl,
          processedBlob: null,
          processedDataUrl: null,
          status: 'pending',
          progress: 0,
        };
        newItems.push(item);
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }

    setImages((prev) => {
      const updated = [...prev, ...newItems];
      if (!activeImageId && updated.length > 0) {
        setActiveImageId(updated[0].id);
        // Sync custom resolution default
        setExportSettings((prevExp) => ({
          ...prevExp,
          customWidth: updated[0].width,
          customHeight: updated[0].height,
        }));
      }
      return updated;
    });
  };

  const handleSelectImage = (id: string) => {
    setActiveImageId(id);
    const target = images.find((img) => img.id === id);
    if (target && target.customSettings) {
      setSettings(target.customSettings);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== id);
      if (activeImageId === id) {
        setActiveImageId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const handleClearAll = () => {
    if (isProcessingBatch) {
      cancelBatchRef.current = true;
    }
    setImages([]);
    setActiveImageId(null);
  };

  const handleUpdateSettings = (newSettings: Partial<ShadowSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SHADOW_SETTINGS);
  };

  const handleApplyToAll = () => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        customSettings: { ...settings },
        status: 'pending', // mark for re-processing
      }))
    );
  };

  const handleUpdatePosition = (deltaX: number, deltaY: number) => {
    setSettings((prev) => ({
      ...prev,
      positionX: Math.max(-50, Math.min(50, prev.positionX + deltaX)),
      positionY: Math.max(-50, Math.min(50, prev.positionY + deltaY)),
    }));
  };

  const handleUpdateExportSettings = (newExport: Partial<ExportSettings>) => {
    setExportSettings((prev) => ({ ...prev, ...newExport }));
  };

  // Helper to trigger browser download with correct filename and extension
  const triggerDownload = (blob: Blob, requestedFilename: string, requestedFormat: 'png' | 'jpg') => {
    let cleanName = requestedFilename.replace(/\.[^/.]+$/, '');
    const finalFilename = `${cleanName}.${requestedFormat}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  // Process an individual image item strictly in the requested target format
  const processSingleImage = async (
    item: ImageItem,
    targetFormat: 'png' | 'jpg',
    customSet?: ShadowSettings
  ): Promise<Blob> => {
    const imgElement = await loadImage(item.originalDataUrl);
    const activeSetting = customSet || item.customSettings || settings;
    const expSet: ExportSettings = {
      ...exportSettings,
      format: targetFormat,
    };
    const blob = await exportProcessedImage(imgElement, activeSetting, expSet);
    return blob;
  };

  // Batch Process All Images in Queue
  const handleProcessAll = async () => {
    if (images.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);
    cancelBatchRef.current = false;
    setBatchProgress({ total: images.length, completed: 0, failed: 0 });

    let completed = 0;
    let failed = 0;

    for (let i = 0; i < images.length; i++) {
      if (cancelBatchRef.current) break;

      const item = images[i];

      // Update state to processing
      setImages((prev) =>
        prev.map((img) =>
          img.id === item.id ? { ...img, status: 'processing', progress: 20 } : img
        )
      );

      try {
        // Yield to browser event loop
        await new Promise((r) => setTimeout(r, 40));

        // Generate in current format (default PNG)
        const blob = await processSingleImage(item, exportSettings.format);
        const processedUrl = URL.createObjectURL(blob);

        setImages((prev) =>
          prev.map((img) =>
            img.id === item.id
              ? {
                  ...img,
                  status: 'ready',
                  progress: 100,
                  processedBlob: blob,
                  processedDataUrl: processedUrl,
                }
              : img
          )
        );
        completed++;
      } catch (err: any) {
        console.error('Batch item failed:', item.name, err);
        setImages((prev) =>
          prev.map((img) =>
            img.id === item.id
              ? {
                  ...img,
                  status: 'error',
                  progress: 0,
                  errorMessage: err?.message || 'Processing failed',
                }
              : img
          )
        );
        failed++;
      }

      setBatchProgress({ total: images.length, completed, failed });
    }

    setIsProcessingBatch(false);
  };

  const handleCancelBatch = () => {
    cancelBatchRef.current = true;
    setIsProcessingBatch(false);
  };

  // Single Image Download (strictly exports PNG or JPG as requested)
  const handleDownloadActive = async (format: 'png' | 'jpg') => {
    if (!activeImage) return;

    setIsDownloading(true);
    setDownloadProgressText(`Exporting ${activeImage.name} as ${format.toUpperCase()} (300 DPI)...`);

    try {
      const expSet: ExportSettings = {
        ...exportSettings,
        format, // Strictly 'png' or 'jpg'
      };

      const imgElement = await loadImage(activeImage.originalDataUrl);
      const blob = await exportProcessedImage(imgElement, settings, expSet);

      const baseName = activeImage.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_soft-shadow.${format}`;

      triggerDownload(blob, filename, format);
    } catch (err) {
      console.error('Failed to export active image:', err);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgressText('');
    }
  };

  // Batch ZIP Download strictly in the chosen format (PNG or JPG)
  const handleDownloadBatchZip = async (format: 'png' | 'jpg') => {
    if (images.length === 0 || isDownloading) return;

    setIsDownloading(true);
    const zip = new JSZip();
    const usedNames = new Set<string>();

    try {
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setDownloadProgressText(
          `Generating 300 DPI ${format.toUpperCase()} for ${item.name} (${i + 1}/${images.length})...`
        );

        // Always render in the requested format to guarantee 100% compliance
        const blob = await processSingleImage(item, format);

        const baseName = item.name.replace(/\.[^/.]+$/, '');
        let safeName = `${baseName}_soft-shadow.${format}`;

        let counter = 1;
        while (usedNames.has(safeName)) {
          safeName = `${baseName}_soft-shadow_${counter}.${format}`;
          counter++;
        }
        usedNames.add(safeName);

        zip.file(safeName, blob);

        // Yield to keep UI responsive
        await new Promise((r) => setTimeout(r, 20));
      }

      setDownloadProgressText(`Compressing ${format.toUpperCase()} ZIP package...`);
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      triggerDownload(zipBlob, `umbra_soft_shadows_${format}_${timestamp}.zip`, 'zip' as any);
    } catch (err) {
      console.error('Failed to generate batch ZIP:', err);
      alert('Error building ZIP package.');
    } finally {
      setIsDownloading(false);
      setDownloadProgressText('');
    }
  };

  // Sequential individual downloads strictly in the chosen format
  const handleDownloadSequential = async (format: 'png' | 'jpg') => {
    if (images.length === 0 || isDownloading) return;

    setIsDownloading(true);
    try {
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setDownloadProgressText(
          `Downloading ${i + 1} of ${images.length} as ${format.toUpperCase()}: ${item.name}...`
        );

        const blob = await processSingleImage(item, format);
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_soft-shadow.${format}`;

        triggerDownload(blob, filename, format);

        // Controlled delay between browser downloads to prevent throttling
        await new Promise((r) => setTimeout(r, 450));
      }
    } catch (err) {
      console.error('Failed during sequential download:', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgressText('');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-100 font-sans text-neutral-900">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        totalImages={images.length}
        readyImages={images.filter((img) => img.status === 'ready').length}
        onOpenHelp={() => setIsHelpOpen(true)}
        onQuickExportPng={() => handleDownloadActive('png')}
        onQuickExportJpg={() => handleDownloadActive('jpg')}
        isProcessing={isDownloading || isProcessingBatch}
      />

      {/* 2. Main 3-Column Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Upload & Batch Queue */}
        <LeftPanel
          images={images}
          activeImageId={activeImageId}
          onSelectImage={handleSelectImage}
          onRemoveImage={handleRemoveImage}
          onClearAll={handleClearAll}
          onFilesSelected={handleFilesSelected}
          isProcessingBatch={isProcessingBatch}
          onProcessAll={handleProcessAll}
          onCancelBatch={handleCancelBatch}
          batchProgress={batchProgress}
        />

        {/* Center: Live Interactive Preview Viewport */}
        <CenterPreview
          activeImage={activeImage}
          settings={settings}
          onUpdatePosition={handleUpdatePosition}
        />

        {/* Right: Adjustments & Optics Controls */}
        <RightPanel
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetSettings={handleResetSettings}
          onApplyToAll={handleApplyToAll}
          exportSettings={exportSettings}
          onUpdateExportSettings={handleUpdateExportSettings}
          activeImageDimensions={
            activeImage ? { width: activeImage.width, height: activeImage.height } : undefined
          }
        />
      </div>

      {/* 3. Bottom Bar: Download & Batch ZIP Controls */}
      <BottomBar
        activeImage={activeImage}
        totalImages={images.length}
        isTransparent={settings.backgroundMode === 'transparent'}
        onDownloadActive={handleDownloadActive}
        onDownloadBatchZip={handleDownloadBatchZip}
        onDownloadSequential={handleDownloadSequential}
        isDownloading={isDownloading}
        downloadProgressText={downloadProgressText}
      />

      {/* 4. Help & Reference Match Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
