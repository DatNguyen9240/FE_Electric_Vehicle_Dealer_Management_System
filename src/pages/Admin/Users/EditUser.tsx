import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import { updateUserById, fetchUserById } from "@redux/slice/User/UserThunks";
import { clearError } from "@redux/slice/User/UserSlice";
import { fetchStationsThunk } from "@redux/slice/Station/StationThunk";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";

const EditUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedUser } = useSelector(
    (state: RootState) => state.user
  );
  const { stations, loading: stationsLoading } = useSelector(
    (state: RootState) => state.station
  );
  const { setTitle } = useTitle();

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "driver" as "admin" | "staff" | "driver",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
    stationId: "" as string | "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTitle("Edit User");
  }, [setTitle]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
    // Fetch stations for dropdown
    dispatch(fetchStationsThunk());
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        name: selectedUser.name,
        phone: selectedUser.phone || "",
        role: selectedUser.role,
        status: selectedUser.status,
        stationId: selectedUser.stationId || "",
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

    // Validate: if role is staff, stationId is required
    if (editForm.role === "staff" && !editForm.stationId) {
      toast.error("Station is required when role is Staff");
      return;
    }

    setIsLoading(true);
    try {
      const userData: any = {
        name: editForm.name,
        phone: editForm.phone,
        role: editForm.role,
        status: editForm.status,
      };

      // Only include stationId if role is staff or if it's being cleared
      if (editForm.role === "staff") {
        userData.stationId = editForm.stationId;
      } else if (editForm.stationId) {
        // Allow clearing stationId for non-staff roles
        userData.stationId = null;
      }

      await dispatch(
        updateUserById({
          userId: userId,
          userData: userData,
        })
      ).unwrap();

      toast.success("User updated successfully!");
      navigate(`/admin/users/view/${userId}`);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        err ||
        "Failed to update user";
      toast.error(errorMessage);
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
      case "admin":
        return "text-red-600";
      case "staff":
        return "text-blue-600";
      case "driver":
        return "text-green-600";
      default:
        return "text-gray-600";
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
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedUser.name}
          </h1>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            User Information
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter user name"
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
                placeholder="User email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    role: e.target.value as "admin" | "staff" | "driver",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="driver">Driver</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {/* Station (only show when role is staff) */}
            {editForm.role === "staff" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station <span className="text-red-500">*</span>
                </label>
                {stationsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Loading stations...
                  </div>
                ) : (
                  <select
                    value={editForm.stationId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stationId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a station</option>
                    {stations.map((station) => (
                      <option key={station._id} value={station._id}>
                        {station.name} {station.status && `(${station.status})`}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Staff members can only manage data for their assigned station
                </p>
              </div>
            )}
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.target.value as "ACTIVE" | "SUSPENDED",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Created At (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created Date
              </label>
              <input
                type="text"
                value={new Date(selectedUser.created_at).toLocaleDateString(
                  "vi-VN"
                )}
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
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={
                isLoading ||
                !editForm.name.trim() ||
                (editForm.role === "staff" && !editForm.stationId)
              }
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* User Info Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Current Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Name</div>
            <div className="text-lg font-medium text-gray-900">
              {selectedUser.name}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Role</div>
            <div
              className={`text-lg font-medium ${getRoleTextColor(
                selectedUser.role
              )}`}
            >
              {selectedUser.role === "admin"
                ? "Admin"
                : selectedUser.role === "staff"
                ? "Staff"
                : "Driver"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Status</div>
            <div
              className={`text-lg font-medium ${
                selectedUser.status === "ACTIVE"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {selectedUser.status === "ACTIVE" ? "Active" : "Suspended"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
