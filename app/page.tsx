'use client';

import { useSplatStore } from '@/store/useSplatStore';
import { useSceneStore } from '@/store/useSceneStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainMenu } from '@/components/ui/MainMenu';
import { Scene } from '@/components/scene/Scene';
import { HUD } from '@/components/ui/HUD';
import { MobileControls } from '@/components/ui/MobileControls';
import { loadFile } from '@/utils/storage';

export default function Home() {
  const url = useSplatStore((state) => state.url);
  const setUrl = useSplatStore((state) => state.setUrl);
  const setMeshUrl = useSplatStore((state) => state.setMeshUrl);
  const setTransform = useSplatStore((state) => state.setTransform);
  const resetSplatStore = useSplatStore((state) => state.reset);
  
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const getScene = useSceneStore((state) => state.getScene);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadScene() {
      if (!activeSceneId) {
        resetSplatStore();
        return;
      }
      
      const scene = getScene(activeSceneId);
      if (!scene) {
          console.warn("Active scene not found in store");
          return;
      }

      setIsLoading(true);

      try {
        // Set Transform immediately
        setTransform(scene.transform);

        // Load Splat
        if (scene.type === 'demo' && scene.splatData.url) {
            setUrl(scene.splatData.url);
        } else if (scene.type === 'user' && scene.splatData.fileKey) {
            const splatFile = await loadFile(scene.splatData.fileKey);
            if (splatFile) {
                setUrl(URL.createObjectURL(splatFile as Blob));
            }
        }

        // Load Mesh
        // Note: Demo scenes in this codebase don't have separate mesh URLs yet, but the logic handles it
        if (scene.type === 'demo' && scene.meshData.url) {
             setMeshUrl(scene.meshData.url);
        } else if (scene.type === 'user' && scene.meshData.fileKey) {
             const meshFile = await loadFile(scene.meshData.fileKey);
             if (meshFile) {
                 setMeshUrl(URL.createObjectURL(meshFile as Blob));
             } else {
                 setMeshUrl(null);
             }
        } else {
            setMeshUrl(null);
        }

      } catch (error) {
          console.error("Failed to load scene:", error);
      } finally {
          setIsLoading(false);
      }
    }

    // Only trigger if url is not already set matching the scene? 
    // Actually, just checking activeSceneId change is safer.
    // If we already have a url, we might be reloading.
    // To prevent infinite loops or redundant loads, we can check if the current store matches the active scene intent?
    // But since `url` is transient (blob), we always need to reload on mount if activeSceneId exists.
    if (activeSceneId && !url) {
        loadScene();
    }
  }, [activeSceneId, getScene, setUrl, setMeshUrl, setTransform, resetSplatStore, url]);
  
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      {!url && <MainMenu isLoading={isLoading} />}
      {url && (
        <>
          <Scene />
          <HUD />
          <MobileControls />
        </>
      )}
    </main>
  );
}
