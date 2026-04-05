import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Node, Edge } from '@xyflow/react';

export interface GuidelineFile {
  name: string;
  content: string;
}

export interface NodeAnalysis {
  status: 'idle' | 'analyzing' | 'gap_found' | 'resolved';
  recommendation?: string;
}

interface MappingState {
  nodes: Node[];
  edges: Edge[];
  complianceScore: number;
  lastUpdated: string;
  uploadedGuideline: GuidelineFile | null;
  geminiApiKey: string;
  selectedNodeId: string | null;
  analysisState: Record<string, NodeAnalysis>;
}

const initialNodes: Node[] = [
  {
    id: 'external-1',
    type: 'custom',
    data: { title: '전자금융감독규정', content: '전자금융감독규정 제15조 해킹 방지', category: 'external' },
    position: { x: 50, y: 50 },
  },
  {
    id: 'external-2',
    type: 'custom',
    data: { title: '개인정보보호법', content: '개인정보보호법 제29조 안전조치의무', category: 'external' },
    position: { x: 50, y: 300 },
  },
  {
    id: 'external-3',
    type: 'custom',
    data: { title: '신용정보법', content: '신용정보 이용 및 보호에 관한 법률 제19조', category: 'external' },
    position: { x: 50, y: 550 },
  },
  {
    id: 'internal-1',
    type: 'custom',
    data: { title: '내부 지침', content: '정보보안 기본지침 제2-1조 (접근통제 및 악성코드 방지)', category: 'internal' },
    position: { x: 550, y: 50 },
  },
  {
    id: 'internal-2',
    type: 'custom',
    data: { title: '고객 데이터 보관지침', content: '개인정보처리방침 제4조 (물리적 접근 방어)', category: 'internal' },
    position: { x: 550, y: 300 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-i1', source: 'external-1', target: 'internal-1', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2-i1', source: 'external-2', target: 'internal-1', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2-i2', source: 'external-2', target: 'internal-2', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e3-i2', source: 'external-3', target: 'internal-2', animated: true, style: { stroke: '#3b82f6' } },
];

const initialState: MappingState = {
  nodes: initialNodes,
  edges: initialEdges,
  complianceScore: 87.5,
  lastUpdated: new Date().toISOString(),
  uploadedGuideline: null,
  geminiApiKey: '',
  selectedNodeId: null,
  analysisState: {},
};

export const mappingSlice = createSlice({
  name: 'mapping',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    updateComplianceScore: (state, action: PayloadAction<number>) => {
      state.complianceScore = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setUploadedGuideline: (state, action: PayloadAction<GuidelineFile | null>) => {
      state.uploadedGuideline = action.payload;
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.geminiApiKey = action.payload;
    },
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },
    setNodeAnalysisStatus: (state, action: PayloadAction<{ id: string; analysis: NodeAnalysis }>) => {
      state.analysisState[action.payload.id] = action.payload.analysis;
    },
    updateNodeRecommendation: (state, action: PayloadAction<{ id: string; chunk: string }>) => {
      if (state.analysisState[action.payload.id]) {
         state.analysisState[action.payload.id].recommendation = 
           (state.analysisState[action.payload.id].recommendation || '') + action.payload.chunk;
      }
    },
    resolveNodeMapping: (state, action: PayloadAction<{ id: string; acceptedContent: string }>) => {
      // Update node content
      const node = state.nodes.find(n => n.id === action.payload.id);
      if (node) {
        node.data.content = action.payload.acceptedContent;
      }
      // Update analysis state
      if (state.analysisState[action.payload.id]) {
        state.analysisState[action.payload.id].status = 'resolved';
      }
      state.selectedNodeId = null;
      state.complianceScore = Math.min(100, state.complianceScore + 12.5); // Example score boost
      state.lastUpdated = new Date().toISOString();
    }
  },
});

export const { 
  setNodes, setEdges, updateComplianceScore, 
  setUploadedGuideline, setApiKey, setSelectedNodeId,
  setNodeAnalysisStatus, updateNodeRecommendation, resolveNodeMapping
} = mappingSlice.actions;

export default mappingSlice.reducer;
