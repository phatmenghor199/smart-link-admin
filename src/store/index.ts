import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth-slice";
import userReducer from "./features/user-slice";
import planReducer from "./features/plan-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    plans: planReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
