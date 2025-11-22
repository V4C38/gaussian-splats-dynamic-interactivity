import { create } from 'zustand';

interface InputState {
  move: { x: number; y: number; z: number }; // x: strafe, y: forward/back, z: up/down
  look: { x: number; y: number }; 
  keys: Record<string, boolean>; // Generic key tracking
  
  setMove: (x: number, y: number, z: number) => void;
  setLook: (x: number, y: number) => void;
  setKey: (code: string, pressed: boolean) => void;
}

export const useInputStore = create<InputState>((set) => ({
  move: { x: 0, y: 0, z: 0 },
  look: { x: 0, y: 0 },
  keys: {},
  
  setMove: (x, y, z) => set({ move: { x, y, z } }),
  setLook: (x, y) => set({ look: { x, y } }),
  setKey: (code, pressed) => set((state) => {
    // Only update if changed to avoid unnecessary re-renders
    if (state.keys[code] === pressed) return state;
    return { keys: { ...state.keys, [code]: pressed } };
  }),
}));
