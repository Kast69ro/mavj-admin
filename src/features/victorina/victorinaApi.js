import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

export const fetchQuiz = createAsyncThunk(
  "victorina/fetchQuiz",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get("/quiz/questions", {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const deleteQuizQuestion = createAsyncThunk(
  "victorina/deleteQuizQuestion",
  async (questionId, { rejectWithValue, dispatch }) => {
    try {
      await axiosRequest.delete(`/quiz/questions/${questionId}`);
      dispatch(fetchQuiz());

      return questionId;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const createQuiz = createAsyncThunk(
  "victorina/createQuiz",
  async (quiz, { rejectWithValue, dispatch }) => {
    try {
      await axiosRequest.post("/quiz/questions", quiz);
      dispatch(fetchQuiz());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const updateQuiz = createAsyncThunk(
  "victorina/updateQuiz",
  async ({ id, ...quiz }, { rejectWithValue, dispatch }) => {
    try {
      await axiosRequest.put(`/quiz/questions/${id}`, quiz);
      dispatch(fetchQuiz());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const toggleQuizStatus = createAsyncThunk(
  "victorina/toggleQuizStatus",
  async ({ id, is_active }, { rejectWithValue, dispatch }) => {
    try {
      await axiosRequest.patch(`/quiz/questions/${id}/toggle`, { is_active });
      dispatch(fetchQuiz());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const uploadExcel = createAsyncThunk(
  "victorina/uploadExcel",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axiosRequest.post("/quiz/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const deleteQuestions = createAsyncThunk(
  "victorina/deleteQuestions",
  async (_arg, { rejectWithValue, dispatch }) => {
    try {
      await axiosRequest.delete("/quiz/questions");
      dispatch(fetchQuiz());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);


export const fetchQuizStats = createAsyncThunk(
  "victorina/fetchQuizStats",
  async (_arg, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get("/quiz/stats");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);
