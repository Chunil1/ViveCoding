import { configureStore } from '@reduxjs/toolkit';
import mappingReducer from './mappingSlice';

export const store = configureStore({
  reducer: {
    mapping: mappingReducer,
  },
});

store.subscribe(() => {
  if (typeof window !== 'undefined') {
    const state = store.getState().mapping;
    localStorage.setItem('lexLinkReport', JSON.stringify({
      nodes: state.nodes,
      edges: state.edges,
      complianceScore: state.complianceScore,
      lastUpdated: state.lastUpdated,
      uploadedGuideline: state.uploadedGuideline,
      analysisState: state.analysisState
    }));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
