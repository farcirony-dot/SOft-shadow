import { ShadowSettings, ExportSettings } from '../types';
import { injectDpiMetadata } from './dpi';

/**
 * Parses a hex color string into RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Loads an image from a URL or data URL and returns an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

/**
 * Renders the realistic soft shadow effect on a canvas.
 * Can be used for both live preview and high-resolution export.
 */
export async function renderShadowToCanvas(
  sourceImage: HTMLImageElement,
  settings: ShadowSettings,
  outputWidth: number,
  outputHeight: number,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(outputWidth));
  canvas.height = Math.max(1, Math.round(outputHeight));

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Background
  if (settings.backgroundMode === 'solid') {
    ctx.fillStyle = settings.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 2. Prepare Source Silhouette Canvas
  // We extract the silhouette and apply background removal if requested
  const origW = sourceImage.naturalWidth || sourceImage.width;
  const origH = sourceImage.naturalHeight || sourceImage.height;

  const silCanvas = document.createElement('canvas');
  silCanvas.width = origW;
  silCanvas.height = origH;
  const silCtx = silCanvas.getContext('2d', { willReadFrequently: true });
  if (!silCtx) throw new Error('Could not get silhouette canvas context');

  silCtx.drawImage(sourceImage, 0, 0);

  // If solid background removal is enabled (e.g. for scans or white-background PNGs)
  if (settings.removeBackground) {
    const imgData = silCtx.getImageData(0, 0, origW, origH);
    const data = imgData.data;
    const targetRgb = hexToRgb(settings.bgKeyColor || '#ffffff');
    const tol = (settings.bgTolerance / 100) * 441.67; // max distance is sqrt(255^2 * 3) = 441.67
    const feather = (settings.bgFeather / 100) * 80;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      const dist = Math.sqrt(
        (r - targetRgb.r) ** 2 +
        (g - targetRgb.g) ** 2 +
        (b - targetRgb.b) ** 2
      );

      if (dist < tol) {
        data[i + 3] = 0; // completely keyed out
      } else if (dist < tol + feather && feather > 0) {
        // Soft feather edge
        const ratio = (dist - tol) / feather;
        data[i + 3] = Math.round(a * ratio);
      }
    }
    silCtx.putImageData(imgData, 0, 0);
  }

  // Convert to monochromatic shadow silhouette
  // We use source-in to tint the silhouette with the exact shadow color
  const colorRgb = hexToRgb(settings.shadowColor || '#404448');
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = origW;
  shadowCanvas.height = origH;
  const shadowCtx = shadowCanvas.getContext('2d', { willReadFrequently: true });
  if (!shadowCtx) throw new Error('Could not get shadow canvas context');

  // Fill with shadow color
  shadowCtx.fillStyle = `rgb(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b})`;
  shadowCtx.fillRect(0, 0, origW, origH);

  // Apply original silhouette shape & alpha mask
  shadowCtx.globalCompositeOperation = 'destination-in';
  shadowCtx.drawImage(silCanvas, 0, 0);

  // Apply shadow intensity curve (gamma curve)
  if (settings.intensity !== 50) {
    const sImgData = shadowCtx.getImageData(0, 0, origW, origH);
    const sData = sImgData.data;
    // intensity 0 -> gamma 2.0 (lighter core), intensity 100 -> gamma 0.4 (dense core)
    const gamma = Math.pow(2, (50 - settings.intensity) / 30);
    for (let i = 0; i < sData.length; i += 4) {
      if (sData[i + 3] > 0) {
        const normA = sData[i + 3] / 255;
        sData[i + 3] = Math.min(255, Math.round(Math.pow(normA, gamma) * 255));
      }
    }
    shadowCtx.putImageData(sImgData, 0, 0);
  }

  // 3. Render Shadow onto Target Canvas with Realistic Blur & Penumbra
  // Blur scale factors account for export resolution scaling
  const scaleRatio = outputWidth / origW;
  const baseBlurRadius = Math.max(0.1, settings.blur * scaleRatio * 0.45);
  const totalOpacity = Math.max(0, Math.min(1, settings.opacity / 100));

  // Transformation setup
  const cx = canvas.width / 2 + (settings.positionX / 100) * canvas.width;
  const cy = canvas.height / 2 + (settings.positionY / 100) * canvas.height;
  const scale = (settings.scale / 100) * scaleRatio;
  const rotationRad = (settings.rotation * Math.PI) / 180;

  // Function to draw transformed shadow with specific filter & opacity
  const drawTransformedShadow = (blurPx: number, alpha: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationRad);
    ctx.scale(settings.flipH ? -scale : scale, settings.flipV ? -scale : scale);
    ctx.globalAlpha = alpha;
    ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
    ctx.drawImage(shadowCanvas, -origW / 2, -origH / 2, origW, origH);
    ctx.restore();
  };

  // Pass 1: Core shadow umbra
  const coreAlpha = totalOpacity * (1 - (settings.edgeSoftness / 100) * 0.4);
  drawTransformedShadow(baseBlurRadius, coreAlpha);

  // Pass 2: Penumbra / diffuse outer sunlight falloff (if edgeSoftness > 0)
  if (settings.edgeSoftness > 0) {
    const penumbraBlur = baseBlurRadius + (settings.edgeSoftness * scaleRatio * 0.7);
    const penumbraAlpha = totalOpacity * (settings.edgeSoftness / 100) * 0.4;
    drawTransformedShadow(penumbraBlur, penumbraAlpha);
  }

  return canvas;
}

