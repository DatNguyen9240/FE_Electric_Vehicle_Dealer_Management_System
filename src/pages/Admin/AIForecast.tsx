import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@libs/axios";
import { getCookie } from "@libs/utils";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

const periods = [
  { value: "3m", label: "3 tháng" },
  { value: "6m", label: "6 tháng" },
  { value: "1y", label: "1 năm" },
];

const AIForecast: React.FC = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Array<any>>([]);
  const [stationId, setStationId] = useState<string | "">("");
  const [period, setPeriod] = useState<string>("3m");
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = getCookie("user");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(decodeURIComponent(raw));
      if (!user || (user.role !== "admin" && user.role !== "staff")) {
        setError("Bạn không có quyền truy cập trang này.");
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    async function loadStations() {
      setLoadingStations(true);
      try {
        const res = await api.get("/stations");
        setStations(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStations(false);
      }
    }
    loadStations();
  }, []);

  const fetchAI = async () => {
    setError(null);
    setLoadingAI(true);
    setData(null);
    try {
      const params = { stationId: stationId || null, period };
      const res = await api.get(`/ai/forecast/infrastructure`, { params });
      const payload = res.data?.data ?? res.data;

      const summary = payload?.summary;
      const raw = payload?.rawDataSample ?? [];
      const aiInsight = payload?.aiInsight ?? {};
      const forecast = aiInsight?.forecast ?? payload?.forecast;
      const recommendations = aiInsight?.recommendations ?? payload?.recommendations;
      const analysis = aiInsight?.analysis ?? payload?.analysis;

      const months = raw.map((r: any) => r.month);
      const sessions = raw.map((r: any) => r.sessionsCount ?? 0);
      const energy = raw.map((r: any) => r.totalEnergyKwh ?? 0);

      const normalized: any = {
        summary: {
          sessions: summary?.totalSessions ?? "-",
          energy: summary?.totalKwh ?? "-",
          stationsAnalyzed: summary?.stationsAnalyzed ?? "-",
        },
        monthly: { months, sessions, energy },
        analysis,
        forecast,
        recommendations,
        raw,
      };

      setData(normalized);
    } catch (err) {
      console.error(err);
      setError("Không thể lấy dữ liệu AI. Hãy thử lại sau.");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (!stationId || loadingStations) return;
    fetchAI();
  }, [stationId, period, loadingStations]);

  // currently selected station object (may be undefined)
  const selectedStation = stations.find((s) => s._id === stationId);

  const lineChartData = useMemo(() => {
    if (!data?.monthly) return null;
    return {
      labels: data.monthly.months,
      datasets: [
        {
          label: "Số phiên",
          data: data.monthly.sessions,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.2)",
          tension: 0.3,
        },
        {
          label: "Năng lượng (kWh)",
          data: data.monthly.energy,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [data]);

  const barChartData = useMemo(() => {
    if (!data?.forecast?.next_3_months?.peak_hours) return null;
    const peak = data.forecast.next_3_months.peak_hours;
    if (typeof peak === "string") return null;
    const labels = Object.keys(peak);
    const values = labels.map((l) => peak[l]);
    return {
      labels,
      datasets: [
        {
          label: "Dự báo giờ cao điểm (số phiên)",
          data: values,
          backgroundColor: "#f97316",
        },
      ],
    };
  }, [data]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">AI Dự báo & Nâng cấp Hạ tầng</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="border rounded px-3 py-2"
            disabled={loadingStations}
          >
            {loadingStations ? (
              <option>Đang tải...</option>
            ) : (
              <>
                <option value="">-- Chọn trạm --</option>
                {stations.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name || s.title || s._id}
                  </option>
                ))}
              </>
            )}
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAI}
            disabled={!stationId || loadingAI}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loadingAI ? "Đang phân tích..." : "Làm mới dữ liệu"}
          </button>
        </div>
      </div>

      {/* Danh sách trạm */}
      <div>
        <h3 className="text-lg font-medium mb-2">Danh sách trạm</h3>
        {loadingStations ? (
          <div>Đang tải danh sách...</div>
        ) : stations.length === 0 ? (
          <div>Không có trạm nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stations.map((s) => (
              <button
                key={s._id}
                onClick={() => setStationId(s._id)}
                className={`text-left p-4 bg-white rounded shadow hover:shadow-md transition ${
                  stationId === s._id ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{s.name}</div>
                  <div className={`text-sm px-2 py-1 rounded ${s.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{s.status}</div>
                </div>
                <div className="text-sm text-gray-600">Lat: {s.lat ?? (s.location?.coordinates?.[1]) ?? '-'}, Lng: {s.lng ?? (s.location?.coordinates?.[0]) ?? '-'}</div>
                <div className="text-xs text-gray-500 mt-1">Tạo: {s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</div>
                <div className="text-xs text-gray-500">Cập nhật: {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '-'}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading / no data */}
      {loadingAI && <div>Đang gọi AI, vui lòng chờ...</div>}
      {!loadingAI && !data && <div>Chưa có dữ liệu để hiển thị.</div>}

      {/* Kết quả */}
      {data && (
        <>
          {/* Tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded shadow col-span-full md:col-span-4">
              <div className="text-sm text-gray-500">Trạm đang phân tích</div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="text-lg font-semibold">{selectedStation?.name ?? "—"}</div>
                  <div className="text-sm text-gray-600">ID: {selectedStation?._id ?? "—"}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-sm px-2 py-1 rounded ${selectedStation?.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {selectedStation?.status ?? "—"}
                  </div>
                  <div className="text-sm text-gray-600">Lat: {selectedStation?.lat ?? "—"}, Lng: {selectedStation?.lng ?? "—"}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">Tạo: {selectedStation?.createdAt ? new Date(selectedStation.createdAt).toLocaleString() : '—'} — Cập nhật: {selectedStation?.updatedAt ? new Date(selectedStation.updatedAt).toLocaleString() : '—'}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Tổng phiên sạc</div>
              <div className="text-2xl font-semibold">{data.summary.sessions}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Tổng năng lượng (kWh)</div>
              <div className="text-2xl font-semibold">{data.summary.energy}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Số trạm phân tích</div>
              <div className="text-2xl font-semibold">{data.summary.stationsAnalyzed}</div>
            </div>
          </div>

          {/* Biểu đồ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium mb-2">Xu hướng số phiên & năng lượng</h3>
              {lineChartData ? <Line data={lineChartData} /> : "Không có dữ liệu"}
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium mb-2">Giờ cao điểm dự báo</h3>
              {barChartData ? (
                <Bar data={barChartData} />
              ) : (
                <div className="text-gray-600">
                  {typeof data?.forecast?.next_3_months?.peak_hours === "string"
                    ? data.forecast.next_3_months.peak_hours
                    : "Không có dữ liệu giờ cao điểm."}
                </div>
              )}
            </div>
          </div>

          {/* Phân tích và dự báo */}
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-medium mb-2">AI Insight</h3>
            {data.analysis && <p className="text-gray-700 mb-3">{data.analysis}</p>}

            {data.forecast?.next_3_months && (() => {
              const f = data.forecast.next_3_months;
              return (
                <div className="mb-3">
                  <strong>Dự báo 3 tháng tới:</strong>
                  <div>Số phiên: {f.estimated_sessions}</div>
                  <div>Năng lượng: {f.estimated_kwh} kWh</div>
                  <div>
                    Giờ cao điểm:{" "}
                    {typeof f.peak_hours === "string"
                      ? f.peak_hours
                      : Array.isArray(f.peak_hours)
                      ? f.peak_hours.join(", ")
                      : "Không xác định"}
                  </div>
                </div>
              );
            })()}

            {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
              <div>
                <strong>Gợi ý nâng cấp:</strong>
                <ul className="list-disc ml-5 mt-2 text-gray-700">
                  {data.recommendations.map((r: any, i: number) => (
                    <li key={i} className="py-1">
                      {typeof r === "string" ? r : r.reason ?? JSON.stringify(r)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Dữ liệu gốc */}
          {data.raw && data.raw.length > 0 && (
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium mb-2">Dữ liệu gốc</h3>
              <table className="w-full text-sm text-gray-700 border">
                <thead className="border-b font-semibold">
                  <tr>
                    <th className="text-left p-2">Tháng</th>
                    <th className="text-left p-2">Số phiên</th>
                    <th className="text-left p-2">Năng lượng (kWh)</th>
                    <th className="text-left p-2">Thời gian TB (phút)</th>
                    <th className="text-left p-2">Loại cổng</th>
                  </tr>
                </thead>
                <tbody>
                  {data.raw.map((r: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{r.month}</td>
                      <td className="p-2">{r.sessionsCount}</td>
                      <td className="p-2">{r.totalEnergyKwh}</td>
                      <td className="p-2">{r.avgChargingMinutes}</td>
                      <td className="p-2">{r.connectorType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIForecast;
