import React from "react";
import { Search, Eye, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";
import { useNavigate } from "react-router-dom";

type MembershipPlanItem = {
  _id?: string;
  id?: string;
  code?: string;
  name?: string;
  monthly_fee_vnd?: number;
  status?: string;
  mods?: {
    pricePerKwhPctOff?: number;
    pricePerMinPctOff?: number;
    idleFeePerMinPctOff?: number;
    graceMinBonus?: number;
    minBalancePctOff?: number;
    queueBoost?: number;
  };
  created_at?: string;
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") return "—";
  return `${value.toLocaleString("en-US")} VND`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return value;
  }
};

const badgeClass = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700";
    case "INACTIVE":
      return "bg-gray-50 text-gray-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const MembershipPlansManagement: React.FC = () => {
  const { setTitle } = useTitle();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [rows, setRows] = React.useState<MembershipPlanItem[]>([]);

  React.useEffect(() => {
    setTitle("Membership Plans Management");
  }, [setTitle]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<MembershipPlanItem[]>("/admin/membership-plans", {
        params: {
          status: statusFilter || undefined,
        },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const filtered = search
        ? data.filter(
            (p) =>
              p.code?.toLowerCase().includes(search.toLowerCase()) ||
              p.name?.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setRows(filtered);
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Error loading data";
        } catch {
          return "Error loading data";
        }
      };
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleActivate = async (id?: string) => {
    if (!id) return;
    try {
      await api.patch(`/admin/membership-plans/${id}/activate`);
      fetchData();
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Cannot activate plan";
        } catch {
          return "Cannot activate plan";
        }
      };
      alert(getErrorMessage(err));
    }
  };

  const handleDeactivate = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to deactivate this plan?")) return;
    try {
      await api.patch(`/admin/membership-plans/${id}/deactivate`);
      fetchData();
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Cannot deactivate plan";
        } catch {
          return "Cannot deactivate plan";
        }
      };
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/membership-plans/${id}`);
      fetchData();
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Cannot delete plan";
        } catch {
          return "Cannot delete plan";
        }
      };
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code/name"
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/membership-plans/create")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} /> Create New Plan
        </button>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Membership Plans List</h2>
            <span className="text-sm text-gray-500">{rows.length} plans</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No plans found</td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{p.code || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.name || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.monthly_fee_vnd)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(p.status)}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {p.status || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(p.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                      <a
                        href={`/admin/membership-plans/view/${p._id}`}
                        className="text-gray-400 hover:text-blue-600"
                        title="View details"
                      >
                        <Eye size={16} />
                      </a>
                      {p.status === "ACTIVE" ? (
                        <button
                          onClick={() => handleDeactivate(p._id)}
                          className="text-gray-400 hover:text-orange-600"
                          title="Deactivate plan"
                        >
                          <PowerOff size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(p._id)}
                          className="text-gray-400 hover:text-green-600"
                          title="Activate plan"
                        >
                          <Power size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlansManagement;

