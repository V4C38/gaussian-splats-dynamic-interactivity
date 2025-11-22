'use client';

import { useState } from 'react';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useSplatStore } from '@/store/useSplatStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSceneStore } from '@/store/useSceneStore';
import { ArrowLeft, Settings, X, Grid, Move3D, Activity, Box } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { useRouter } from 'next/navigation';

function PerformanceOverlay() {
  const { settings, metrics } = useSettingsStore();
  if (!settings.showPerformance) return null;
  return (
    <div className="pointer-events-none absolute top-20 right-6 z-40">
      <div className="rounded-2xl bg-white/95 border border-zinc-200 shadow-xl backdrop-blur-md px-4 py-3 min-w-[220px]">
        <div className="flex items-baseline justify-between pb-2 border-b border-zinc-100">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Performance</span>
          <span className="text-xs font-semibold text-zinc-900">{metrics.fps} fps</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2 text-[11px] text-zinc-600">
          <div className="flex justify-between"><span>Frame</span><span className="font-medium text-zinc-900">{metrics.frameMs} ms</span></div>
          <div className="flex justify-between"><span>Calls</span><span className="font-medium text-zinc-900">{metrics.calls}</span></div>
          <div className="flex justify-between"><span>Tris</span><span className="font-medium text-zinc-900">{metrics.triangles}</span></div>
          <div className="flex justify-between"><span>Geoms</span><span className="font-medium text-zinc-900">{metrics.geometries}</span></div>
          <div className="flex justify-between"><span>Textures</span><span className="font-medium text-zinc-900">{metrics.textures}</span></div>
          {metrics.memoryMB !== undefined && (
            <div className="flex justify-between"><span>Memory</span><span className="font-medium text-zinc-900">{metrics.memoryMB} MB</span></div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HUD() {
  const hoveredId = useInteractionStore((state) => state.hoveredId);
  const url = useSplatStore((state) => state.url);
  const setUrl = useSplatStore((state) => state.setUrl);
  const resetSplat = useSplatStore((state) => state.reset);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);
  const router = useRouter();
  
  const { isMenuOpen, toggleMenu, settings, updateSettings } = useSettingsStore();

  const handleBack = () => {
    resetSplat();
    setActiveScene(null);
    router.push('/');
  };

  const ToolButton = ({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label: string }) => (
    <button
      aria-pressed={active}
      onClick={onClick}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-95 ${
        active ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      {children}
    </button>
  );

  const toggleSetting = (key: 'showGrid' | 'wireframe' | 'showGizmo' | 'showPerformance') => {
    const current = useSettingsStore.getState().settings[key];
    updateSettings({ [key]: !current } as any);
  };

  return (
    <>
      {/* Crosshair */}
      {!isMenuOpen && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
          <div 
            className={`h-1.5 w-1.5 rounded-full bg-white border border-black transition-all duration-300 ${
                hoveredId ? 'scale-150' : 'scale-100'
            }`}
          />
        </div>
      )}

      <PerformanceOverlay />

      {/* Top Bar (Back on left, Tool toggles + Settings on right) */}
      {url && (
        <div className="pointer-events-auto absolute top-0 left-0 right-0 z-50 flex flex-wrap items-start justify-between gap-4 p-4 md:p-6">
          {!isMenuOpen ? (
             <button
               onClick={handleBack}
               className="group flex items-center gap-2 rounded-full bg-white/80 pl-3 pr-5 py-2.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md border border-zinc-200/50 transition-all hover:bg-white hover:text-zinc-900 hover:shadow-md active:scale-95"
             >
               <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
               Back
             </button>
          ) : <div />}

          <div className="flex flex-wrap items-center justify-end gap-2">
            
            {/* Speed Slider */}
            {!isMenuOpen && (
                <div className="flex items-center gap-2 mr-2 bg-white/80 rounded-full px-3 py-2 border border-zinc-200/50 backdrop-blur-md shadow-sm order-first md:order-none w-full md:w-auto justify-between md:justify-start">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Speed</span>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="5" 
                        step="0.5"
                        value={settings.moveSpeed}
                        onChange={(e) => updateSettings({ moveSpeed: parseFloat(e.target.value) })}
                        className="w-24 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    />
                    <span className="text-[10px] font-medium text-zinc-900 w-6 text-right">{settings.moveSpeed.toFixed(1)}x</span>
                </div>
            )}

            {/* Scene Tool Toggles */}
            <ToolButton
              active={settings.showGrid}
              onClick={() => toggleSetting('showGrid')}
              label="Ground Grid"
            >
              <Grid size={18} />
            </ToolButton>
            <ToolButton
              active={settings.wireframe}
              onClick={() => toggleSetting('wireframe')}
              label="Wireframe"
            >
              <Box size={18} />
            </ToolButton>
            <ToolButton
              active={settings.showGizmo}
              onClick={() => toggleSetting('showGizmo')}
              label="Transform Gizmo"
            >
              <Move3D size={18} />
            </ToolButton>
            <ToolButton
              active={settings.showPerformance}
              onClick={() => toggleSetting('showPerformance')}
              label="Performance Stats"
            >
              <Activity size={18} />
            </ToolButton>

            {/* Settings/Burger */}
            <button
              onClick={() => toggleMenu(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-md border border-zinc-200/50 text-zinc-600 transition-all hover:bg-white hover:text-zinc-900 hover:shadow-md active:scale-95"
            >
              {isMenuOpen ? <X size={20} /> : <Settings size={20} />}
            </button>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
           <SettingsPanel />
        </div>
      )}
    </>
  );
}
