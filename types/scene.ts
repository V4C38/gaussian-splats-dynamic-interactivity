import { InteractionType } from './interaction';

export interface SerializedTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SerializedInteractable {
  id: string;
  type: InteractionType;
  title: string;
  position: [number, number, number];
  // Actions and callbacks are defined by the runtime/code logic or a future scripting system
  // For now, we mainly store existence and position
}

export type SceneType = 'demo' | 'user';

export interface Scene {
  id: string;
  name: string;
  type: SceneType;
  created: number;
  lastModified: number;
  
  // Splat Data
  splatData: {
    url: string | null; // For demo scenes, this is the remote URL. For user scenes, this is null (data is in IndexedDB)
    fileKey?: string; // For user scenes, key in IndexedDB
  };
  
  // Mesh Data
  meshData: {
    url: string | null; 
    fileKey?: string;
    visible: boolean;
  };
  
  // State
  transform: SerializedTransform;
  interactables: SerializedInteractable[];
}

