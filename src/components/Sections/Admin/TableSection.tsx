import React from "react";

const transactions = [
  {
    status: "Completed",
    statusColor: "bg-green-100 text-green-600",
    card: "Visa card **** 4831",
    type: "Card payment",
    amount: "$182.94",
    date: "Jan 17, 2022",
    charger: "Charger #1",
  },
  {
    status: "Completed",
    statusColor: "bg-green-100 text-green-600",
    card: "Mastercard **** 6442",
    type: "Card payment",
    amount: "$99.00",
    date: "Jan 17, 2022",
    charger: "Charger #2",
  },
  {
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-600",
    card: "Account **** 882",
    type: "Bank payment",
    amount: "$249.94",
    date: "Jan 17, 2022",
    charger: "Charger #3",
  },
  {
    status: "Canceled",
    statusColor: "bg-red-100 text-red-600",
    card: "Amex card **** 5666",
    type: "Card payment",
    amount: "$199.24",
    date: "Jan 17, 2022",
    charger: "Charger #4",
  },
  {
    status: "Canceled",
    statusColor: "bg-red-100 text-red-600",
    card: "Amex card **** 5666",
    type: "Card payment",
    amount: "$199.24",
    date: "Jan 17, 2022",
    charger: "Charger #4",
  },
];

const customers = [
  {
    name: "Jenny Wilson",
    email: "w.lawson@example.com",
    amount: "$11,234",
    charger: "Charger #1",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Devon Lane",
    email: "dat.roberts@example.com",
    amount: "$11,159",
    charger: "Charger #2",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Jane Cooper",
    email: "jgraham@example.com",
    amount: "$10,483",
    charger: "Charger #3",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Dianne Russell",
    email: "curtis.d@example.com",
    amount: "$9,084",
    charger: "Charger #4",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Dianne Russell",
    email: "curtis.d@example.com",
    amount: "$9,084",
    charger: "Charger #4",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const TableSection: React.FC = () => (
  <div className="flex gap-6 mt-8">
    {/* Transactions Table */}
    <div className="bg-white rounded-xl border p-6 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-lg">Transactions</div>
          <div className="text-xs text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipis.
          </div>
        </div>
        <a
          href="#"
          className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
        >
          See All Transactions <span>&#8250;</span>
        </a>
      </div>
      <div>
        {transactions.map((t, i) => (
          <div
            key={i}
            className="flex items-center py-3 border-b last:border-b-0 text-sm"
          >
            {/* Status */}
            <div className="w-32 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  t.statusColor.split(" ")[0]
                }`}
              ></span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${t.statusColor}`}
              >
                {t.status}
              </span>
            </div>
            {/* Card */}
            <div className="flex-1">
              <div className="font-medium">{t.card}</div>
              <div className="text-xs text-gray-400">{t.type}</div>
            </div>
            {/* Amount */}
            <div className="w-24 font-semibold">{t.amount}</div>
            {/* Date */}
            <div className="w-28 text-gray-500">{t.date}</div>
            {/* Charger */}
            <div className="w-28 text-gray-500">{t.charger}</div>
            {/* More */}
            <div className="w-8 text-gray-400 text-xl text-center">...</div>
          </div>
        ))}
      </div>
    </div>
    {/* Recent Customers */}
    <div className="bg-white rounded-xl border p-6 w-80 flex-shrink-0">
      <div className="font-semibold text-lg mb-1">Recent Customers</div>
      <div className="text-xs text-gray-400 mb-4">
        Lorem ipsum dolor sit ametis.
      </div>
      <div className="flex flex-col gap-4">
        {customers.map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={c.avatar}
                alt={c.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-gray-400">{c.email}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm">{c.amount}</div>
              <div className="text-xs text-gray-400">{c.charger}</div>
            </div>
          </div>
        ))}
      </div>
      <a
        href="#"
        className="block text-xs text-blue-600 font-medium mt-6 hover:underline"
      >
        SEE ALL CUSTOMERS &nbsp; &gt;
      </a>
    </div>
  </div>
);

export default TableSection;
