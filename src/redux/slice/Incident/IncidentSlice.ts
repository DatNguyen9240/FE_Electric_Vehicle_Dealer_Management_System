import { createSlice } from "@reduxjs/toolkit";
import { fetchIncidents, getIncident, updateIncidentStatus, markIncidentInProgress } from "./IncidentThunks";

export interface Incident {
  id: string;
  stationId: string | null;
  connectorId: string | null;
  reportedBy: string;
  title?: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  attachments: string[];
  resolvedBy: string | null;
  resolvedAt: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface IncidentResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  items: Incident[];
}

interface IncidentState {
  data: Incident[];
  loading: boolean;
  error: string | null;
  selectedIncident: Incident | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: IncidentState = {
  data: [],
  loading: false,
  error: null,
  selectedIncident: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

const incidentSlice = createSlice({
  name: "incident",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedIncident: (state, action) => {
      state.selectedIncident = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch incidents
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get single incident
    builder
      .addCase(getIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIncident = action.payload;
      })
      .addCase(getIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update incident status
    builder
      .addCase(updateIncidentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.data.findIndex((inc) => inc.id === updated.id);
        if (index !== -1) {
          state.data[index] = updated;
        }
        if (state.selectedIncident?.id === updated.id) {
          state.selectedIncident = updated;
        }
      })
      .addCase(updateIncidentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Mark incident in progress
    builder
      .addCase(markIncidentInProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markIncidentInProgress.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.data.findIndex((inc) => inc.id === updated.id);
        if (index !== -1) {
          state.data[index] = updated;
        }
        if (state.selectedIncident?.id === updated.id) {
          state.selectedIncident = updated;
        }
      })
      .addCase(markIncidentInProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedIncident } = incidentSlice.actions;
export default incidentSlice.reducer;

