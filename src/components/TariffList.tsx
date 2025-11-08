import React from "react";

type Tariff = {
  _id: string;
  stationId: string;
  mode: string;
  pricePerKwh: number;
  pricePerMin: number;
  idleFeePerMin: number;
  graceMin: number;
  active: boolean;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
};

interface TariffListProps {
  data: Tariff[];
}

const formatVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";
const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

export const TariffList: React.FC<TariffListProps> = ({ data }) => (
  <div className="max-w-7xl mx-auto mt-10 px-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800">💡 Biểu giá sạc</h2>
      <span className="text-sm text-gray-500">
        Tổng cộng: {data.length} biểu giá
      </span>
    </div>

    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
      <table className="w-full border-collapse text-sm md:text-base">
        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
          <tr>
            <th className="p-4 text-left font-semibold">#</th>
            <th className="p-4 text-left font-semibold">Chế độ</th>
            <th className="p-4 text-right font-semibold">Giá/kWh</th>
            <th className="p-4 text-right font-semibold">Phí chờ/phút</th>
            <th className="p-4 text-right font-semibold">Miễn phí</th>
            <th className="p-4 text-center font-semibold">Hiệu lực</th>
            <th className="p-4 text-center font-semibold">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="text-center p-6 text-gray-400 italic"
              >
                Không có dữ liệu biểu giá
              </td>
            </tr>
          ) : (
            data.map((t, idx) => (
              <tr
                key={t._id}
                className="border-t border-gray-100 hover:bg-blue-50/40 transition-colors"
              >
                <td className="p-4">{idx + 1}</td>
                <td className="p-4 font-medium text-gray-700">{t.mode}</td>
                <td className="p-4 text-right text-gray-700">{formatVND(t.pricePerKwh)}</td>
                <td className="p-4 text-right text-gray-700">{formatVND(t.idleFeePerMin)}</td>
                <td className="p-4 text-right text-gray-700">{t.graceMin} phút</td>
                <td className="p-4 text-center text-gray-600">{formatDate(t.effectiveFrom)}</td>
                <td className="p-4 text-center">
                  {t.active ? (
                    <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Đang áp dụng</span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">Không hiệu lực</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
