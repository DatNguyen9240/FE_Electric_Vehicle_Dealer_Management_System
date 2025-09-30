import { createSlice } from "@reduxjs/toolkit";
import { fetchTariffs } from "./TariffThunks";

export interface Tariff {
  _id: string;
  stationId: string;
  mode: string;
  pricePerKwh: number;
  pricePerMin: number;
  idleFeePerMin: number;
  graceMin: number;
  active: boolean;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

interface TariffState {
  data: Tariff[];
  loading: boolean;
  error: string | null;
}

const initialState: TariffState = {
  data: [],
  loading: false,
  error: null,
};

const tariffSlice = createSlice({
  name: "tariff",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTariffs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTariffs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTariffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default tariffSlice.reducer;
