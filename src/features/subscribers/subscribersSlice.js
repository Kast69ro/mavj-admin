import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {fetchSubscribers} from "./subscribers";



const subscribersSlice = createSlice({
  name: "subscribers",
  initialState: {
    subscribers: [],
    total: 0,
    page: 1,
    limit: 20,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscribers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscribers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscribers = action.payload.subscribers;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default subscribersSlice.reducer;