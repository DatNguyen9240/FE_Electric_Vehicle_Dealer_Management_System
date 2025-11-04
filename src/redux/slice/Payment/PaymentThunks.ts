import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";

interface FetchPaymentsParams {
  page?: number;
  limit?: number;
  type?: string;
  userId?: string;
  from?: string;
  to?: string;
}

interface PaymentResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: any[];
}

export const fetchPayments = createAsyncThunk(
  "payment/fetchPayments",
  async (params: FetchPaymentsParams = {}, { rejectWithValue }) => {
    try {
      console.log("Fetching payments with params:", params);
      const response = await api.get("/admin/wallet/transactions", {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...(params.type && { type: params.type }),
          ...(params.userId && { userId: params.userId }),
          ...(params.from && { from: params.from }),
          ...(params.to && { to: params.to }),
        },
      });
      console.log("API Response:", response.data);
      return response.data as PaymentResponse;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string }>;
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.detail || "Lấy danh sách thanh toán thất bại"
      );
    }
  }
);

export const fetchWalletThunk = createAsyncThunk(
  "payment/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/wallets/me");
      return res.data; // { balance: number, ... }
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Không lấy được số dư ví"
      );
    }
  }
);

export const initiateTopupPayOSThunk = createAsyncThunk(
  "payment/initiateTopupPayOS",
  async (amount: number, { rejectWithValue }) => {
    try {
      const res = await api.post("/payments/payos/initiate", { amount });
      return res.data; // { provider, orderCode, checkoutUrl, ... }
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(
        err.response?.data?.msg || "Không thể khởi tạo giao dịch nạp ví"
      );
    }
  }
);
