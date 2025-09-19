import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import TableToolbar from "@components/Admin/TableToolbar";

const paymentData = [
  {
    amount: "$9.54",
    status: "Succeeded",
    description: "Invoice 6B1E73DA~0017",
    customer: "manhhackht08@gmail.com",
    date: "Dec 30, 09:42 PM",
  },
  {
    amount: "$12.83",
    status: "Succeeded",
    description: "Invoice 6B1E73DA~0017",
    customer: "trungkienspktnd@gmail.com",
    date: "Dec 29, 09:42 PM",
  },
  {
    amount: "$0.19",
    status: "Succeeded",
    description: "Invoice 6B1E73DA~0017",
    customer: "danghoang87hl@gmail.com",
    date: "Dec 28, 11:14 PM",
  },
  // ...thêm các dòng khác tương tự...
];

const tabs = ["Succeeded", "Refunded", "Uncaptured", "All"];

const PaymentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Succeeded");

  // Lọc dữ liệu theo tab nếu cần, ở đây chỉ demo tab Succeeded
  const filteredData = paymentData; // Có thể lọc theo status nếu có nhiều loại

  return (
    <div className="p-6">
      {/* Tabs */}
      {/* Toolbar */}
      <TableToolbar
        searchPlaceholder="Search payment"
        createLabel="Create payment"
      />
      <div className="flex gap-6 border-b mb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-2 px-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="px-4 py-3 text-left">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Amount</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
              <th className="px-4 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3">{row.amount}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                    <CheckCircle size={14} className="text-green-500" />
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">{row.description}</td>
                <td className="px-4 py-3">{row.customer}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3 text-gray-400 text-xl text-center">
                  ...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManager;
