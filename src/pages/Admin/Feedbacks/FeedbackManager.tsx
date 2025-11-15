import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Eye, Star } from "lucide-react";
import { fetchFeedbacks } from "@redux/slice/Feedback/FeedbackThunks";
import { clearError } from "@redux/slice/Feedback/FeedbackSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import type { Feedback } from "@redux/slice/Feedback/FeedbackSlice";
import { useTitle } from "../../../contexts";

const FeedbackManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: feedbacks, loading, error } = useSelector((state: RootState) => state.feedback);
  const { setTitle } = useTitle();

  const [searchTerm, setSearchTerm] = useState("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    setTitle("Feedback Management");
  }, [setTitle]);

  // Fetch feedbacks
  const fetchFeedbacksWithFilters = React.useCallback(() => {
    const params: any = {};
    if (userIdFilter) params.userId = userIdFilter;

    dispatch(fetchFeedbacks(params));
  }, [dispatch, userIdFilter]);

  useEffect(() => {
    fetchFeedbacksWithFilters();
  }, [fetchFeedbacksWithFilters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleViewFeedback = (feedbackId: string) => {
    navigate(`/admin/feedbacks/view/${feedbackId}`);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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

  // Filter feedbacks based on search term and date range
  const filteredFeedbacks = feedbacks.filter((feedback: Feedback) => {
    const needle = searchTerm.trim().toLowerCase();
    if (needle) {
      const comment = (feedback.comment || "").toLowerCase();
      const id = (feedback.id || feedback._id || "").toLowerCase();
      const userId = (feedback.userId || "").toLowerCase();
      if (!comment.includes(needle) && !id.includes(needle) && !userId.includes(needle)) {
        return false;
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

    return true;
  });

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>

          {/* Date Range */}
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

          {/* User ID Filter */}
          <input
            type="text"
            placeholder="User ID"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            className="border border-[#333333] rounded-lg px-3 py-1 text-sm w-48"
          />
        </div>
      </div>

      <div className="border-b mb-4" />

      {/* Feedback List */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || userIdFilter
                      ? "No feedbacks found matching the search criteria"
                      : "No feedbacks yet"}
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((feedback: Feedback) => (
                  <tr key={feedback.id || feedback._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {feedback.id ? `${feedback.id.slice(0, 8)}...` : feedback._id || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {feedback.userId || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.rating ? renderStars(feedback.rating) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="max-w-xs truncate text-gray-900">
                        {feedback.comment || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewFeedback(feedback.id || feedback._id || "")}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="View details"
                        disabled={!feedback.id && !feedback._id}
                      >
                        <Eye size={16} />
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

export default FeedbackManager;

