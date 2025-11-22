import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  fetchProfile,
  updateProfile,
  fetchUsers,
  fetchUserById,
  updateUserById,
  deleteUser,
} from "./UserThunks";

export interface UserVehicle {
  id: string;
  user_id: string;
  license_plate?: string;
  plug_type?: string;
  make?: string;
  model?: string;
  battery_kwh?: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "staff" | "driver";
  status: "ACTIVE" | "SUSPENDED";
  stationId?: string | null;
  created_at: string;
  updated_at?: string;
  vehicles?: UserVehicle[];
}

interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  profile: User | null;
}

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
  selectedUser: null,
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Profile (for staff/customer)
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user as User | undefined;
        if (updatedUser) {
          state.profile = updatedUser;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Admin: fetch all users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Admin: fetch user by id
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Admin: update user by id
    builder
      .addCase(updateUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user as User;
        const index = state.data.findIndex((user) => user.id === updatedUser.id);
        if (index !== -1) {
          state.data[index] = updatedUser;
        }
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((user) => user.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;
