import React from 'react';
import { X, Sparkles, Check, FileCheck, Layers } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-800" />
            <h3 className="font-semibold text-sm text-neutral-900">
              Guide to Realistic Soft Sunlight Shadows
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-neutral-600 max-h-[70vh] overflow-y-auto">
          {/* Section 1: The Physics of Realistic Sunlight Penumbra */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-neutral-800 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authentic Penumbra vs Ordinary Drop Shadows</span>
            </h4>
            <p className="leading-relaxed text-neutral-600">
              Unlike harsh computer drop shadows or flat black-and-white cutouts, sunlight filtering through leaves onto a wall creates a dual-layer optical shadow: a dense core <em>(umbra)</em> and a wide, silky feathered edge <em>(penumbra)</em>.
            </p>
          </div>

          {/* Section 2: Reproducing the Reference Images */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="font-semibold text-neutral-800 text-[11px] uppercase tracking-wider">
              Matching the Reference Images
            </div>
            <div className="space-y-1 text-[11px]">
              <div>
                <strong className="text-neutral-800">Reference 1 (Olive Branch):</strong> Use the <em>Olive Branch (Ref 1)</em> preset. Blur 20–25px, Edge Softness 35%, Opacity ~68%, Shadow Color <code>#404448</code>.
              </div>
              <div>
                <strong className="text-neutral-800">Reference 2 (Palm Leaves):</strong> Use the <em>Palm Frond (Ref 2)</em> preset. Blur 34–38px, Edge Softness 48%, Opacity ~58%, Shadow Color <code>#45494e</code>, rotated slightly.
              </div>
            </div>
          </div>

          {/* Section 3: 300 DPI Export Guarantee */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-neutral-800 text-xs flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Embedded 300 DPI Metadata</span>
            </h4>
            <p className="leading-relaxed text-neutral-600">
              Exported PNGs contain genuine physical pixel dimension chunks (<code>pHYs</code> set to 11,811 pixels per meter = 300 DPI). Exported JPEGs contain standardized JFIF <code>APP0</code> markers with 300 DPI density tags for high-end graphic design and print workflows.
            </p>
          </div>

          {/* Section 4: Transparent vs Solid Background */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-neutral-800 text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solid Background Artwork Support</span>
            </h4>
            <p className="leading-relaxed text-neutral-600">
              If your PNG has a solid white or light background instead of alpha transparency, toggle the <strong>Background Removal Keyer</strong> in the right panel to instantly isolate your botanicals.
            </p>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
