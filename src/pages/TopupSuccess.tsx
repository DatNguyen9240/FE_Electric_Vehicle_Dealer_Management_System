import { useLocation, Link } from "react-router-dom";

const TopupSuccess: React.FC = () => {
  const location = useLocation();
  // Lấy thông tin từ query nếu cần
  const query = new URLSearchParams(location.search);
  const orderCode = query.get("orderCode");
  const balance = query.get("balance");
  const amount = query.get("amount");
  const status = query.get("status");

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow rounded-lg p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Nạp tiền thành công!
      </h1>
      <div className="mb-4 text-gray-700">
        <div className="font-semibold">
          Mã giao dịch: <span className="text-blue-700">{orderCode}</span>
        </div>
        <div>
          Số tiền nạp:{" "}
          <span className="font-bold">
            {amount ? Number(amount).toLocaleString() : ""}₫
          </span>
        </div>
        <div>
          Trạng thái:{" "}
          <span className="text-green-600">
            {status === "PAID" ? "Đã thanh toán" : status}
          </span>
        </div>
        <div>
          Số dư ví mới:{" "}
          <span className="font-bold text-blue-700">
            {balance ? Number(balance).toLocaleString() : ""}₫
          </span>
        </div>
      </div>
      <Link
        to="/wallet"
        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
      >
        Về trang ví
      </Link>
    </div>
  );
};

export default TopupSuccess;
