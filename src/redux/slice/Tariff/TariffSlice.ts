import { createSlice } from "@reduxjs/toolkit";
import { fetchTariffs, createTariff, updateTariff, deleteTariff, getTariff } from "./TariffThunks";

export interface Tariff {
  _id: string;
  stationId: string;
  connectorType?: string;
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
  selectedTariff: Tariff | null;
  loading: boolean;
  error: string | null;
}

const initialState: TariffState = {
  data: [],
  selectedTariff: null,
  loading: false,
  error: null,
};

const tariffSlice = createSlice({
  name: "tariff",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tariffs
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
      })
      // Create tariff
      .addCase(createTariff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTariff.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createTariff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update tariff
      .addCase(updateTariff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTariff.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateTariff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete tariff
      .addCase(deleteTariff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTariff.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((t) => t._id !== action.meta.arg);
        if (state.selectedTariff?._id === action.meta.arg) {
          state.selectedTariff = null;
        }
      })
      .addCase(deleteTariff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get tariff
      .addCase(getTariff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTariff.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTariff = action.payload;
      })
      .addCase(getTariff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedTariff = null;
      });
  },
});

export const { clearError } = tariffSlice.actions;
export default tariffSlice.reducer;
