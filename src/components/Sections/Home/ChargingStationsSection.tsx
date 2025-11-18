import React, { useEffect, useState } from "react";
import StationCard from "@components/Ui/StationCard";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Ui/Pagination";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@redux/store/store";
import { fetchCompatibleStationsThunk } from "@redux/slice/Station/StationThunk";

const ChargingStationsSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { stations, loading, error } = useSelector((state: RootState) => state.station);

  // debug: log stations to verify we received the array
  console.log("ChargingStationsSection: stations ->", stations);

  useEffect(() => {
    // fetch only compatible stations and prioritize nearby ones - handled by thunk
    dispatch(fetchCompatibleStationsThunk());
  }, [dispatch]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil((stations?.length || 0) / itemsPerPage));

  // Calculate which stations to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStations = stations ? stations.slice(startIndex, endIndex) : [];

  const handleBookNow = (stationId: string) => {
    navigate(`/booking/station/${stationId}`);
  };

  // Details view removed: station details are not shown from the Home cards

  return (
    <section className="w-full bg-white py-8">
      <div>
        {/* Title & subtitle */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-2 text-center">
            Active Charging Stations
          </h2>
          <p className="text-gray-600 text-base md:text-lg text-center">
            Monitor real-time status of your EV chargers and slots availability.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading stations...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            {/* Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentStations.map((station) => (
                <StationCard
                  key={station._id}
                  name={station.name}
                  status={station.status}
                  lat={station.lat}
                  lng={station.lng}
                  address={station.location?.coordinates ? `${station.location.coordinates[1]}, ${station.location.coordinates[0]}` : ""}
                  onBookNow={() => handleBookNow(station._id)}
                />
              ))}
            </div>

            {/* Pagination and View All */}
            <div className="flex justify-between items-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
              <Link
                to="/booking"
                className="text-blue-600 font-semibold text-lg flex items-center gap-2 hover:underline"
              >
                View All
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ChargingStationsSection;
