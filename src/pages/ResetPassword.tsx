import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../redux/slice/Auth/authThunks';
import type { AppDispatch } from '../redux/store/store';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
    // If token is provided in URL, keep it but do not show it on UI
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Token is required');
    // Removed minimum length requirement per product request; only check for non-empty
    if (!password) return toast.error('Password is required');
    if (password !== confirm) return toast.error('Passwords do not match');
    setSubmitting(true);

    try {
      await dispatch(resetPassword({ token, password })).unwrap();
      toast.success('Password reset successfully. You can now sign in.');
      navigate('/login');
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err as any)?.msg || 'Reset failed';
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Reset password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your new password below.</p>
        <form onSubmit={handleSubmit}>
          {/* Token is kept from the reset link (query param) but hidden on the page
              for security (not shown or editable). If token is missing, prompt
              user to request a new reset from the Forgot Password page. */}
          {!token && (
            <div className="mb-4 text-sm text-gray-700">
              You need a valid reset link (token) to change your password. If you
              didn't receive one, please
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-blue-600 hover:underline ms-1"
              >
                request a new reset token
              </button>
              .
            </div>
          )}
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border mb-4"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 rounded border mb-4"
          />
          <div className="flex justify-between items-center">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={submitting || !token}>
              {submitting ? 'Resetting...' : 'Reset password'}
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

export default ResetPassword;
