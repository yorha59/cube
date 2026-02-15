
import React, { useRef } from 'react';
import { Box } from '@react-three/drei';
import { PieceState } from '../types';
import { COLORS } from '../constants';

interface CubePieceProps {
  state: PieceState;
}

const CubePiece: React.FC<CubePieceProps> = ({ state }) => {
  const { position, colors } = state;

  return (
    <group position={position}>
      {/* The main body of the cubie */}
      <Box args={[0.92, 0.92, 0.92]} castShadow receiveShadow>
        <meshStandardMaterial color="#111" roughness={0.1} metalness={0.2} />
      </Box>

      {/* Stickers - offset slightly from the body */}
      {/* Top */}
      <Box args={[0.8, 0.01, 0.8]} position={[0, 0.465, 0]}>
        <meshStandardMaterial color={COLORS[colors.top]} roughness={0.3} />
      </Box>
      {/* Bottom */}
      <Box args={[0.8, 0.01, 0.8]} position={[0, -0.465, 0]}>
        <meshStandardMaterial color={COLORS[colors.bottom]} roughness={0.3} />
      </Box>
      {/* Left */}
      <Box args={[0.01, 0.8, 0.8]} position={[-0.465, 0, 0]}>
        <meshStandardMaterial color={COLORS[colors.left]} roughness={0.3} />
      </Box>
      {/* Right */}
      <Box args={[0.01, 0.8, 0.8]} position={[0.465, 0, 0]}>
        <meshStandardMaterial color={COLORS[colors.right]} roughness={0.3} />
      </Box>
      {/* Front */}
      <Box args={[0.8, 0.8, 0.01]} position={[0, 0, 0.465]}>
        <meshStandardMaterial color={COLORS[colors.front]} roughness={0.3} />
      </Box>
      {/* Back */}
      <Box args={[0.8, 0.8, 0.01]} position={[0, 0, -0.465]}>
        <meshStandardMaterial color={COLORS[colors.back]} roughness={0.3} />
      </Box>
    </group>
  );
};

export default CubePiece;
