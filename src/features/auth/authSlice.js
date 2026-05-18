import { createSlice } from "@reduxjs/toolkit";
import { login, Role } from "./authApi";  

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        localStorage.setItem("token", action.payload.access_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(Role.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      });  
  },
});

export const { logout, restoreToken } = authSlice.actions;
export default authSlice.reducer;