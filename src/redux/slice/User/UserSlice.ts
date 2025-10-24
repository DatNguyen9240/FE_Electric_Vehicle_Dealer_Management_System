import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchUsers, getUser, updateUser, deleteUser } from "./UserThunks";

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "staff" | "driver";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
  selectedUser: null,
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
    // Fetch all users
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

    // Get single user
    builder
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        const index = state.data.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.data[index] = updatedUser;
        }
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
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
        state.data = state.data.filter(user => user.id !== action.payload);
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
