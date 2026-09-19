import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";


export const fetchOperators = createAsyncThunk(
  "operators/fetchOperators",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get('/operators');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateOperatorStatus = createAsyncThunk(
  "operators/updateOperatorStatus",
  async ({ code, status }, { dispatch, rejectWithValue }) => {
    try {
      await axiosRequest.patch(`/operators/${code}/status`, null, { params: { status } });
      dispatch(fetchOperators());
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);