import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, Trash2, Search, Filter, Pencil } from "lucide-react";
import { fetchUsers, deleteUser } from "@redux/slice/User/UserThunks";
import { clearError } from "@redux/slice/User/UserSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import type { User } from "@redux/slice/User/UserSlice";
import { useTitle } from "../../../contexts";

const UserManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: users, loading, error } = useSelector((state: RootState) => state.user);
  const { setTitle } = useTitle();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    setTitle("Quản lí người dùng");
    dispatch(fetchUsers());
  }, [dispatch, setTitle]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEditUser = (user: User) => {
    navigate(`/admin/users/edit/${user.id}`);
  };

  // Remove handleUpdateUser since we use separate edit page

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) {
      return;
    }

    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success("Xóa người dùng thành công!");
      dispatch(fetchUsers()); // Refresh list
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/view/${userId}`);
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

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
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
      

      {/* Search and Filter Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
            </select>
          </div>
        </div>
        
        
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Danh sách người dùng</h2>
            <span className="text-sm text-gray-500">
              {filteredUsers.length} / {users.length} người dùng
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || roleFilter !== "all" 
                      ? "Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm" 
                      : "Chưa có người dùng nào"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone || "Chưa cập nhật"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span >
                      {user.role === "admin" ? "Admin" : user.role === "staff" ? "Staff" : "Driver"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(user.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusDotColor(user.status)}`}></span>
                      {user.status === "ACTIVE" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa người dùng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal removed - using separate edit page */}

      {/* User Details Modal removed - using separate detail page */}
    </div>
  );
};

export default UserManager;