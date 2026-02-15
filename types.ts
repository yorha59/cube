
export type Color = 'white' | 'yellow' | 'red' | 'orange' | 'blue' | 'green' | 'black';

export interface PieceState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  colors: {
    top: Color;
    bottom: Color;
    left: Color;
    right: Color;
    front: Color;
    back: Color;
  };
}

export type Move = 'U' | 'D' | 'L' | 'R' | 'F' | 'B' | "U'" | "D'" | "L'" | "R'" | "F'" | "B'";

export interface CubeState {
  pieces: PieceState[];
  isRotating: boolean;
  history: Move[];
}
