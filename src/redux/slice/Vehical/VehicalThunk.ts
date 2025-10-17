import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@libs/axios";
import type { AxiosError } from "axios";
import type { Vehicle } from "./VehicalSlice";

export const fetchVehiclesThunk = createAsyncThunk(
	"vehical/fetchVehicles",
	async (_, { rejectWithValue }) => {
			try {
				const res = await api.get("/vehicles");

				// Helper: map a single API vehicle (snake_case) to our app Vehicle (camelCase).
				const mapVehicle = (v: unknown): Vehicle => {
					const vehicle = v as {
						id: string;
						_id?: string;
						user_id?: string;
						model: string;
						make?: string;
						license_plate?: string;
						license_plate_norm?: string;
						plug_type?: string;
						battery_kwh?: number;
						is_default?: boolean;
						created_at?: string;
						updated_at?: string;
						deleted_at?: string;
					};
					return {
						id: vehicle.id,
						_id: vehicle._id ?? "",
						userId: vehicle.user_id ?? "",
						model: vehicle.model,
						make: vehicle.make ?? "",
						licensePlate: vehicle.license_plate ?? "",
						licensePlateNorm: vehicle.license_plate_norm ?? "",
						plugType: vehicle.plug_type ?? "",
						batteryKwh: vehicle.battery_kwh ?? 0,
						isDefault: vehicle.is_default ?? false,
						createdAt: vehicle.created_at ?? "",
						updatedAt: vehicle.updated_at ?? "",
						deletedAt: vehicle.deleted_at ?? "",
					};
				};

				const data = res.data;

				// Normalize possible server shapes to an array of raw vehicles.
				const rawVehicles: unknown[] = Array.isArray(data)
					? data
					: Array.isArray(data?.vehicles)
					? data.vehicles
					: Array.isArray(data?.data)
					? data.data
					: [];

				return { ...(data && typeof data === "object" ? data : {}), vehicles: rawVehicles.map(mapVehicle) };
			} catch (error) {
				const err = error as AxiosError<{ msg?: string }>;
				return rejectWithValue(err.response?.data?.msg || "Không lấy được danh sách xe");
			}
	}
);

export const updateVehicleThunk = createAsyncThunk(
	"vehical/updateVehicle",
	async (
		{ id, data }: { id: string; data: Record<string, unknown> },
		{ rejectWithValue }
	) => {
			try {
				const res = await api.put(`/vehicles/${id}`, data);
				const v = res.data?.vehicle;
				if (v) {
					const mapped: Vehicle = {
						id: v.id,
						_id: v._id ?? "",
						userId: v.user_id ?? "",
						model: v.model,
						make: v.make ?? "",
						licensePlate: v.license_plate ?? "",
						licensePlateNorm: v.license_plate_norm ?? "",
						plugType: v.plug_type ?? "",
						batteryKwh: v.battery_kwh ?? 0,
						isDefault: v.is_default ?? false,
						createdAt: v.created_at ?? "",
						updatedAt: v.updated_at ?? "",
						deletedAt: v.deleted_at ?? "",
					};
					return { ...res.data, vehicle: mapped };
				}
				return res.data;
			} catch (error) {
				const err = error as AxiosError<{ msg?: string }>;
				return rejectWithValue(err.response?.data?.msg || "Không thể cập nhật xe");
			}
	}
);

export const createVehicleThunk = createAsyncThunk(
	"vehical/createVehicle",
	async (
		data: {
			model: string;
			plugType: string;
			batteryKwh: number;
			licensePlate?: string | null;
			make?: string | null;
			isDefault?: boolean;
		},
		{ rejectWithValue }
	) => {
			try {
				const res = await api.post(`/vehicles`, data);
				const v = res.data?.vehicle;
				if (v) {
					const mapped: Vehicle = {
						id: v.id,
						_id: v._id ?? "",
						userId: v.user_id ?? "",
						model: v.model,
						make: v.make ?? "",
						licensePlate: v.license_plate ?? "",
						licensePlateNorm: v.license_plate_norm ?? "",
						plugType: v.plug_type ?? "",
						batteryKwh: v.battery_kwh ?? 0,
						isDefault: v.is_default ?? false,
						createdAt: v.created_at ?? "",
						updatedAt: v.updated_at ?? "",
						deletedAt: v.deleted_at ?? "",
					};
					return { ...res.data, vehicle: mapped };
				}
				return res.data;
			} catch (error) {
				const err = error as AxiosError<{ msg?: string }>;
				return rejectWithValue(err.response?.data?.msg || "Error creating vehicle");
			}
	}
);

export const deleteVehicleThunk = createAsyncThunk(
	"vehical/deleteVehicle",
	async (id: string, { rejectWithValue }) => {
		try {
			const res = await api.delete(`/vehicles/${id}`);
			return res.data; // expect { success: true }
		} catch (error) {
			const err = error as AxiosError<{ msg?: string }>;
			return rejectWithValue(err.response?.data?.msg || "Error deleting vehicle");
		}
	}
);


