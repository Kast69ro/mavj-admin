import { createSlice } from "@reduxjs/toolkit";
import { fetchBilling } from "./biling";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    resetBilling: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBilling.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBilling.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBilling.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Не удалось загрузить биллинг";
      });
  },
});

export const { resetBilling } = billingSlice.actions;
export default billingSlice.reducer;