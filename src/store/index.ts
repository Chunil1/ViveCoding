import { configureStore } from '@reduxjs/toolkit';
import mappingReducer from './mappingSlice';

export const store = configureStore({
  reducer: {
    mapping: mappingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
