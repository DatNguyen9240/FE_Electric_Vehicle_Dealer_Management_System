import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changePassword } from '../redux/slice/Auth/authThunks';
import type { AppDispatch } from '../redux/store/store';

const ChangePassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return toast.error('Current password is required');
    // Removed minimum length requirement per product request; only check password is non-empty
    if (!newPassword) return toast.error('New password is required');
    if (newPassword !== confirm) return toast.error('Passwords do not match');
    setSubmitting(true);
    try {
      await dispatch(changePassword({ currentPassword: current, newPassword })).unwrap();
      toast.success('Password changed successfully');
      navigate('/profile');
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err as any)?.msg || 'Change failed';
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Change password</h2>
        <p className="text-sm text-gray-600 mb-4">Set a new password for your account.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full px-4 py-2 rounded border mb-4"
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border mb-4"
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 rounded border mb-4"
            required
          />
          <div className="flex justify-between items-center">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={submitting}>
              {submitting ? 'Saving...' : 'Change password'}
            </button>
            <button onClick={() => navigate('/profile')} type="button" className="text-sm text-gray-600 hover:underline">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
