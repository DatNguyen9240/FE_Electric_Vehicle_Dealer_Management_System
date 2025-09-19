import React, { useEffect } from "react";
import { StaffTable, TableToolbar } from "@components/Admin";
import { useTitle } from "../../../contexts";

const userList = [
  {
    name: "Olivia Rhye",
    username: "@olivia",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active",
    joinDate: "2022-01-10",
    phone: "0123456789",
    email: "olivia@untitledui.com",
  },
  {
    name: "Phoenix Baker",
    username: "@phoenix",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "Active",
    joinDate: "2022-01-12",
    phone: "0123456789",
    email: "phoenix@untitledui.com",
  },
  {
    name: "Lana Steiner",
    username: "@lana",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    status: "Active",
    joinDate: "2022-01-15",
    phone: "0123456789",
    email: "lana@untitledui.com",
  },
  {
    name: "Demi Wilkinson",
    username: "@demi",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "Active",
    joinDate: "2022-01-18",
    phone: "0123456789",
    email: "demi@untitledui.com",
  },
  {
    name: "Candice Wu",
    username: "@candice",
    avatar: "",
    status: "Active",
    joinDate: "2022-01-20",
    phone: "0123456789",
    email: "candice@untitledui.com",
  },
  {
    name: "Natali Craig",
    username: "@natali",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    status: "Active",
    joinDate: "2022-01-22",
    phone: "0123456789",
    email: "natali@untitledui.com",
  },
  {
    name: "Drew Cano",
    username: "@drew",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    status: "Active",
    joinDate: "2022-01-25",
    phone: "0123456789",
    email: "drew@untitledui.com",
  },
  {
    name: "Orlando Diggs",
    username: "@orlando",
    avatar: "",
    status: "Active",
    joinDate: "2022-01-28",
    phone: "",
    email: "orlando@untitledui.com",
    role: "UI Designer",
  },
  {
    name: "Andi Lane",
    username: "@andi",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    status: "Active",
    joinDate: "2022-02-01",
    phone: "0123456789",
    email: "andi@untitledui.com",
  },
  {
    name: "Kate Morrison",
    username: "@kate",
    avatar: "",
    status: "Active",
    joinDate: "2022-02-05",
    phone: "0123456789",
    email: "kate@untitledui.com",
  },
];

const UserManager: React.FC = () => {
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Users");
  }, [setTitle]);

  return (
    <div className="p-6">
      <TableToolbar createLabel="Create User" searchPlaceholder="Search user" />
      <StaffTable staffList={userList} />
    </div>
  );
};

export default UserManager;
