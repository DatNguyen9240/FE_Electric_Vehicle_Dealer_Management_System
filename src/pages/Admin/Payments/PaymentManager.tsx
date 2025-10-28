import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { fetchPayments } from "@redux/slice/Payment/PaymentThunks";
import { clearError } from "@redux/slice/Payment/PaymentSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";

const tabs = ["Succeeded", "Refunded", "All"];

const PaymentManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentState = useSelector((state: RootState) => state.payment) as any;
  const { data: payments, loading, error, pagination } = paymentState;
  const { setTitle } = useTitle();
  
  const [activeTab, setActiveTab] = useState("Succeeded");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTitle("Quản lí thanh toán");
    dispatch(fetchPayments({ page: 1, limit: 20 }));
  }, [dispatch, setTitle]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const type = tab === "Succeeded" ? "TOPUP" : tab === "Refunded" ? "REFUND" : undefined;
    dispatch(fetchPayments({ page: 1, limit: 20, type }));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return <CheckCircle size={14} className="text-green-500" />;
      case "FAILED": return <XCircle size={14} className="text-red-500" />;
      case "PENDING": return <Clock size={14} className="text-yellow-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return "bg-green-50 text-green-600";
      case "FAILED": return "bg-red-50 text-red-600";
      case "PENDING": return "bg-yellow-50 text-yellow-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch = 
      payment.idempotency_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search payment"
            value={searchTerm}
            className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
      </div>
      
      {/* Tabs */}
      <div className="flex gap-6 border-b mb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-2 px-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              
              <th className="px-4 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 py-3 text-left font-semibold">Wallet</th>
              <th className="px-4 py-3 text-left font-semibold">Method</th>

              <th className="px-4 py-3 text-left font-semibold">Amount</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {!payments || payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu thanh toán
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment: any) => (
                <tr
                  key={payment.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                 
                  <td className="px-4 py-3">
                    {payment.user_id}
                  </td>
                  <td className="px-4 py-3">
                    {payment.wallet_id}
                  </td>
                  <td className="px-4 py-3">
                    {payment.method}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatAmount(payment.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </span>
                  </td>
                  
                  
                  <td className="px-4 py-3">
                    {formatDate(payment.createdAt)}
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-2">
            <button
              disabled={pagination?.page === 1}
              onClick={() => dispatch(fetchPayments({ page: (pagination?.page || 1) - 1, limit: pagination?.limit || 20 }))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1">
              {pagination?.page || 1} / {pagination?.pages || 1}
            </span>
            <button
              disabled={pagination?.page === pagination?.pages}
              onClick={() => dispatch(fetchPayments({ page: (pagination?.page || 1) + 1, limit: pagination?.limit || 20 }))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManager;
