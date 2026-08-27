import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchAnalytics",
  async (_arg, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get("/stats");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);