import React from "react";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body?: string;
  type: string;
  data?: unknown;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
}

const typeColor: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  booking: "bg-indigo-100 text-indigo-700",
  session: "bg-purple-100 text-purple-700",
  invoice: "bg-pink-100 text-pink-700",
  wallet: "bg-amber-100 text-amber-700",
  system: "bg-gray-100 text-gray-700",
  membership: "bg-cyan-100 text-cyan-700",
  "membership.purchase": "bg-cyan-100 text-cyan-700",
  "membership.switch": "bg-cyan-100 text-cyan-700",
};

const NotificationItem: React.FC<{ notification: Notification; onClick?: () => void }> = ({ notification, onClick }) => {
  const color = typeColor[notification.type] || "bg-gray-100 text-gray-700";
  return (
    <div
      className={`flex flex-col gap-1 p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${color} ${notification.isRead ? "opacity-60" : ""}`}
      onClick={onClick}
      tabIndex={0}
      role="button"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-base flex-1">{notification.title}</span>
        {!notification.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Chưa đọc" />}
      </div>
      {notification.body && <div className="text-sm text-gray-700">{notification.body}</div>}
      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
        <span>{notification.type}</span>
        {notification.createdAt && <span>• {new Date(notification.createdAt).toLocaleString()}</span>}
      </div>
    </div>
  );
};

export default NotificationItem;
