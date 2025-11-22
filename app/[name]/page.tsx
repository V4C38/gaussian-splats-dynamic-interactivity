'use client';

import { useSplatStore } from '@/store/useSplatStore';
import { useEffect, use } from 'react';
import { Scene } from '@/components/scene/Scene';
import { HUD } from '@/components/ui/HUD';
import { MobileControls } from '@/components/ui/MobileControls';

// Map friendly names to URLs (or handle generic URLs if possible)
// For now, hardcoded mapping for the presets + generic handler?
const PRESET_MAP: Record<string, string> = {
    'plush': 'https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat',
    'garden': 'https://huggingface.co/cakewalk/splat-data/resolve/main/garden.splat',
};

export default function SplatPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const setUrl = useSplatStore((state) => state.setUrl);

  useEffect(() => {
      // Check if it's a preset
      const lowerName = name.toLowerCase();
      if (PRESET_MAP[lowerName]) {
          setUrl(PRESET_MAP[lowerName]);
      } else {
          // If it's not a preset, we can't easily guess the URL unless passed via query param.
          // Or maybe we treat 'name' as a base64 encoded url? Unlikely.
          // For this demo, we only support presets via route, or maybe we redirect to home?
          // User said "I want the splat view to be it´s own route where loading a splat is /SplatName"
          console.warn(`Unknown splat: ${name}`);
      }
  }, [name, setUrl]);

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

