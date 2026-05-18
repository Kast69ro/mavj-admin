import { createAsyncThunk } from "@reduxjs/toolkit";
import { token } from "../../utils/utils";
import axios from "axios";
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