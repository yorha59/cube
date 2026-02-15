
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { INITIAL_PIECES } from './constants';
import { Move, PieceState } from './types';
import ControlPanel from './components/ControlPanel';
import CubePiece from './components/CubePiece';
import AIHelper from './components/AIHelper';

const App: React.FC = () => {
  const [pieces, setPieces] = useState<PieceState[]>(INITIAL_PIECES());
  const [isRotating, setIsRotating] = useState(false);
  const [moves, setMoves] = useState<Move[]>([]);
  const [scrambling, setScrambling] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  
  // Animation state
  const [activeRotation, setActiveRotation] = useState<{
    axis: 'x' | 'y' | 'z';
    lValue: number;
    angle: number;
    progress: number;
  } | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const finalizeRotation = useCallback((axis: 'x' | 'y' | 'z', lValue: number, angle: number) => {
    setPieces(prev => prev.map(p => {
      const pos = p.position;
      const isAffected = (axis === 'x' && Math.round(pos[0]) === lValue) ||
                         (axis === 'y' && Math.round(pos[1]) === lValue) ||
                         (axis === 'z' && Math.round(pos[2]) === lValue);

      if (!isAffected) return p;

      const vector = new THREE.Vector3(...pos);
      const rotationMatrix = new THREE.Matrix4();
      if (axis === 'x') rotationMatrix.makeRotationX(angle);
      else if (axis === 'y') rotationMatrix.makeRotationY(angle);
      else rotationMatrix.makeRotationZ(angle);
      
      vector.applyMatrix4(rotationMatrix);

      const newColors = { ...p.colors };
      if (axis === 'y') {
        if (angle < 0) {
          newColors.front = p.colors.right; newColors.right = p.colors.back;
          newColors.back = p.colors.left; newColors.left = p.colors.front;
        } else {
          newColors.front = p.colors.left; newColors.left = p.colors.back;
          newColors.back = p.colors.right; newColors.right = p.colors.front;
        }
      } else if (axis === 'x') {
        if (angle < 0) {
          newColors.top = p.colors.front; newColors.front = p.colors.bottom;
          newColors.bottom = p.colors.back; newColors.back = p.colors.top;
        } else {
          newColors.top = p.colors.back; newColors.back = p.colors.bottom;
          newColors.bottom = p.colors.front; newColors.front = p.colors.top;
        }
      } else if (axis === 'z') {
        if (angle < 0) {
          newColors.top = p.colors.left; newColors.left = p.colors.bottom;
          newColors.bottom = p.colors.right; newColors.right = p.colors.top;
        } else {
          newColors.top = p.colors.right; newColors.right = p.colors.bottom;
          newColors.bottom = p.colors.left; newColors.left = p.colors.top;
        }
      }

      return {
        ...p,
        position: [Math.round(vector.x), Math.round(vector.y), Math.round(vector.z)],
        colors: newColors
      };
    }));
  }, []);

  const rotate = useCallback(async (move: Move) => {
    if (isRotating) return;
    setIsRotating(true);
    setIsActive(true);
    setLastMove(move);

    let axis: 'x' | 'y' | 'z' = 'y';
    let lValue = 0;

    if (move.includes('U')) { axis = 'y'; lValue = 1; }
    else if (move.includes('D')) { axis = 'y'; lValue = -1; }
    else if (move.includes('E')) { axis = 'y'; lValue = 0; }
    else if (move.includes('R')) { axis = 'x'; lValue = 1; }
    else if (move.includes('L')) { axis = 'x'; lValue = -1; }
    else if (move.includes('M')) { axis = 'x'; lValue = 0; }
    else if (move.includes('F')) { axis = 'z'; lValue = 1; }
    else if (move.includes('B')) { axis = 'z'; lValue = -1; }
    else if (move.includes('S')) { axis = 'z'; lValue = 0; }

    let angle = move.includes("'") ? Math.PI / 2 : -Math.PI / 2;
    if (move.includes('U') || move.includes('R') || move.includes('B')) {
       angle = -angle;
    }

    // Start animation
    setActiveRotation({ axis, lValue, angle, progress: 0 });
    
    // Animation timing (300ms)
    const duration = scrambling ? 150 : 250;
    const startTime = performance.now();
    
    return new Promise<void>((resolve) => {
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setActiveRotation(prev => prev ? { ...prev, progress } : null);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          finalizeRotation(axis, lValue, angle);
          setActiveRotation(null);
          setIsRotating(false);
          setLastMove(null);
          setMoves(prev => [...prev, move]);
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }, [isRotating, scrambling, finalizeRotation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const isInverse = e.shiftKey;
      const validKeys = ['U', 'D', 'L', 'R', 'F', 'B', 'M', 'E', 'S'];
      if (validKeys.includes(key)) {
        e.preventDefault();
        const move = (key + (isInverse ? "'" : "")) as Move;
        rotate(move);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotate]);

  const scramble = async () => {
    if (scrambling) return;
    setScrambling(true);
    setMoves([]);
    setTimer(0);
    setIsActive(false);
    const possibleMoves: Move[] = ['U', 'D', 'L', 'R', 'F', 'B', 'M', 'E', 'S', "U'", "D'", "L'", "R'", "F'", "B'", "M'", "E'", "S'"];
    for (let i = 0; i < 20; i++) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      await rotate(randomMove);
    }
    setScrambling(false);
  };

  const reset = () => {
    setPieces(INITIAL_PIECES());
    setMoves([]);
    setTimer(0);
    setIsActive(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#05050a] text-white select-none">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px]" />
      </div>

      <header className="relative z-20 flex-none px-8 py-4 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.97 4.43c-.16.09-.33.14-.5.14s-.34-.05-.5-.14l-7.97-4.43c-.32-.17-.53-.5-.53-.88V7.5c0-.38.21-.71.53-.88l7.97-4.43c.16-.09.33-.14.5-.14s.34.05.5.14l7.97 4.43c.32.17.53.5.53.88v9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none">
              CUBE<span className="text-blue-500">PRO</span>
            </h1>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Full 3-Axis Logic</p>
          </div>
        </div>
        
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-gray-500 font-black uppercase mb-0.5 tracking-widest">TIME</span>
            <span className="text-lg font-mono font-black text-emerald-400">{formatTime(timer)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-gray-500 font-black uppercase mb-0.5 tracking-widest">MOVES</span>
            <span className="text-lg font-mono font-black text-blue-400">{moves.length}</span>
          </div>
        </div>
      </header>

      <main className="relative flex-1 min-h-0 z-10">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={35} />
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={2.5} castShadow />
          <pointLight position={[-10, -5, -10]} intensity={0.6} color="#4444ff" />
          
          <group position={[0, 0, 0]}>
            {pieces.map((p) => (
              <CubePiece 
                key={p.id} 
                state={p} 
                activeRotation={activeRotation}
              />
            ))}
            <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={8} blur={3} far={4} />
          </group>

          <Environment preset="city" />
          <OrbitControls 
            makeDefault 
            enableDamping 
            dampingFactor={0.05}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-1 opacity-20 hover:opacity-100 transition-opacity text-right">
          <span className="text-[8px] font-black text-gray-600 uppercase mb-2 tracking-widest">History Log</span>
          {moves.slice(-10).reverse().map((m, i) => (
            <div key={i} className={`text-xs font-mono font-black ${i === 0 ? 'text-white scale-110 origin-right' : 'text-gray-700'}`}>
              {m}
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-20 flex-none bg-[#0a0a14]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1600px] mx-auto p-4 flex flex-col lg:flex-row gap-6 items-stretch justify-center">
          <div className="flex-none lg:w-[320px]">
            <AIHelper currentMoves={moves} pieces={pieces} />
          </div>
          <div className="flex-1">
            <ControlPanel 
              onMove={rotate} 
              onScramble={scramble} 
              onReset={reset} 
              isRotating={isRotating || scrambling}
              lastMove={lastMove}
            />
          </div>
        </div>
      </footer >
    </div>
  );
};

export default App;
