import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // Adjust the path if needed

export const store = configureStore({
  reducer: {
    user: userReducer, // Add other reducers here if needed 
  },
});

// 🔹 Define RootState type
export type RootState = ReturnType<typeof store.getState>;

// 🔹 Define AppDispatch type
export type AppDispatch = typeof store.dispatch;

export default store;
