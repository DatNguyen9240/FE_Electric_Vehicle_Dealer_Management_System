import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/Ui/Button";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@redux/store/store";
import {
  createVehicleThunk,
  fetchVehiclesThunk,
} from "@redux/slice/Vehical/VehicalThunk";
import { setSelectedVehicle } from "@redux/slice/Vehical/VehicalSlice";
import { ArrowLeft } from "lucide-react";

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

      toast.success("Vehicle registered successfully");
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
    <div className="px-6 py-10">
      <div className=" mx-20 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={16} />
          Back to home
        </button>

        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-3">
          <p className="text-sm uppercase text-gray-500 tracking-wide">Your garage</p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Register a new EV
          </h1>
          <p className="text-sm text-gray-500">
            Add your vehicle details to book charging sessions faster and keep track of usage.
          </p>
        </div>

        <div className=" gap-6">
          <form
            onSubmit={handleSubmit}
            className=" bg-white rounded-2xl border p-6 shadow-sm space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VinFast VF8, Tesla Model 3..."
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plug type
                </label>
                <select
                  value={plugType}
                  onChange={(e) => setPlugType(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {PLUG_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Battery (kWh) <span className="text-red-500">*</span>
                  </label>
                <input
                  type="number"
                  value={batteryKwh}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBatteryKwh(v === "" ? "" : parseFloat(v));
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={0.1}
                  step={0.1}
                  placeholder="75"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make / Brand
                  </label>
                <input
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hyundai, Nissan..."
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License plate
                  </label>
                <input
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="51H-12345"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {error}
              </div>
            )}

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Set as default vehicle
            </label>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={loading} className="px-6 bg-blue-600 text-white">
                {loading ? "Saving..." : "Register vehicle"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/wallet")}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </form>

          
        </div>
      </div>
    </div>
  );
}
