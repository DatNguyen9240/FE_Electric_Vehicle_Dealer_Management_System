import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type BookingDetail = {
  _id: string;
  id?: string;
  status: string;
  slotStart: string;
  slotEnd: string;
  createdAt?: string;
  updatedAt?: string;
  user?: { id?: string; name?: string; email?: string; phone?: string } | null;
  station?: { id?: string; name?: string; code?: string; address?: string; province?: string } | null;
  connector?: { id?: string; code?: string; type?: string; powerKw?: number } | null;
  session?: { id?: string; status?: string; startedAt?: string; stoppedAt?: string } | null;
  vehicle?: { licensePlate?: string; make?: string; model?: string } | null;
};

type GetResponse = { booking: BookingDetail };

const fmt = (value?: string) => {
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

const badgeClass = (status: string) => {
  switch (status) {
    case "RESERVED":
      return "bg-blue-50 text-blue-700";
    case "CHECKED_IN":
      return "bg-yellow-50 text-yellow-700";
    case "CANCELLED":
      return "bg-red-50 text-red-600";
    case "NO_SHOW":
      return "bg-orange-50 text-orange-700";
    case "COMPLETED":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const BookingManagementDetail: React.FC = () => {
  const { setTitle } = useTitle();
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<BookingDetail | null>(null);

  React.useEffect(() => {
    setTitle("Booking Details");
  }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!bookingId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<GetResponse>(`/admin/bookings/${bookingId}`);
        if (!mounted) return;
        setData(res.data.booking || null);
      } catch (err: unknown) {
        if (!mounted) return;
        const getErrorMessage = (e: unknown) => {
          try {
            const ae = e as { response?: { data?: { message?: string } }; message?: string };
            return ae?.response?.data?.message || ae?.message || "Unable to load booking details";
          } catch {
            return "Unable to load booking details";
          }
        };
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [bookingId]);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-4"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Booking Information</h2>
            {data?.status && (
              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(data.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {data.status}
              </span>
            )}
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500">Booking ID</div>
            <div className="font-medium">{data?.id || data?._id || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">User</div>
            <div className="font-medium">{data?.user?.name || data?.user?.email || data?.user?.id || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Station</div>
            <div className="font-medium">{data?.station?.name || data?.station?.code || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Connector</div>
            <div className="font-medium">{data?.connector?.code || data?.connector?.type || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Start Slot</div>
            <div className="font-medium">{fmt(data?.slotStart)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">End Slot</div>
            <div className="font-medium">{fmt(data?.slotEnd)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created At</div>
            <div className="font-medium">{fmt(data?.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">License Plate</div>
            <div className="font-medium">{data?.vehicle?.licensePlate || "—"}</div>
          </div>
        </div>
        {error && (
          <div className="px-6 pb-6 text-red-600 text-sm">{error}</div>
        )}
        {loading && (
          <div className="px-6 pb-6 text-gray-500 text-sm">Loading data...</div>
        )}
      </div>
    </div>
  );
};

export default BookingManagementDetail;


