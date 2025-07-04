
export interface MindMapNode {
  topic: string;
  children?: MindMapNode[];
}

export interface SpeakerDetail {
  speakerId: string;
  summary: string;
  knowledgeGraph: string[];
}

export interface SpeakerAnalysisResult {
  speakers: SpeakerDetail[];
  commonGround: string[];
  divergentPoints: string[];
}

export type AnalysisType = 'summary' | 'speakers' | 'mindmap' | 'combined';

export interface CombinedAnalysisResult {
    summary: string;
    mindMap: MindMapNode;
}