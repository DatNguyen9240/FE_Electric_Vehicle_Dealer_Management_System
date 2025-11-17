import { createSlice } from "@reduxjs/toolkit";
import { fetchFeedbacks, getFeedback, updateFeedback } from "./FeedbackThunks";

export interface Feedback {
  _id?: string;
  id: string;
  userId: string;
  bookingId?: string | null;
  rating: number;
  comment?: string;
  status: "pending" | "in_progress" | "resolved";
  note?: string | null;
  handledBy?: string | null;
  handledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackState {
  data: Feedback[];
  loading: boolean;
  error: string | null;
  selectedFeedback: Feedback | null;
}

const initialState: FeedbackState = {
  data: [],
  loading: false,
  error: null,
  selectedFeedback: null,
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedFeedback: (state, action) => {
      state.selectedFeedback = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch feedbacks
    builder
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get single feedback
    builder
      .addCase(getFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFeedback = action.payload;
      })
      .addCase(getFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update feedback
    builder
      .addCase(updateFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.data.findIndex((fb) => fb.id === updated.id);
        if (index !== -1) {
          state.data[index] = updated;
        }
        if (state.selectedFeedback?.id === updated.id) {
          state.selectedFeedback = updated;
        }
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;

