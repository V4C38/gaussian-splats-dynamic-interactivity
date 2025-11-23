'use client';

import { Splat, PivotControls, useGLTF, Html } from '@react-three/drei';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSceneStore } from '@/store/useSceneStore';
import { useEffect, useState, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Group } from 'three';
import { RigidBody } from '@react-three/rapier';
import { loadFile, loadSceneJSON } from '@/utils/storage';

interface ErrorBoundaryProps {
  onError: (e: Error) => void;
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error);
  }
  
  render() {
    return this.props.children;
  }
}

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
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const getScene = useSceneStore((state) => state.getScene);
  const updateScene = useSceneStore((state) => state.updateScene);
  const setDraggingGizmo = useSceneStore((state) => state.setDraggingGizmo);

  const { showGizmo, splatAlphaTest, splatAlphaHash, splatChunkSize } = useSettingsStore((state) => state.settings);
  const [key, setKey] = useState(0);
  const [splatSrc, setSplatSrc] = useState<string | null>(null);
  const [meshSrc, setMeshSrc] = useState<string | null>(null);
  const [isMeshVisible, setIsMeshVisible] = useState<boolean>(false);
  const [transform, setTransformState] = useState<{ position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Transform State (Local)
  const groupRef = useRef<Group>(null);

  async function isGaussianPly(blob: Blob): Promise<boolean | null> {
    try {
      const text = await blob.slice(0, 65536).text();
      if (!text.toLowerCase().startsWith('ply')) return null; // not a ply
      const lower = text.toLowerCase();
      const isBinary = lower.includes('format binary_little_endian');
      const hasGaussian =
        lower.includes('property float scale_0') &&
        (lower.includes('property float rot_0') || lower.includes('property float qx')) &&
        (lower.includes('property float opacity') || lower.includes('property float alpha'));
      return isBinary && hasGaussian;
    } catch {
      return null;
    }
  }

  // Force re-mount on critical setting changes
  useEffect(() => {
    setKey((k) => k + 1);
  }, [splatAlphaHash, splatChunkSize, splatAlphaTest]); 

  // Resolve active scene -> sources and transform
  useEffect(() => {
    if (!activeSceneId) {
      setSplatSrc(null);
      setMeshSrc(null);
      setIsMeshVisible(false);
      setTransformState(null);
      return;
    }
    const scene = getScene(activeSceneId);
    if (!scene) return;
    // First set from current store, then try to refine from persisted JSON
    setTransformState(scene.transform);
    setIsMeshVisible(scene.meshData.visible);
    setLoadError(null);
    let revokeUrls: string[] = [];
    (async () => {
      try {
        // Prefer persisted JSON (ensures transforms restored even if store defaults)
        try {
          const persisted = await loadSceneJSON(activeSceneId);
          if (persisted) {
            setTransformState(persisted.transform);
            setIsMeshVisible(persisted.meshData.visible);
          }
        } catch {
          // ignore
        }
        // Splat
        if (scene.type === 'demo' && scene.splatData.url) {
          setSplatSrc(scene.splatData.url);
        } else if (scene.type === 'user' && scene.splatData.fileKey) {
          const file = await loadFile(scene.splatData.fileKey);
          if (file) {
            const blob = file as Blob;
            const plyCheck = await isGaussianPly(blob);
            if (plyCheck === false) {
              setLoadError('Unsupported PLY: requires binary little-endian Gaussian Splat PLY with scale/rot/opacity.');
              setSplatSrc(null);
            } else {
              const url = URL.createObjectURL(blob);
              revokeUrls.push(url);
              setSplatSrc(url);
            }
          } else {
            setSplatSrc(null);
          }
        } else {
          setSplatSrc(null);
        }
        // Mesh
        if (scene.type === 'demo' && scene.meshData.url) {
          setMeshSrc(scene.meshData.url);
        } else if (scene.type === 'user' && scene.meshData.fileKey) {
          const file = await loadFile(scene.meshData.fileKey);
          if (file) {
            const url = URL.createObjectURL(file as Blob);
            revokeUrls.push(url);
            setMeshSrc(url);
          } else {
            setMeshSrc(null);
          }
        } else {
          setMeshSrc(null);
        }
      } catch (e) {
        console.error('Failed to resolve scene sources', e);
        setLoadError('Failed to load scene assets');
      }
    })();
    return () => {
      revokeUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [activeSceneId, getScene]);

  useEffect(() => {
    // Apply persisted transform
    if (!groupRef.current || !transform) return;
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
    
    setTransformState(newTransform as typeof newTransform);
    
    if (saveToStore && activeSceneId) {
        updateScene(activeSceneId, { transform: newTransform });
    }
  };

  if (loadError) {
    return (
      <group>
        <Html center>
          <div className="rounded-md bg-white/90 border border-red-200 text-red-700 px-3 py-2 text-sm shadow-sm">
            {loadError}
          </div>
        </Html>
      </group>
    );
  }

  if (!splatSrc || !transform) return null;

  return (
    <PivotControls 
      anchor={[0, 0, 0]} 
      depthTest={false} 
      scale={1.5}
      lineWidth={2}
      visible={showGizmo}
      enabled={showGizmo}
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
          <ErrorBoundary onError={(e) => setLoadError(e.message)}>
            <Splat 
              key={`${splatSrc}-${key}`}
              src={splatSrc} 
              alphaTest={splatAlphaTest}
              alphaHash={splatAlphaHash}
              chunkSize={splatChunkSize}
              toneMapped={false} 
            />
          </ErrorBoundary>
          
          {meshSrc && (
              <RigidBody type="fixed" colliders="trimesh"> 
                   <MeshLoader url={meshSrc} visible={isMeshVisible} />
              </RigidBody>
          )}
      </group>
    </PivotControls>
  );
}
