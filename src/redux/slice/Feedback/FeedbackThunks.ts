import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";
import type { Feedback } from "./FeedbackSlice";

interface FetchFeedbacksParams {
  userId?: string;
  bookingId?: string;
  handledBy?: string;
}

interface FeedbacksResponse {
  feedbacks: Feedback[];
}

interface FeedbackResponse {
  feedback: Feedback;
}

interface UpdateFeedbackResponse {
  msg: string;
  feedback: Feedback;
}

// GET /api/v1/feedbacks - List all feedbacks (Admin/Staff)
export const fetchFeedbacks = createAsyncThunk(
  "feedback/fetchFeedbacks",
  async (params: FetchFeedbacksParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.get<FeedbacksResponse>("/feedbacks", {
        params: {
          ...(params.userId && { userId: params.userId }),
          ...(params.bookingId && { bookingId: params.bookingId }),
          ...(params.handledBy && { handledBy: params.handledBy }),
        },
      });
      return response.data.feedbacks;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string; message?: string }>;
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Failed to fetch feedbacks"
      );
    }
  }
);

// GET /api/v1/feedbacks/:id - Get single feedback (Admin/Staff)
export const getFeedback = createAsyncThunk(
  "feedback/getFeedback",
  async (feedbackId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<FeedbackResponse>(`/feedbacks/${feedbackId}`);
      return response.data.feedback;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string; message?: string }>;
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Failed to fetch feedback"
      );
    }
  }
);

// PATCH /api/v1/feedbacks/:id - Update feedback (Admin/Staff)
export const updateFeedback = createAsyncThunk(
  "feedback/updateFeedback",
  async (
    { feedbackId, note }: { feedbackId: string; note?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const body: { note?: string | null } = {};
      if (note !== undefined) body.note = note;

      const response = await api.patch<UpdateFeedbackResponse>(`/feedbacks/${feedbackId}`, body);
      return response.data.feedback;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string; message?: string }>;
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Failed to update feedback"
      );
    }
  }
);

