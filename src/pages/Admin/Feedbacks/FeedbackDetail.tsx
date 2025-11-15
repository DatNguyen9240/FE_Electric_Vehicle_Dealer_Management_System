import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Edit, Star } from "lucide-react";
import { getFeedback } from "@redux/slice/Feedback/FeedbackThunks";
import { clearError } from "@redux/slice/Feedback/FeedbackSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";

const FeedbackDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedFeedback } = useSelector((state: RootState) => state.feedback);
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Feedback Details");
  }, [setTitle]);

  useEffect(() => {
    if (feedbackId) {
      dispatch(getFeedback(feedbackId));
    }
  }, [dispatch, feedbackId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEdit = () => {
    if (selectedFeedback) {
      navigate(`/admin/feedbacks/edit/${selectedFeedback.id}`);
    }
  };

  const handleBack = () => {
    navigate("/admin/feedbacks");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-2 text-lg font-medium text-gray-700">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (!selectedFeedback) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">Feedback not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* Feedback Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Feedback Information</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback ID
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">
                {selectedFeedback.id}
              </div>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">
                {selectedFeedback.userId}
              </div>
            </div>

            {/* Booking ID */}
            {selectedFeedback.bookingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking ID
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">
                  {selectedFeedback.bookingId}
                </div>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {renderStars(selectedFeedback.rating)}
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created At
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formatDate(selectedFeedback.createdAt)}
              </div>
            </div>

            {/* Updated At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Updated At
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formatDate(selectedFeedback.updatedAt)}
              </div>
            </div>

            {/* Handled By */}
            {selectedFeedback.handledBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handled By
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">
                  {selectedFeedback.handledBy}
                </div>
              </div>
            )}

            {/* Handled At */}
            {selectedFeedback.handledAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handled At
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {formatDate(selectedFeedback.handledAt)}
                </div>
              </div>
            )}

            {/* Comment - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[100px] whitespace-pre-wrap">
                {selectedFeedback.comment || "—"}
              </div>
            </div>

            {/* Note - Full Width */}
            {selectedFeedback.note && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Note
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-gray-900 min-h-[80px] whitespace-pre-wrap">
                  {selectedFeedback.note}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit size={16} />
          Edit Feedback
        </button>
      </div>
    </div>
  );
};

export default FeedbackDetail;

