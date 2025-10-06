import React from "react";

interface AdminChargerCardProps {
  id: string | number;
  status: string;
  statusColor: string;
  img: string;
  remainingTime?: string;
  onClick?: () => void;
  onTogglePower?: (id: string | number, isOn: boolean) => void;
  isPowerOn?: boolean;
}

const AdminChargerCard: React.FC<AdminChargerCardProps> = ({
  id,
  status,
  statusColor,
  img,
  onClick,
  onTogglePower,
  isPowerOn = true,
}) => {
  const handleTogglePower = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onTogglePower) {
      onTogglePower(id, !isPowerOn);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow pt-6 flex flex-col items-center cursor-pointer relative"
      onClick={onClick}
    >
      {/* Power Status Badge */}
      <div className="absolute top-3 right-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
          isPowerOn ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isPowerOn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          {isPowerOn ? 'ON' : 'OFF'}
        </span>
      </div>

      <img
        src={img}
        alt={`Charger ${id}`}
        className="w-[250px] h-[300px] object-contain mb-4"
      />
      <div className="text-center w-full">
        <div className="font-medium text-lg mb-2">Charger #{id}</div>
        <div className="font-semibold text-base mb-2">
          Status: <span className={statusColor}>{status}</span>
        </div>
        
        {/* Toggle Power Button */}
        <button
          type="button"
          onClick={handleTogglePower}
          className={`w-full font-semibold py-3 px-4 transition-colors ${
            isPowerOn 
              ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
              : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'
          }`}
        >
          {isPowerOn ? 'Turn Off' : 'Turn On'}
        </button>
      </div>
    </div>
  );
};

export default AdminChargerCard;
