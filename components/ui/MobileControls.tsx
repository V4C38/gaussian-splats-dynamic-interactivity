'use client';

import { useEffect, useState, useRef } from 'react';
import { useInputStore } from '@/store/useInputStore';

export function MobileControls() {
  const [isTouch, setIsTouch] = useState(false);
  const setMove = useInputStore((state) => state.setMove);
  const setLook = useInputStore((state) => state.setLook);

  useEffect(() => {
    const checkTouch = () => {
       setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const moveZoneRef = useRef<HTMLDivElement>(null);
  const lookZoneRef = useRef<HTMLDivElement>(null);

  const handleTouch = (e: React.TouchEvent, type: 'move' | 'look') => {
    // e.preventDefault() here might be too late if not passive:false, but for now rely on CSS touch-action
    const touch = e.targetTouches[0];
    const zone = type === 'move' ? moveZoneRef.current : lookZoneRef.current;
    if (!zone) return;

    const rect = zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalize -1 to 1
    const x = (touch.clientX - centerX) / (rect.width / 2);
    const y = (touch.clientY - centerY) / (rect.height / 2);

    // Clamp
    const clampedX = Math.max(-1, Math.min(1, x));
    const clampedY = Math.max(-1, Math.min(1, y));

    if (type === 'move') {
      // In store: x is strafe, y is forward/back (inverted for screen Y)
      // Mobile joystick up (negative screen Y) means forward (+y in store logic for W key equivalent)
      // Let's check Player.tsx logic:
      // KeyW: setMove(current.x, 1, current.z) -> y=1 is forward
      // So negative screen Y (up) should map to positive store Y.
      // clampedY is -1 (top) to 1 (bottom).
      // So store Y = -clampedY.
      setMove(clampedX, -clampedY, 0); 
    } else {
      setLook(clampedX, clampedY);
    }
  };

  const handleEnd = (type: 'move' | 'look') => {
    if (type === 'move') setMove(0, 0, 0);
    if (type === 'look') setLook(0, 0);
  };

  if (!isTouch) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-end pb-8 px-4 select-none touch-none">
      {/* Interact Button */}
      <div className="absolute bottom-24 right-8 pointer-events-auto">
         <button 
           className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-md border border-zinc-200/50 text-zinc-800 font-bold transition-transform active:scale-95 active:bg-white select-none touch-none"
           onTouchStart={(e) => { e.preventDefault(); }}
           onTouchEnd={(e) => { e.preventDefault(); }}
           onContextMenu={(e) => e.preventDefault()}
         >
           E
         </button>
      </div>

      <div className="flex justify-between pointer-events-auto w-full max-w-lg mx-auto">
        {/* Move Stick */}
        <div 
          ref={moveZoneRef}
          className="h-32 w-32 rounded-full bg-zinc-900/5 backdrop-blur-sm border border-zinc-900/5 relative active:bg-zinc-900/10 transition-colors touch-none select-none"
          onTouchStart={(e) => handleTouch(e, 'move')}
          onTouchMove={(e) => handleTouch(e, 'move')}
          onTouchEnd={() => handleEnd('move')}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-400 text-[10px] font-bold tracking-widest select-none">MOVE</div>
        </div>

        {/* Look Stick */}
        <div 
          ref={lookZoneRef}
          className="h-32 w-32 rounded-full bg-zinc-900/5 backdrop-blur-sm border border-zinc-900/5 relative active:bg-zinc-900/10 transition-colors touch-none select-none"
          onTouchStart={(e) => handleTouch(e, 'look')}
          onTouchMove={(e) => handleTouch(e, 'look')}
          onTouchEnd={() => handleEnd('look')}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-400 text-[10px] font-bold tracking-widest select-none">LOOK</div>
        </div>
      </div>
    </div>
  );
}
