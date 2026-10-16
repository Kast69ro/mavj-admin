import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

// По умолчанию — только включённые операторы (для всех разделов админки).
// { all: true } — полный список, нужен там, где оператора можно включить/выключить.
export const fetchOperators = createAsyncThunk(
  "operators/fetchOperators",
  async ({ all = false } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get('/operators', {
        params: all ? undefined : { active_only: true },
      });
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
      dispatch(fetchOperators({ all: true }));
      return { code, status };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
