const TopupCancel: React.FC = () => (
  <div className="max-w-md mx-auto mt-12 bg-white shadow rounded-lg p-6 text-center">
    <h1 className="text-xl font-bold text-red-600 mb-4">Giao dịch đã bị hủy</h1>
    <p className="mb-4">
      Bạn đã hủy giao dịch nạp tiền. Số dư ví không thay đổi.
    </p>
    <a href="/wallet" className="text-blue-600 underline">
      Quay lại ví
    </a>
  </div>
);

export default TopupCancel;
