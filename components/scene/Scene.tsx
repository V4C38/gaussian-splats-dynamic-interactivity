'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { SplatViewer } from './SplatViewer';
import { Player } from '../player/Player';
import { InteractionManager } from '../interaction/InteractionManager';
import { DemoWorld } from './DemoWorld';
import { Suspense, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSceneStore } from '@/store/useSceneStore';
import * as THREE from 'three';

function WireframeEffect() {
  const wireframe = useSettingsStore((state) => state.settings.wireframe);
  const { scene } = useThree();

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const material = (mesh as any).material as THREE.Material | THREE.Material[] | undefined;
      if (!material) return;
      const mats = Array.isArray(material) ? material : [material];
      mats.forEach((m) => {
        if ('wireframe' in m) {
          (m as any).wireframe = wireframe;
        }
      });
    });
  }, [wireframe, scene]);

  return null;
}

function MetricsCollector() {
  const show = useSettingsStore((s) => s.settings.showPerformance);
  const updateMetrics = useSettingsStore((s) => s.updateMetrics);
  const { gl } = useThree();
  const last = useRef<number | null>(null);
  const accum = useRef({ frames: 0, time: 0 });

  useFrame((state) => {
    if (!show) return;
    const now = state.clock.elapsedTime;
    if (last.current === null) last.current = now;
    const dt = now - last.current;
    last.current = now;

    accum.current.frames += 1;
    accum.current.time += dt;

    // Update 4 times per second
    if (accum.current.time >= 0.25) {
      const fps = accum.current.frames / accum.current.time;
      const frameMs = (accum.current.time / accum.current.frames) * 1000;
      const info = gl.info;
      const memory = (performance as any).memory;
      updateMetrics({
        fps: Math.round(fps),
        frameMs: Math.round(frameMs),
        triangles: info.render.triangles,
        calls: info.render.calls,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        memoryMB: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : undefined,
      });
      accum.current.frames = 0;
      accum.current.time = 0;
    }
  });

  return null;
}

export function Scene() {
  const activeSceneId = useSceneStore((s) => s.activeSceneId);
  const shouldShowDemoWorld = activeSceneId === 'demo-interaction';
  return (
    <div className="h-screen w-screen bg-[#fafafa]">
      <Canvas
        camera={{ fov: 75, position: [0, 2, 5] }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: false,
          stencil: false,
          alpha: false,
          depth: true 
        }}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#fafafa']} />
        <WireframeEffect />
        <MetricsCollector />

        <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
                <InteractionManager />
                <SplatViewer />
                <Player />
                {shouldShowDemoWorld && <DemoWorld />}
            </Physics>
        </Suspense>
        
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
      </Canvas>
    </div>
  );
}
