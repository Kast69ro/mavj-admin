import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPeriods,
  createPeriod,
  deletePeriod,
  togglePeriodStatus,
  extendPeriod,
} from "./periodsApi";

const periodsSlice = createSlice({
  name: "periods",
  initialState: { periods: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeriods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeriods.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = action.payload.periods;
      })
      .addCase(fetchPeriods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(extendPeriod.fulfilled, (state, action) => {
        const idx = state.periods.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.periods[idx] = action.payload;
      })
      .addCase(extendPeriod.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(createPeriod.fulfilled, (state, action) => {
        state.periods.push(action.payload);
      })
      .addCase(createPeriod.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deletePeriod.fulfilled, (state, action) => {
        state.periods = state.periods.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePeriod.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(togglePeriodStatus.fulfilled, (state, action) => {
        const idx = state.periods.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.periods[idx] = action.payload;
      })
      .addCase(togglePeriodStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default periodsSlice.reducer;
