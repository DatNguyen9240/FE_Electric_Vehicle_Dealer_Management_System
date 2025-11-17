import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/Ui/Button";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@redux/store/store";
import { createVehicleThunk, fetchVehiclesThunk } from "@redux/slice/Vehical/VehicalThunk";
import { setSelectedVehicle } from "@redux/slice/Vehical/VehicalSlice";

export default function NewVehicle() {
  const [model, setModel] = useState("");
  const PLUG_TYPES = ["CCS2", "CHAdeMO", "AC_Type2", "GB/T", "Other"];
  const [plugType, setPlugType] = useState<string>(PLUG_TYPES[0]);
  const [make, setMake] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [batteryKwh, setBatteryKwh] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // validate and coerce batteryKwh
      const battery = Number(batteryKwh);
      if (Number.isNaN(battery) || battery <= 0) {
        throw new Error("Battery (kWh) must be a positive number");
      }

      const payload = {
        licensePlate: licensePlate.trim() || undefined,
        make: make.trim() || undefined,
        model: model.trim(),
        plugType: plugType.trim(),
        batteryKwh: battery,
        isDefault,
      };

      const res = await dispatch(createVehicleThunk(payload)).unwrap();
      // refresh vehicles and set selected vehicle to the created one
      try {
        await dispatch(fetchVehiclesThunk());
        const createdId = res?.vehicle?.id;
        if (createdId) dispatch(setSelectedVehicle(createdId));
      } catch {
        // Do nothing
      }

      toast.success("Đăng ký xe thành công");
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ||
        (err as Error).message ||
        "Error registering vehicle";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Creation-only page: no edit/fetch/delete logic

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Register New Vehicle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Plug type</label>
          <select
            value={plugType}
            onChange={(e) => setPlugType(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          >
            {PLUG_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Make</label>
          <input
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Hyundai, Nissan..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">License plate</label>
          <input
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="51H-12345"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Battery (kWh)</label>
          <input
            type="number"
            value={batteryKwh}
            onChange={(e) => {
              const v = e.target.value;
              setBatteryKwh(v === "" ? "" : parseFloat(v));
            }}
            className="w-full rounded border px-3 py-2"
            min={0.1}
            step={0.1}
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Set as default vehicle</span>
          </label>

        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
