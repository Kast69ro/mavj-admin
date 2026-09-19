import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchSubscribers, fetchSubscriberQuiz, fetchSubscriberFull } from "./subscribers";



const subscribersSlice = createSlice({
  name: "subscribers",
  initialState: {
    subscribers: [],
    total: 0,
    page: 1,
    limit: 20,
    isLoading: false,
    error: null,

    selectedSubscriber: {
      data: null,
      isLoading: false,
      error: null,
    },
    selectedSubscriberFull: {
      data: null,
      isLoading: false,
      error: null,
    },
  },
  reducers: {
    clearSelectedSubscriber: (state) => {
      state.selectedSubscriber.data = null;
      state.selectedSubscriber.error = null;
      state.selectedSubscriberFull.data = null;
      state.selectedSubscriberFull.error = null;
    },
  },
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
      })

      .addCase(fetchSubscriberQuiz.pending, (state) => {
        state.selectedSubscriber.isLoading = true;
        state.selectedSubscriber.error = null;
      })
      .addCase(fetchSubscriberQuiz.fulfilled, (state, action) => {
        state.selectedSubscriber.isLoading = false;
        state.selectedSubscriber.data = action.payload;
      })
      .addCase(fetchSubscriberQuiz.rejected, (state, action) => {
        state.selectedSubscriber.isLoading = false;
        state.selectedSubscriber.error = action.payload;
      })

      .addCase(fetchSubscriberFull.pending, (state) => {
        state.selectedSubscriberFull.isLoading = true;
        state.selectedSubscriberFull.error = null;
      })
      .addCase(fetchSubscriberFull.fulfilled, (state, action) => {
        state.selectedSubscriberFull.isLoading = false;
        state.selectedSubscriberFull.data = action.payload;
      })
      .addCase(fetchSubscriberFull.rejected, (state, action) => {
        state.selectedSubscriberFull.isLoading = false;
        state.selectedSubscriberFull.error = action.payload;
      });
  },
});

export const { clearSelectedSubscriber } = subscribersSlice.actions;
export default subscribersSlice.reducer;