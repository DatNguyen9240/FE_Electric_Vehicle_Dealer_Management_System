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



type ChartSectionProps = {
  data?: any;
  loading?: boolean;
};

const ChartSection: React.FC<ChartSectionProps> = ({ data: propData, loading: propLoading }) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<any>("/analytics/admin/overview");
        if (mounted) setData(res.data);
      } catch (e) {
        // silent fail for UI; could add toast
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [propData]);

  const displayData = propData || data;
  const displayLoading = propLoading !== undefined ? propLoading : loading;

  const chartData = (displayData?.revenue?.monthly || []).map((m: any) => ({ name: m.month, value: m.total }));
  const [range, setRange] = React.useState<'3M' | '6M'>('6M');
  const displayedChartData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    if (range === '3M') return chartData.slice(-3);
    return chartData.slice(-6);
  }, [chartData, range]);

  return (
    <>
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
        {displayLoading ? (
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
    </>
  );
};

export default ChartSection;
