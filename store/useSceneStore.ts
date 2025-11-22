import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Scene, SerializedInteractable, SerializedTransform } from '@/types/scene';

const DEFAULT_TRANSFORM: SerializedTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

const DEMO_SCENES: Scene[] = [
  {
    id: 'demo-plush',
    name: 'Plush',
    type: 'demo',
    created: Date.now(),
    lastModified: Date.now(),
    splatData: {
      url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat',
    },
    meshData: {
      url: null,
      visible: false,
    },
    transform: DEFAULT_TRANSFORM,
    interactables: [],
  },
  {
    id: 'demo-garden',
    name: 'Garden',
    type: 'demo',
    created: Date.now(),
    lastModified: Date.now(),
    splatData: {
      url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/garden.splat',
    },
    meshData: {
      url: null,
      visible: false,
    },
    transform: DEFAULT_TRANSFORM,
    interactables: [],
  },
];

interface SceneState {
  scenes: Scene[];
  activeSceneId: string | null;
  
  // Actions
  addScene: (scene: Scene) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  setActiveScene: (id: string | null) => void;
  getScene: (id: string) => Scene | undefined;
}

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scenes: DEMO_SCENES,
      activeSceneId: null,

      addScene: (scene) => 
        set((state) => ({ 
          scenes: [...state.scenes, scene],
          activeSceneId: scene.id 
        })),

      updateScene: (id, updates) =>
        set((state) => ({
          scenes: state.scenes.map((s) => 
            s.id === id ? { ...s, ...updates, lastModified: Date.now() } : s
          ),
        })),

      removeScene: (id) =>
        set((state) => ({
          scenes: state.scenes.filter((s) => s.id !== id),
          activeSceneId: state.activeSceneId === id ? null : state.activeSceneId,
        })),

      setActiveScene: (id) => set({ activeSceneId: id }),
      
      getScene: (id) => get().scenes.find((s) => s.id === id),
    }),
    {
      name: 'scene-storage',
      // We only persist the scenes list. Active scene ID could be persisted or not. 
      // Let's persist it so reload brings you back.
      partialize: (state) => ({ scenes: state.scenes, activeSceneId: state.activeSceneId }),
    }
  )
);

