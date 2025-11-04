import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";

export const fetchStationsThunk = createAsyncThunk(
  "station/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/stations/all");
      console.log("fetchStationsThunk: API response ->", res.data);
      // API may return either an array or an object { stations: [...], pagination: {...} }
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.stations)) return res.data.stations;
      return [];
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Không lấy được danh sách trạm");
    }
  }
);