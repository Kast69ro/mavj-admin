import { createSlice } from "@reduxjs/toolkit";
import { fetchQuiz } from "./victorinaApi";

const victorinaSlice = createSlice({
  name: "victorina",
  initialState: {
    questions: [],
    isLoading: false,
    error: null,
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
        state.questions = action.payload;
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default victorinaSlice.reducer;
