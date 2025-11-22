import { create } from 'zustand';
import { SerializedTransform } from '@/types/scene';

interface SplatState {
  url: string | null;
  meshUrl: string | null;
  isMeshVisible: boolean;
  transform: SerializedTransform;
  isDraggingGizmo: boolean;
  
  setUrl: (url: string | null) => void;
  setMeshUrl: (url: string | null) => void;
  setMeshVisible: (visible: boolean) => void;
  setTransform: (t: Partial<SerializedTransform>) => void;
  setDraggingGizmo: (dragging: boolean) => void;
  reset: () => void;
}

export const useSplatStore = create<SplatState>((set) => ({
  url: null,
  meshUrl: null,
  isMeshVisible: false,
  transform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  isDraggingGizmo: false,
  
  setUrl: (url) => set({ url }),
  setMeshUrl: (url) => set({ meshUrl: url }),
  setMeshVisible: (visible) => set({ isMeshVisible: visible }),
  setTransform: (t) => set((state) => ({ transform: { ...state.transform, ...t } })),
  setDraggingGizmo: (dragging) => set({ isDraggingGizmo: dragging }),
  reset: () => set({
    url: null,
    meshUrl: null,
    isMeshVisible: false,
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    isDraggingGizmo: false,
  }),
}));
