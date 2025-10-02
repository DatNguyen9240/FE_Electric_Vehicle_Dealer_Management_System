import React from "react";

interface Connector {
  status: string;
  remainingTime: string;
}

interface ChargingStation {
  id: number;
  name: string;
  location: string;
  status: string;
  statusColor: string;
  img: string;
  connectors: number;
  power: string;
  connector1?: Connector;
  connector2?: Connector;
}

interface ChargingStationCardPopupProps {
  stations: ChargingStation[];
  selectedStation: number | null;
  onStationSelect: (stationId: number) => void;
}

const ChargingStationCardPopup: React.FC<ChargingStationCardPopupProps> = ({
  stations,
  selectedStation,
  onStationSelect,
}) => {
  const hasAvailableConnector = (station: ChargingStation) => {
    const connector1 = station.connector1?.status || station.status;
    const connector2 = station.connector2?.status || "Available";
    
    // Nếu cả 2 đều không Available thì disable
    if (connector1 !== "Available" && connector2 !== "Available") {
      return false;
    }
    return true;
  };

  return (
  <div className="lg:w-2/3 w-full flex flex-col border-r overflow-hidden">
    <div className="flex-1 overflow-y-auto p-6 pt-4">
      <div className="space-y-4">
         {stations.map((station) => {
           const isAvailable = hasAvailableConnector(station);
           return (
           <div
             key={station.id}
             className={`border rounded-xl p-4 transition ${
               !isAvailable 
                 ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                 : selectedStation === station.id
                 ? "border-blue-500 bg-blue-50 cursor-pointer"
                 : "border-gray-200 hover:border-gray-300 cursor-pointer"
             }`}
             onClick={() => isAvailable && onStationSelect(station.id)}
           >
            <div className="flex items-start gap-10 ms-4">
              <div className="flex-shrink-0">
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow pt-6 flex flex-col items-center">
                  <img
                    src={station.img}
                    alt={`Charger ${station.id}`}
                    className="w-[200px] h-[250px] object-contain mb-4"
                  />
                  
                </div>
              </div>
              <div className="flex-1 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {station.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    {station.location}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{station.connectors} Connectors</span>
                    <span>{station.power} Power</span>
                  </div>
                   <div className="mt-4">
                     <h1 className="font-semibold ">Connector 1</h1>
                     <div className=" text-sm my-2">
                       Status:{" "}
                       <span className={station.connector1?.status === "Available" ? "text-green-600" : "text-red-500"}>
                         {station.connector1?.status || station.status}
                       </span>
                     </div>
                     <div className="text-sm mb-4">
                       Remaining Time:{" "}
                       <span className="text-gray-600">
                         {station.connector1?.remainingTime || ""}
                       </span>
                     </div>
                   </div>
                   <div className="mt-4">
                     <h1 className="font-semibold ">Connector 2</h1>
                     <div className="text-sm my-2">
                       Status:{" "}
                       <span className={station.connector2?.status === "Available" ? "text-green-600" : "text-red-500"}>
                         {station.connector2?.status || "Available"}
                       </span>
                     </div>
                     <div className="text-sm mb-4">
                       Remaining Time:{" "}
                       <span className="text-gray-600">
                         {station.connector2?.remainingTime || ""}
                       </span>
                     </div>
                   </div>
                  {" "}
                </div>
              </div>

              <div className="flex-shrink-0">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedStation === station.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>
           </div>
           );
         })}
       </div>
     </div>
   </div>
   );
 };

export default ChargingStationCardPopup;
