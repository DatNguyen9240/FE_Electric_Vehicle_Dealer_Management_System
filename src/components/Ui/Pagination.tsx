import React from "react";

const Pagination: React.FC = () => (
  <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
    <button className="px-2 py-1 rounded hover:bg-gray-100">
      &larr; Previous
    </button>
    <button className="w-8 h-8 rounded bg-blue-600 text-white font-bold">
      1
    </button>
    <button className="w-8 h-8 rounded hover:bg-gray-100">2</button>
    <span>...</span>
    <button className="w-8 h-8 rounded hover:bg-gray-100">8</button>
    <button className="w-8 h-8 rounded hover:bg-gray-100">9</button>
    <button className="w-8 h-8 rounded hover:bg-gray-100">10</button>
    <button className="px-2 py-1 rounded hover:bg-gray-100">Next &rarr;</button>
  </div>
);

export default Pagination;
