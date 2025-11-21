import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { RegisterRequest } from "./AuthSlice";
import type { AxiosError } from "axios";
import { setCookie, deleteCookie } from "@libs/utils";
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", payload);
      setCookie("token", res.data.token);
      // store user and membership separately if backend returns membership
      setCookie("user", JSON.stringify(res.data.user));
      if (res.data.membership) {
        setCookie("membership", JSON.stringify(res.data.membership));
      } else {
        const user = res.data.user as unknown;
        if (user && typeof user === "object") {
          const userRec = user as Record<string, unknown>;
          const membership = userRec["membership"];
          if (membership !== undefined) setCookie("membership", JSON.stringify(membership));
        }
      }
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Đăng nhập thất bại");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: RegisterRequest, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", payload);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Đăng ký thất bại");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
        deleteCookie("token");
        deleteCookie("user");
        deleteCookie("membership");
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Đăng xuất thất bại");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/forgot-password", payload);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Yêu cầu khôi phục mật khẩu thất bại");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { token: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/reset-password", payload);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Đặt lại mật khẩu thất bại");
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    payload: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch("/auth/change-password", payload);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Đổi mật khẩu thất bại");
    }
  }
);
