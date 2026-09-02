import { createSlice } from "@reduxjs/toolkit";
import { fetchOperators } from "./operators";

const operatorsSlice = createSlice({
  name: "operators",
  initialState: {
    info: [],
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
        state.info = action.payload?.operators || [];
      })
      .addCase(fetchOperators.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default operatorsSlice.reducer;
