import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";

export const fetchTariffs = createAsyncThunk(
  "tariff/fetchTariffs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/tariffs");
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Lấy danh sách biểu giá thất bại"
      );
    }
  }
);

export const createTariff = createAsyncThunk(
  "tariff/createTariff",
  async (
    payload: Partial<import("./TariffSlice").Tariff>,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/tariffs", payload);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Tạo biểu giá thất bại"
      );
    }
  }
);

export const updateTariff = createAsyncThunk(
  "tariff/updateTariff",
  async (
    {
      id,
      payload,
    }: { id: string; payload: Partial<import("./TariffSlice").Tariff> },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/tariffs/${id}`, payload);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Cập nhật biểu giá thất bại"
      );
    }
  }
);

export const deleteTariff = createAsyncThunk(
  "tariff/deleteTariff",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/tariffs/${id}`);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Xoá biểu giá thất bại"
      );
    }
  }
);

export const getTariffEffective = createAsyncThunk(
  "tariff/getTariffEffective",
  async (
    { stationId, at }: { stationId: string; at: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(`/tariffs/effective`, {
        params: { stationId, at },
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Lấy biểu giá hiệu lực thất bại"
      );
    }
  }
);
