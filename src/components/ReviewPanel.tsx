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
    <div className="w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center sm:px-8 shrink-0">
        <div>
          <Title className="text-2xl font-bold flex items-center gap-3">
            AI Redlining 검토 
            {analysisState?.status === 'resolved' && <Badge color="emerald">승인 완료</Badge>}
            {analysisState?.status === 'gap_found' && <Badge color="rose">수정 필요</Badge>}
            {analysisState?.status === 'analyzing' && <Badge color="amber">AI 심층 분석 중</Badge>}
          </Title>
          <Text className="mt-1 text-slate-500">AI가 제안하는 내규 수정 권고안을 확인하고 반영할 수 있습니다.</Text>
        </div>
        <button 
          onClick={handleClose} 
          className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50/50">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm shrink-0">
          <Text className="font-semibold text-slate-900 mb-2">대상 규정 (내규 원문)</Text>
          <div className="bg-slate-50 p-4 rounded text-slate-700 font-medium">
            {selectedNode.data.title as string}
          </div>
          <Text className="text-slate-500 mt-2 text-sm whitespace-pre-wrap">{String(selectedNode.data.content)}</Text>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm min-h-[350px] flex flex-col">
          <Text className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI 수정 제안서 (To-Be)
          </Text>

          {analysisState?.status === 'analyzing' && !analysisState?.recommendation && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-10 opacity-80">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="text-center">
                <Text className="text-lg font-medium text-indigo-700">심층 법률 검토 및 매핑 진행 중...</Text>
                <Text className="text-sm text-slate-500 mt-2">입력된 수많은 조항과 갭(Gap)을 실시간으로 추적하고 있습니다.</Text>
              </div>
            </div>
          )}

          {(analysisState?.recommendation || analysisState?.status === 'gap_found') && (
            <div className="bg-slate-800 text-slate-100 p-5 rounded-lg text-sm sm:text-base leading-loose whitespace-pre-wrap flex-1 overflow-y-auto shadow-inner border border-slate-700">
              {analysisState.recommendation}
              {analysisState.status === 'analyzing' && (
                <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse" />
              )}
            </div>
          )}

          {(!analysisState || analysisState.status === 'idle' || analysisState.status === 'resolved') && !analysisState?.recommendation && (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              분석된 내용이 없습니다. 먼저 상단의 분석 시작 버튼을 눌러주세요.
            </div>
          )}
        </div>
      </div>

      {(analysisState?.status === 'gap_found') && (
        <div className="bg-white shrink-0 border-t border-slate-200 p-6 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <Button size="lg" variant="secondary" color="red" onClick={handleReject}>반려 (Reject)</Button>
          <Button size="lg" color="indigo" onClick={handleApprove}>수정안 승인 (Approve)</Button>
        </div>
      )}
    </div>
  );
}
