import React from "react";

const OurMissionSectionV2: React.FC = () => {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        {/* Image bên trái */}
        <div className="md:w-1/2 w-full flex justify-center">
          <img
            src="/station/03.png"
            alt="EV Car Charging"
            className="w-full max-w-lg object-contain rounded"
            draggable={false}
          />
        </div>
        {/* Text bên phải */}
        <div className="md:w-1/2 w-full">
          <p className="mb-4 text-gray-800">
            <span className="font-bold">Reliable:</span> E.V.C is a reliable
            electric car charging application with charging devices from
            European brands, and always listens to customer opinions to improve
            the application's features. Help customers have the best experience
            when charging at EV ONE public charging stations.
          </p>
          <p className="text-gray-800">
            <span className="font-bold">Reasonable cost:</span> EV ONE provides
            customers with reasonable charging costs for users, not only
            applicable to individual customers, but businesses and organizations
            can also register for individually designed charging packages
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurMissionSectionV2;
