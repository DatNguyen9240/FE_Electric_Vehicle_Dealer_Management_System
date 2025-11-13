import React from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type InvoiceItem = {
  _id?: string;
  id?: string;
  session_id?: string;
  user_id?: string;
  total?: number;
  currency?: string;
  issued_at?: string;
  due_at?: string;
  paid_at?: string;
  paid_total?: number;
  payment_status?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ListResponse = {
  pagination: { page: number; limit: number; total: number; pages: number };
  items: InvoiceItem[];
};

const STATUS_OPTIONS = [
  { key: "ISSUED", label: "Issued" },
  { key: "VOID", label: "Void" },
] as const;

const PAYMENT_STATUS_OPTIONS = [
  { key: "UNPAID", label: "Unpaid" },
  { key: "PAID", label: "Paid" },
  { key: "EXPIRED", label: "Expired" },
] as const;

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat("vi-VN", {
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

const formatCurrency = (value?: number, currency = "VND") => {
  if (typeof value !== "number") return "—";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString("vi-VN")} ${currency}`;
  }
};

const badgeClass = (paymentStatus?: string) => {
  switch (paymentStatus) {
    case "PAID":
      return "bg-green-50 text-green-700";
    case "UNPAID":
      return "bg-yellow-50 text-yellow-700";
    case "EXPIRED":
      return "bg-red-50 text-red-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const InvoiceManagement: React.FC = () => {
  const { setTitle } = useTitle();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [paymentStatuses, setPaymentStatuses] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [sort, setSort] = React.useState<string>("-createdAt");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");

  const [rows, setRows] = React.useState<InvoiceItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(0);

  React.useEffect(() => {
    setTitle("Quản lí hóa đơn");
  }, [setTitle]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ListResponse>("/admin/invoices", {
        params: {
          search: search || undefined,
          status: statuses.length ? statuses.join(",") : undefined,
          paymentStatus: paymentStatuses.length ? paymentStatuses.join(",") : undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          limit,
          sort,
        },
      });
      setRows(res.data.items);
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Lỗi khi tải dữ liệu";
        } catch {
          return "Lỗi khi tải dữ liệu";
        }
      };
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statuses, paymentStatuses, from, to, page, limit, sort]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatusTab = (statusKey: string) => {
    setPage(1);
    if (statusKey === "ALL") {
      setStatuses([]);
    } else {
      setStatuses((prev) => (prev.includes(statusKey) ? [] : [statusKey]));
    }
  };

  const togglePaymentStatusTab = (statusKey: string) => {
    setPage(1);
    if (statusKey === "ALL") {
      setPaymentStatuses([]);
    } else {
      setPaymentStatuses((prev) => (prev.includes(statusKey) ? [] : [statusKey]));
    }
  };

  const onSortToggle = (field: string) => {
    setPage(1);
    setSort((prev) => {
      if (prev === field) return "-" + field;
      if (prev === "-" + field) return field;
      return "-" + field;
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search invoice/session/user"
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">đến</span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Invoice status</label>
            <select
              value={statuses[0] || ""}
              onChange={(e) => {
                setPage(1);
                const v = e.target.value;
                setStatuses(v ? [v] : []);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Payment status</label>
            <select
              value={paymentStatuses[0] || ""}
              onChange={(e) => {
                setPage(1);
                const v = e.target.value;
                setPaymentStatuses(v ? [v] : []);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All</option>
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="border-b mb-4" />

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Danh sách hóa đơn</h2>
            <span className="text-sm text-gray-500">{total} kết quả</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã hóa đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => onSortToggle("total")} className="inline-flex items-center gap-1">
                    Tổng tiền <ArrowUpDown size={14} className="text-gray-400" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => onSortToggle("createdAt")} className="inline-flex items-center gap-1">
                    Tạo lúc <ArrowUpDown size={14} className="text-gray-400" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Không có hóa đơn nào</td>
                </tr>
              ) : (
                rows.map((invoice) => (
                  <tr key={invoice._id || invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/admin/invoices/view/${invoice.id || invoice._id}`}
                        className="text-blue-600 hover:underline"
                        title="Xem chi tiết"
                      >
                        {invoice.id || invoice._id}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.session_id || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.user_id || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(invoice.payment_status)}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {invoice.payment_status || "—"}
                      </span>
                      <a
                        href={`/admin/invoices/view/${invoice.id || invoice._id}`}
                        className="text-gray-400 hover:text-blue-600"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </a>
                      <a
                        href={`/admin/invoices/update/${invoice.id || invoice._id}`}
                        className="text-gray-400 hover:text-blue-600"
                        title="Cập nhật hóa đơn"
                      >
                        Update
                      </a>
                      {invoice.session_id && (
                        <a
                          href={`/admin/sessions/view/${invoice.session_id}`}
                          className="text-gray-400 hover:text-blue-600"
                          title="Xem session"
                        >
                          Session
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDateTime(invoice.createdAt || invoice.issued_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Trang {page} / {Math.max(1, pages)}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;


