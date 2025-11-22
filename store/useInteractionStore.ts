import { create } from 'zustand';
import { InteractionState, IInteractive } from '@/types/interaction';

interface InteractionStore extends InteractionState {
  interactives: Map<string, IInteractive>;
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  hoveredId: null,
  heldId: null,
  isInteracting: false,
  interactives: new Map(),

  registerInteractive: (id, config) => {
    const interactives = new Map(get().interactives);
    interactives.set(id, config);
    set({ interactives });
  },

  unregisterInteractive: (id) => {
    const interactives = new Map(get().interactives);
    interactives.delete(id);
    set({ interactives });
  },

  setHovered: (id) => set({ hoveredId: id }),
  setHeld: (id) => set({ heldId: id }),
  setIsInteracting: (val) => set({ isInteracting: val }),

  getInteractive: (id) => get().interactives.get(id),
}));

