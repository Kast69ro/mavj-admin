import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/authSlice";
import operatorsSlice from "../features/operators/operatorsSlice";
import victorinaSlice from "../features/victorina/victorinaSlice";
import subscribersSlice from "../features/subscribers/subscribersSlice";
export const store = configureStore({
  reducer: {
    auth:authSlice,
    operators:operatorsSlice,
    victorina:victorinaSlice,
    subscribers:subscribersSlice,
    // Здесь можно добавить редьюсеры для управления состоянием приложения
  },
});