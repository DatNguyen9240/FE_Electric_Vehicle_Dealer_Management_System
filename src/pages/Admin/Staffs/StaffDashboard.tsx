import React from "react";
import { useTitle } from "@contexts";
import { Users, Calendar, Activity, PieChart } from "lucide-react";

const StatCard: React.FC<{ title: string; value: string; icon?: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  </div>
);

const ActivityItem: React.FC<{ title: string; time: string; user?: string }> = ({ title, time, user }) => (
  <div className="py-3 flex items-start justify-between">
    <div>
      <div className="text-sm font-medium">{title}</div>
      {user && <div className="text-xs text-gray-500">{user}</div>}
    </div>
    <div className="text-xs text-gray-400">{time}</div>
  </div>
);

const StaffDashboard: React.FC = () => {
  const { setTitle } = useTitle();

  React.useEffect(() => {
    setTitle("Staff dashboard");
  }, [setTitle]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Staff dashboard</h1>
          <p className="text-sm text-gray-600">Overview of staff activity and important metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded bg-white border hover:bg-gray-50">Refresh</button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Invite staff</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total staff" value="24" icon={<Users className="w-5 h-5" />} />
        <StatCard title="Active today" value="8" icon={<Activity className="w-5 h-5" />} />
        <StatCard title="Pending invites" value="2" icon={<Calendar className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Recent activity</h2>
          <div className="divide-y">
            <ActivityItem title="Olivia updated role to Manager" time="2 hours ago" user="Olivia" />
            <ActivityItem title="Phoenix reset their password" time="5 hours ago" user="Phoenix" />
            <ActivityItem title="New staff invite sent to kate@example.com" time="1 day ago" user="System" />
            <ActivityItem title="Demi suspended account" time="2 days ago" user="Admin" />
          </div>
        </section>

        <aside className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Quick stats</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Active this month</span>
              <span className="font-medium">18</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Admins</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Support</span>
              <span className="font-medium">6</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StaffDashboard;
