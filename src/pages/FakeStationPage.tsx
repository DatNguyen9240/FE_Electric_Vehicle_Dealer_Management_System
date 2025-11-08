import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SimpleStationList from "@components/Sections/Booking/SimpleStationList";
import SimpleChargerList from "@components/Sections/Booking/SimpleChargerList";
import api from "@libs/axios";

interface Connector {
  _id: string;
  type: string;
  powerKw?: number;
  status: string;
  code?: string;
}

interface Charger {
  _id: string;
  name?: string;
  code?: string;
  connectorType?: string;
  powerKw?: number;
  status?: string;
  connectors?: Connector[];
}

const FakeStationPage: React.FC = () => {
  const { stationId, chargerId } = useParams<{ stationId: string; chargerId: string }>();
  const [charger, setCharger] = useState<Charger | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stationId && chargerId) {
      setLoading(true);
      setError(null);
      api.get<{ charger: Charger }>(`/chargers/${chargerId}`)
        .then(res => {
          setCharger(res.data.charger || res.data);
        })
        .catch(err => {
          setError(err?.response?.data?.msg || err.message || "Không lấy được thông tin trụ");
        })
        .finally(() => setLoading(false));
    }
  }, [stationId, chargerId]);

  let content;
  if (stationId && chargerId) {
    content = (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 mt-8">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Đang tải thông tin trụ...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : charger ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Thông tin trụ sạc</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-green-600">
                  <path d="M7 2v11h3v9l7-12h-4l3-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1 text-center">{charger.name || charger.code || `Charger ${charger._id}`}</h3>
              <p className="text-gray-500 text-sm mb-2 text-center">
                Loại: {charger.connectorType || "Không rõ"} | Công suất: {charger.powerKw ? `${charger.powerKw}kW` : "-"}
              </p>
              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${charger.status === "ACTIVE" ? "bg-green-100 text-green-700" : charger.status === "INACTIVE" ? "bg-gray-200 text-gray-500" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {charger.status === "ACTIVE"
                    ? "Đang hoạt động"
                    : charger.status === "INACTIVE"
                    ? "Ngưng hoạt động"
                    : charger.status || "Không rõ trạng thái"}
                </span>
              </div>
            </div>
            <h4 className="font-semibold mb-2">Danh sách connector:</h4>
            <ul className="space-y-2">
              {(charger.connectors || []).map(connector => (
                <li key={connector._id} className="flex items-center gap-2 border rounded-lg px-3 py-2">
                  <span className="font-medium">{connector.code || connector.type}</span>
                  <span className="text-xs text-gray-500">{connector.type}</span>
                  <span className="text-xs text-gray-500">{connector.powerKw ? `${connector.powerKw}kW` : "-"}</span>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold
                    ${connector.status === "IDLE" ? "bg-green-100 text-green-700" : connector.status === "CHARGING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-500"}`}
                  >
                    {connector.status === "IDLE" ? "Rảnh" : connector.status === "CHARGING" ? "Đang sạc" : connector.status}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    );
  } else if (stationId) {
    content = <SimpleChargerList stationId={stationId} />;
  } else {
    content = <SimpleStationList />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Giả lập Trạm Sạc</h1>
        {content}
      </div>
    </div>
  );
};

export default FakeStationPage;
