export interface GraphNode {
    duration: number;
    complete: boolean;
    predecessors: number[];
    predecessornums: number;
    id: number;
}

export type Graph = GraphNode[]