/**
 * Exports a processed image as a high-resolution Blob with 300 DPI metadata.
 */
export async function exportProcessedImage(
  sourceImage: HTMLImageElement,
  settings: ShadowSettings,
  exportSettings: ExportSettings
): Promise<Blob> {
  const origW = sourceImage.naturalWidth || sourceImage.width;
  const origH = sourceImage.naturalHeight || sourceImage.height;

  // Calculate target export dimensions
  let targetW = origW;
  let targetH = origH;

  switch (exportSettings.resolutionMode) {
    case '2x':
      targetW = origW * 2;
      targetH = origH * 2;
      break;
    case '4x':
      targetW = origW * 4;
      targetH = origH * 4;
      break;
    case 'custom':
      targetW = Math.max(10, Math.round(exportSettings.customWidth));
      targetH = Math.max(10, Math.round(exportSettings.customHeight));
      break;
    case '1x':
    default:
      targetW = origW;
      targetH = origH;
      break;
  }

  // For PNG: strictly preserve transparent background if set
  // For JPG: automatically fallback to solid white since JPG cannot store alpha
  const effectiveSettings: ShadowSettings = { ...settings };
  if (exportSettings.format === 'jpg' && effectiveSettings.backgroundMode === 'transparent') {
    effectiveSettings.backgroundMode = 'solid';
    effectiveSettings.backgroundColor = effectiveSettings.backgroundColor || '#ffffff';
  }

  // Render to offscreen canvas
  const exportCanvas = document.createElement('canvas');
  await renderShadowToCanvas(sourceImage, effectiveSettings, targetW, targetH, exportCanvas);

  // Generate Blob strictly matching export format
  const isJpg = exportSettings.format === 'jpg';
  const mimeType = isJpg ? 'image/jpeg' : 'image/png';
  const quality = isJpg
    ? Math.max(0.9, Math.min(1.0, exportSettings.jpegQuality / 100))
    : undefined;

  const rawBlob = await new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create ' + mimeType + ' blob from canvas'));
      },
      mimeType,
      quality
    );
  });

  // Inject 300 DPI metadata
  const dpiBlob = await injectDpiMetadata(rawBlob, exportSettings.embedDpi || 300);
  return dpiBlob;
}
