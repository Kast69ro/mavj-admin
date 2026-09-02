import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchAnalytics",
  async ({ date_from, date_to, operator } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get("/stats/dashboard", {
        params: {
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(operator && { operator }),
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);