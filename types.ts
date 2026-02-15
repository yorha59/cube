
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

// 补全中间层指令：M (X轴中), E (Y轴中), S (Z轴中)
export type Move = 
  | 'U' | 'D' | 'L' | 'R' | 'F' | 'B' | 'M' | 'E' | 'S'
  | "U'" | "D'" | "L'" | "R'" | "F'" | "B'" | "M'" | "E'" | "S'";

export interface CubeState {
  pieces: PieceState[];
  isRotating: boolean;
  history: Move[];
}
