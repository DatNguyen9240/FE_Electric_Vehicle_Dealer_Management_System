import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { RegisterRequest } from "./AuthSlice";
import type { AxiosError } from "axios";
import { setCookie, deleteCookie } from "@libs/utils";
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/v1/auth/login", payload);
      setCookie("token", res.data.token);
      setCookie("user", JSON.stringify(res.data.user));
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
      const res = await api.post("/v1/auth/signup", payload);
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
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Đăng xuất thất bại");
    }
  }
);
