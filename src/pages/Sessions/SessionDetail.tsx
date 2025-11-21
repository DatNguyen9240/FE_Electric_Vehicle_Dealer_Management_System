import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '@libs/axios';
// no links: remove direct action buttons from user session detail
import { useTitle } from '@contexts';

const fmt = (value?: string | null) => {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return value ?? '—';
  }
};

const badgeClass = (status?: string | null) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-50 text-green-700';
    case 'COMPLETED':
      return 'bg-blue-50 text-blue-700';
    case 'FAILED':
      return 'bg-red-50 text-red-600';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

const SessionDetail: React.FC = () => {
  const { setTitle } = useTitle();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any | null>(null);

  React.useEffect(() => {
    setTitle('Session Details');
  }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/sessions/${sessionId}`);
        const payload = res.data || {};
        // some endpoints return { session: {...} } but our public endpoint should just return the session payload
        const session = payload.session || payload;
        if (!mounted) return;
        setData(session || null);
      } catch (err: unknown) {
        if (!mounted) return;
        const ae = err as any;
        setError(ae?.response?.data?.message || ae?.message || 'Unable to load session details');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sessionId]);

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
            <h2 className="text-lg font-semibold text-gray-900">Session Information</h2>
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
            <div className="text-sm text-gray-500">Session ID</div>
            <div className="font-medium">{data?.id || data?._id || '—'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Station</div>
            <div className="font-medium">{data?.station?.name || data?.station?.code || '—'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Booking</div>
            <div className="font-medium">{data?.booking?.id || data?.bookingId || '—'}</div>
            <div className="text-sm text-gray-400">Status: {data?.booking?.status || '—'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Connector</div>
            <div className="font-medium">{data?.connector?.code || data?.connector?.type || '—'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Connector Type / Power</div>
            <div className="font-medium">{(data?.connector?.type || '—') + (data?.connector?.powerKw ? ` • ${data.connector.powerKw} kW` : '')}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Started At</div>
            <div className="font-medium">{fmt(data?.startedAt || data?.createdAt)}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Stopped At</div>
            <div className="font-medium">{fmt(data?.stoppedAt)}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Charge minutes / Idle minutes</div>
            <div className="font-medium">{(data?.totalChargingMinutes ?? data?.chargeDurationMinutes ?? '—')} / {(data?.totalIdleMinutes ?? '—')}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">SoC (start / end)</div>
            <div className="font-medium">{data?.socStart ?? '—'}% / {data?.socEnd ?? '—'}%</div>
          </div>

          <div className="md:col-span-2">
            {typeof data?.billing?.totalAmount === 'number' ? (
              <div className="text-sm text-gray-500">
                Total Amount: <span className="font-bold text-2xl text-green-600">{(data.billing.totalAmount || 0).toLocaleString('vi-VN')} {data.billing.currency || 'VND'}</span>
              </div>
            ) : (
              <div className="font-medium">—</div>
            )}
          </div>

          {data?.billing && (
            <div className="md:col-span-2">
              <div className="text-sm text-gray-500">Billing breakdown</div>
              <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-700">
                <div>Charging: {data.billing.chargingAmount?.toLocaleString() ?? '—'} {data.billing.currency || ''}</div>
                <div>Idle: {data.billing.idleAmount?.toLocaleString() ?? '—'} {data.billing.currency || ''}</div>
                <div>Energy: {(data.billing.breakdown?.energyKwh ?? '—')} kWh</div>
                <div>Charging rate: {(data.billing.breakdown?.chargingRatePerKwh ?? '—')} per kWh</div>
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            {error && <div className="text-red-600">{error}</div>}
            {loading && <div className="text-gray-500">Loading data...</div>}
          </div>

          {/* Removed action buttons (Open Booking / View Invoice) per request */}
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
