import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { deleteUser, getUser } from "@redux/slice/User/UserThunks";
import { clearError } from "@redux/slice/User/UserSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import api from "@libs/axios";

const asRecord = (v: unknown): Record<string, unknown> => (typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {});
const getErrorMessage = (eVal: unknown, fallback = "An error occurred") => {
  if (!eVal) return fallback;
  if (typeof eVal === "string") return eVal;
  if (eVal instanceof Error) return eVal.message;
  const r = asRecord(eVal);
  if (typeof r.message === "string") return r.message;
  const response = asRecord(r.response);
  const data = asRecord(response.data);
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;
  return fallback;
};

const UserDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedUser } = useSelector((state: RootState) => state.user);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{ wallet_id: string; balance: number; createdAt?: string; updatedAt?: string } | null>(null);

  
  useEffect(() => {
    if (userId) {
      dispatch(getUser(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!userId) return;
      try {
        setWalletLoading(true);
        const { data } = await api.get("/admin/wallet/user", { params: { userId } });
        setWalletInfo({
          wallet_id: data?.wallet?.wallet_id,
          balance: data?.wallet?.balance ?? 0,
          createdAt: data?.wallet?.createdAt,
          updatedAt: data?.wallet?.updatedAt,
        });
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Unable to fetch wallet information"));
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, [userId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEditUser = () => {
    if (selectedUser) {
      navigate(`/admin/users/edit/${selectedUser.id}`);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm(`Are you sure you want to delete user "${selectedUser.name}"?`)) {
      return;
    }

    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      toast.success("User deleted successfully!");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleBack = () => {
    navigate("/admin/users");
  };

  const getRoleTextColor = (role: string) => {
    switch (role) {
      case "admin": return "text-red-600 bg-red-50";
      case "staff": return "text-blue-600 bg-blue-50";
      case "driver": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-50 text-green-600";
      case "SUSPENDED": return "bg-red-50 text-red-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-400";
      case "SUSPENDED": return "bg-red-400";
      default: return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        
       
      </div>

      {/* User Info Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">User Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {selectedUser.name}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {selectedUser.email}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {selectedUser.phone || "Not updated"}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleTextColor(selectedUser.role)}`}>
                  {selectedUser.role === "admin" ? "Admin" : selectedUser.role === "staff" ? "Staff" : "Driver"}
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedUser.status)}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusDotColor(selectedUser.status)}`}></span>
                  {selectedUser.status === "ACTIVE" ? "Active" : "Suspended"}
                </div>
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created Date
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-4 me-6">
          <button
            onClick={handleEditUser}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={handleDeleteUser}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

      {/* Wallet Info */}
        <div className="px-6  mt-6">
          <h2 className="text-lg font-medium text-gray-900">Wallet Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm text-gray-500">Wallet Balance</div>
              <div className="text-2xl font-semibold text-gray-900">
                {walletLoading ? "…" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(walletInfo?.balance ?? 0)}
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm text-gray-500">Wallet ID</div>
              <div className="text-sm font-medium text-gray-900 break-all">{walletInfo?.wallet_id || "-"}</div>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="text-sm font-medium text-gray-900">{walletInfo?.updatedAt ? new Date(walletInfo.updatedAt).toLocaleDateString('vi-VN') : "-"}</div>
            </div>
          </div>
        </div>
      
    
    </div>
  );
};

export default UserDetail;
