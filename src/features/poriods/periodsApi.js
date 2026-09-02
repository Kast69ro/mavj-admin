import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

export const fetchPeriods = createAsyncThunk(
  "periods/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get("/periods");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось загрузить периоды"
      );
    }
  }
);

export const createPeriod = createAsyncThunk(
  "periods/create",
  async (payload, { rejectWithValue,dispatch }) => {
    try {
      const res = await axiosRequest.post("/periods", payload);
      dispatch(fetchPeriods()); 
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось создать период"
      );
    }
  }
);

export const deletePeriod = createAsyncThunk(
  "periods/delete",
  async (id, { rejectWithValue,dispatch }) => {
    try {
      await axiosRequest.delete(`/periods/${id}`);
      dispatch(fetchPeriods()); 
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось удалить период"
      );
    }
  }
);

export const togglePeriodStatus = createAsyncThunk(
  "periods/toggleStatus",
  async ({ id, is_active }, { rejectWithValue,dispatch }) => {
    try {
      const res = await axiosRequest.patch(`/periods/${id}/activate`, {
        is_active,
      });
      dispatch(fetchPeriods());
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось изменить статус периода"
      );
    }
  }
);
export const extendPeriod = createAsyncThunk(
  "periods/extend",
  async ({ id, end_date }, { rejectWithValue,dispatch }) => {
    try {
      const res = await axiosRequest.patch(`/periods/${id}`, { end_date });
      dispatch(fetchPeriods());
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось продлить период"
      );
    }
  }
);