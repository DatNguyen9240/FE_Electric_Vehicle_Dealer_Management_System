import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  registerSuccess: boolean;
  registerMsg?: string;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  registerSuccess: false,
  registerMsg: undefined,
};

import { registerUser } from "./authThunks";

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registerRequest(state) {
      state.loading = true;
      state.error = null;
      state.registerSuccess = false;
      state.registerMsg = undefined;
    },
    registerSuccess(state) {
      state.loading = false;
      state.registerSuccess = true;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.registerSuccess = false;
      state.registerMsg = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerSuccess = true;
        state.registerMsg = action.payload?.msg;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
        state.registerMsg = undefined;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.registerSuccess = false;
        state.registerMsg = undefined;
      });
  },
});

export const { registerRequest, registerSuccess, registerFailure } =
  authSlice.actions;
export default authSlice.reducer;
