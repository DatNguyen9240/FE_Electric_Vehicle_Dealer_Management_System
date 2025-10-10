import React, { useEffect, useRef, useState } from "react";
import type { Vehicle } from "@redux/slice/Vehical/VehicalSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@redux/store/store";
import { updateVehicleThunk } from "@redux/slice/Vehical/VehicalThunk";
import { Button } from "@components/Ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
}

const VehicleEditModal: React.FC<Props> = ({ open, onClose, vehicle }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [model, setModel] = useState("");
  const [make, setMake] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [plugType, setPlugType] = useState("");
  const [batteryKwh, setBatteryKwh] = useState<number | "">("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    if (vehicle) {
      setModel(vehicle.model ?? "");
      setMake(vehicle.make ?? "");
      setLicensePlate(vehicle.licensePlate ?? "");
      setPlugType(vehicle.plugType ?? "");
      setBatteryKwh(vehicle.batteryKwh ?? "");
      setIsDefault(Boolean(vehicle.isDefault));
    }
  }, [vehicle, open]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    const battery = Number(batteryKwh);
    if (Number.isNaN(battery) || battery <= 0) return; // simple guard
    setLoading(true);
    try {
      const data = {
        licensePlate: licensePlate.trim() || undefined,
        make: make.trim() || undefined,
        model: model.trim(),
        plugType: plugType.trim(),
        batteryKwh: battery,
        isDefault,
      };
      await dispatch(updateVehicleThunk({ id: vehicle.id, data })).unwrap();
      onClose();
    } catch (err) {
      // ignore here; could show toast
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2" onClick={handleOverlayClick}>
      <div ref={modalRef} className="bg-white rounded-2xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-4 text-xl" onClick={onClose}>×</button>
        <h2 className="text-lg font-semibold mb-4">Edit vehicle</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Model</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Make</label>
            <input value={make} onChange={(e) => setMake(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">License plate</label>
            <input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Plug type</label>
            <input value={plugType} onChange={(e) => setPlugType(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Battery (kWh)</label>
            <input type="number" value={batteryKwh} onChange={(e) => setBatteryKwh(e.target.value === "" ? "" : parseFloat(e.target.value))} className="w-full rounded border px-3 py-2" min={0.1} step={0.1} required />
          </div>
          <div className="flex items-center gap-2">
            <input id="editIsDefault" type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            <label htmlFor="editIsDefault" className="text-sm">Set as default</label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEditModal;
