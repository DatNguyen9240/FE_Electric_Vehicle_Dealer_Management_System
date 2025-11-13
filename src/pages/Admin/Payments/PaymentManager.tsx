import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { fetchPayments } from "@redux/slice/Payment/PaymentThunks";
import { clearError } from "@redux/slice/Payment/PaymentSlice";
import type { Payment } from "@redux/slice/Payment/PaymentSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";
import api from "../../../libs/axios";

const tabs = ["Succeeded", "Refunded", "All"];

type User = {
  id: string;
  name: string;
  email?: string;
};

const PaymentManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentState = useSelector((state: RootState) => state.payment);
  const { data: payments = [], loading, error, pagination } = paymentState;
  const { setTitle } = useTitle();
  
  const [activeTab, setActiveTab] = useState("Succeeded");
  const [searchTerm, setSearchTerm] = useState("");
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users để lấy tên
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await api.get("/users");
        const usersList = Array.isArray(res.data) ? res.data : (res.data?.users || []);
        const map: Record<string, User> = {};
        usersList.forEach((user: User) => {
          if (user.id) {
            map[user.id] = user;
          }
        });
        setUsersMap(map);
      } catch (err) {
        console.error("Error fetching users:", err);
        // Không hiển thị toast vì đây là optional data
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

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

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "SUBSCRIPTION": return "Mua gói";
      case "CHARGE": return "Sạc xe";
      case "IDLE_FEE": return "Phí chờ";
      case "ADJUSTMENT": return "Điều chỉnh";
      case "OTHER": return "Khác";
      default: return category || "Không xác định";
    }
  };

  

  // Helper để lấy tên user
  const getUserName = (userId: string): string => {
    const user = usersMap[userId];
    if (user) {
      return user.name || user.email || userId;
    }
    return userId; // Fallback về ID nếu chưa load được user
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter((payment: Payment) => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return true;
    const idemp = (payment.idempotency_key || "").toString().toLowerCase();
    const userId = (payment.user_id || "").toString().toLowerCase();
    const userName = getUserName(payment.user_id).toLowerCase();
    const method = (payment.method || "").toString().toLowerCase();
    return idemp.includes(needle) || userId.includes(needle) || userName.includes(needle) || method.includes(needle);
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
              <th className="px-4 py-3 text-left font-semibold">Loại giao dịch</th>
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
              filteredPayments.map((payment: Payment) => (
                <tr
                  key={payment.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                 
                  <td className="px-4 py-3">
                    {loadingUsers ? (
                      <span className="text-gray-400">Đang tải...</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-medium">{getUserName(payment.user_id)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`}>
                      {getCategoryLabel(payment.category)}
                    </span>
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
