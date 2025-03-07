export interface GraphNode {
    duration: number;
    complete: boolean;
    predecessors: number[];
    predecessornums: number;
}

export type Graph = GraphNode[]

