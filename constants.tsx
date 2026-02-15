
import { Color } from './types';

export const COLORS: Record<Color, string> = {
  white: '#FFFFFF',
  yellow: '#FFD700',
  red: '#FF0000',
  orange: '#FF8C00',
  blue: '#0000FF',
  green: '#008000',
  black: '#111111',
};

export const INITIAL_PIECES = (): any[] => {
  const pieces = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        pieces.push({
          id: `${x}-${y}-${z}`,
          position: [x, y, z],
          rotation: [0, 0, 0],
          colors: {
            top: y === 1 ? 'white' : 'black',
            bottom: y === -1 ? 'yellow' : 'black',
            left: x === -1 ? 'orange' : 'black',
            right: x === 1 ? 'red' : 'black',
            front: z === 1 ? 'green' : 'black',
            back: z === -1 ? 'blue' : 'black',
          },
        });
      }
    }
  }
  return pieces;
};
