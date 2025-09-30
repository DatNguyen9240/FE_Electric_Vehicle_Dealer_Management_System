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
  <div className="max-w-7xl mx-auto mt-8">
    <h2 className="text-xl font-bold mb-4">Danh sách biểu giá sạc</h2>
    <table className="w-full border border-gray-300 rounded shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">#</th>
          <th className="p-2">Mode</th>
          <th className="p-2">Giá/kWh</th>
          <th className="p-2">Phí chờ/phút</th>
          <th className="p-2">Miễn phí (phút)</th>
          <th className="p-2">Hiệu lực từ</th>
          <th className="p-2">Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {data.map((t, idx) => (
          <tr key={t._id} className="text-center border-t">
            <td className="p-2">{idx + 1}</td>
            <td className="p-2">{t.mode}</td>
            <td className="p-2">{formatVND(t.pricePerKwh)}</td>
            <td className="p-2">{formatVND(t.idleFeePerMin)}</td>
            <td className="p-2">{t.graceMin}</td>
            <td className="p-2">{formatDate(t.effectiveFrom)}</td>
            <td className="p-2">
              {t.active ? (
                <span className="text-green-600 font-semibold">
                  Đang áp dụng
                </span>
              ) : (
                <span className="text-gray-400">Không hiệu lực</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
