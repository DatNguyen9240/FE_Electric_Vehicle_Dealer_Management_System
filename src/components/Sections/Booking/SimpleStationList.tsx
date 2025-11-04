import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@libs/axios";

import SimpleChargerList from "./SimpleChargerList";

interface GeoLocation {
  type: string;
  coordinates: number[];
}
interface Station {
  _id: string;
  name: string;
  location?: string | GeoLocation;
  status?: string;
}

const SimpleStationList: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();

  // ...existing code for station list...
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    // only fetch stations when we're NOT viewing a single station
    if (stationId) return;
    setLoading(true);
    setError(null);
    api
      .get<{ stations: Station[] }>("/stations/all")
      .then((res) => {
        setStations(Array.isArray(res.data) ? res.data : res.data.stations || []);
      })
      .catch((err: unknown) => {
        let message = "Failed to load stations";
        if (err instanceof Error) message = err.message;
        else if (typeof err === "object" && err !== null) {
          const r = err as Record<string, unknown>;
          const response = r["response"] as Record<string, unknown> | undefined;
          const data = response?.["data"] as Record<string, unknown> | undefined;
          const msg = data?.["msg"] as string | undefined;
          if (msg) message = msg;
        }
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [stationId]);

  // Nếu có stationId trên URL thì show danh sách trụ, ngược lại show danh sách trạm
  if (stationId) {
    return <SimpleChargerList stationId={stationId} />;
  }

  return (
    <div className="min-h-[400px] w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Danh sách trạm sạc</h2>
      {loading ? (
        <div className="text-center text-gray-500 py-10">Đang tải danh sách trạm...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stations.map(station => (
            <div
              key={station._id}
              className="border rounded-2xl p-6 bg-white shadow-md flex flex-col items-center transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11v6m-3-3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1 text-center">{station.name}</h3>
              <p className="text-gray-500 text-sm mb-2 text-center">
                {typeof station.location === "string"
                  ? station.location
                  : station.location && typeof station.location === "object" && "type" in station.location && "coordinates" in station.location
                  ? `${(station.location as GeoLocation).type} (${(station.location as GeoLocation).coordinates.join(", ")})`
                  : "Không rõ địa chỉ"}
              </p>
              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${station.status === "ACTIVE" ? "bg-green-100 text-green-700" : station.status === "INACTIVE" ? "bg-gray-200 text-gray-500" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {station.status === "ACTIVE"
                    ? "Đang hoạt động"
                    : station.status === "INACTIVE"
                    ? "Ngưng hoạt động"
                    : station.status || "Không rõ trạng thái"}
                </span>
              </div>
              <button
                className="mt-auto px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition-all w-full"
                onClick={() => navigate(`/fake-station/${station._id}`)}
              >
                Book now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleStationList;
