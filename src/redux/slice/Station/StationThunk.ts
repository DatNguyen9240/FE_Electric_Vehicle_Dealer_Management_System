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
// Fallback: if compatible fails (no vehicle), use nearby only; if both fail, use all stations
export const fetchCompatibleStationsThunk = createAsyncThunk(
  "station/fetchCompatibleStations",
  async (_: void, { rejectWithValue }) => {
    let compatible: any[] = [];

    // 1) Try to get compatible list (may fail if user has no default vehicle)
    try {
      const res = await api.get("/stations/compatible");
      const d: any = res.data;
      compatible = Array.isArray(d) ? d : Array.isArray(d?.stations) ? d.stations : Array.isArray(d?.items) ? d.items : [];
    } catch (error) {
      console.warn("fetchCompatibleStationsThunk: compatible stations failed (user may not have vehicle)", error);
    }

    // 2) Try to get nearby stations from browser geolocation
    let nearList: any[] = [];
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const nearRes = await api.get("/stations", { params: { near: `${lat},${lng}`, radiusKm: 50 } });
        const dn: any = nearRes.data;
        nearList = Array.isArray(dn) ? dn : Array.isArray(dn?.stations) ? dn.stations : Array.isArray(dn?.items) ? dn.items : [];
      } catch (e) {
        console.warn("fetchCompatibleStationsThunk: geolocation/fetch failed", e);
      }
    }

    // 3) Decision logic:
    // - If we have both compatible and nearby: return intersection
    // - If we only have nearby (compatible failed): return nearby
    // - If we only have compatible (no geolocation): return compatible
    // - If both failed: fallback to all stations

    if (Array.isArray(nearList) && nearList.length > 0) {
      if (compatible.length > 0) {
        // Both available: return intersection
        const compSet = new Set((compatible || []).map((s: any) => s._id || s.id));
        const intersection = (nearList || []).filter((s: any) => compSet.has(s._id || s.id));
        return intersection.length > 0 ? intersection : nearList; // If intersection empty, fallback to nearby
      } else {
        // Only nearby available: return nearby
        return nearList;
      }
    }

    if (compatible.length > 0) {
      // Only compatible available: return compatible
      return compatible;
    }

    // Both failed: fallback to all stations
    try {
      const allRes = await api.get("/stations/all");
      const allData: any = allRes.data;
      const allStations = Array.isArray(allData) ? allData : Array.isArray(allData?.stations) ? allData.stations : [];
      return allStations;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Không lấy được danh sách trạm");
    }
  }
);