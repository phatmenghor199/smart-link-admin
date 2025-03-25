import { configureStore, combineReducers } from "@reduxjs/toolkit";

// Import your reducers here
// For example:
// import userReducer from './userSlice';
// import retentionReducer from './retentionSlice';

// Combine reducers
const rootReducer = combineReducers({
  // Add your reducers here
  // For example:
  // user: userReducer,
  // retention: retentionReducer,

  // Placeholder reducer to resolve the initial error
  placeholder: (state = {}) => state,
});

// Create the Redux store
export const store = configureStore({
  reducer: rootReducer,

  // Optional: Add middleware or other store configurations
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check if needed
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
