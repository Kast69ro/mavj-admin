import { createSlice } from "@reduxjs/toolkit";
import { login, Role, changeMyPassword } from "./authApi";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    userError: null,
    mustChangePassword: false,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.userError = null;
      state.mustChangePassword = false;
      state.token = null;
      localStorage.removeItem("token");
    },
    passwordChangeRequired: (state) => {
      state.mustChangePassword = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.userError = null;
        state.mustChangePassword = false;
        state.token = action.payload.access_token;
        localStorage.setItem("token", action.payload.access_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(Role.pending, (state) => {
        state.userError = null;
      })
      .addCase(Role.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.mustChangePassword = Boolean(action.payload?.must_change_password);
      })
      .addCase(Role.rejected, (state, action) => {
        state.userError = action.payload || "Не удалось загрузить профиль";
      })
      .addCase(changeMyPassword.fulfilled, (state) => {
        state.mustChangePassword = false;
        if (state.user) state.user.must_change_password = false;
      });
  },
});

export const { logout, passwordChangeRequired } = authSlice.actions;
export default authSlice.reducer;
