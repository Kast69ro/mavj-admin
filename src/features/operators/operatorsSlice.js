import { createSlice } from "@reduxjs/toolkit";
import { fetchOperators } from "./operators";

const operatorsSlice = createSlice({
  name: "operators",
  initialState: {
    info: [], // только включённые
    all: [], // все, включая выключенные
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperators.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOperators.fulfilled, (state, action) => {
        state.isLoading = false;
        const list = action.payload?.operators || [];
        if (action.meta.arg?.all) state.all = list;
        else state.info = list;
      })
      .addCase(fetchOperators.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default operatorsSlice.reducer;
