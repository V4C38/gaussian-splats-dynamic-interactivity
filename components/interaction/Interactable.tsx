'use client';

import { useEffect, useRef, cloneElement, Children, isValidElement, useState } from 'react';
import { useSceneStore } from '@/store/useSceneStore';
import { InteractionType, IInteractionAction } from '@/types/interaction';
import { Group } from 'three';
import { Html, Outlines } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import { useSettingsStore } from '@/store/useSettingsStore';

interface InteractableProps {
  id: string;
  type: InteractionType;
  title: string;
  actions: IInteractionAction[];
  children: React.ReactNode;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  position?: any;
}

export function Interactable({ 
  id, 
  type, 
  title,
  actions,
  children, 
  onHoverStart, 
  onHoverEnd,
  position 
}: InteractableProps) {
  const register = useSceneStore((state) => state.registerInteractive);
  const unregister = useSceneStore((state) => state.unregisterInteractive);
  const hoveredId = useSceneStore((state) => state.hoveredId);
  const groupRef = useRef<Group>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{x:number;y:number}>({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);
  const audioEnabled = useSettingsStore((s) => s.settings.audioEnabled);
  
  const isHovered = hoveredId === id;

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Spawn animation + optional sound
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    // Scale-in animation
    let start: number | null = null;
    const durationMs = 180;
    const from = 0.001;
    const to = 1.0;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      const s = from + (to - from) * p;
      g.scale.setScalar(s);
      if (p < 1) requestAnimationFrame(step);
    };
    g.scale.setScalar(from);
    const rafId = requestAnimationFrame(step);

    // Sound
    if (audioEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = 0.05;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.16);
        osc.onended = () => ctx.close();
      } catch {
        // Ignore audio errors (autoplay policies, etc.)
      }
    }

    return () => cancelAnimationFrame(rafId);
  }, [audioEnabled]);

  useEffect(() => {
    register(id, { 
      id, 
      type, 
      title,
      actions,
      onHoverStart, 
      onHoverEnd,
      position 
    });
    
    return () => unregister(id);
  }, [id, type, title, actions, register, unregister, onHoverStart, onHoverEnd, position]);

  useEffect(() => {
    if (!isHovered) return;
    const clamp = () => {
      const el = boxRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const margin = 12;
      let dx = 0, dy = 0;
      
      // More aggressive clamping for mobile safe area
      const safeW = window.innerWidth;
      const safeH = window.innerHeight;

      if (rect.right > safeW - margin) dx = (safeW - margin) - rect.right;
      if (rect.left < margin) dx = margin - rect.left;
      if (rect.bottom > safeH - margin) dy = (safeH - margin) - rect.bottom;
      if (rect.top < margin) dy = margin - rect.top;
      
      setOffset({ x: dx, y: dy });
    };
    const idr = requestAnimationFrame(clamp);
    window.addEventListener('resize', clamp);
    return () => { cancelAnimationFrame(idr); window.removeEventListener('resize', clamp); };
  }, [isHovered]);

  return (
    <group ref={groupRef} userData={{ interactiveId: id }} position={position}>
      {/* Object Content & Outline Injection */}
      <group>
        {Children.map(children, (child) => {
           if (isValidElement(child)) {
             return cloneElement(child as React.ReactElement<any>, {}, 
               <>
                 {child.props.children}
                 {isHovered && <Outlines thickness={0.05} color="white" opacity={1} transparent screenspace={false} angle={0} />}
               </>
             );
           }
           return child;
        })}
      </group>
      
      {/* Starfield-style UI Prompt */}
      <Html 
        position={[0, 0, 0]} 
        center 
        zIndexRange={[100, 0]} 
        style={{ 
            pointerEvents: 'none', 
            width: '260px', 
            height: '130px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
      >
        <AnimatePresence>
            {isHovered && (
                <div className="relative w-full h-full">
                    {/* Anchor Dot - Minimal */}
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full z-10"
                    />

                    {/* Line Container - Rotated -45deg */}
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 90, opacity: 1 }} 
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 h-[1px] bg-white origin-left"
                        style={{ transform: 'rotate(-45deg) translateY(-0.5px)' }}
                    />
                    
                    {/* Content Box - white background, clamped to viewport */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 64 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="absolute top-1/2 left-1/2"
                        style={{ marginTop: '-64px', transform: `translate(${offset.x}px, ${offset.y}px)` }}
                    >
                        <div ref={boxRef} className="flex flex-col bg-white text-zinc-900 border-l-2 border-zinc-300 px-3 py-2 rounded-r-sm shadow-2xl min-w-[160px] backdrop-blur-md origin-top-left">
                            <div className="flex items-baseline justify-between border-b border-zinc-200 pb-1.5 mb-1.5 gap-2">
                                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900 whitespace-nowrap">
                                    {title}
                                </h2>
                                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                    {type}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                {actions.map((action, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-700">
                                            {action.label}
                                        </span>
                                        {!isTouch && (
                                            <div className="flex items-center justify-center h-4 min-w-[16px] px-1.5 bg-white text-zinc-900 text-[10px] font-black rounded-[2px] border border-zinc-300">
                                                {action.key}
                                            </div>
                                        )}
                                        {isTouch && (
                                            <div className="flex items-center justify-center h-4 px-1.5 bg-zinc-100 text-zinc-500 text-[9px] font-bold rounded-full">
                                                TAP E
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </Html>
    </group>
  );
}
