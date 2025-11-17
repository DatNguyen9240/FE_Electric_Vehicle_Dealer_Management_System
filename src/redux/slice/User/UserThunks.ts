import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";
import type { User } from "./UserSlice";

// Current user profile APIs (staff + customer)
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/profile");
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Lấy thông tin người dùng thất bại"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const res = await api.patch("/profile", userData);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Cập nhật thông tin người dùng thất bại"
      );
    }
  }
);

// Admin user management APIs
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

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
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

export const updateUserById = createAsyncThunk(
  "user/updateUserById",
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

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Xóa người dùng thất bại"
      );
    }
  }
);
