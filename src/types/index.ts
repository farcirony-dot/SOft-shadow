export interface ShadowSettings {
  // Shadow appearance
  intensity: number;      // 0 - 100: Shadow darkness / core density
  opacity: number;        // 0 - 100: Overall shadow opacity
  blur: number;           // 0 - 100: Gaussian blur radius
  edgeSoftness: number;   // 0 - 100: Penumbra / secondary soft diffusion
  shadowColor: string;    // Hex color (default #404448)

  // Transforms
  positionX: number;      // Horizontal offset in % (-50 to 50)
  positionY: number;      // Vertical offset in % (-50 to 50)
  scale: number;          // 10 to 200%
  rotation: number;       // -180 to 180 degrees
  flipH: boolean;         // Horizontal flip
  flipV: boolean;         // Vertical flip

  // Background removal (for PNGs that have solid white/colored background)
  removeBackground: boolean;
  bgKeyColor: string;     // Hex color to key out (default #ffffff)
  bgTolerance: number;    // 0 - 100 (threshold for background removal)
  bgFeather: number;      // 0 - 20 (edge smoothing for keyed out background)

  // Output background
  backgroundMode: 'solid' | 'transparent';
  backgroundColor: string; // Hex color (default #ffffff)
}

export type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  originalDataUrl: string;
  processedBlob: Blob | null;
  processedDataUrl: string | null;
  status: ProcessingStatus;
  progress: number; // 0 - 100
  errorMessage?: string;
  customSettings?: ShadowSettings; // Optional per-image custom settings
}

export type ExportResolutionMode = '1x' | '2x' | '4x' | 'custom';
export type ExportFormat = 'png' | 'jpg';

export interface ExportSettings {
  format: ExportFormat;
  resolutionMode: ExportResolutionMode;
  customWidth: number;
  customHeight: number;
  lockAspectRatio: boolean;
  jpegQuality: number; // 90 - 100
  embedDpi: number;    // 300 DPI
}

export interface PresetStyle {
  id: string;
  name: string;
  description: string;
  settings: Partial<ShadowSettings>;
}
