import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import {  updateUser, getUser } from "@redux/slice/User/UserThunks";
import { clearError } from "@redux/slice/User/UserSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";

const EditUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedUser } = useSelector((state: RootState) => state.user);
  const { setTitle } = useTitle();
  
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "driver" as "admin" | "staff" | "driver",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED"
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTitle("Chỉnh sửa người dùng");
  }, [setTitle]);

  useEffect(() => {
    if (userId) {
      dispatch(getUser(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        name: selectedUser.name,
        phone: selectedUser.phone || "",
        role: selectedUser.role,
        status: selectedUser.status
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleUpdateUser = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      await dispatch(updateUser({
        userId: userId,
        userData: editForm
      })).unwrap();
      
      toast.success("Cập nhật người dùng thành công!");
      navigate(`/admin/users/view/${userId}`);
    } catch (err) {
      toast.error(err as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (userId) {
      navigate(`/admin/users/view/${userId}`);
    } else {
      navigate("/admin/users");
    }
  };

  const getRoleTextColor = (role: string) => {
    switch (role) {
      case "admin": return "text-red-600";
      case "staff": return "text-blue-600";
      case "driver": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">Không tìm thấy người dùng</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedUser.name}
          </h1>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông tin người dùng</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên người dùng"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={selectedUser.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Email người dùng"
              />
              <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value as "admin" | "staff" | "driver"})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="driver">Driver</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value as "ACTIVE" | "SUSPENDED"})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Created At (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <input
                type="text"
                value={new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
              Hủy
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={isLoading || !editForm.name.trim()}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      {/* User Info Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin hiện tại</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tên</div>
            <div className="text-lg font-medium text-gray-900">{selectedUser.name}</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Vai trò</div>
            <div className={`text-lg font-medium ${getRoleTextColor(selectedUser.role)}`}>
              {selectedUser.role === "admin" ? "Admin" : selectedUser.role === "staff" ? "Staff" : "Driver"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Trạng thái</div>
            <div className={`text-lg font-medium ${selectedUser.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
              {selectedUser.status === "ACTIVE" ? "Active" : "Suspended"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
