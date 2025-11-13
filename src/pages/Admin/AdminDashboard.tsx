import React from "react";
import { ChartSection, TableSection } from "@components/Sections/Admin";
import { useTitle } from "../../contexts";
import api from "../../libs/axios";
import { toast } from "react-toastify";

type RangeKey = "1d" | "7d" | "1m" | "3m" | "6m" | "12m";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "1d", label: "1 day" },
  { key: "7d", label: "7 days" },
  { key: "1m", label: "1 month" },
  { key: "3m", label: "3 months" },
  { key: "6m", label: "6 months" },
  { key: "12m", label: "12 months" },
];

type Station = {
  _id: string;
  name: string;
  status?: string;
};

const AdminDashboard: React.FC = () => {
  const { setTitle } = useTitle();
  const [loading, setLoading] = React.useState(false);
  const [overview, setOverview] = React.useState<any>(null);
  const [range, setRange] = React.useState<RangeKey>("3m");
  const [stations, setStations] = React.useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = React.useState<string>("all");
  const [loadingStations, setLoadingStations] = React.useState(false);

  React.useEffect(() => {
    setTitle("Admin Dashboard");
  }, [setTitle]);

  // Fetch danh sách stations
  React.useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const res = await api.get("/stations", { params: { limit: 1000 } });
        const stationsData = Array.isArray(res.data) 
          ? res.data 
          : (res.data?.stations || []);
        setStations(stationsData);
      } catch (err: unknown) {
        console.error("Error fetching stations:", err);
        toast.error("Unable to load stations list");
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStations();
  }, []);

  const fetchOverview = React.useCallback(
    async (selectedRange: RangeKey, stationId: string) => {
      try {
        setLoading(true);
        const params: Record<string, string> = { range: selectedRange };
        if (stationId && stationId !== "all") {
          params.stationId = stationId;
        }
        const res = await api.get("/analytics/admin/overview", { params });
        setOverview(res.data);
      } catch (err: unknown) {
        console.error(err);
        toast.error("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchOverview(range, selectedStationId);
  }, [fetchOverview, range, selectedStationId]);

  const currencyCode =
    overview?.revenue?.currency ||
    overview?.revenue?.lifetime?.currency ||
    "VND";

  const formatCurrency = (amount: number | undefined | null) => {
    const value = Number(amount ?? 0);
    if (!Number.isFinite(value)) return "0";
    try {
      if (currencyCode === "VND") {
        return new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      }).format(value);
    } catch {
      return `${value.toLocaleString("vi-VN")} ${currencyCode}`;
    }
  };

  const formatNumber = (value: number | undefined | null) =>
    Number(value ?? 0).toLocaleString("vi-VN");

  const computeChange = (points?: { total: number }[]) => {
    if (!points || points.length < 2) return null;
    const current = Number(points[points.length - 1]?.total ?? 0);
    const prev = Number(points[points.length - 2]?.total ?? 0);
    if (!Number.isFinite(current) || !Number.isFinite(prev) || prev === 0)
      return null;
    const diff = ((current - prev) / prev) * 100;
    return {
      diff,
      text: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`,
      isUp: diff >= 0,
    };
  };

  const rangeInfo = overview?.range;
  const rangeLabel = React.useMemo(() => {
    if (!rangeInfo) return undefined;
    const fromDate = rangeInfo.from ? new Date(rangeInfo.from) : null;
    const toExclusive = rangeInfo.to ? new Date(rangeInfo.to) : null;
    let toDisplay: Date | null = null;
    if (toExclusive) {
      toDisplay = new Date(toExclusive);
      toDisplay.setDate(toDisplay.getDate() - 1);
    }
    const fromStr = fromDate
      ? fromDate.toLocaleDateString("vi-VN")
      : undefined;
    const toStr = toDisplay ? toDisplay.toLocaleDateString("vi-VN") : undefined;
    if (fromStr && toStr && fromStr !== toStr) {
      return `${fromStr} → ${toStr}`;
    }
    return fromStr || toStr || undefined;
  }, [rangeInfo]);

  const revenueSeriesPoints = overview?.revenue?.series?.points || [];
  const revenueChange = computeChange(revenueSeriesPoints);

  const totals = overview?.totals || {};
  const chargingSelected = overview?.charging?.selectedRange || {};
  const feedback = overview?.feedback || {};

  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    subtitleClassName?: string;
  }> = ({ title, value, subtitle, subtitleClassName }) => (
    <div className="bg-white rounded-xl border p-6 flex flex-col h-35 relative">
      <span className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide leading-tight">
        {title}
      </span>
      <span className="text-5xl font-bold text-black ps-3">
        {loading ? "..." : typeof value === "number" ? formatNumber(value) : value}
      </span>
      {subtitle && (
        <span
          className={`text-sm font-medium absolute bottom-3 right-3 ${subtitleClassName ?? "text-green-600"
            }`}
        >
          {loading ? "" : subtitle}
        </span>
      )}
    </div>
  );

  // Lấy danh sách stations để hiển thị trong bảng (khi station = "all")
  const stationsToDisplay = React.useMemo(() => {
    if (selectedStationId && selectedStationId !== "all") {
      return null; // Không hiển thị bảng khi filter theo station cụ thể
    }
    const topStations = overview?.charging?.topStationsInRange || [];
    // Sắp xếp theo revenue giảm dần (BE đã sort rồi nhưng đảm bảo)
    return [...topStations].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  }, [overview, selectedStationId]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Overview</h1>
          {rangeLabel && (
            <p className="text-sm text-gray-500">
              Data in range: {rangeLabel}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Station Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Station:
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              disabled={loadingStations}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[200px]"
            >
              <option value="all">All stations</option>
              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.name || `Station ${station._id}`}
                </option>
              ))}
            </select>
          </div>
          {/* Range Filter */}
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  range === opt.key
                    ? "border-blue-500 text-blue-600 bg-blue-50 font-medium"
                    : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="USERS"
          value={totals?.users?.total ?? 0}
          subtitle={`+${formatNumber(totals?.users?.newInRange ?? 0)} `}
        />
        <MetricCard
          title="BOOKINGS"
          value={totals?.bookings?.total ?? 0}
          subtitle={`Upcoming: ${formatNumber(
            totals?.bookings?.upcoming ?? 0
          )}`}
        />
        <MetricCard
          title="STATIONS"
          value={totals?.stations?.total ?? 0}
          subtitle={`Online: ${formatNumber(
            totals?.stations?.byStatus?.ONLINE ?? 0
          )}`}
        />
        <MetricCard
          title="CONNECTORS"
          value={totals?.connectors?.total ?? 0}
          subtitle={`Power: ${formatNumber(
            totals?.connectors?.totalPowerKw ?? 0
          )} kW`}
        />
        <MetricCard
          title="CHARGING"
          value={chargingSelected.sessions ?? 0}
          subtitle={`${Number(chargingSelected.energyKwh ?? 0).toFixed(1)} kWh`}
        />
        <MetricCard
          title="FEEDBACK"
          value={feedback.total ?? 0}
          subtitle={`⭐ ${Number(feedback.averageRating ?? 0).toFixed(2)}`}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="bg-white rounded-xl border p-6 flex flex-col w-full lg:w-80 h-40">
          <span className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
            Total Revenue
          </span>
          <span className="text-4xl font-bold text-blue-600 ps-2">
            {loading ? "..." : formatCurrency(overview?.revenue?.lifetime?.total)}
          </span>
          <span className="text-xs text-green-600 mt-4 text-right">Compared to previous period</span>
          <span className="text-sm font-medium mt-1 text-right">
            {loading ? (
              ""
            ) : revenueChange ? (
              <span
                className={revenueChange.isUp ? "text-green-600" : "text-red-600"}
              >
                {revenueChange.text} {revenueChange.isUp ? "↑" : "↓"}
              </span>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </span>
        </div>
        <div className="flex-1 bg-white rounded-xl border p-6 flex flex-col">
          <ChartSection
            revenueSeries={overview?.revenue?.series}
            loading={loading}
            rangeLabel={rangeLabel}
          />
        </div>
      </div>

      {/* Chỉ hiển thị bảng khi station = "all" */}
      {stationsToDisplay !== null && (
        <TableSection
          stations={stationsToDisplay}
          currency={currencyCode}
          loading={loading}
          title="All stations by revenue"
        />
      )}
    </div>
  );
};

export default AdminDashboard;

