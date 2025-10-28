import { createSlice} from "@reduxjs/toolkit";
import { fetchPayments } from "@redux/slice/Payment/PaymentThunks";

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
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;

