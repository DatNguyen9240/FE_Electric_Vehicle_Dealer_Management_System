import React from 'react';
import { Search, Star } from 'lucide-react';
import api from '@libs/axios';
import { useUi } from '../../contexts/uiContextCore';
import { useTitle } from '../../contexts';

type Feedback = {
  id?: string;
  _id?: string;
  userId?: string;
  user?: { id?: string; name?: string; fullName?: string; email?: string; phone?: string } | null;
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
  const [search, setSearch] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState<string>("");
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
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

  const getUserName = (feedback: Feedback) => {
    // Use user object from API
    if (feedback.user) {
      return feedback.user.name || feedback.user.fullName || feedback.user.email || "—";
    }
    // Fallback to userId if user object not available
    return feedback.userId || "—";
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateString));
    } catch {
      return "—";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Filter feedbacks
  const filteredFeedbacks = list.filter((feedback) => {
    if (ratingFilter) {
      const bucket = Number(ratingFilter);
      if (!Number.isNaN(bucket)) {
        const value = typeof feedback.rating === "number" ? feedback.rating : null;
        if (value === null) return false;
        const lowerBound = bucket;
        const upperBound = bucket === 5 ? 5.0001 : bucket + 1;
        if (value < lowerBound || value >= upperBound) return false;
      }
    }

    if (fromDate && feedback.createdAt) {
      try {
        const feedbackDate = new Date(feedback.createdAt);
        const from = new Date(fromDate);
        if (feedbackDate < from) return false;
      } catch {
        return false;
      }
    }

    if (toDate && feedback.createdAt) {
      try {
        const feedbackDate = new Date(feedback.createdAt);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (feedbackDate > to) return false;
      } catch {
        return false;
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const comment = (feedback.comment || "").toLowerCase();
      const userName = getUserName(feedback).toLowerCase();
      if (!comment.includes(searchLower) && !userName.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedbacks..."
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Feedback List</h2>
            <span className="text-sm text-gray-500">{filteredFeedbacks.length} results</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {ratingFilter || fromDate || toDate || search
                      ? "No feedbacks found matching the search criteria"
                      : "No feedbacks yet"}
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((f) => {
                  const feedbackId = f.id || f._id;
                  return (
                    <tr key={feedbackId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {f.id ? `${f.id.slice(0, 8)}...` : f._id || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {getUserName(f)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {f.rating ? renderStars(f.rating) : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-xs truncate text-gray-900" title={f.comment || undefined}>
                          {f.comment || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(f.createdAt)}
                      </td>
                      
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Feedbacks;
