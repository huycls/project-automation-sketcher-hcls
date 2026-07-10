export type NodeType = 'note' | 'process' | 'decision' | 'io' | 'start_end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // Hex color code or Tailwind name
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  isEraser?: boolean;
}

export type BoardMode = 'select' | 'draw' | 'erase';

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface BoardTemplate {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
}
