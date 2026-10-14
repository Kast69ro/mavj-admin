import { createSlice } from "@reduxjs/toolkit";
import {
  fetchContentOperators,
  updateContentOperator,
  uploadOperatorLogo,
  fetchOperatorPeriods,
  updateOperatorPeriod,
  deleteOperatorPeriod,
  fetchPeriodDetail,
} from "./operatorContentApi";

const operatorContentSlice = createSlice({
  name: "operatorContent",
  initialState: {
    operators: [],
    operatorsLoading: false,
    operatorsError: null,

    periods: [],
    periodsOperator: null,
    periodsLoading: false,
    periodsError: null,

    detail: null, // { period, prizes, winners }
    detailLoading: false,
    detailError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== Операторы =====
      .addCase(fetchContentOperators.pending, (state) => {
        state.operatorsLoading = true;
        state.operatorsError = null;
      })
      .addCase(fetchContentOperators.fulfilled, (state, action) => {
        state.operatorsLoading = false;
        state.operators = action.payload?.operators || [];
      })
      .addCase(fetchContentOperators.rejected, (state, action) => {
        state.operatorsLoading = false;
        state.operatorsError = action.payload;
      })
      .addCase(updateContentOperator.fulfilled, (state, action) => {
        const idx = state.operators.findIndex((o) => o.code === action.payload?.code);
        if (idx !== -1) state.operators[idx] = action.payload;
      })
      .addCase(uploadOperatorLogo.fulfilled, (state, action) => {
        const op = state.operators.find((o) => o.code === action.payload.code);
        if (op) op.logo_url = action.payload.logo_url;
      })

      // ===== Периоды =====
      .addCase(fetchOperatorPeriods.pending, (state, action) => {
        state.periodsLoading = true;
        state.periodsError = null;
        if (state.periodsOperator !== action.meta.arg) {
          state.periods = [];
          state.periodsOperator = action.meta.arg;
        }
      })
      .addCase(fetchOperatorPeriods.fulfilled, (state, action) => {
        state.periodsLoading = false;
        state.periods = action.payload?.periods || [];
      })
      .addCase(fetchOperatorPeriods.rejected, (state, action) => {
        state.periodsLoading = false;
        state.periodsError = action.payload;
      })
      .addCase(updateOperatorPeriod.fulfilled, (state, action) => {
        const idx = state.periods.findIndex((p) => p.id === action.payload?.id);
        if (idx !== -1) state.periods[idx] = { ...state.periods[idx], ...action.payload };
        if (state.detail?.period?.id === action.payload?.id) {
          state.detail.period = { ...state.detail.period, ...action.payload };
        }
      })
      .addCase(deleteOperatorPeriod.fulfilled, (state, action) => {
        state.periods = state.periods.filter((p) => p.id !== action.payload);
        if (state.detail?.period?.id === action.payload) state.detail = null;
      })

      // ===== Экран периода =====
      .addCase(fetchPeriodDetail.pending, (state, action) => {
        state.detailLoading = true;
        state.detailError = null;
        if (String(state.detail?.period?.id) !== String(action.meta.arg)) state.detail = null;
      })
      .addCase(fetchPeriodDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchPeriodDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export default operatorContentSlice.reducer;
