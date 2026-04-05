import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import type { Connection, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { RootState } from '../store';
import { setEdges as setEdgesRedux } from '../store/mappingSlice';
import CustomNode from './CustomNode';

export default function MappingGraph() {
  const dispatch = useDispatch();
  const reduxNodes = useSelector((state: RootState) => state.mapping.nodes);
  const reduxEdges = useSelector((state: RootState) => state.mapping.edges);

  const [nodes, , onNodesChange] = useNodesState(reduxNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reduxEdges);

  // Define custom node types
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = { ...params, animated: true, style: { stroke: '#3b82f6' } } as Edge;
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      dispatch(setEdgesRedux(newEdges));
    },
    [edges, setEdges, dispatch]
  );

  // Sync back to Redux only on significant changes if needed, 
  // but for drag&drop we can keep it local for performance, or sync it.
  // We'll keep nodes synced on drop for simple usecases.
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Typically we'd debounce syncing to redux when dragging
    },
    [onNodesChange]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
