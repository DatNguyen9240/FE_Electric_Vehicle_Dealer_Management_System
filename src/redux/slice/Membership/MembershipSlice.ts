import { createSlice } from "@reduxjs/toolkit";
import { fetchMembershipPlansThunk } from "./MembershipThunk";

export interface MembershipPlan {
  code: string;
  name: string;
  monthly_fee_vnd: number;
  mods: {
    pricePerKwhPctOff: number;
    pricePerMinPctOff: number;
    idleFeePerMinPctOff: number;
    graceMinBonus: number;
    minBalancePctOff: number;
    queueBoost: number;
  };
  isCurrent: boolean;
}

interface MembershipState {
  current: string;
  plans: MembershipPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: MembershipState = {
  current: "FREE",
  plans: [],
  loading: false,
  error: null,
};

const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembershipPlansThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipPlansThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.current || "FREE";
        state.plans = action.payload.plans || [];
      })
      .addCase(fetchMembershipPlansThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default membershipSlice.reducer;