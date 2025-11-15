import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";
import { getFeedback, updateFeedback } from "@redux/slice/Feedback/FeedbackThunks";
import { clearError } from "@redux/slice/Feedback/FeedbackSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";

const FeedbackEdit: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedFeedback } = useSelector((state: RootState) => state.feedback);
  const { setTitle } = useTitle();

  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle("Edit Feedback");
  }, [setTitle]);

  useEffect(() => {
    if (feedbackId) {
      dispatch(getFeedback(feedbackId));
    }
  }, [dispatch, feedbackId]);

  useEffect(() => {
    if (selectedFeedback) {
      setNote(selectedFeedback.note || "");
    }
  }, [selectedFeedback]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackId) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        updateFeedback({
          feedbackId,
          note: note.trim() || null,
        })
      ).unwrap();
      toast.success("Feedback updated successfully");
      navigate(`/admin/feedbacks/view/${feedbackId}`);
    } catch (err) {
      toast.error(err as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (feedbackId) {
      navigate(`/admin/feedbacks/view/${feedbackId}`);
    } else {
      navigate("/admin/feedbacks");
    }
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
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Feedback {selectedFeedback.id.slice(0, 8)}
          </h1>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Update Feedback</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback Info (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm">
                {selectedFeedback.userId}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {selectedFeedback.rating} / 5
              </div>
            </div>

            {/* Comment (Read-only) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 min-h-[80px] whitespace-pre-wrap">
                {selectedFeedback.comment || "—"}
              </div>
            </div>

            {/* Internal Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Add internal note about this feedback..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                This note is only visible to admin and staff
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSubmitting ? "Updating..." : "Update Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackEdit;

