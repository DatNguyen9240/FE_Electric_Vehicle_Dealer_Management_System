import { createSlice } from "@reduxjs/toolkit";
import { fetchStationsThunk } from "./StationThunk";

export interface Station {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface StationState {
  stations: Station[];
  loading: boolean;
  error: string | null;
}

const initialState: StationState = {
  stations: [],
  loading: false,
  error: null,
};

const stationSlice = createSlice({
  name: "station",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Lỗi lấy trạm";
      });
  },
});

export default stationSlice.reducer;