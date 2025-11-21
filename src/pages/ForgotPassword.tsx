import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../redux/slice/Auth/authThunks';
import type { AppDispatch } from '../redux/store/store';

const ForgotPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await dispatch(forgotPassword({ email })).unwrap();
      // backend may return token directly for mobile; show success
      toast.success('A password reset token has been issued. Check your email or the app.');
      if (res && res.token) {
        // Pre-fill reset page with token so user can change immediate
        navigate(`/reset-password?token=${encodeURIComponent(res.token)}`);
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err as any)?.msg || 'Request failed';
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Forgot password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your email address to receive a reset token.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded border mb-4"
          />
          <div className="flex justify-between items-center">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send reset token'}
            </button>
            <button type="button" className="text-sm text-gray-600 hover:underline" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
