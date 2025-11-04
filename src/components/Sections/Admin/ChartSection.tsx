import React from "react";
import api from "../../../libs/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



const ChartSection: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<unknown | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/analytics/admin/overview");
        if (mounted) setData(res.data as unknown);
      } catch (err) {
        // keep a console trace for debugging without failing the UI
        console.error("Failed to load admin overview:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // old KPI variables removed for classic layout

  const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

  const currency = (() => {
    const d = asRecord(data);
    const rev = d && asRecord(d["revenue"]);
    const c = rev && rev["currency"];
    return typeof c === "string" ? c : "VND";
  })();

  const chartData: { name: string; value: number }[] = (() => {
    const d = asRecord(data);
    const rev = d && asRecord(d["revenue"]);
    const monthly = rev ? rev["monthly"] : null;
    if (!Array.isArray(monthly)) return [];
    return (monthly as unknown[]).map((m) => {
      const item = asRecord(m) || {};
      const name = typeof item["month"] === "string" ? (item["month"] as string) : String(item["month"] ?? "");
      const value = typeof item["total"] === "number" ? (item["total"] as number) : Number(item["total"] ?? 0);
      return { name, value };
    });
  })();
  const [range, setRange] = React.useState<'3M' | '6M'>('6M');
  const displayedChartData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    if (range === '3M') return chartData.slice(-3);
    return chartData.slice(-6);
  }, [chartData, range]);

  // currency for formatting revenue
  const formatCurrency = (amount: number) => {
    if (!Number.isFinite(amount)) return "0";
    return new Intl.NumberFormat("vi-VN").format(amount) + (currency === "VND" ? " VNĐ" : "");
  };

  const totalUsers = (() => {
    const d = asRecord(data);
    const totals = d && asRecord(d["totals"]);
    const users = totals && asRecord(totals["users"]);
    const v = users ? users["total"] : undefined;
    return typeof v === "number" ? v : Number(v ?? 0);
  })();
  const newUsers30 = (() => {
    const d = asRecord(data);
    const totals = d && asRecord(d["totals"]);
    const users = totals && asRecord(totals["users"]);
    const v = users ? users["newLast30Days"] : undefined;
    return typeof v === "number" ? v : Number(v ?? 0);
  })();
  // sub-status values not displayed in compact card

  const bookingsTotal = (() => {
    const d = asRecord(data);
    const totals = d && asRecord(d["totals"]);
    const bookings = totals && asRecord(totals["bookings"]);
    const v = bookings ? bookings["total"] : undefined;
    return typeof v === "number" ? v : Number(v ?? 0);
  })();
  // status breakdown not displayed in compact card
  const sessions30Days = (() => {
    const d = asRecord(data);
    const charging = d && asRecord(d["charging"]);
    const last30 = charging && asRecord(charging["last30Days"]);
    const v = last30 ? last30["sessions"] : undefined;
    return typeof v === "number" ? v : Number(v ?? 0);
  })();
  const totalFee30 = (() => {
    const d = asRecord(data);
    const rev = d && asRecord(d["revenue"]);
    const last30 = rev && asRecord(rev["last30Days"]);
    const v = last30 ? last30["total"] : undefined;
    return typeof v === "number" ? v : Number(v ?? 0);
  })();

  return (
    <div className="flex gap-6 p-4">
      {/* Left column */}
      <div className="flex flex-col gap-4 w-80">
        <div className="flex gap-4">
          {/* Card 1 - Users */}
          <div className="w-1/2 bg-white rounded-xl border p-6 flex flex-col h-35 relative">
            <span className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide leading-tight">
              USERS
            </span>
            <span className="text-5xl font-bold text-black ps-5">{loading ? "..." : totalUsers.toLocaleString("vi-VN")}</span>
            <span className="text-sm text-green-500 font-medium absolute bottom-3 right-3">{loading ? "" : `+${newUsers30.toLocaleString("vi-VN")} ↑`}</span>
          </div>
          {/* Card 2 - Bookings */}
          <div className="w-1/2 bg-white rounded-xl border p-6 flex flex-col h-35 relative">
            <span className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide leading-tight">BOOKINGS</span>
            <span className="text-5xl font-bold text-black pt-1">
              {loading ? "..." : bookingsTotal.toLocaleString("vi-VN")}
            </span>
            <span className="text-sm text-green-500 font-medium absolute bottom-3 right-3">{loading ? "" : `+${sessions30Days.toLocaleString("vi-VN")} ↑`}</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-xl border p-6 flex flex-col h-35 relative">
          <span className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">TOTAL FEE</span>
          <span className="text-4xl font-bold text-blue-600 ps-6">{loading ? "..." : formatCurrency(totalFee30)}</span>
          <span className="text-sm font-medium absolute bottom-4 right-4">
            {(() => {
              const d = asRecord(data);
              const rev = d && asRecord(d["revenue"]);
              const monthly = Array.isArray(rev?.["monthly"] as unknown) ? (rev?.["monthly"] as unknown[]) : [];
              const len = monthly.length;
              const prevItem = len >= 2 ? asRecord(monthly[len - 2]) : null;
              const prev = prevItem && typeof prevItem["total"] === "number" ? (prevItem["total"] as number) : Number(prevItem?.["total"] ?? 0);
              if (prev == null || prev === 0 || !Number.isFinite(prev)) return <span className="text-gray-400">—</span>;
              const diff = ((totalFee30 - prev) / prev) * 100;
              const isUp = diff >= 0;
              const cls = isUp ? "text-green-500" : "text-red-500";
              const sign = isUp ? "+" : "";
              return <span className={cls}>{`${sign}${diff.toFixed(1)}%`} ↑</span>;
            })()}
          </span>
        </div>
      </div>
      {/* Right column - Chart */}
      <div className="flex-1 bg-white rounded-xl border p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-lg">Charger Report</span>
          <div className="flex gap-2">
            <button
              onClick={() => setRange('6M')}
              className={`px-3 py-1 rounded border bg-gray-100 font-medium text-sm shadow-sm ${range === '6M' ? 'border-blue-500 text-blue-600 bg-blue-50' : ''}`}
            >
              6 Months
            </button>
            <button
              onClick={() => setRange('3M')}
              className={`px-3 py-1 rounded border bg-gray-100 font-medium text-sm shadow-sm ${range === '3M' ? 'border-blue-500 text-blue-600 bg-blue-50' : ''}`}
            >
              3 Months
            </button>
          </div>
        </div>
        {/* Chart with recharts */}
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={displayedChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}>
                </Line>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
