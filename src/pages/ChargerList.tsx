import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ChargingStationCard from "@components/Ui/ChargingStationCard";
import Pagination from "@components/Ui/Pagination";
import api from "@libs/axios";
import axios from "axios";

type Connector = {
  _id: string;
  stationId: string;
  chargerId: string;
  type: string;
  powerKw?: number;
  status: string;
  code?: string;
};

type Charger = {
  _id: string;
  stationId: string;
  name?: string;
  code?: string;
  connectorType?: string;
  powerKw?: number;
  status?: string;
  connectors?: Connector[];
};

const ChargerList: React.FC = () => {
  const navigate = useNavigate();
  const { stationId } = useParams<{ stationId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string | null>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    if (!stationId) return;

    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
  const res = await api.get<{ chargers?: Charger[]; name?: string }>(`/stations/${stationId}/assets`);
  const data = res.data;
        // API returns station object with `chargers` array
        setChargers(Array.isArray(data.chargers) ? data.chargers : []);
        setStationName(data.name || null);
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.message as string) || err.message
          : (err as Error)?.message || "Failed to load chargers";
        console.error(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [stationId]);

  const totalPages = Math.max(1, Math.ceil(chargers.length / itemsPerPage));

  // Calculate which chargers to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChargers = chargers.slice(startIndex, endIndex);

  const handleBookNow = (chargerId: string) => {
    navigate(`/booking/station/${stationId}/charger/${chargerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/booking")}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4 ms-5 text-sm font-medium"
          >
            <ArrowLeft size={15} />
            <span>Back to Stations</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 ms-5 mb-1">
            {stationName || `Station ${stationId}`}
          </h1>
          <p className="text-gray-600 text-md ms-5">Select a charger to view available time slots</p>
        </div>

        <section className="w-full">
          <div>
            {loading ? (
              <div className="text-center text-gray-500 py-10">Loading chargers...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {currentChargers.map((charger) => {
                    const availableConnectors = (charger.connectors || []).filter(c => c.status === 'IDLE').length;
                    const statusColor = availableConnectors > 0 ? 'text-green-600' : 'text-yellow-500';
                    return (
                      <ChargingStationCard
                        key={charger._id}
                        id={charger.code || charger._id}
                        status={charger.status || (availableConnectors > 0 ? 'Available' : 'Unavailable')}
                        statusColor={statusColor}
                        img={'/station/01.png'}
                        onBookNow={() => handleBookNow(charger._id)}
                      />
                    );
                  })}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChargerList;

