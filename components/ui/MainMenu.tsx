'use client';

import React, { useCallback, useState } from 'react';
import { Upload, Box, Settings, ArrowRight, Trash2, FileType } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSceneStore } from '@/store/useSceneStore';
import { SettingsPanel } from './SettingsPanel';
import { saveFile, deleteFile } from '@/utils/storage';
import { Scene } from '@/types/scene';

interface MainMenuProps {
    isLoading?: boolean;
}

export function MainMenu({ isLoading }: MainMenuProps) {
  const { isMenuOpen, toggleMenu } = useSettingsStore();
  const scenes = useSceneStore((state) => state.scenes);
  const addScene = useSceneStore((state) => state.addScene);
  const removeScene = useSceneStore((state) => state.removeScene);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);
  
  // Local state for creation
  const [splatFile, setSplatFile] = useState<File | null>(null);
  const [meshFile, setMeshFile] = useState<File | null>(null);
  const [sceneName, setSceneName] = useState('');

  const handleSplatSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSplatFile(file);
        if (!sceneName) {
            setSceneName(file.name.replace(/\.(splat|ply)$/i, ''));
        }
    }
  };

  const handleMeshSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setMeshFile(file);
    }
  };

  const handleCreateScene = async () => {
      if (!splatFile) return;

      const sceneId = crypto.randomUUID();
      const splatKey = `${sceneId}-splat`;
      const meshKey = meshFile ? `${sceneId}-mesh` : undefined;

      // Save files
      await saveFile(splatKey, splatFile);
      if (meshFile && meshKey) {
          await saveFile(meshKey, meshFile);
      }

      // Create Scene Object
      const newScene: Scene = {
          id: sceneId,
          name: sceneName || 'Untitled Scene',
          type: 'user',
          created: Date.now(),
          lastModified: Date.now(),
          splatData: {
              url: null,
              fileKey: splatKey
          },
          meshData: {
              url: null,
              fileKey: meshKey,
              visible: !!meshKey
          },
          transform: {
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1]
          },
          interactables: []
      };

      addScene(newScene);
      setActiveScene(sceneId);
  };

  const handleDeleteScene = async (e: React.MouseEvent, scene: Scene) => {
      e.stopPropagation();
      if (scene.type === 'demo') return;
      
      if (confirm(`Are you sure you want to delete "${scene.name}"?`)) {
          removeScene(scene.id);
          if (scene.splatData.fileKey) await deleteFile(scene.splatData.fileKey);
          if (scene.meshData.fileKey) await deleteFile(scene.meshData.fileKey);
      }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="flex min-h-full flex-col items-center justify-center p-6 relative">
      
        {/* Settings Toggle */}
        {!isMenuOpen && (
            <div className="absolute top-6 right-6 pointer-events-auto z-10">
                <button
                    onClick={() => toggleMenu(true)}
                    className="group flex h-12 w-12 items-center justify-center rounded-full bg-white border border-zinc-100 hover:border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <Settings size={20} className="transition-transform group-hover:rotate-90 duration-700 ease-in-out" />
                </button>
            </div>
        )}

        {/* Main Content */}
        {!isMenuOpen ? (
            <div className="w-full max-w-md flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-500 ease-out">
                
                {/* Create New Section */}
                <div className="flex flex-col gap-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-light tracking-tight text-zinc-900">
                            Interactive Gaussian Splat
                        </h1>
                        <p className="text-sm text-zinc-400 font-light">
                            Import your Gaussian Splat files
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="group">
                             <input 
                                type="text" 
                                value={sceneName}
                                onChange={(e) => setSceneName(e.target.value)}
                                placeholder="Scene Name"
                                className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:border-zinc-900 text-zinc-900 placeholder-zinc-500 focus:outline-none transition-all font-light text-center"
                             />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Splat Upload */}
                            <label className={`group relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed transition-all cursor-pointer ${splatFile ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'}`}>
                                <Upload size={18} className={`transition-colors duration-300 ${splatFile ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                                <span className={`text-[10px] font-medium uppercase tracking-widest text-center transition-colors duration-300 ${splatFile ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-700'}`}>
                                    {splatFile ? 'Splat' : 'Add Splat'}
                                </span>
                                {splatFile && <span className="absolute bottom-2 text-[8px] text-zinc-500 truncate max-w-[90%]">{splatFile.name}</span>}
                                <input type="file" accept=".splat,.ply" className="hidden" onChange={handleSplatSelect} />
                            </label>

                            {/* Mesh Upload */}
                            <label className={`group relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed transition-all cursor-pointer ${meshFile ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'}`}>
                                <FileType size={18} className={`transition-colors duration-300 ${meshFile ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                                <span className={`text-[10px] font-medium uppercase tracking-widest text-center transition-colors duration-300 ${meshFile ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-700'}`}>
                                    {meshFile ? 'Mesh' : 'Add Mesh'}
                                </span>
                                {meshFile && <span className="absolute bottom-2 text-[8px] text-zinc-500 truncate max-w-[90%]">{meshFile.name}</span>}
                                <input type="file" accept=".glb,.gltf,.obj" className="hidden" onChange={handleMeshSelect} />
                            </label>
                        </div>

                        <button
                            onClick={handleCreateScene}
                            disabled={!splatFile || isLoading}
                            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-zinc-200"
                        >
                            {isLoading ? 'Processing...' : (
                                <>
                                    <span>Create</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Divider */}
                {scenes.length > 0 && (
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-zinc-200"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Library</span>
                        <div className="flex-grow border-t border-zinc-200"></div>
                    </div>
                )}

                {/* Scene List */}
                {scenes.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {scenes.map((scene, i) => (
                            <div
                                key={scene.id}
                                onClick={() => setActiveScene(scene.id)}
                                className="group relative w-full flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${scene.type === 'demo' ? 'bg-zinc-50 text-zinc-400' : 'bg-zinc-900 text-white'}`}>
                                        <Box size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="block text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors truncate">{scene.name}</span>
                                        <span className="text-[10px] text-zinc-400 group-hover:text-zinc-500 transition-colors">
                                            {scene.type === 'demo' ? 'Demo Scene' : new Date(scene.lastModified).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {scene.type !== 'demo' && (
                                        <button
                                            onClick={(e) => handleDeleteScene(e, scene)}
                                            className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <div className="h-8 w-8 rounded-full text-zinc-300 group-hover:text-zinc-900 flex items-center justify-center transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        ) : (
            <SettingsPanel />
        )}
      </div>
    </div>
  );
}
