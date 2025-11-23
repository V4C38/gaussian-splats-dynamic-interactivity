'use client';

import { useSceneStore } from '@/store/useSceneStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainMenu } from '@/components/ui/MainMenu';
import { Scene } from '@/components/scene/Scene';
import { HUD } from '@/components/ui/HUD';
import { MobileControls } from '@/components/ui/MobileControls';

export default function Home() {
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [activeSceneId]);
  
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      {!activeSceneId && <MainMenu isLoading={isLoading} />}
      {activeSceneId && (
        <>
          <Scene />
          <HUD />
          <MobileControls />
        </>
      )}
    </main>
  );
}
