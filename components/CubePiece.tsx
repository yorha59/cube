
import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import { PieceState } from '../types';
import { COLORS } from '../constants';

interface CubePieceProps {
  state: PieceState;
  activeRotation: {
    axis: 'x' | 'y' | 'z';
    lValue: number;
    angle: number;
    progress: number;
  } | null;
}

const CubePiece: React.FC<CubePieceProps> = ({ state, activeRotation }) => {
  const { position, colors } = state;

  // Calculate temporary animation offset
  const rotationOffset = useMemo(() => {
    if (!activeRotation) return new THREE.Euler(0, 0, 0);

    const isAffected = (activeRotation.axis === 'x' && Math.round(position[0]) === activeRotation.lValue) ||
                       (activeRotation.axis === 'y' && Math.round(position[1]) === activeRotation.lValue) ||
                       (activeRotation.axis === 'z' && Math.round(position[2]) === activeRotation.lValue);

    if (!isAffected) return new THREE.Euler(0, 0, 0);

    const currentAngle = activeRotation.angle * activeRotation.progress;
    return new THREE.Euler(
      activeRotation.axis === 'x' ? currentAngle : 0,
      activeRotation.axis === 'y' ? currentAngle : 0,
      activeRotation.axis === 'z' ? currentAngle : 0
    );
  }, [activeRotation, position]);

  // If we are rotating around an axis, we need to rotate the position as well visually
  const animatedPosition = useMemo(() => {
    if (!activeRotation) return new THREE.Vector3(...position);

    const isAffected = (activeRotation.axis === 'x' && Math.round(position[0]) === activeRotation.lValue) ||
                       (activeRotation.axis === 'y' && Math.round(position[1]) === activeRotation.lValue) ||
                       (activeRotation.axis === 'z' && Math.round(position[2]) === activeRotation.lValue);

    if (!isAffected) return new THREE.Vector3(...position);

    const currentAngle = activeRotation.angle * activeRotation.progress;
    const vec = new THREE.Vector3(...position);
    const matrix = new THREE.Matrix4();
    if (activeRotation.axis === 'x') matrix.makeRotationX(currentAngle);
    else if (activeRotation.axis === 'y') matrix.makeRotationY(currentAngle);
    else matrix.makeRotationZ(currentAngle);
    
    return vec.applyMatrix4(matrix);
  }, [activeRotation, position]);

  return (
    <group position={animatedPosition} rotation={rotationOffset}>
      {/* Main body of the cubie */}
      <Box args={[0.94, 0.94, 0.94]} castShadow receiveShadow>
        <meshStandardMaterial color="#0a0a0a" roughness={0.05} metalness={0.4} />
      </Box>

      {/* Stickers */}
      {/* Top */}
      <Box args={[0.82, 0.02, 0.82]} position={[0, 0.47, 0]}>
        <meshStandardMaterial color={COLORS[colors.top]} roughness={0.2} metalness={0.1} />
      </Box>
      {/* Bottom */}
      <Box args={[0.82, 0.02, 0.82]} position={[0, -0.47, 0]}>
        <meshStandardMaterial color={COLORS[colors.bottom]} roughness={0.2} metalness={0.1} />
      </Box>
      {/* Left */}
      <Box args={[0.02, 0.82, 0.82]} position={[-0.47, 0, 0]}>
        <meshStandardMaterial color={COLORS[colors.left]} roughness={0.2} metalness={0.1} />
      </Box>
      {/* Right */}
      <Box args={[0.02, 0.82, 0.82]} position={[0.47, 0, 0]}>
        <meshStandardMaterial color={COLORS[colors.right]} roughness={0.2} metalness={0.1} />
      </Box>
      {/* Front */}
      <Box args={[0.82, 0.82, 0.02]} position={[0, 0, 0.47]}>
        <meshStandardMaterial color={COLORS[colors.front]} roughness={0.2} metalness={0.1} />
      </Box>
      {/* Back */}
      <Box args={[0.82, 0.82, 0.02]} position={[0, 0, -0.47]}>
        <meshStandardMaterial color={COLORS[colors.back]} roughness={0.2} metalness={0.1} />
      </Box>
    </group>
  );
};

export default CubePiece;
