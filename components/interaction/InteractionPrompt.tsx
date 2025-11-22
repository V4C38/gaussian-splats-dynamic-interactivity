'use client';

import { Html } from '@react-three/drei';
import { useState, useEffect } from 'react';

interface InteractionPromptProps {
  objectName: string;
  label: string; // Action name
  secondaryLabel?: string;
  visible: boolean;
}

export function InteractionPrompt({ objectName, label, secondaryLabel, visible }: InteractionPromptProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    if (visible) setIsMounted(true);
    // Delay unmount to allow exit animation? 
    // For now, just simple mount/unmount or opacity
  }, [visible]);

  // Starfield-style:
  // A line drawn from the anchor (0,0) to the UI box.
  // The UI box is offset.
  const offsetX = 60;
  const offsetY = -60;

  return (
    <Html
      position={[0, 0, 0]} // Anchor at object center
      center // Center the coordinate system
      zIndexRange={[100, 0]}
      style={{ 
         pointerEvents: 'none',
         opacity: visible ? 1 : 0,
         transition: 'opacity 0.2s ease-in-out',
         transform: 'scale(1)',
      }}
    >
        {/* The Line and Box Container */}
        <div className="relative w-0 h-0">
            
            {/* SVG Line */}
            <svg 
                width="300" 
                height="300" 
                className="absolute top-0 left-0 overflow-visible"
                style={{ transform: 'translate(-50%, -50%)' }} // Center SVG on 0,0
            >
                {/* Line from center (150,150) to offset */}
                <line 
                    x1="150" 
                    y1="150" 
                    x2={150 + offsetX} 
                    y2={150 + offsetY} 
                    stroke="white" 
                    strokeWidth="1.5"
                    className="drop-shadow-md"
                />
                {/* Dot at anchor */}
                <circle cx="150" cy="150" r="3" fill="white" />
            </svg>

            {/* Content Box */}
            <div 
                className="absolute flex flex-col items-start min-w-[180px] backdrop-blur-sm"
                style={{ 
                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                    left: 0,
                    top: 0,
                }}
            >
                {/* Object Name Box */}
                <div className="bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black border border-white">
                    {objectName}
                </div>

                {/* Interactions Container */}
                <div className="mt-1 flex flex-col gap-1 bg-black/60 p-2 border-l-2 border-white shadow-lg backdrop-blur-md">
                    {/* Primary Interaction */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center bg-white/10 border border-white/30 text-[10px] font-bold text-white">
                            F
                        </div>
                        <span className="text-xs font-bold uppercase text-white tracking-wide">
                            {label}
                        </span>
                    </div>

                    {/* Secondary Interaction (Optional) */}
                    {secondaryLabel && (
                         <div className="flex items-center gap-2 opacity-80">
                            <div className="flex h-5 w-5 items-center justify-center bg-white/10 border border-white/30 text-[10px] font-bold text-white">
                                C
                            </div>
                            <span className="text-xs font-bold uppercase text-white tracking-wide">
                                {secondaryLabel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </Html>
  );
}

