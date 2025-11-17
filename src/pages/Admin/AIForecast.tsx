import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { useTitle } from "../../contexts";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

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
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "1y", label: "1 year" },
];

type Station = {
  _id: string;
  name?: string;
  lat?: number;
  lng?: number;
  location?: { type?: string; coordinates?: number[] };
  title?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type RawSampleItem = {
  month?: string;
  sessionsCount?: number;
  sessions?: number;
  kwh?: number;
  totalEnergyKwh?: number;
  avgChargingMinutes?: number;
  connectorType?: string;
  stationId?: string;
  stationName?: string;
};

type PeakHours = Record<string, number> | string | string[];

type Forecast = {
  next_3_months?: {
    estimated_sessions?: number;
    estimated_kwh?: number;
    peak_hours?: PeakHours;
  };
} & Record<string, unknown>;

type NormalizedData = {
  summary?: { sessions?: number | string; energy?: number | string; stationsAnalyzed?: number | string };
  monthly?: { months: string[]; sessions: number[]; energy: number[] };
  analysis?: string;
  forecast?: Forecast;
  recommendations?: Array<string | Record<string, unknown> | string>;
  raw?: RawSampleItem[];
  peakHours?: PeakHours;
  insights?: string;
};

const statusBadgeClass = (status?: string) => {
  const normalized = String(status || "").toUpperCase();
  switch (normalized) {
    case "ONLINE":
      return "bg-green-100 text-green-700";
    case "OFFLINE":
      return "bg-red-100 text-red-600";
    case "MAINTENANCE":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const AIForecast: React.FC = () => {
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const [stations, setStations] = useState<Station[]>([]);
  const [stationId, setStationId] = useState<string | "">("");
  const [period, setPeriod] = useState<string>("3m");
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [data, setData] = useState<NormalizedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("AI Forecast");
  }, [setTitle]);

  useEffect(() => {
    const raw = getCookie("user");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(decodeURIComponent(raw));
      if (!user || (user.role !== "admin" && user.role !== "staff")) {
        setError("You do not have permission to access this page.");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    async function loadStations() {
      setLoadingStations(true);
      try {
        const res = await api.get("/stations");
        setStations((res.data || []) as Station[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStations(false);
      }
    }
    loadStations();
  }, []);

  const fetchAI = useCallback(async () => {
    if (!stationId) {
      setError("Please choose a station to start the forecast.");
      return;
    }
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

      const months = raw.map((r: RawSampleItem) => r.month ?? "");
      const sessions = raw.map((r: RawSampleItem) => r.sessionsCount ?? 0);
      const energy = raw.map((r: RawSampleItem) => r.totalEnergyKwh ?? 0);

      const normalized: NormalizedData = {
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
      setError("Unable to fetch AI data. Please try again later.");
    } finally {
      setLoadingAI(false);
    }
  }, [stationId, period]);

  useEffect(() => {
    if (!stationId || loadingStations) return;
    fetchAI();
  }, [stationId, period, loadingStations, fetchAI]);

  const lineChartData = useMemo(() => {
    if (!data?.monthly) return null;
    return {
      labels: data.monthly.months,
      datasets: [
        {
          label: "Sessions",
          data: data.monthly.sessions,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.2)",
          tension: 0.3,
        },
        {
          label: "Energy (kWh)",
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
    if (Array.isArray(peak)) return null; // array of labels only - no numeric values for chart
    const peakRecord = peak as Record<string, number>;
    const labels = Object.keys(peakRecord);
    const values = labels.map((l) => peakRecord[l] ?? 0);
    return {
      labels,
      datasets: [
        {
          label: "Forecasted peak hours (sessions)",
          data: values,
          backgroundColor: "#f97316",
        },
      ],
    };
  }, [data]);

  const renderErrorBanner = () => {
    if (!error) return null;
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
        <AlertTriangle size={16} />
        {error}
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!data) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border px-5 py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sessions</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{data.summary?.sessions ?? "-"}</p>
          <p className="text-xs text-gray-500 mt-1">Total charging sessions</p>
        </div>
        <div className="bg-white rounded-2xl border px-5 py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Energy (kWh)</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{data.summary?.energy ?? "-"}</p>
          <p className="text-xs text-gray-500 mt-1">Total energy delivered</p>
        </div>
        <div className="bg-white rounded-2xl border px-5 py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stations analyzed</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            {data.summary?.stationsAnalyzed ?? "-"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Insights across network</p>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    if (!data) return null;
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sessions & Energy Trend</h3>
              <p className="text-sm text-gray-500">Historic demand for the selected station</p>
            </div>
          </div>
          {lineChartData ? (
            <Line data={lineChartData} />
          ) : (
            <div className="text-sm text-gray-500">No trend data to visualize</div>
          )}
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Forecasted Peak Hours</h3>
              <p className="text-sm text-gray-500">Upcoming 3-month projection</p>
            </div>
          </div>
          {barChartData ? (
            <Bar data={barChartData} />
          ) : (
            <div className="text-sm text-gray-500">
              {typeof data?.forecast?.next_3_months?.peak_hours === "string"
                ? data.forecast.next_3_months.peak_hours
                : "AI did not identify peak hours for this station."}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInsight = () => {
    if (!data) return null;
    const forecast = data.forecast?.next_3_months;
    return (
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Insight</h3>
          {data.analysis ? (
            <p className="text-sm text-gray-600 mt-1">{data.analysis}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">No narrative insight provided.</p>
          )}
        </div>
        {forecast && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border px-4 py-3">
              <p className="text-xs text-gray-500 uppercase">Sessions (3m)</p>
              <p className="text-2xl font-semibold">{forecast.estimated_sessions ?? "-"}</p>
            </div>
            <div className="rounded-xl border px-4 py-3">
              <p className="text-xs text-gray-500 uppercase">Energy (kWh)</p>
              <p className="text-2xl font-semibold">{forecast.estimated_kwh ?? "-"}</p>
            </div>
            <div className="rounded-xl border px-4 py-3">
              <p className="text-xs text-gray-500 uppercase">Peak hours</p>
              <p className="text-sm font-medium">
                {typeof forecast.peak_hours === "string"
                  ? forecast.peak_hours
                  : Array.isArray(forecast.peak_hours)
                  ? forecast.peak_hours.join(", ")
                  : "—"}
              </p>
            </div>
          </div>
        )}

        {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Upgrade recommendations</p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
              {data.recommendations.map((r: string | Record<string, unknown>, i: number) => {
                if (typeof r === "string") return <li key={i}>{r}</li>;
                const rr = r as Record<string, unknown>;
                return <li key={i}>{String(rr["reason"] ?? JSON.stringify(rr))}</li>;
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderRawTable = () => {
    if (!data?.raw || data.raw.length === 0) return null;
    return (
      <div className="bg-white rounded-2xl border p-5 overflow-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw data sample</h3>
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="py-2 pr-4">Month</th>
              <th className="py-2 pr-4">Sessions</th>
              <th className="py-2 pr-4">Energy (kWh)</th>
              <th className="py-2 pr-4">Avg duration (min)</th>
              <th className="py-2 pr-4">Connector</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.raw.map((r: RawSampleItem, i: number) => (
              <tr key={i}>
                <td className="py-2 pr-4">{r.month ?? "—"}</td>
                <td className="py-2 pr-4">{r.sessionsCount ?? "—"}</td>
                <td className="py-2 pr-4">{r.totalEnergyKwh ?? "—"}</td>
                <td className="py-2 pr-4">{r.avgChargingMinutes ?? "—"}</td>
                <td className="py-2 pr-4">{r.connectorType ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Forecast</h1>
          <p className="text-sm text-gray-500">
            Predict demand and plan infrastructure upgrades with AI insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm min-w-[220px]"
            disabled={loadingStations}
          >
            {loadingStations ? (
              <option>Loading stations...</option>
            ) : (
              <>
                <option value="">Select station</option>
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
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {loadingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {renderErrorBanner()}

      <div className="bg-white rounded-2xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Stations</h2>
            <p className="text-sm text-gray-500">
              Choose a station to run AI analysis against its usage history.
            </p>
          </div>
        </div>
        {loadingStations ? (
          <div className="text-sm text-gray-500">Loading stations...</div>
        ) : stations.length === 0 ? (
          <div className="text-sm text-gray-500">No stations available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {stations.map((s) => {
              const active = stationId === s._id;
              return (
                <button
                  key={s._id}
                  onClick={() => setStationId(s._id)}
                  className={`text-left rounded-2xl border px-4 py-3 transition shadow-sm ${
                    active
                      ? "border-blue-500 shadow-blue-100 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">
                      {s.name || s.title || "Unnamed station"}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass(
                        s.status
                      )}`}
                    >
                      {s.status ?? "—"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Lat: {s.lat ?? s.location?.coordinates?.[1] ?? "—"} · Lng:{" "}
                    {s.lng ?? s.location?.coordinates?.[0] ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated: {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "—"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loadingAI && (
        <div className="bg-white rounded-2xl border p-6 text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Calling AI, please wait...
        </div>
      )}

      {!loadingAI && !data && (
        <div className="bg-white rounded-2xl border p-6 text-sm text-gray-500">
          {stationId
            ? "No AI data available for the selected station."
            : "Choose a station above to run the forecast."}
        </div>
      )}

      {data && (
        <>
          {renderSummaryCards()}
          {renderCharts()}
          {renderInsight()}
          {renderRawTable()}
        </>
      )}
    </div>
  );
};

export default AIForecast;