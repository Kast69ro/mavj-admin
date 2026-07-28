import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

export const fetchSMS = createAsyncThunk(
  "sms/fetchSMS",
  async ({ operator, language } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get('/templates', {
        params: {
          operator: operator || undefined,
          language: language || undefined,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createSMS = createAsyncThunk(
  "sms/createSMS",
  async (obj, { rejectWithValue, dispatch }) => {
    try {
       await axiosRequest.post('/templates', obj);
       dispatch(fetchSMS());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateSMS = createAsyncThunk(
  "sms/updateSMS",
  async ({ id, ...payload }, { dispatch, rejectWithValue }) => {
    try {
      await axiosRequest.put(`/templates/${id}`, payload);
      dispatch(fetchSMS());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);