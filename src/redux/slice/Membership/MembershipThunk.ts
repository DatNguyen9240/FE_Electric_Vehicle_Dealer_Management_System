import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@libs/axios";
import type { AxiosError } from "axios";

export const fetchMembershipPlansThunk = createAsyncThunk(
  "membership/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/memberships/plans");
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
      return rejectWithValue(err.response?.data?.msg || "Không lấy được gói thành viên");
    }
  }
);