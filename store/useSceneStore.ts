import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Scene, SerializedInteractable, SerializedTransform } from '@/types/scene';
import { IInteractive } from '@/types/interaction';
import { saveSceneJSON, deleteSceneJSON } from '@/utils/storage';

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
  {
    id: 'demo-interaction',
    name: 'Interaction demo',
    type: 'demo',
    created: Date.now(),
    lastModified: Date.now(),
    splatData: {
      url: null,
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
  // Ephemeral interaction/UI state (not persisted)
  hoveredId: string | null;
  heldId: string | null;
  isDraggingGizmo: boolean;
  interactives: Map<string, IInteractive>;
  
  // Actions
  addScene: (scene: Scene) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  setActiveScene: (id: string | null) => void;
  getScene: (id: string) => Scene | undefined;
  createInteractable: (data: Omit<SerializedInteractable, 'id'> & { id?: string }) => void;
  // Interaction registry
  registerInteractive: (id: string, config: IInteractive) => void;
  unregisterInteractive: (id: string) => void;
  setHovered: (id: string | null) => void;
  setHeld: (id: string | null) => void;
  getInteractive: (id: string) => IInteractive | undefined;
  setDraggingGizmo: (dragging: boolean) => void;
}

// Helper function to merge demo scenes with persisted scenes
function mergeScenes(persistedState: Partial<SceneState> | undefined): SceneState {
  const persistedScenes = persistedState?.scenes || [];
  
  // Create a map of persisted scenes by ID for quick lookup
  const persistedMap = new Map(persistedScenes.map(s => [s.id, s]));
  
  // Merge: Always include all demo scenes (with updates from persisted if they exist)
  // Then add any user scenes that aren't demo scenes
  const mergedScenes: Scene[] = [];
  
  // First, add all demo scenes (using persisted version if it exists, otherwise default)
  for (const demoScene of DEMO_SCENES) {
    const persisted = persistedMap.get(demoScene.id);
    if (persisted) {
      // Use persisted version but ensure it's still marked as demo type
      mergedScenes.push({ ...persisted, type: 'demo' as const });
    } else {
      mergedScenes.push(demoScene);
    }
  }
  
  // Then add user scenes (non-demo scenes)
  for (const scene of persistedScenes) {
    if (scene.type !== 'demo') {
      mergedScenes.push(scene);
    }
  }
  
  return {
    scenes: mergedScenes,
    activeSceneId: persistedState?.activeSceneId ?? null,
    hoveredId: null,
    heldId: null,
    isDraggingGizmo: false,
    interactives: new Map<string, IInteractive>(),
  };
}

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scenes: DEMO_SCENES,
      activeSceneId: null,
      hoveredId: null,
      heldId: null,
      isDraggingGizmo: false,
      interactives: new Map<string, IInteractive>(),

      addScene: (scene) => 
        set((state) => { 
          // Fire-and-forget IndexedDB persistence
          void saveSceneJSON(scene);
          return { 
            scenes: [...state.scenes, scene],
            activeSceneId: scene.id 
          };
        }),

      updateScene: (id, updates) =>
        set((state) => {
          const nextScenes = state.scenes.map((s) => 
            s.id === id ? { ...s, ...updates, lastModified: Date.now() } : s
          );
          const updated = nextScenes.find((s) => s.id === id);
          if (updated) {
            void saveSceneJSON(updated);
          }
          return { scenes: nextScenes };
        }),

      removeScene: (id) =>
        set((state) => {
          void deleteSceneJSON(id);
          return {
            scenes: state.scenes.filter((s) => s.id !== id),
            activeSceneId: state.activeSceneId === id ? null : state.activeSceneId,
          };
        }),

      setActiveScene: (id) => set({ activeSceneId: id }),
      
      getScene: (id) => get().scenes.find((s) => s.id === id),

      createInteractable: (data) => {
        const id = data.id ?? crypto.randomUUID();
        const activeId = get().activeSceneId;
        if (!activeId) return;
        set((state) => {
          const scenes = state.scenes.map((s) => {
            if (s.id !== activeId) return s;
            const next: Scene = {
              ...s,
              lastModified: Date.now(),
              interactables: [...s.interactables, { ...data, id }],
            };
            void saveSceneJSON(next);
            return next;
          });
          return { scenes };
        });
      },

      registerInteractive: (id, config) => {
        const next = new Map(get().interactives);
        next.set(id, config);
        set({ interactives: next });
      },
      unregisterInteractive: (id) => {
        const next = new Map(get().interactives);
        next.delete(id);
        set({ interactives: next });
      },
      setHovered: (id) => set({ hoveredId: id }),
      setHeld: (id) => set({ heldId: id }),
      getInteractive: (id) => get().interactives.get(id),
      setDraggingGizmo: (dragging) => set({ isDraggingGizmo: dragging }),
    }),
    {
      name: 'scene-storage',
      // We only persist the scenes list. Active scene ID could be persisted or not. 
      // Let's persist it so reload brings you back.
      partialize: (state) => ({ scenes: state.scenes, activeSceneId: state.activeSceneId }),
      // After rehydration, merge demo scenes to ensure they're always present
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate scene store:', error);
          return;
        }
        if (state) {
          // Merge demo scenes with persisted scenes
          const merged = mergeScenes({ scenes: state.scenes, activeSceneId: state.activeSceneId });
          state.scenes = merged.scenes;
        }
      },
    }
  )
);

