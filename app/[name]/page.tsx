'use client';

import { useEffect, use } from 'react';
import { Scene } from '@/components/scene/Scene';
import { HUD } from '@/components/ui/HUD';
import { MobileControls } from '@/components/ui/MobileControls';
import { useSceneStore } from '@/store/useSceneStore';

// Map friendly names to URLs (or handle generic URLs if possible)
// For now, hardcoded mapping for the presets + generic handler?
const PRESET_MAP: Record<string, string> = {
    'plush': 'https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat',
    'garden': 'https://huggingface.co/cakewalk/splat-data/resolve/main/garden.splat',
  'interaction': '',
  'interaction-demo': '',
};

export default function SplatPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);

  useEffect(() => {
      // Check if it's a preset
      const lowerName = name.toLowerCase();
      if (PRESET_MAP[lowerName]) {
          // Map preset to our demo IDs
          const id = lowerName === 'plush' 
            ? 'demo-plush' 
            : lowerName === 'garden' 
              ? 'demo-garden' 
              : (lowerName === 'interaction' || lowerName === 'interaction-demo')
                ? 'demo-interaction'
                : null;
          if (id) setActiveScene(id);
      } else {
          // If it's not a preset, we can't easily guess the URL unless passed via query param.
          // Or maybe we treat 'name' as a base64 encoded url? Unlikely.
          // For this demo, we only support presets via route, or maybe we redirect to home?
          // User said "I want the splat view to be it´s own route where loading a splat is /SplatName"
          console.warn(`Unknown splat: ${name}`);
      }
  }, [name, setActiveScene]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
       {/* We render the Scene directly, assuming URL is set by effect */}
       {/* We might want a loading state here */}
       <Scene />
       <HUD />
       <MobileControls />
    </main>
  );
}

