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

const data = [
  { name: "Feb", value: 12000 },
  { name: "Mar", value: 18000 },
  { name: "Apr", value: 22000 },
  { name: "May", value: 26000 },
  { name: "Jun", value: 45591 },
  { name: "Jul", value: 39000 },
  { name: "Aug", value: 42000 },
  { name: "Sep", value: 47000 },
  { name: "Oct", value: 51000 },
  { name: "Nov", value: 48000 },
  { name: "Dec", value: 53000 },
  { name: "Jan", value: 57000 },
];

const ChartSection: React.FC = () => {
  return (
    <div className="flex gap-6 p-4">
      {/* Left column */}
      <div className="flex flex-col gap-4 w-72">
        <div className="flex gap-4">
          {/* Card 1 */}
          <div className="flex-1 bg-white rounded-xl border p-4 flex flex-col items-start h-40">
            <span className="text-xs text-gray-500 mb-2">
              TODAY'S CAR CHARGED
            </span>
            <span className="text-2xl font-bold">50</span>
            <span className="text-xs text-green-500 mt-1">+3.6%</span>
          </div>
          {/* Card 2 */}
          <div className="flex-1 bg-white rounded-xl border p-4 flex flex-col items-start">
            <span className="text-xs text-gray-500 mb-2">TOTAL SLOT DONE</span>
            <span className="text-2xl font-bold">
              190
              <span className="text-base text-gray-400">/192</span>
            </span>
            <span className="text-xs text-red-500 mt-1">-1.4%</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-xl border p-4 flex flex-col items-start">
          <span className="text-xs text-gray-500 mb-2">TOTAL FEE</span>
          <span className="text-3xl font-bold text-blue-600">$2,38,485</span>
          <span className="text-xs text-green-500 mt-1">+3.6%</span>
        </div>
      </div>
      {/* Right column */}
      <div className="flex-1 bg-white rounded-xl border p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-lg">Charger Report</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border bg-gray-100 font-medium text-sm shadow-sm border-blue-500 text-blue-600">
              12 Months
            </button>
            <button className="px-3 py-1 rounded border bg-gray-100 font-medium text-sm shadow-sm">
              6 Months
            </button>
            <button className="px-3 py-1 rounded border bg-gray-100 font-medium text-sm shadow-sm">
              30 Days
            </button>
            <button className="px-3 py-1 rounded border bg-gray-100 font-medium text-sm shadow-sm">
              7 Days
            </button>
          </div>
        </div>
        {/* Chart with recharts */}
        <div className="flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={data}
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
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
