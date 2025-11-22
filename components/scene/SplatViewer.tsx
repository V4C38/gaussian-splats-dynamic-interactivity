'use client';

import { Splat, PivotControls, useGLTF } from '@react-three/drei';
import { useSplatStore } from '@/store/useSplatStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSceneStore } from '@/store/useSceneStore';
import { useEffect, useState, useRef } from 'react';
import { Group } from 'three';
import { RigidBody } from '@react-three/rapier';

// Helper component to load GLTF/GLB mesh
function MeshLoader({ url, visible }: { url: string, visible: boolean }) {
    const { scene } = useGLTF(url);
    
    // Clone scene to avoid issues if reused
    const clonedScene = scene.clone();

    return (
        <primitive 
            object={clonedScene} 
            visible={visible}
        >
             {visible && (
                 <meshStandardMaterial wireframe color="green" />
             )}
        </primitive>
    );
}

export function SplatViewer() {
  const url = useSplatStore((state) => state.url);
  const meshUrl = useSplatStore((state) => state.meshUrl);
  const isMeshVisible = useSplatStore((state) => state.isMeshVisible);
  const transform = useSplatStore((state) => state.transform);
  const setTransform = useSplatStore((state) => state.setTransform);
  const setDraggingGizmo = useSplatStore((state) => state.setDraggingGizmo);
  
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const updateScene = useSceneStore((state) => state.updateScene);

  const { showGizmo, splatAlphaTest, splatAlphaHash, splatChunkSize } = useSettingsStore((state) => state.settings);
  const [key, setKey] = useState(0);
  
  // Transform State (Local)
  const groupRef = useRef<Group>(null);

  // Force re-mount on critical setting changes
  useEffect(() => {
    setKey((k) => k + 1);
  }, [splatAlphaHash, splatChunkSize, splatAlphaTest]); 

  useEffect(() => {
    // Apply persisted transform
    if (!groupRef.current) return;
    groupRef.current.position.set(...transform.position);
    groupRef.current.rotation.set(...transform.rotation);
    groupRef.current.scale.set(...transform.scale);
  }, [transform]);

  const persistFromRef = (saveToStore = false) => {
    if (!groupRef.current) return;
    const p = groupRef.current.position;
    const r = groupRef.current.rotation;
    const s = groupRef.current.scale;
    const newTransform = { position: [p.x, p.y, p.z], rotation: [r.x, r.y, r.z], scale: [s.x, s.y, s.z] } as const;
    
    setTransform(newTransform);
    
    if (saveToStore && activeSceneId) {
        updateScene(activeSceneId, { transform: newTransform });
    }
  };

  if (!url) return null;

  return (
    <PivotControls 
      anchor={[0, 0, 0]} 
      depthTest={false} 
      scale={1.5}
      lineWidth={2}
      visible={showGizmo}
      onDragStart={() => { setDraggingGizmo(true); document.exitPointerLock(); }}
      onDrag={() => { persistFromRef(false); }}
      onDragEnd={() => { persistFromRef(true); setDraggingGizmo(false); }}
    >
      <group
        ref={groupRef}
        position={transform.position}
        rotation={transform.rotation as unknown as [number, number, number]}
        scale={transform.scale}
      >
          {/* 
            Performance Tuning for Large Splats:
            1. toneMapped={false}: Skips tone mapping pass (faster)
            2. alphaTest: Use the store setting (user can crank it up to 0.5+ to kill overdraw)
            3. alphaHash: Keep off for massive scenes unless GPU is high-end
          */}
          <Splat 
            key={`${url}-${key}`}
            src={url} 
            alphaTest={splatAlphaTest}
            alphaHash={splatAlphaHash}
            chunkSize={splatChunkSize}
            toneMapped={false} 
          />
          
          {meshUrl && (
              <RigidBody type="fixed" colliders="trimesh"> 
                   <MeshLoader url={meshUrl} visible={isMeshVisible} />
              </RigidBody>
          )}
      </group>
    </PivotControls>
  );
}
