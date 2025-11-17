import React from 'react';
import api from '@libs/axios';
import { useUi } from '../../contexts/uiContextCore';
import { useTitle } from '../../contexts';

type Feedback = {
  id?: string;
  _id?: string;
  userId?: string;
  rating?: number;
  comment?: string;
  bookingId?: string;
  status?: string;
  note?: string;
  handledBy?: string;
  handledAt?: string;
  createdAt?: string;
};

const Feedbacks: React.FC = () => {
  const [list, setList] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { showToast } = useUi();
  const { setTitle } = useTitle();

  React.useEffect(() => { setTitle('Feedbacks'); }, [setTitle]);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedbacks');
      const d: any = res.data;
      const items = d?.feedbacks || d?.items || d?.data || d || [];
      setList(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load feedbacks', err);
      showToast('Failed to load feedbacks', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => { fetch(); }, [fetch]);

  // API returns a simple feedback object (see sample). No status/note editing available.

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Feedbacks</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetch}
            className="px-3 py-1.5 rounded-lg border text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : list.length === 0 ? (
          <div className="text-gray-400 italic">No feedbacks found</div>
        ) : (
          <ul className="space-y-3">
            {list.map((f) => (
              <li key={f.id ?? f._id} className="border p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-600">User: {f.userId ?? '-'}</div>
                    <div className="font-medium text-gray-800">{f.comment ?? '-'}</div>
                    <div className="text-xs text-gray-500">Booking: {f.bookingId ?? '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{f.rating ?? '-' } ★</div>
                    <div className="text-xs text-gray-500">{f.createdAt ? new Date(f.createdAt).toLocaleString() : '-'}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Feedbacks;
