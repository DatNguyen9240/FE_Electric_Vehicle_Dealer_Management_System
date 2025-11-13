import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RevenueSeriesPoint = {
  bucket: string;
  total: number;
};

type RevenueSeries = {
  unit?: "day" | "month";
  points?: RevenueSeriesPoint[];
};

type ChartSectionProps = {
  revenueSeries?: RevenueSeries | null;
  loading?: boolean;
  rangeLabel?: string;
};

const formatLabel = (bucket: string | undefined, unit: string | undefined) => {
  if (!bucket) return "";
  if (unit === "day") {
    // bucket format YYYY-MM-DD
    const d = new Date(bucket);
    if (!Number.isNaN(d.getTime())) {
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    }
  }
  if (unit === "month") {
    // bucket format YYYY-MM
    const [year, month] = bucket.split("-");
    if (year && month) {
      return `${month}/${year}`;
    }
  }
  return bucket;
};

const ChartSection: React.FC<ChartSectionProps> = ({
  revenueSeries,
  loading = false,
  rangeLabel,
}) => {
  const unit = revenueSeries?.unit;
  const chartData =
    revenueSeries?.points?.map((point) => ({
      name: formatLabel(point.bucket, unit),
      value: point.total ?? 0,
    })) ?? [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-lg">Doanh thu theo {unit === "day" ? "ngày" : "tháng"}</span>
        {rangeLabel && (
          <span className="text-sm text-gray-500">Khoảng: {rangeLabel}</span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="text-gray-400">Đang tải...</div>
        ) : chartData.length === 0 ? (
          <div className="text-gray-400">Không có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={chartData}
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
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
};

export default ChartSection;
