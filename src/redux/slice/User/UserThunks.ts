import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";
import type { User } from "./UserSlice";

// GET /api/v1/users - Lấy danh sách tất cả users (chỉ admin)
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users");
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Lấy danh sách người dùng thất bại"
      );
    }
  }
);

// GET /api/v1/users/:id - Lấy thông tin 1 user (chỉ admin)
export const getUser = createAsyncThunk(
  "user/getUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Lấy thông tin người dùng thất bại"
      );
    }
  }
);

// PUT /api/v1/users/:id - Cập nhật thông tin user (chỉ admin)
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (
    { userId, userData }: { userId: string; userData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/users/${userId}`, userData);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Cập nhật thông tin người dùng thất bại"
      );
    }
  }
);

// DELETE /api/v1/users/:id - Xóa user (chỉ admin)
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId; // Return userId để update state
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Xóa người dùng thất bại"
      );
    }
  }
);
