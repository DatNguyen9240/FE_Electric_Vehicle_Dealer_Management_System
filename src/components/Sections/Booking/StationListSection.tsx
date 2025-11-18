import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StationCard from "@components/Ui/StationCard";
import Pagination from "@components/Ui/Pagination";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@redux/store/store";
import { fetchCompatibleStationsThunk } from "@redux/slice/Station/StationThunk";

const StationListSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Lấy danh sách trạm từ Redux
  const { stations, loading, error } = useSelector(
    (state: RootState) => state.station
  );

  useEffect(() => {
    dispatch(fetchCompatibleStationsThunk());
  }, [dispatch]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(stations.length / itemsPerPage);

  // Calculate which stations to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStations = stations.slice(startIndex, endIndex);

  const handleBookNow = (stationId: string) => {
    navigate(`/booking/station/${stationId}`);
  };

  // Station details removed from the list cards. Use the station page for full details.

  return (
    <section className="w-full py-12 bg-white">
      <div>
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-center">
          Charging Station List
        </h2>
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading stations...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {currentStations.map((station) => (
                <StationCard
                  key={station._id}
                  name={station.name}
                  status={station.status}
                  address={`${station.location.coordinates[1]}, ${station.location.coordinates[0]}`}
                  onBookNow={() => handleBookNow(station._id)}
                />
              ))}
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
  );
};

export default StationListSection;
