import { createSlice } from "@reduxjs/toolkit";
import { fetchUssd } from "./ussdTemplates";

const initialState = {
  templates: [],
  total: 0,
  status: "idle",
  error: null,
};

const ussdSlice = createSlice({
  name: "ussd",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUssd.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUssd.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload.templates;
        state.total = action.payload.total;
      })
      .addCase(fetchUssd.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch USSD templates";
      });
  },
});

export default ussdSlice.reducer;
