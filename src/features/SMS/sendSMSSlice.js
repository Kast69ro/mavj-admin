import { createSlice } from "@reduxjs/toolkit";
import { fetchSMS } from "./sendSMS"; // путь поправь под свою структуру

const initialState = {
  templates: [],
  total: 0,
  status: "idle", 
  error: null,
};

const smsSlice = createSlice({
  name: "sms",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSMS.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSMS.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload.templates;
        state.total = action.payload.total;
      })
      .addCase(fetchSMS.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch SMS templates";
      });
  },
});

export default smsSlice.reducer;