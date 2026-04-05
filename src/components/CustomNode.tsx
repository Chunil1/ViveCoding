import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Card, Text, Badge } from '@tremor/react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setSelectedNodeId } from '../store/mappingSlice';

export default function CustomNode({ id, data, isConnectable }: NodeProps) {
  const dispatch = useDispatch();
  const analysisState = useSelector((state: RootState) => state.mapping.analysisState[id]);
  const isSelected = useSelector((state: RootState) => state.mapping.selectedNodeId === id);
  
  const isExternal = data.category === 'external';

  // Determine decoration color based on analysis state
  let borderColor = isExternal ? 'border-l-blue-500' : 'border-l-emerald-500';
  let badgeColor: "blue" | "emerald" | "amber" | "rose" | "slate" = isExternal ? 'blue' : 'emerald';
  let statusText = null;

  if (!isExternal && analysisState) {
    if (analysisState.status === 'analyzing') {
      borderColor = 'border-l-amber-400';
      badgeColor = 'amber';
      statusText = '분석중...';
    } else if (analysisState.status === 'gap_found') {
      borderColor = 'border-l-rose-500';
      badgeColor = 'rose';
      statusText = '수정 권고';
    } else if (analysisState.status === 'resolved') {
      borderColor = 'border-l-emerald-500';
      badgeColor = 'emerald';
      statusText = '적용 완료';
    }
  }

  return (
    <Card
      className={`w-64 border-l-4 ${borderColor} ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-tremor-card'} cursor-pointer transition-all hover:shadow-md`}
      decoration="left"
      decorationColor={badgeColor as any} // Tremor uses specific typed color names
      onClick={() => {
        if (!isExternal) {
          dispatch(setSelectedNodeId(id));
        }
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <Badge color={badgeColor}>{String(data.title ?? '')}</Badge>
        {statusText && (
          <span className={`text-xs font-bold ${analysisState?.status === 'gap_found' ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
            {statusText}
          </span>
        )}
      </div>
      <Text className="font-semibold text-slate-800 break-words line-clamp-3">
        {String(data.content ?? '')}
      </Text>
      
      {!isExternal && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-slate-400"
        />
      )}
      
      {isExternal && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-blue-500"
        />
      )}
    </Card>
  );
}
