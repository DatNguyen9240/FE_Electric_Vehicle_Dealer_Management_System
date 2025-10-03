import { createSlice } from "@reduxjs/toolkit";
import { fetchWalletThunk, initiateTopupPayOSThunk } from "./PaymentThunk";

interface PaymentState {
  loading: boolean;
  error: string | null;
  result: any;
  wallet: { balance: number } | null;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  result: null,
  wallet: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Lấy số dư ví
      .addCase(fetchWalletThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWalletThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Không lấy được số dư ví";
      })
      // Nạp ví qua PayOS
      .addCase(initiateTopupPayOSThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateTopupPayOSThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(initiateTopupPayOSThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Nạp ví thất bại";
      });
  },
});

export default paymentSlice.reducer;
