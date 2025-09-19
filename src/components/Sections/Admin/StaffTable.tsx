import React from "react";
import { Trash2, Pencil } from "lucide-react";

interface Staff {
  name: string;
  username: string;
  avatar: string | null;
  status: string;
  joinDate: string;
  phone: string;
  email: string;
  role?: string;
}

interface StaffTableProps {
  staffList: Staff[];
}

const StaffTable: React.FC<StaffTableProps> = ({ staffList }) => (
  <div className="bg-white rounded-xl border">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-gray-500 border-b">
          <th className="px-4 py-3 text-left">
            <input type="checkbox" />
          </th>
          <th className="px-4 py-3 text-left font-semibold">Name</th>
          <th className="px-4 py-3 text-left font-semibold">
            Status <span className="text-xs">↓</span>
          </th>
          <th className="px-4 py-3 text-left font-semibold">Join Date</th>
          <th className="px-4 py-3 text-left font-semibold">Phone Number</th>
          <th className="px-4 py-3 text-left font-semibold">Email address</th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {staffList.map((staff, idx) => (
          <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
            <td className="px-4 py-3">
              <input type="checkbox" />
            </td>
            <td className="px-4 py-3 flex items-center gap-3">
              {staff.avatar ? (
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center font-semibold text-violet-600">
                  {staff.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
              )}
              <div>
                <div className="font-medium">{staff.name}</div>
                <div className="text-xs text-gray-400">{staff.username}</div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                Active
              </span>
            </td>
            <td className="px-4 py-3 text-gray-500">{staff.joinDate || ""}</td>
            <td className="px-4 py-3 text-gray-500">
              {staff.phone || staff.role || ""}
            </td>
            <td className="px-4 py-3 text-gray-500">{staff.email}</td>
            <td className="px-4 py-3 flex gap-2">
              <button className="text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
              <button className="text-gray-400 hover:text-blue-500">
                <Pencil size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default StaffTable;
