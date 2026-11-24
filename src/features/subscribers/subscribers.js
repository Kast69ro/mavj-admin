import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

const errorDetail = (err) => {
  const detail = err.response?.data?.detail ?? err.response?.data?.message;
  return typeof detail === "string" ? detail : null;
};


export const fetchSubscribers = createAsyncThunk(
  "subscribers/fetchSubscribers",
  async (
    { search, operator, status, page = 1, limit = 20, billedToday, sortBy, sortDir } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosRequest.get("/subscribers", {
        params: {
          search: search || undefined,
          operator: operator || undefined,
          status: status || undefined,
          billed_today: billedToday || undefined,
          sort_by: sortBy || undefined,
          sort_dir: sortDir || undefined,
          page,
          limit,
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        errorDetail(err) || "Не удалось загрузить список абонентов"
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
        errorDetail(err) || "Не удалось загрузить данные абонента"
      );
    }
  }
);

export const fetchSubscriberFull = createAsyncThunk(
  "subscribers/fetchSubscriberFull",
  async (msisdn, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get(`/subscribers/${msisdn}/full`);
      return data;
    } catch (err) {
      return rejectWithValue(
        errorDetail(err) || "Не удалось загрузить карточку абонента"
      );
    }
  }
);

// ===== Карточка абонента по дням (дни — по Душанбе) =====
// Данные живут в состоянии таблицы, поэтому это обычные функции, а не thunk

export const fetchSubscriberDays = async (msisdn, { date_from, date_to } = {}) => {
  try {
    const { data } = await axiosRequest.get(`/subscribers/${msisdn}/days`, {
      params: { date_from: date_from || undefined, date_to: date_to || undefined },
    });
    return data;
  } catch (err) {
    throw new Error(errorDetail(err) || "Не удалось загрузить историю по дням");
  }
};

export const fetchSubscriberDay = async (msisdn, day) => {
  try {
    const { data } = await axiosRequest.get(`/subscribers/${msisdn}/days/${day}`);
    return data;
  } catch (err) {
    throw new Error(errorDetail(err) || "Не удалось загрузить подробности дня");
  }
};
