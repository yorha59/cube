
import React from 'react';
import { Move } from '../types';

interface ControlPanelProps {
  onMove: (move: Move) => void;
  onScramble: () => void;
  onReset: () => void;
  isRotating: boolean;
  lastMove: Move | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onMove, onScramble, onReset, isRotating, lastMove }) => {
  
  const ArrowIcon = ({ move }: { move: Move }) => {
    const isInverse = move.includes("'");
    const m = move.charAt(0);
    
    // Horizontal
    if (['U', 'E', 'D'].includes(m)) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform duration-300 ${isInverse ? '' : 'rotate-180'}`}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      );
    }
    // Vertical
    if (['L', 'M', 'R'].includes(m)) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform duration-300 ${isInverse ? 'rotate-180' : ''}`}>
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      );
    }
    // Depth (Z) - Circles
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform duration-300 ${isInverse ? 'scale-x-[-1]' : ''}`}>
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    );
  };

  const MoveButton = ({ move, color, text }: { move: Move; color: string; text: string }) => {
    const isActive = lastMove === move;
    const isInverse = move.includes("'");
    const baseKey = move.charAt(0);
    
    return (
      <button
        disabled={isRotating}
        onClick={() => onMove(move)}
        className={`
          relative flex-1 h-12 flex items-center justify-center rounded-xl transition-all duration-150 group overflow-hidden
          ${isActive ? 'scale-90 shadow-inner brightness-75' : 'hover:scale-102 hover:brightness-110 active:scale-95 shadow-md'}
          ${isRotating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isInverse ? 'bg-slate-800 text-slate-300 border border-slate-700' : `${color} ${text} border border-black/10`}
        `}
      >
        <div className="flex flex-col items-center gap-0.5">
          <ArrowIcon move={move} />
          <div className="flex items-center gap-1">
             <span className="text-[10px] font-black tracking-tighter">{move}</span>
             <span className={`text-[7px] font-bold px-1 rounded bg-black/10 flex items-center h-3 border border-black/5`}>
               {isInverse ? `⇧${baseKey}` : baseKey}
             </span>
          </div>
        </div>
        
        {/* Hover Highlight */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
      </button>
    );
  };

  const AxisSection = ({ title, icon, children }: { title: string; icon: string; children?: React.ReactNode }) => (
    <div className="flex flex-col gap-2.5 bg-white/[0.03] p-3 rounded-2xl border border-white/5 flex-1 min-w-[160px]">
      <div className="flex items-center justify-between px-1 border-b border-white/5 pb-1 mb-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
        <span className="text-sm opacity-60">{icon}</span>
      </div>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Y Axis */}
      <AxisSection title="Horiz (Y)" icon="↔️">
        <div className="flex gap-2">
          <MoveButton move="U" color="bg-slate-100" text="text-slate-900" />
          <MoveButton move="U'" color="bg-slate-100" text="text-slate-900" />
        </div>
        <div className="flex gap-2">
          <MoveButton move="E" color="bg-slate-600" text="text-white" />
          <MoveButton move="E'" color="bg-slate-600" text="text-white" />
        </div>
        <div className="flex gap-2">
          <MoveButton move="D" color="bg-amber-400" text="text-slate-900" />
          <MoveButton move="D'" color="bg-amber-400" text="text-slate-900" />
        </div>
      </AxisSection>

      {/* X Axis */}
      <AxisSection title="Vert (X)" icon="↕️">
        <div className="flex gap-2">
          <MoveButton move="L" color="bg-orange-500" text="text-white" />
          <MoveButton move="L'" color="bg-orange-500" text="text-white" />
        </div>
        <div className="flex gap-2">
          <MoveButton move="M" color="bg-slate-600" text="text-white" />
          <MoveButton move="M'" color="bg-slate-600" text="text-white" />
        </div>
        <div className="flex gap-2">
          <MoveButton move="R" color="bg-rose-600" text="text-white" />
          <MoveButton move="R'" color="bg-rose-600" text="text-white" />
        </div>
      </AxisSection>

      {/* Z Axis */}
      <AxisSection title="Depth (Z)" icon="⊙">
        <div className="flex gap-2">
          <MoveButton move="F" color="bg-emerald-600" text="text-white" />
          <MoveButton move="F'" color="bg-emerald-600" text="text-white" />
        </div>
        <div className="flex gap-2">
          <MoveButton move="S" color="bg-slate-600" text="text-white" />
          <MoveButton move="S'" color="bg-slate-600" text="text-white" />
        </div>
        <div className="flex gap-2">
          <MoveButton move="B" color="bg-indigo-600" text="text-white" />
          <MoveButton move="B'" color="bg-indigo-600" text="text-white" />
        </div>
      </AxisSection>

      {/* Global Actions */}
      <div className="flex flex-col gap-3 min-w-[140px] justify-center ml-2 border-l border-white/5 pl-4">
         <button
          onClick={onScramble}
          disabled={isRotating}
          className="group relative py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-xl border-b-4 border-blue-900 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-widest shadow-lg overflow-hidden"
        >
          <span className="relative z-10">Scramble</span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={onReset}
          disabled={isRotating}
          className="group relative py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-black rounded-xl border-b-4 border-black/40 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-widest border border-white/5"
        >
          <span className="relative z-10">Reset Cube</span>
        </button>
        <div className="mt-2 text-[8px] text-slate-600 font-bold uppercase text-center tracking-tighter italic">
          Tip: Use SHIFT + KEY for inverse
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
