import { create } from 'zustand';

interface PerfMetrics {
  fps: number;
  frameMs: number;
  triangles: number;
  calls: number;
  geometries: number;
  textures: number;
  memoryMB?: number;
}

interface RenderSettings {
  pixelRatio: number;
  antialiasing: boolean;
  showPerformance: boolean;
  showGrid: boolean;
  showGizmo: boolean;
  wireframe: boolean; // Global wireframe toggle for the scene
  moveSpeed: number; // Camera movement speed multiplier
  // Splat Specific
  splatAlphaTest: number;
  splatAlphaHash: boolean;
  splatChunkSize: number;
}

interface SettingsState {
  settings: RenderSettings;
  metrics: PerfMetrics;
  isMenuOpen: boolean;
  updateSettings: (settings: Partial<RenderSettings>) => void;
  updateMetrics: (metrics: Partial<PerfMetrics>) => void;
  toggleMenu: (isOpen?: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    pixelRatio: 1,
    antialiasing: false,
    showPerformance: false,
    showGrid: true,
    showGizmo: false,
    wireframe: false,
    moveSpeed: 1.0,
    splatAlphaTest: 0.1,
    splatAlphaHash: false,
    splatChunkSize: 25000,
  },
  metrics: {
    fps: 0,
    frameMs: 0,
    triangles: 0,
    calls: 0,
    geometries: 0,
    textures: 0,
    memoryMB: undefined,
  },
  isMenuOpen: false,
  updateSettings: (newSettings) => 
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  updateMetrics: (m) => 
    set((state) => ({ metrics: { ...state.metrics, ...m } })),
  toggleMenu: (isOpen) => 
    set((state) => ({ isMenuOpen: isOpen !== undefined ? isOpen : !state.isMenuOpen })),
}));
