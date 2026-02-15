
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { INITIAL_PIECES, COLORS } from './constants';
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

  const rotate = useCallback((move: Move) => {
    if (isRotating) return;
    setIsRotating(true);
    setIsActive(true);
    setLastMove(move);

    const axis = move.includes('U') || move.includes('D') ? 'y' : 
                 move.includes('L') || move.includes('R') ? 'x' : 'z';
    
    const lValue = move.startsWith('U') ? 1 : move.startsWith('D') ? -1 :
                  move.startsWith('R') ? 1 : move.startsWith('L') ? -1 :
                  move.startsWith('F') ? 1 : -1;

    const angle = move.includes("'") ? Math.PI / 2 : -Math.PI / 2;

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

    setMoves(prev => [...prev, move]);
    setTimeout(() => {
      setIsRotating(false);
      setLastMove(null);
    }, 200);
  }, [isRotating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const isInverse = e.shiftKey;
      const validKeys = ['U', 'D', 'L', 'R', 'F', 'B'];
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
    const possibleMoves: Move[] = ['U', 'D', 'L', 'R', 'F', 'B', "U'", "D'", "L'", "R'", "F'", "B'"];
    for (let i = 0; i < 20; i++) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      rotate(randomMove);
      await new Promise(r => setTimeout(r, 220));
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
    <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden bg-[#0a0a14]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="absolute top-8 w-full max-w-5xl px-8 flex justify-between items-center z-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            CUBE<span className="text-blue-500">MASTER</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">3D Real-time Simulator</p>
        </div>
        
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Time</span>
            <span className="text-2xl font-mono font-black text-emerald-400">{formatTime(timer)}</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Moves</span>
            <span className="text-2xl font-mono font-black text-blue-400">{moves.length}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-full">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[6, 6, 6]} fov={40} />
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.8} color="#4444ff" />
          
          <group scale={1.2}>
            {pieces.map((p) => (
              <CubePiece key={p.id} state={p} />
            ))}
          </group>

          <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={15} blur={2.5} far={5} />
          <Environment preset="night" />
          <OrbitControls 
            makeDefault 
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={0.8}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>
      </div>

      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-2 max-h-[300px] overflow-hidden opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold text-gray-600 uppercase mb-2 font-mono">History</span>
        {moves.slice(-12).reverse().map((m, i) => (
          <div key={i} className={`text-lg font-mono font-black transition-all ${i === 0 ? 'text-white scale-125' : 'text-gray-700'}`}>
            {m}
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 w-full max-w-5xl px-8 flex flex-col md:flex-row items-end justify-between gap-8 pointer-events-none">
        <div className="pointer-events-auto w-full md:w-[320px]">
          <AIHelper currentMoves={moves} pieces={pieces} />
        </div>
        <div className="pointer-events-auto flex-1 max-w-3xl">
          <ControlPanel 
            onMove={rotate} 
            onScramble={scramble} 
            onReset={reset} 
            isRotating={isRotating || scrambling}
            lastMove={lastMove}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
