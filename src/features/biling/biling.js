import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

export const fetchBilling = createAsyncThunk(
  "billing/fetchBilling",
  async ({ date_from, date_to, operator } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get("/billing/daily", {
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