import React from "react";
import DashboardStats from "../../components/common/DashboardStats";
import OngoingActivities from "../../components/common/OngoingActivities";

const Home: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardStats />
      <OngoingActivities />
    </div>
  );
};

export default Home;
