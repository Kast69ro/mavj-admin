import { createAsyncThunk } from "@reduxjs/toolkit";
import { token } from "../../utils/utils";
import axios from "axios";
import { axiosRequest } from "../../utils/axiosInstance";


export const fetchSubscribers = createAsyncThunk(
  "subscribers/fetchSubscribers",
  async (
    { search, operator, status, page = 1, limit = 20 } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosRequest.get("/subscribers", {
        params: {
          search: search || undefined,
          operator: operator || undefined,
          status: status || undefined,
          page,
          limit,
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось загрузить список абонентов"
      );
    }
  }
);


export const fetchSubscriberQuiz = createAsyncThunk(
  "subscribers/fetchSubscriberQuiz",
  async ({ msisdn, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get(`/subscribers/${msisdn}/quiz`, {
        params: {
          page,
          limit,
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось загрузить данные абонента"
      );
    }
  }
);

