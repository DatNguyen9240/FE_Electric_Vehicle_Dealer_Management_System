import React from "react";
import { StaffTable, TableToolbar } from "@components/Admin";

const staffList = [
  {
    name: "Olivia Rhye",
    username: "@olivia",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "olivia@untitledui.com",
  },
  {
    name: "Phoenix Baker",
    username: "@phoenix",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "phoenix@untitledui.com",
  },
  {
    name: "Lana Steiner",
    username: "@lana",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "lana@untitledui.com",
  },
  {
    name: "Demi Wilkinson",
    username: "@demi",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "demi@untitledui.com",
  },
  {
    name: "Candice Wu",
    username: "@candice",
    avatar: null,
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "candice@untitledui.com",
  },
  {
    name: "Natali Craig",
    username: "@natali",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "natali@untitledui.com",
  },
  {
    name: "Drew Cano",
    username: "@drew",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "drew@untitledui.com",
  },
  {
    name: "Orlando Diggs",
    username: "@orlando",
    avatar: null,
    status: "Active",
    joinDate: "",
    phone: "",
    email: "orlando@untitledui.com",
    role: "UI Designer",
  },
  {
    name: "Andi Lane",
    username: "@andi",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "andi@untitledui.com",
  },
  {
    name: "Kate Morrison",
    username: "@kate",
    avatar: null,
    status: "Active",
    joinDate: "",
    phone: "0123456789",
    email: "kate@untitledui.com",
  },
];

const StaffManager: React.FC = () => {
  return (
    <div className="p-6">
      {/* Search and actions */}
      <TableToolbar
        searchPlaceholder="Search staff"
        createLabel="Create Staff"
        onSearchChange={undefined}
        onExport={undefined}
        onCreate={undefined}
      />
      {/* Table */}
      <StaffTable staffList={staffList} />
    </div>
  );
};

export default StaffManager;
