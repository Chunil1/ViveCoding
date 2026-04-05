import { Provider, useSelector, useDispatch } from 'react-redux';
import { Card, Text, Metric, Flex, ProgressCircle, Title, Subtitle, Button } from '@tremor/react';
import { store } from './store';
import type { RootState, AppDispatch } from './store';
import MappingGraph from './components/MappingGraph';
import Uploader from './components/Uploader';
import ReviewPanel from './components/ReviewPanel';
import { setNodeAnalysisStatus, updateNodeRecommendation, setSelectedNodeId } from './store/mappingSlice';
import { geminiService } from './services/geminiService';

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const complianceScore = useSelector((state: RootState) => state.mapping.complianceScore);
  const lastUpdated = useSelector((state: RootState) => state.mapping.lastUpdated);
  const uploadedGuideline = useSelector((state: RootState) => state.mapping.uploadedGuideline);
  const geminiApiKey = useSelector((state: RootState) => state.mapping.geminiApiKey);
  const selectedNodeId = useSelector((state: RootState) => state.mapping.selectedNodeId);
  const nodes = useSelector((state: RootState) => state.mapping.nodes);
  const edges = useSelector((state: RootState) => state.mapping.edges);

  const startAnalysis = async () => {
    if (!geminiApiKey || !uploadedGuideline) {
      alert("API 키와 파일 업로드가 필요합니다.");
      return;
    }
    
    geminiService.setApiKey(geminiApiKey);

    // 내부 규정들(internal)에 대해 외부 규정(mapped)을 바탕으로 분석 시작
    const internalNodes = nodes.filter(n => n.data.category === 'internal');
    
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

          <Card className="flex-shrink-0">
            <Title>규정 준수율 (Compliance)</Title>
            <Flex alignItems="center" className="mt-4">
              <ProgressCircle value={complianceScore} size="xl" color={complianceScore > 80 ? 'emerald' : 'yellow'}>
                <span className="text-lg font-medium text-slate-700">{Math.round(complianceScore)}%</span>
              </ProgressCircle>
              <div className="ml-4">
                <Metric>{Math.round(complianceScore)}%</Metric>
                <Text className="text-xs text-slate-400 mt-1">{new Date(lastUpdated).toLocaleTimeString()}</Text>
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

        {/* Right Sidebar (Review Panel) */}
        {selectedNodeId && (
          <div className="w-96 flex-shrink-0 transition-transform transform translate-x-0">
             <ReviewPanel />
          </div>
        )}
      </div>
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
