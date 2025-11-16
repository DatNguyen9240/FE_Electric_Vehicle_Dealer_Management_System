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

// GET current authenticated user's profile (uses /profile)
export const getUser = createAsyncThunk(
  "user/getUser",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get(`/profile`);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Lấy thông tin người dùng thất bại"
      );
    }
  }
);

// PATCH /api/v1/profile - Cập nhật profile của user hiện tại
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/profile`, userData);
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
