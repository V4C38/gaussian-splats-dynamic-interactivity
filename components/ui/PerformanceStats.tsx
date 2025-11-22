'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Html } from '@react-three/drei';

export function PerformanceStats() {
  const showPerformance = useSettingsStore((state) => state.settings.showPerformance);
  const [stats, setStats] = useState({ fps: 0, frameTime: 0, memory: 0, drawCalls: 0 });
  const lastTime = useRef(performance.now());
  const frames = useRef(0);

  useFrame(({ gl, scene, camera }) => {
    if (!showPerformance) return;

    const time = performance.now();
    frames.current++;

    if (time >= lastTime.current + 1000) {
      const fps = Math.round((frames.current * 1000) / (time - lastTime.current));
      const frameTime = Math.round(1000 / fps);
      const memory = (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 0;
      const drawCalls = gl.info.render.calls;

      setStats({ fps, frameTime, memory, drawCalls });
      
      lastTime.current = time;
      frames.current = 0;
    }
  });

  if (!showPerformance) return null;

  return (
    <Html fullscreen style={{ pointerEvents: 'none', zIndex: 100 }}>
      <div className="absolute top-4 left-4 flex flex-col gap-2 min-w-[180px]">
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-zinc-200 p-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Performance</h3>
                <div className={`h-2 w-2 rounded-full ${stats.fps > 50 ? 'bg-emerald-500' : stats.fps > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                    <span className="block text-[10px] text-zinc-400">FPS</span>
                    <span className="text-sm font-bold text-zinc-700">{stats.fps}</span>
                </div>
                <div>
                    <span className="block text-[10px] text-zinc-400">Frame Time</span>
                    <span className="text-sm font-bold text-zinc-700">{stats.frameTime}ms</span>
                </div>
                <div>
                    <span className="block text-[10px] text-zinc-400">Draw Calls</span>
                    <span className="text-sm font-bold text-zinc-700">{stats.drawCalls}</span>
                </div>
                <div>
                    <span className="block text-[10px] text-zinc-400">Memory</span>
                    <span className="text-sm font-bold text-zinc-700">{stats.memory > 0 ? `${stats.memory}MB` : 'N/A'}</span>
                </div>
            </div>
        </div>
      </div>
    </Html>
  );
}

