import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";
import type { Incident } from "./IncidentSlice";

interface FetchIncidentsParams {
  page?: number;
  limit?: number;
  status?: string;
  stationId?: string;
  severity?: string;
  from?: string;
  to?: string;
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

// GET /api/v1/admin/incidents - List all incidents
export const fetchIncidents = createAsyncThunk(
  "incident/fetchIncidents",
  async (params: FetchIncidentsParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.get<IncidentResponse>("/admin/incidents", {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...(params.status && { status: params.status }),
          ...(params.stationId && { stationId: params.stationId }),
          ...(params.severity && { severity: params.severity }),
          ...(params.from && { from: params.from }),
          ...(params.to && { to: params.to }),
        },
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string; message?: string }>;
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Failed to fetch incidents"
      );
    }
  }
);

// GET /api/v1/admin/incidents/:id - Get single incident (need to find from list)
export const getIncident = createAsyncThunk(
  "incident/getIncident",
  async (incidentId: string, { rejectWithValue }) => {
    try {
      // Since there's no direct GET /admin/incidents/:id endpoint,
      // we'll fetch the list and find the incident
      const response = await api.get<IncidentResponse>("/admin/incidents", {
        params: { limit: 1000 },
      });
      const incident = response.data.items.find((inc) => inc.id === incidentId);
      if (!incident) {
        return rejectWithValue("Incident not found");
      }
      return incident;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string; message?: string }>;
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Failed to fetch incident"
      );
    }
  }
);

// PATCH /api/v1/staff/incidents/:id/status - Update incident status (for staff)
export const updateIncidentStatus = createAsyncThunk(
  "incident/updateIncidentStatus",
  async (
    { incidentId, status }: { incidentId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<{ incident: Incident }>(
        `/staff/incidents/${incidentId}/status`,
        { status }
      );
      return response.data.incident;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string; message?: string }>;
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Failed to update incident status"
      );
    }
  }
);

// PATCH /api/v1/admin/incidents/:id/in-progress - Mark incident in progress (admin only)
export const markIncidentInProgress = createAsyncThunk(
  "incident/markIncidentInProgress",
  async (incidentId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ incident: Incident }>(
        `/admin/incidents/${incidentId}/in-progress`
      );
      return response.data.incident;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; detail?: string; message?: string }>;
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Failed to mark incident in progress"
      );
    }
  }
);

