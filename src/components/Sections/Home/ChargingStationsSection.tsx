import React from "react";

const stations = [
  {
    id: 1,
    status: "Charging",
    statusColor: "text-red-500",
    bookUrl: "#",
    img: "/station/01.png",
  },
  {
    id: 2,
    status: "Available",
    statusColor: "text-green-600",
    bookUrl: "#",
    img: "/station/01.png",
  },
  {
    id: 3,
    status: "Out of Service",
    statusColor: "text-yellow-500",
    bookUrl: "#",
    img: "/station/01.png",
  },
];

const ChargingStationsSection: React.FC = () => {
  return (
    <section className="w-full py-12 md:py-20 bg-white">
      <div>
        {/* Title & subtitle */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-2 text-center">
            Active Charging Stations
          </h2>
          <p className="text-gray-600 text-base md:text-lg text-center">
            Monitor real-time status of your EV chargers and slots availability.
          </p>
        </div>
        {/* Cards + Get all */}
        <div className="flex flex-col md:flex-row md:items-start md:gap-8 relative">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {stations.map((station, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center"
              >
                <img
                  src={station.img}
                  alt={`Charger ${station.id}`}
                  className="w-[220px] h-[320px] object-contain mb-4"
                />
                <div className="text-center">
                  <div className="font-medium text-lg mb-1">
                    Charger #{station.id}
                  </div>
                  <div className="font-semibold text-base mb-2">
                    Status:{" "}
                    <span className={station.statusColor}>
                      {station.status}
                    </span>
                  </div>
                  <a
                    href={station.bookUrl}
                    className="text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1"
                  >
                    Book now
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
          {/* Get all link */}
          <div className="flex md:flex-col justify-center md:justify-center items-center md:items-start md:ml-8 mt-6 md:mt-0 md:self-center">
            <a
              href="#"
              className="text-blue-600 font-semibold text-lg flex items-center gap-2 hover:underline"
            >
              Get all
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChargingStationsSection;
