import { Vector3 } from 'three';

export type InteractionType = 'trigger' | 'grab' | 'volume';

export interface IInteractionAction {
  label: string;
  key: string; // 'F', 'C', etc.
  onStart?: () => void;
  onEnd?: () => void;
}

export interface IInteractive {
  id: string;
  type: InteractionType;
  title: string; // Object Name
  actions: IInteractionAction[];
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  position?: Vector3;
}

export interface InteractionState {
  hoveredId: string | null;
  heldId: string | null;
  
  registerInteractive: (id: string, config: IInteractive) => void;
  unregisterInteractive: (id: string) => void;
  setHovered: (id: string | null) => void;
  setHeld: (id: string | null) => void;
  getInteractive: (id: string) => IInteractive | undefined;
}
