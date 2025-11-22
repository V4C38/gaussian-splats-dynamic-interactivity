'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useInputStore } from '@/store/useInputStore';

export function useRaycastInteraction() {
  const { camera, scene } = useThree();
  const setHovered = useInteractionStore((state) => state.setHovered);
  const getInteractive = useInteractionStore((state) => state.getInteractive);
  
  useFrame(() => {
    const raycaster = new Raycaster();
    raycaster.setFromCamera(new Vector2(0, 0), camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    let foundId: string | null = null;
    
    for (const hit of intersects) {
      let obj: any = hit.object;
      while (obj) {
        if (obj.userData?.interactiveId) {
          foundId = obj.userData.interactiveId;
          break;
        }
        obj = obj.parent;
      }
      if (foundId) break;
    }
    
    const currentHover = useInteractionStore.getState().hoveredId;
    if (currentHover !== foundId) {
      if (currentHover) {
        getInteractive(currentHover)?.onHoverEnd?.();
      }
      setHovered(foundId);
      if (foundId) {
        getInteractive(foundId)?.onHoverStart?.();
      }
    }
  });

  // Handle Input Events via Store Subscription
  useEffect(() => {
    const unsub = useInputStore.subscribe((state, prevState) => {
      const hoveredId = useInteractionStore.getState().hoveredId;
      if (!hoveredId) return;

      const interactive = getInteractive(hoveredId);
      if (!interactive) return;

      // Check each action defined on the object
      interactive.actions.forEach(action => {
        // Key mapping: if config says "F", we check "KeyF".
        const code = `Key${action.key.toUpperCase()}`; 
        
        const wasPressed = prevState.keys[code];
        const isPressed = state.keys[code];

        if (isPressed && !wasPressed) {
          action.onStart?.();
        }
        if (!isPressed && wasPressed) {
          action.onEnd?.();
        }
      });
    });
    return unsub;
  }, [getInteractive]);
}
