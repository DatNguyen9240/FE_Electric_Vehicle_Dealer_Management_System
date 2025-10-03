import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../libs/axios";
import type { AxiosError } from "axios";

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
