import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

export const fetchUssd = createAsyncThunk(
  "ussd/fetchUssd",
  async ({ operator, language } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get('/ussd-templates', {
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

export const createUssd = createAsyncThunk(
  "ussd/createUssd",
  async (obj, { rejectWithValue, dispatch }) => {
    try {
      await axiosRequest.post('/ussd-templates', obj);
      dispatch(fetchUssd());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateUssd = createAsyncThunk(
  "ussd/updateUssd",
  async ({ id, ...payload }, { dispatch, rejectWithValue }) => {
    try {
      await axiosRequest.put(`/ussd-templates/${id}`, payload);
      dispatch(fetchUssd());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
