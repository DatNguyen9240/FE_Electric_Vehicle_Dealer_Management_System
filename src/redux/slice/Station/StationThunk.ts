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

// Fetch compatible stations (for homepage): compatible + nearby => intersection
export const fetchCompatibleStationsThunk = createAsyncThunk(
  "station/fetchCompatibleStations",
  async (_: void, { rejectWithValue }) => {
    try {
      // 1) compatible list
      const res = await api.get("/stations/compatible");
      const d: any = res.data;
      const compatible = Array.isArray(d) ? d : Array.isArray(d?.stations) ? d.stations : Array.isArray(d?.items) ? d.items : [];

      // 2) try to get nearby stations from browser
      let nearList: any[] = [];
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const nearRes = await api.get("/stations", { params: { near: `${lat},${lng}`, radiusKm: 10 } });
          const dn: any = nearRes.data;
          nearList = Array.isArray(dn) ? dn : Array.isArray(dn?.stations) ? dn.stations : Array.isArray(dn?.items) ? dn.items : [];
        } catch (e) {
          // geolocation or fetch failed — fall back to compatible list only
          console.warn("fetchCompatibleStationsThunk: geolocation/fetch failed", e);
        }
      }

      // if we have nearby station results, return intersection (nearby + compatible)
      if (Array.isArray(nearList) && nearList.length > 0) {
        const compSet = new Set((compatible || []).map((s: any) => s._id || s.id));
        const intersection = (nearList || []).filter((s: any) => compSet.has(s._id || s.id));
        return intersection;
      }

      // no geolocation — return compatible only
      return compatible;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Không lấy được danh sách trạm tương thích");
    }
  }
);