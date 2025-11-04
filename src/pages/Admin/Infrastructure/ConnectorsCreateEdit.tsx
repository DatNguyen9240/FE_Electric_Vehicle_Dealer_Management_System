import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type ConnectorPayload = { stationId: string; chargerId: string; type: string; powerKw: number; status: string; code: string };

const ConnectorsCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { connectorId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(connectorId);

  type Station = { _id: string; name?: string; code?: string };
  type Charger = { _id: string; stationId?: string; name?: string; code?: string };

  const [stations, setStations] = React.useState<Station[]>([]);
  const [chargers, setChargers] = React.useState<Charger[]>([]);
  const [form, setForm] = React.useState<ConnectorPayload>({ stationId: "", chargerId: "", type: "AC", powerKw: 7.2, status: "IDLE", code: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle(isEdit ? "Sửa đầu sạc" : "Thêm đầu sạc"); }, [isEdit, setTitle]);

  const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

  const getErrorMessage = (e: unknown) => {
    try {
      const ae = e as { response?: { data?: { message?: string } }; message?: string };
      return ae?.response?.data?.message || ae?.message || "Không tải được dữ liệu";
    } catch {
      return "Không tải được dữ liệu";
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const [s, ch] = await Promise.all([
          api.get("/stations", { params: { limit: 1000 } }),
          api.get("/chargers", { params: { limit: 1000 } }),
        ]);
        const sd: unknown = s.data;
        const cd: unknown = ch.data;
        const sl = (Array.isArray(sd) ? sd : (asRecord(sd)?.items ?? asRecord(sd)?.data ?? [])) as Station[];
        const cl = (Array.isArray(cd) ? cd : (asRecord(cd)?.items ?? asRecord(cd)?.data ?? [])) as Charger[];
        setStations(sl);
        setChargers(cl);
        // set defaults using functional updates to avoid reading `form` from closure
        if (sl[0]?._id) setForm((f) => (f.stationId ? f : { ...f, stationId: sl[0]._id }));
        if (cl[0]?._id) setForm((f) => (f.chargerId ? f : { ...f, chargerId: cl[0]._id }));
      } catch (err: unknown) {
        console.error("Failed to load stations/chargers", err);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const r = await api.get(`/connectors/${connectorId}`);
        const c: unknown = r.data;
        if (c && typeof c === "object") {
          const o = c as Record<string, unknown>;
          setForm({
            stationId: (o["stationId"] as string) || "",
            chargerId: (o["chargerId"] as string) || "",
            type: (o["type"] as string) || "AC",
            powerKw: typeof o["powerKw"] === "number" ? (o["powerKw"] as number) : Number(o["powerKw"] ?? 7.2),
            status: (o["status"] as string) || "IDLE",
            code: (o["code"] as string) || "",
          });
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Không tải được đầu sạc");
      } finally { setLoading(false); }
    })();
  }, [isEdit, connectorId]);

  const submit = async () => {
    try {
      setLoading(true); setError(null);
      if (isEdit) await api.put(`/connectors/${connectorId}`, form);
      else await api.post(`/connectors`, form);
      navigate("/admin/infrastructure/connectors");
  } catch (err: unknown) { setError(getErrorMessage(err) || "Lỗi lưu đầu sạc"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border max-w-2xl">
        <div className="px-6 py-4 border-b font-semibold">{isEdit ? "Sửa đầu sạc" : "Thêm đầu sạc"}</div>
        <div className="p-6 grid grid-cols-1 gap-4">
          <label className="text-sm">
            <span className="text-gray-600">Trạm</span>
            <select value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              {stations.map((s) => (<option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Trụ</span>
            <select value={form.chargerId} onChange={(e) => setForm({ ...form, chargerId: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              {chargers.map((ch) => (<option key={ch._id} value={ch._id}>{ch.name || ch.code || ch._id}</option>))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-gray-600">Loại</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
                <option value="AC">AC</option>
                <option value="DC">DC</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-gray-600">Công suất (kW)</span>
              <input type="number" value={form.powerKw} onChange={(e) => setForm({ ...form, powerKw: Number(e.target.value) })} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
          </div>
          <label className="text-sm">
            <span className="text-gray-600">Mã</span>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Trạng thái</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              <option value="IDLE">IDLE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="FINISHED">FINISHED</option>
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

export default ConnectorsCreateEdit;


