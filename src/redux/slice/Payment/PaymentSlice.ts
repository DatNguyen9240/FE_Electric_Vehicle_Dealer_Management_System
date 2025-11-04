import { createSlice} from "@reduxjs/toolkit";
import { fetchPayments, fetchWalletThunk, initiateTopupPayOSThunk } from "@redux/slice/Payment/PaymentThunks";

export interface Payment {
  id: string;
  user_id: string;
  wallet_id: string;
  type: "TOPUP" | "DEBIT" | "REFUND";
  category?: string;
  amount: number;
  method: string;
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  resulting_balance?: number;
  idempotency_key: string;
  meta?: any;
  createdAt: string;
}

interface PaymentResult {
  orderCode?: string;
  checkoutUrl?: string;
}

interface PaymentState {
  data: Payment[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  // Wallet state
  wallet: { balance: number } | null;
  result: PaymentResult | null;
}

const initialState: PaymentState = {
  data: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  wallet: null,
  result: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages,
        };
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Wallet thunks
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

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;

