import { Provider, useSelector, useDispatch } from 'react-redux';
import { Card, Text, Metric, Flex, ProgressCircle, Title, Subtitle, Button } from '@tremor/react';
import { store } from './store';
import type { RootState, AppDispatch } from './store';
import MappingGraph from './components/MappingGraph';
import Uploader from './components/Uploader';
import ReviewPanel from './components/ReviewPanel';
import { setNodeAnalysisStatus, updateNodeRecommendation, setSelectedNodeId, setGlobalAnalyzing } from './store/mappingSlice';
import { geminiService } from './services/geminiService';

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const uploadedGuideline = useSelector((state: RootState) => state.mapping.uploadedGuideline);
  const geminiApiKey = useSelector((state: RootState) => state.mapping.geminiApiKey);
  const selectedNodeId = useSelector((state: RootState) => state.mapping.selectedNodeId);
  const nodes = useSelector((state: RootState) => state.mapping.nodes);
  const edges = useSelector((state: RootState) => state.mapping.edges);
  const analysisState = useSelector((state: RootState) => state.mapping.analysisState);
  const isGlobalAnalyzing = useSelector((state: RootState) => state.mapping.isGlobalAnalyzing);

  const internalNodes = nodes.filter(n => n.data.category === 'internal');
  const totalInternal = internalNodes.length;
  // Calculate dynamic score
  const gapsCount = internalNodes.filter(n => analysisState[n.id]?.status === 'gap_found').length;
  const isAnalyzed = internalNodes.some(n => analysisState[n.id]);
  const dynamicScore = isAnalyzed ? Math.max(0, Math.round(((totalInternal - gapsCount) / totalInternal) * 100)) : 100;

  const startAnalysis = async () => {
    if (!geminiApiKey || !uploadedGuideline) {
      alert("API 키와 파일 업로드가 필요합니다.");
      return;
    }
    
    geminiService.setApiKey(geminiApiKey);

    // 내부 규정들(internal)에 대해 외부 규정(mapped)을 바탕으로 분석 시작
    const internalNodes = nodes.filter(n => n.data.category === 'internal');
    
    dispatch(setGlobalAnalyzing(true));
    try {
      for (const node of internalNodes) {
        // 해당 노드에 연결된 외부 규정 찾기
        const linkedEdges = edges.filter(e => e.target === node.id);
        if (linkedEdges.length === 0) continue;

        const externalNode = nodes.find(n => n.id === linkedEdges[0].source);
        if (!externalNode) continue;

        dispatch(setNodeAnalysisStatus({ id: node.id, analysis: { status: 'analyzing' } }));
        
        try {
          const stream = geminiService.streamComplianceCheck(
            String(externalNode.data.content),
            uploadedGuideline.content
          );

          dispatch(setNodeAnalysisStatus({ id: node.id, analysis: { status: 'gap_found', recommendation: '' } }));

          for await (const chunk of stream) {
            dispatch(updateNodeRecommendation({ id: node.id, chunk }));
          }

          // 스트리밍이 끝나면 자동 선택하여 사용자에게 확인시키기 (데모 목적)
          dispatch(setSelectedNodeId(node.id));
          
        } catch (err: any) {
          console.error(err);
          let errorMsg = err.message || String(err);
          if (err.name === 'TypeError' || errorMsg.toLowerCase().includes('fetch')) {
            errorMsg = "네트워크 오류 또는 API 권한 문제(Failed to fetch)일 수 있습니다. 발급받은 키의 권한을 확인해주세요. 상세: " + errorMsg;
          }
          
          dispatch(setNodeAnalysisStatus({ id: node.id, analysis: { status: 'gap_found' } }));
          dispatch(updateNodeRecommendation({ id: node.id, chunk: `\n\n🚨 [분석 중 오류 발생]\n${errorMsg}` }));
        }
      }
    } finally {
      dispatch(setGlobalAnalyzing(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      {/* Header Area */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-4 gap-4 w-full">
        <div className="flex-1 min-w-0">
          <Title className="text-3xl font-bold text-slate-900 truncate">Lex-Link Dashboard</Title>
          <Subtitle className="text-slate-500 truncate">외부 규제 및 내부 지침 통합 분석 시스템 (Redlining)</Subtitle>
        </div>
        <div className="flex-shrink-0">
          <Button 
            size="lg" 
            disabled={!geminiApiKey || !uploadedGuideline}
            onClick={startAnalysis}
          >
            AI Gap 분석 시작
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 min-h-[800px] overflow-hidden">
        
        {/* Left Sidebar (Uploader & Metrics) */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
          <div className="flex-shrink-0">
            <Uploader />
          </div>

          <Card className="flex-shrink-0 shadow-md decoration-emerald-500" decoration="top">
            <Title>규정 준수율 (Compliance)</Title>
            <Flex alignItems="center" className="mt-4">
              <ProgressCircle value={dynamicScore} size="xl" color={dynamicScore === 100 ? 'emerald' : 'rose'}>
                <span className={`text-lg font-bold ${dynamicScore === 100 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isAnalyzed ? `${dynamicScore}%` : '대기'}
                </span>
              </ProgressCircle>
              <div className="ml-4">
                <Metric className={dynamicScore === 100 ? 'text-emerald-700' : 'text-rose-600'}>
                  {isAnalyzed ? `${dynamicScore}점` : '미분석'}
                </Metric>
                <Text className="text-xs text-slate-400 mt-1">
                  {isAnalyzed ? `${gapsCount}개 조항 위반 발견` : '분석을 시작해주세요'}
                </Text>
              </div>
            </Flex>
          </Card>
        </div>

        {/* Center Dashboard (React Flow Graph) */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 p-0 overflow-hidden relative">
            <MappingGraph />
          </Card>
        </div>

      </div>

      {/* Full Page Overlay for Redlining Review */}
      {selectedNodeId && !isGlobalAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <ReviewPanel />
        </div>
      )}

      {/* Full Screen Global Loading Overlay */}
      {isGlobalAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
           <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="text-center">
                <Text className="text-xl font-medium text-white">전체 규정 심층 분석 중...</Text>
                <Text className="text-sm text-slate-300 mt-2">입력된 수십 개의 조항과 갭(Gap)을 실시간으로 매핑하고 분석하고 있습니다.</Text>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
}

export default App;
