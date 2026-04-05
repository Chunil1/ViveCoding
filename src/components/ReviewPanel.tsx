import { useDispatch, useSelector } from 'react-redux';
import { Card, Title, Text, Button, Badge } from '@tremor/react';
import type { RootState } from '../store';
import { setSelectedNodeId, resolveNodeMapping } from '../store/mappingSlice';

export default function ReviewPanel() {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector((state: RootState) => state.mapping.selectedNodeId);
  const selectedNode = useSelector((state: RootState) => 
    state.mapping.nodes.find(n => n.id === selectedNodeId)
  );
  const analysisState = useSelector((state: RootState) => 
    selectedNodeId ? state.mapping.analysisState[selectedNodeId] : null
  );

  if (!selectedNodeId || !selectedNode) return null;

  const handleClose = () => dispatch(setSelectedNodeId(null));
  
  const handleApprove = () => {
    // If we have AI recommendation, we would replace internal guideline with it
    const updatedContent = analysisState?.recommendation || selectedNode.data.content as string;
    dispatch(resolveNodeMapping({ id: selectedNodeId, acceptedContent: updatedContent }));
  };

  const handleReject = () => {
    dispatch(setSelectedNodeId(null));
  };

  return (
    <div className="w-96 border-l border-slate-200 bg-white h-full shadow-lg flex flex-col transition-all">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <Title>수정안 검토 (Redlining)</Title>
        <button className="text-slate-400 hover:text-slate-600" onClick={handleClose}>
          ✕
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-6">
        <div>
          <Badge color="emerald" className="mb-2">현재 내부 규정 (As-Is)</Badge>
          <Card className="bg-slate-50 p-3">
            <Text className="text-slate-700">{String(selectedNode.data.content)}</Text>
          </Card>
        </div>

        <div>
          <Badge color="blue" className="mb-2">AI 제안 수정안 (To-Be)</Badge>
          <Card className="border-blue-200 bg-blue-50/30 p-3 min-h-[150px]">
            {analysisState?.status === 'analyzing' && !analysisState.recommendation && (
              <Text className="text-blue-500 animate-pulse">Gemini AI가 빈틈을 분석 중입니다...</Text>
            )}
            
            {(analysisState?.recommendation || analysisState?.status === 'gap_found') && (
              <div className="whitespace-pre-wrap text-sm text-slate-800">
                {analysisState.recommendation}
                {analysisState.status === 'analyzing' && (
                  <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
                )}
              </div>
            )}
            
            {(!analysisState || analysisState.status === 'idle' || analysisState.status === 'resolved') && (
              <Text className="text-slate-400">분석된 내용이 없습니다.</Text>
            )}
          </Card>
        </div>
      </div>

      {(analysisState?.status === 'gap_found') && (
        <div className="p-4 border-t border-slate-200 flex gap-2 bg-slate-50">
          <Button variant="secondary" color="red" className="flex-1" onClick={handleReject}>
            반려 (Reject)
          </Button>
          <Button color="blue" className="flex-1" onClick={handleApprove}>
            승인 (Approve)
          </Button>
        </div>
      )}
    </div>
  );
}
