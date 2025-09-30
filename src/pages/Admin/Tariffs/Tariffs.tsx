import React, { useEffect } from "react";
import { TariffList } from "../../../components/TariffList";
import { useDispatch, useSelector } from "react-redux";
import { fetchTariffs } from "../../../redux/slice/Tariff/TariffThunks";
import type { RootState, AppDispatch } from "../../../redux/store/store";

const AdminTariffs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: tariffs,
    loading,
    error,
  } = useSelector((state: RootState) => state.tariff);

  useEffect(() => {
    dispatch(fetchTariffs());
  }, [dispatch]);

  return (
    <div>
      {loading && <div className="text-center py-4">Đang tải dữ liệu...</div>}
      {error && (
        <div className="text-center text-red-500 py-4">Lỗi: {error}</div>
      )}
      <TariffList data={tariffs} />
    </div>
  );
};

export default AdminTariffs;
