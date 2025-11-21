import api from './axios';

export async function registerDeviceToken(payload: { token: string; platform?: string; deviceId?: string; enabled?: boolean; }) {
  const res = await api.post('/notifications/devices', payload);
  return res.data;
}

export async function getNotificationPreferences() {
  const res = await api.get('/notifications/preferences');
  return res.data?.preferences ?? {};
}

export async function updateNotificationPreferences(payload: any) {
  const res = await api.patch('/notifications/preferences', payload);
  return res.data?.preferences ?? {};
}
