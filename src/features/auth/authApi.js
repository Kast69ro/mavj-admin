import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest, defaultAxios } from "../../utils/axiosInstance";

// логин — без токена
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await defaultAxios.post(
        '/login',
        new URLSearchParams({ username, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Ошибка входа");
    }
  }
);

// остальные — с токеном
export const Role = createAsyncThunk(
  "auth/role",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get('/me');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Ошибка получения роли");
    }
  }
);

