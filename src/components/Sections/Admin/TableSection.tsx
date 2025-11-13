import React from "react";
import api from "../../../libs/axios";

type StationRow = {
  stationId: string | null;
  name: string | null;
  status?: string | null;
  lat: number | null;
  lng: number | null;
  sessions: number;
  revenue: number;
  energyKwh: number;
};

type TableSectionProps = {
  stations?: StationRow[] | null;
  currency?: string;
  loading?: boolean;
  title?: string;
};

const TableSection: React.FC<TableSectionProps> = ({
  stations,
  currency = "VND",
  loading = false,
  title = "Top trạm trong khoảng chọn",
}) => {
  const [connectorCounts, setConnectorCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!stations || stations.length === 0) {
        if (mounted) setConnectorCounts({});
        return;
      }
      const counts: Record<string, number> = {};
      await Promise.all(
        stations
          .filter((s) => !!s.stationId)
          .map(async (s) => {
            try {
              const r = await api.get(`/chargers`, {
                params: { stationId: s.stationId, limit: 1000 },
              });
              const chargers = Array.isArray(r.data) ? (r.data as unknown[]) : [];
              const sum = chargers.reduce((acc: number, ch: unknown) => {
                const obj =
                  ch && typeof ch === "object" && !Array.isArray(ch)
                    ? (ch as Record<string, unknown>)
                    : {};
                const con = obj["connectors"];
                return acc + (Array.isArray(con) ? (con as unknown[]).length : 0);
              }, 0);
              counts[String(s.stationId)] = sum;
            } catch {
              counts[String(s.stationId)] = 0;
            }
          })
      );
      if (mounted) setConnectorCounts(counts);
    })();
    return () => {
      mounted = false;
    };
  }, [stations]);

  const formatCurrency = (amount: number) => {
    if (currency === "VND") return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
    } catch {
      return String(amount);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg">{title}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-3 px-4">Trạm</th>
              <th className="py-3 px-4">Địa điểm</th>
              <th className="py-3 px-4">Số Connectors</th>
              <th className="py-3 px-4">Phiên sạc</th>
              <th className="py-3 px-4">kWh</th>
              <th className="py-3 px-4">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 px-4 text-gray-400" colSpan={6}>
                  Đang tải...
                </td>
              </tr>
            ) : !stations || stations.length === 0 ? (
              <tr>
                <td className="py-6 px-4 text-gray-400" colSpan={6}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              stations.map((s, idx) => {
                const key = s.stationId ? String(s.stationId) : `row-${idx}`;
                const location =
                  s.lat != null && s.lng != null
                    ? `${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}`
                    : "—";
                const connectors = connectorCounts[key] ?? 0;
                return (
                  <tr key={key} className="border-t">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {s.name || `Station ${idx + 1}`}
                    </td>
                    <td className="py-3 px-4">{location}</td>
                    <td className="py-3 px-4">{connectors}</td>
                    <td className="py-3 px-4">{s.sessions}</td>
                    <td className="py-3 px-4">{Number(s.energyKwh || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {formatCurrency(s.revenue)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSection;
