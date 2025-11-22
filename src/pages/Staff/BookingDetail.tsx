import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "../../contexts";

type BookingDetail = {
  id?: string;
  _id?: string;
  reference?: string;
  user?: { id?: string; name?: string; fullName?: string; email?: string; phone?: string } | null;
  customerName?: string;
  vehicle?: { make?: string; model?: string; licensePlate?: string } | null;
  vehicleId?: string;
  station?: { id?: string; name?: string; code?: string } | null;
  stationId?: string;
  stationName?: string;
  connector?: { id?: string; code?: string; type?: string } | null;
  connectorId?: string;
  slotStart?: string | null;
  slotEnd?: string | null;
  status?: string | null;
  session?: { 
    id?: string; 
    status?: string;
    paymentMethod?: string;
    startedAt?: string;
    stoppedAt?: string;
  } | null;
  sessionId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const BookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<BookingDetail | null>(null);

  React.useEffect(() => {
    setTitle("Booking Details");
  }, [setTitle]);

  React.useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is required");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/staff/bookings`, { params: { search: bookingId, limit: 1 } });
        if (!mounted) return;
        const d = res.data as any;
        const items = d?.items || d?.data || d?.bookings || [];
        if (Array.isArray(items) && items.length > 0) {
          setBooking(items[0] as BookingDetail);
        } else {
          setError("Booking not found");
        }
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

  const fmt = (value?: string | null) => {
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

  const badgeClass = (status?: string | null) => {
    const s = String(status || "").toUpperCase();
    switch (s) {
      case "COMPLETED":
        return "bg-green-50 text-green-700";
      case "CHECKED_IN":
        return "bg-yellow-50 text-yellow-700";
      case "CANCELLED":
        return "bg-red-50 text-red-700";
      case "NO_SHOW":
        return "bg-orange-50 text-orange-700";
      case "RESERVED":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-4 hover:text-blue-600"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Booking Information</h2>
            {booking?.status && (
              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(booking.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {booking.status}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500">Loading data...</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-red-600">{error}</div>
        ) : !booking ? (
          <div className="px-6 py-10 text-center text-gray-500">No data</div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Booking ID</div>
              <div className="font-medium">{booking.id || booking._id || booking.reference || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Customer</div>
              <div className="font-medium">{booking.user?.name ?? booking.user?.fullName ?? booking.customerName ?? "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{booking.user?.email || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-medium">{booking.user?.phone || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Vehicle</div>
              <div className="font-medium">
                {booking.vehicle
                  ? `${booking.vehicle.make ?? ""} ${booking.vehicle.model ?? ""}`.trim() || "—"
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">License Plate</div>
              <div className="font-medium">{booking.vehicle?.licensePlate || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Station</div>
              <div className="font-medium">{booking.station?.name ?? booking.stationName ?? "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Connector</div>
              <div className="font-medium">
                {booking.connector?.code
                  ? `${booking.connector.code}${booking.connector.type ? ` (${booking.connector.type})` : ""}`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Slot Start</div>
              <div className="font-medium">{fmt(booking.slotStart)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Slot End</div>
              <div className="font-medium">{fmt(booking.slotEnd)}</div>
            </div>
            {booking.session && (
              <div>
                <div className="text-sm text-gray-500">Session ID</div>
                <div className="font-medium">{booking.session.id || "—"}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">Created At</div>
              <div className="font-medium">{fmt(booking.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Updated At</div>
              <div className="font-medium">{fmt(booking.updatedAt)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;

