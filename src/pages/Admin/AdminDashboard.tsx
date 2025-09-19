import { ChartSection, TableSection } from "@components/Sections/Admin";
import React from "react";
import { useTitle } from "../../contexts";
const AdminDashboard: React.FC = () => {
  const { setTitle } = useTitle();

  React.useEffect(() => {
    setTitle("Admin Dashboard");
  }, [setTitle]);

  return (
    <>
      <ChartSection />
      <TableSection />
    </>
  );
};

export default AdminDashboard;
