'use client';

import React from 'react';
import { ArrowLeft, Monitor, Activity, Gauge, Grid, Move3D } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function SettingsPanel() {
  const { settings, updateSettings, toggleMenu } = useSettingsStore();

  return (
       <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-300">
           
           {/* Header */}
           <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-4">
                  <button 
                     onClick={() => toggleMenu(false)}
                     className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all active:scale-95"
                  >
                      <ArrowLeft size={18} />
                  </button>
                  <div>
                      <h2 className="text-xl font-bold text-zinc-900">Settings</h2>
                      <p className="text-xs text-zinc-500">Configure viewer preferences</p>
                  </div>
              </div>
           </div>

           <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-h-[60vh] overflow-y-auto">
               
               {/* Column 1: Visuals */}
               <div className="space-y-8">
                   <div className="flex items-center gap-2 text-zinc-400 pb-2 border-b border-zinc-100">
                      <Monitor size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Visual Quality</span>
                   </div>

                   {/* Pixel Ratio */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-zinc-700">Resolution Scale</label>
                          <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-600">{settings.pixelRatio}x</span>
                      </div>
                      <input 
                           type="range" 
                           min="0.5" 
                           max="2" 
                           step="0.1"
                           value={settings.pixelRatio}
                           onChange={(e) => updateSettings({ pixelRatio: parseFloat(e.target.value) })}
                           className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                       />
                       <p className="text-[10px] text-zinc-400">Adjust internal render resolution. Lower for better performance.</p>
                   </div>

                   {/* Antialiasing */}
                   <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-700">Antialiasing</span>
                          <span className="text-[10px] text-zinc-400">Smooth edges (MSAA)</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.antialiasing}
                            onChange={(e) => updateSettings({ antialiasing: e.target.checked })}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
                      </label>
                   </div>

                   {/* Scene Tools */}
                   <div className="space-y-4 pt-4 border-t border-zinc-100">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Grid size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Scene Tools</span>
                      </div>

                      {/* Ground Grid */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                        <span className="text-sm font-medium text-zinc-700">Ground Grid</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={settings.showGrid}
                              onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                              className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      {/* Wireframe */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                        <span className="text-sm font-medium text-zinc-700">Wireframe</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={settings.wireframe}
                              onChange={(e) => updateSettings({ wireframe: e.target.checked })}
                              className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                        </label>
                      </div>

                      {/* Transform Gizmo */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                        <span className="text-sm font-medium text-zinc-700">Transform Gizmo</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={settings.showGizmo}
                              onChange={(e) => updateSettings({ showGizmo: e.target.checked })}
                              className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      {/* Performance Stats */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                        <span className="text-sm font-medium text-zinc-700">Performance Stats</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={settings.showPerformance}
                              onChange={(e) => updateSettings({ showPerformance: e.target.checked })}
                              className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                   </div>
               </div>

               {/* Column 2: Splat Optimization */}
               <div className="space-y-8">
                   <div className="flex items-center gap-2 text-zinc-400 pb-2 border-b border-zinc-100">
                      <Gauge size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Splat Optimization</span>
                   </div>

                   {/* Alpha Clip */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-zinc-700">Alpha Clip</label>
                          <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-600">{settings.splatAlphaTest.toFixed(2)}</span>
                      </div>
                      <input 
                           type="range" 
                           min="0" 
                           max="1" 
                           step="0.01"
                           value={settings.splatAlphaTest}
                           onChange={(e) => updateSettings({ splatAlphaTest: parseFloat(e.target.value) })}
                           className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                       />
                       <p className="text-[10px] text-zinc-400">Higher values discard faint points for speed.</p>
                   </div>

                   {/* Alpha Hash */}
                   <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-700">Alpha Hash</span>
                          <span className="text-[10px] text-zinc-400">Smoother transparency</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.splatAlphaHash}
                            onChange={(e) => updateSettings({ splatAlphaHash: e.target.checked })}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
                      </label>
                   </div>
               </div>

           </div>
       </div>
  );
}
