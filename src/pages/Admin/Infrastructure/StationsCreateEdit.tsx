import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type StationPayload = { name: string; lat: number; lng: number; status: string };

const StationsCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { stationId } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(stationId);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<StationPayload>({ name: "", lat: 0, lng: 0, status: "ONLINE" });

  React.useEffect(() => {
    setTitle(isEdit ? "Sửa trạm" : "Tạo trạm");
  }, [isEdit, setTitle]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const res = await api.get(`/stations/${stationId}`);
        if (!mounted) return;
        const s = res.data;
        setForm({ name: s.name, lat: s.lat, lng: s.lng, status: s.status });
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Không tải được trạm");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isEdit, stationId]);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isEdit) await api.put(`/stations/${stationId}`, form);
      else await api.post(`/stations`, form);
      navigate("/admin/infrastructure/stations");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Lỗi lưu trạm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border max-w-2xl">
        <div className="px-6 py-4 border-b font-semibold">{isEdit ? "Sửa trạm" : "Tạo trạm"}</div>
        <div className="p-6 grid grid-cols-1 gap-4">
          <label className="text-sm">
            <span className="text-gray-600">Tên</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-gray-600">Lat</span>
              <input type="number" value={form.lat} onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="text-gray-600">Lng</span>
              <input type="number" value={form.lng} onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
          </div>
          <label className="text-sm">
            <span className="text-gray-600">Trạng thái</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </label>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {loading && <div className="text-gray-500 text-sm">Đang xử lý...</div>}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded">Huỷ</button>
          <button onClick={submit} className="px-3 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
        </div>
      </div>
    </div>
  );
};

export default StationsCreateEdit;


