import { createSlice } from "@reduxjs/toolkit";
import { fetchQuiz, fetchQuizStats } from "./victorinaApi";

const victorinaSlice = createSlice({
  name: "victorina",
  initialState: {
    questions: [],
    isLoading: false,
    error: null,
    total: null,
    stats: null,
    statsLoading: false,
    statsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload.questions;
        state.total = action.payload.total;
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchQuizStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchQuizStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchQuizStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  },
});

export default victorinaSlice.reducer;