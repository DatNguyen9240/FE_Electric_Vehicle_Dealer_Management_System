import React from "react";

interface LableTitleProps {
  children: React.ReactNode;
}

const LableTitle: React.FC<LableTitleProps> = ({ children }) => (
  <div className="flex items-center w-full">
    <div className="border-t border-gray-200 w-16"></div>
    <h2 className="font-bold text-2xl pl-10 pr-8 whitespace-nowrap">
      {children}
    </h2>
    <div className="flex-1 border-t border-gray-200"></div>
  </div>
);

export default LableTitle;
