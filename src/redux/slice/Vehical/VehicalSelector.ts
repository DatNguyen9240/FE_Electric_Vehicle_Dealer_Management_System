import type { RootState } from "@redux/store/store";

export type Vehicle = {
  id: string;
  model: string;
  plugType: string;
  batteryKwh: number;
};

// Basic selectors
export const selectVehicles = (state: RootState): Vehicle[] => state.vehical.vehicles;
export const selectVehicalLoading = (state: RootState): boolean => state.vehical.loading;
export const selectVehicalError = (state: RootState): string | null => state.vehical.error;
export const selectSelectedVehicleId = (state: RootState): string | null => state.vehical.selectedVehicleId;

// Derived selectors
export const selectSelectedVehicle = (state: RootState): Vehicle | null => {
  const id = state.vehical.selectedVehicleId;
  if (!id) return null;
  return state.vehical.vehicles.find((v) => v.id === id) ?? null;
};

export const selectVehicleById = (id: string | null) => (state: RootState): Vehicle | null => {
  if (!id) return null;
  return state.vehical.vehicles.find((v) => v.id === id) ?? null;
};

export const selectVehicleModels = (state: RootState): string[] =>
  state.vehical.vehicles.map((v) => String(v.model)).filter((m) => m.length > 0);
