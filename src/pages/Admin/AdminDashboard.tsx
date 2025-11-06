import { ChartSection, TableSection } from "@components/Sections/Admin";
import React from "react";
import { useTitle } from "../../contexts";
import api from "../../libs/axios";
import { toast } from "react-toastify";

const AdminDashboard: React.FC = () => {
  const { setTitle } = useTitle();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    setTitle("Admin Dashboard");
  }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<any>("/analytics/admin/overview");
        if (mounted) setData(res.data);
      } catch (e: any) {
        if (mounted) {
          toast.error("Không thể tải dữ liệu dashboard");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (amount: number) => {
    if (!Number.isFinite(amount)) return "0";
    const currency = data?.revenue?.currency || "VND";
    return new Intl.NumberFormat("vi-VN").format(amount) + (currency === "VND" ? " VNĐ" : "");
  };

  const formatPercentage = (current: number, previous: number) => {
    if (!previous || previous === 0 || !Number.isFinite(previous)) return null;
    const diff = ((current - previous) / previous) * 100;
    return {
      value: diff,
      isUp: diff >= 0,
      text: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`
    };
  };

  // Card component
  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    subtitleColor?: string;
    valueColor?: string;
    loading?: boolean;
  }> = ({ title, value, subtitle, subtitleColor = "text-green-500", valueColor = "text-black", loading }) => (
    <div className="bg-white rounded-xl border p-6 flex flex-col h-35 relative">
      <span className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide leading-tight">
        {title}
      </span>
      <span className={`text-5xl font-bold ${valueColor} ps-5`}>
        {loading ? "..." : typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </span>
      {subtitle && (
        <span className={`text-sm font-medium absolute bottom-3 right-3 ${subtitleColor}`}>
          {loading ? "" : subtitle}
        </span>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {/* Row 1: Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Users */}
        <MetricCard
          title="USERS"
          value={data?.totals?.users?.total ?? 0}
          subtitle={`+${(data?.totals?.users?.newLast30Days ?? 0).toLocaleString("vi-VN")} ↑`}
          loading={loading}
        />

        {/* Bookings */}
        <MetricCard
          title="BOOKINGS"
          value={data?.totals?.bookings?.total ?? 0}
          subtitle={`Upcoming: ${(data?.totals?.bookings?.upcoming ?? 0).toLocaleString("vi-VN")} `}
          loading={loading}
        />

        {/* Stations */}
        <MetricCard
          title="STATIONS"
          value={data?.totals?.stations?.total ?? 0}
          subtitle={`Online: ${(data?.totals?.stations?.byStatus?.ONLINE ?? 0).toLocaleString("vi-VN")} `}
          loading={loading}
        />

        {/* Connectors */}
        <MetricCard
          title="CONNECTORS"
          value={data?.totals?.connectors?.total ?? 0}
          subtitle={`Power: ${(data?.totals?.connectors?.totalPowerKw)} kW `}
          loading={loading}
        />

        {/* Charging 30D */}
        <MetricCard
          title="CHARGING (30D)"
          value={data?.charging?.last30Days?.sessions ?? 0}
          subtitle={`${(data?.charging?.last30Days?.energyKwh ?? 0).toFixed(1)} kWh `}
          loading={loading}
        />

        {/* Feedback */}
        <MetricCard
          title="FEEDBACK"
          value={data?.feedback?.total ?? 0}
          subtitle={`⭐ ${(data?.feedback?.averageRating ?? 0).toFixed(1)}`}
          loading={loading}
        />
      </div>

      {/* Row 2: Revenue Card and Chart */}
      <div className="flex gap-6 mb-6">
        {/* Left: Revenue Card */}
        <div className="w-80">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl border p-6 flex flex-col h-35 relative">
            <span className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">TOTAL REVENUE</span>
            <span className="text-4xl font-bold text-blue-600 ps-6">
              {loading ? "..." : formatCurrency(data?.revenue?.lifetime?.total ?? 0)}
            </span>
            <span className="text-xs text-gray-400 absolute bottom-8 right-4">
              vs last month
            </span>
            <span className="text-sm font-medium absolute bottom-4 right-4">
              {(() => {
                // So sánh doanh thu tháng hiện tại với tháng trước
                const monthly = data?.revenue?.monthly || [];
                const len = monthly.length;
                
                // Tháng hiện tại và tháng trước
                const currentMonth = len >= 1 ? monthly[len - 1]?.total : null;
                const prevMonth = len >= 2 ? monthly[len - 2]?.total : null;
                
                const pct = prevMonth && currentMonth ? formatPercentage(currentMonth, prevMonth) : null;
                if (!pct) return <span className="text-gray-400">—</span>;
                
                return (
                  <span className={pct.isUp ? "text-green-500" : "text-red-500"}>
                    {pct.text} {pct.isUp ? "↑" : "↓"}
                  </span>
                );
              })()}
            </span>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="flex-1 bg-white rounded-xl border p-6 flex flex-col">
          <ChartSection data={data} loading={loading} />
        </div>
      </div>

      {/* Bottom: Table */}
      <TableSection />
    </div>
  );
};

export default AdminDashboard;
