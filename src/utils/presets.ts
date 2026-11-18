import { ShadowSettings, PresetStyle } from '../types';

export const DEFAULT_SHADOW_SETTINGS: ShadowSettings = {
  intensity: 50,
  opacity: 65,
  blur: 24,
  edgeSoftness: 35,
  shadowColor: '#424549',

  positionX: 0,
  positionY: 0,
  scale: 100,
  rotation: 0,
  flipH: false,
  flipV: false,

  removeBackground: false,
  bgKeyColor: '#ffffff',
  bgTolerance: 20,
  bgFeather: 15,

  // Default to Transparent PNG as requested so exported PNG has zero solid background!
  backgroundMode: 'transparent',
  backgroundColor: '#ffffff',
};

export const PRESET_STYLES: PresetStyle[] = [
  {
    id: 'ref1-olive',
    name: 'Olive Branch (Ref 1)',
    description: 'Natural diffuse branch shadow against transparent/white surface',
    settings: {
      intensity: 52,
      opacity: 68,
      blur: 22,
      edgeSoftness: 35,
      shadowColor: '#404448',
      positionX: 0,
      positionY: 0,
      scale: 100,
      rotation: 0,
    },
  },
  {
    id: 'ref2-palm',
    name: 'Palm Frond (Ref 2)',
    description: 'Soft, airy sunlight palm shadows entering from corner',
    settings: {
      intensity: 48,
      opacity: 58,
      blur: 35,
      edgeSoftness: 48,
      shadowColor: '#45494e',
      positionX: 12,
      positionY: -8,
      scale: 110,
      rotation: -18,
    },
  },
  {
    id: 'deep-contrast',
    name: 'Direct Afternoon Sun',
    description: 'Denser core with defined leaf structure and subtle penumbra',
    settings: {
      intensity: 68,
      opacity: 80,
      blur: 15,
      edgeSoftness: 22,
      shadowColor: '#303336',
    },
  },
  {
    id: 'warm-daylight',
    name: 'Warm Window Glow',
    description: 'Subtle warm tinted shadow with soft organic falloff',
    settings: {
      intensity: 45,
      opacity: 58,
      blur: 28,
      edgeSoftness: 42,
      shadowColor: '#4a4542',
    },
  },
  {
    id: 'diffuse-cloudy',
    name: 'Diffused Overcast',
    description: 'Ultra-gentle feathering and ethereal transparency',
    settings: {
      intensity: 40,
      opacity: 48,
      blur: 46,
      edgeSoftness: 60,
      shadowColor: '#525559',
    },
  },
];
