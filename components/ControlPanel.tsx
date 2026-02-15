
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
  const MoveButton = ({ move, color, text, label }: { move: Move; color: string; text: string; label?: string }) => {
    const isActive = lastMove === move;
    const isInverse = move.includes("'");
    return (
      <button
        disabled={isRotating}
        onClick={() => onMove(move)}
        className={`
          relative flex-1 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-75
          ${isActive ? 'translate-y-1 scale-95 shadow-inner' : 'hover:-translate-y-0.5 active:translate-y-1 active:scale-95 shadow-md'}
          ${isRotating ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          ${isInverse ? 'bg-gray-800 text-gray-400 border-b-2 border-gray-950' : `${color} ${text} border-b-2 border-black/20`}
        `}
      >
        <span className="text-xs font-black">{move}</span>
        <span className="text-[8px] opacity-60 uppercase font-bold">{isInverse ? 'Inv' : 'Clock'}</span>
      </button>
    );
  };

  const AxisSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 flex-1 min-w-[120px]">
      <div className="flex items-center justify-center gap-2 mb-1 border-b border-white/10 pb-2">
        <span className="text-[14px]">{icon}</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-[#12121e]/90 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-400 font-black tracking-[0.3em] uppercase">Control Matrix</span>
          <span className="text-[9px] text-gray-600 font-mono mt-1">AXIS-BASED OPERATIONS</span>
        </div>
        <kbd className="px-3 py-1 bg-white/5 rounded-lg text-[9px] text-gray-500 font-mono border border-white/5">
          Shift + Key = ↺
        </kbd>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Y 轴 - 垂直方向 (上下) */}
        <AxisSection title="Vertical (Y)" icon="↕️">
          <div className="flex gap-2">
            <MoveButton move="U" color="bg-white" text="text-black" />
            <MoveButton move="U'" color="bg-white" text="text-black" />
          </div>
          <div className="flex gap-2">
            <MoveButton move="D" color="bg-yellow-400" text="text-black" />
            <MoveButton move="D'" color="bg-yellow-400" text="text-black" />
          </div>
        </AxisSection>

        {/* X 轴 - 水平方向 (左右) */}
        <AxisSection title="Horizontal (X)" icon="↔️">
          <div className="flex gap-2">
            <MoveButton move="L" color="bg-orange-500" text="text-white" />
            <MoveButton move="L'" color="bg-orange-500" text="text-white" />
          </div>
          <div className="flex gap-2">
            <MoveButton move="R" color="bg-red-600" text="text-white" />
            <MoveButton move="R'" color="bg-red-600" text="text-white" />
          </div>
        </AxisSection>

        {/* Z 轴 - 深度方向 (前后) */}
        <AxisSection title="Depth (Z)" icon="⊙">
          <div className="flex gap-2">
            <MoveButton move="F" color="bg-green-600" text="text-white" />
            <MoveButton move="F'" color="bg-green-600" text="text-white" />
          </div>
          <div className="flex gap-2">
            <MoveButton move="B" color="bg-blue-600" text="text-white" />
            <MoveButton move="B'" color="bg-blue-600" text="text-white" />
          </div>
        </AxisSection>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onScramble}
          disabled={isRotating}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-2xl border-b-4 border-blue-900 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-widest shadow-lg shadow-blue-900/20"
        >
          Auto Scramble
        </button>
        <button
          onClick={onReset}
          disabled={isRotating}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black rounded-2xl border-b-4 border-black/40 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-widest"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
