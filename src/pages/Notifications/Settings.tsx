import React from 'react';
import { useTitle } from '@contexts';
import { getNotificationPreferences, updateNotificationPreferences } from '@libs/notifications';
import { useUi } from '../../contexts/uiContextCore';

const Settings: React.FC = () => {
  const { setTitle } = useTitle();
  const { showToast } = useUi();
  const [loading, setLoading] = React.useState(false);
  const [prefs, setPrefs] = React.useState<any>({});
  // device token registration is currently handled on mobile or automatically
  // so we only expose preferences UI here

  React.useEffect(() => { setTitle('Notification settings'); }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    getNotificationPreferences().then((data) => {
      if (!mounted) return;
      setPrefs(data);
    }).catch((err: any) => {
      console.error(err);
      showToast('Failed to load preferences', 'error');
    }).finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [showToast]);

  // Device registration is intentionally removed from the web settings page

  const handleSavePrefs = async () => {
    try {
      setLoading(true);
      const payload: any = {};
      // push/email/sms toggles
      if (typeof prefs.pushEnabled !== 'undefined') payload.pushEnabled = Boolean(prefs.pushEnabled);
      if (typeof prefs.emailEnabled !== 'undefined') payload.emailEnabled = Boolean(prefs.emailEnabled);
      if (typeof prefs.smsEnabled !== 'undefined') payload.smsEnabled = Boolean(prefs.smsEnabled);
      if (typeof prefs.categories === 'object') payload.categories = { ...prefs.categories };

      await updateNotificationPreferences(payload);
      showToast('Preferences saved', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update preferences', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Notification settings</h2>

      {/* Device registration intentionally removed — use app / mobile flow for token setup */}

      <div className="mt-6 bg-white p-4 rounded-xl border">
        <h3 className="font-medium">Preferences</h3>
        {loading ? (
          <div className="text-gray-500 mt-2">Loading…</div>
        ) : (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(prefs.pushEnabled)} onChange={(e) => setPrefs((p:any) => ({ ...p, pushEnabled: e.target.checked }))} /> Push notifications</label>
            </div>
            <div>
              <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(prefs.emailEnabled)} onChange={(e) => setPrefs((p:any) => ({ ...p, emailEnabled: e.target.checked }))} /> Email</label>
            </div>
            <div>
              <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(prefs.smsEnabled)} onChange={(e) => setPrefs((p:any) => ({ ...p, smsEnabled: e.target.checked }))} /> SMS</label>
            </div>

            <div className="col-span-1 md:col-span-2 border-t pt-3">
              <h4 className="font-medium mb-2">Categories</h4>
              <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(prefs?.categories?.booking)} onChange={(e) => setPrefs((p:any) => ({ ...p, categories: { ...p.categories, booking: e.target.checked } }))} /> Booking</label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(prefs?.categories?.session)} onChange={(e) => setPrefs((p:any) => ({ ...p, categories: { ...p.categories, session: e.target.checked } }))} /> Session</label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(prefs?.categories?.invoice)} onChange={(e) => setPrefs((p:any) => ({ ...p, categories: { ...p.categories, invoice: e.target.checked } }))} /> Invoice</label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={Boolean(prefs?.categories?.marketing)} onChange={(e) => setPrefs((p:any) => ({ ...p, categories: { ...p.categories, marketing: e.target.checked } }))} /> Marketing</label>
            </div>

            <div className="col-span-1 md:col-span-2 mt-3">
              <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={handleSavePrefs} disabled={loading}>Save preferences</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
