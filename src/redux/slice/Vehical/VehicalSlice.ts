import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@redux/store/store";
import { fetchVehiclesThunk, updateVehicleThunk } from "./VehicalThunk";

export type Vehicle = {
	id: string;
	_id?: string; // original DB id if present
	userId?: string | null;
	model: string;
	make?: string | null;
	licensePlate?: string | null;
	licensePlateNorm?: string | null;
	plugType: string;
	batteryKwh: number;
	isDefault?: boolean;
	createdAt?: string | null;
	updatedAt?: string | null;
	deletedAt?: string | null;
};

type VehicalState = {
	vehicles: Vehicle[];
	loading: boolean;
	error: string | null;
	selectedVehicleId: string | null;
};

const initialState: VehicalState = {
	vehicles: [],
	loading: false,
	error: null,
	selectedVehicleId: null,
};

const vehicalSlice = createSlice({
	name: "vehical",
	initialState,
	reducers: {
		setSelectedVehicle(state, action: PayloadAction<string | null>) {
			state.selectedVehicleId = action.payload;
		},
		clearVehicles(state) {
			state.vehicles = [];
			state.selectedVehicleId = null;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchVehiclesThunk.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchVehiclesThunk.fulfilled, (state, action) => {
			state.loading = false;
			state.error = null;
			// expect action.payload to be { vehicles: [...] }
			state.vehicles = action.payload?.vehicles ?? [];
			if (!state.selectedVehicleId && state.vehicles.length > 0) {
				state.selectedVehicleId = state.vehicles[0].id;
			}
		});
		builder.addCase(fetchVehiclesThunk.rejected, (state, action) => {
			state.loading = false;
			state.error = (action.payload as string) || action.error.message || "Lỗi khi lấy xe";
		});

		builder.addCase(updateVehicleThunk.fulfilled, (state, action) => {
			// expect action.payload to be { vehicle: {...} }
			const updated = action.payload?.vehicle;
			if (updated) {
				const idx = state.vehicles.findIndex((v) => v.id === updated.id);
				if (idx !== -1) state.vehicles[idx] = updated;
				else state.vehicles.unshift(updated);
				// if selected is unset, set to updated
				if (!state.selectedVehicleId) state.selectedVehicleId = updated.id;
			}
		});
	},
});

export const { setSelectedVehicle, clearVehicles } = vehicalSlice.actions;

export const selectVehicles = (state: RootState) => state.vehical.vehicles;
export const selectVehicalLoading = (state: RootState) => state.vehical.loading;
export const selectSelectedVehicleId = (state: RootState) => state.vehical.selectedVehicleId;

export default vehicalSlice.reducer;

