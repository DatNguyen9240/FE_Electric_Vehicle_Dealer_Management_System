import React from "react";

interface TableToolbarProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onExport?: () => void;
  onCreate?: () => void;
  createLabel?: string;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchPlaceholder = "Search",
  onSearchChange,
  onExport,
  onCreate,
  createLabel = "Create",
}) => (
  <div className="flex items-center justify-between mb-4">
    <input
      type="text"
      placeholder={searchPlaceholder}
      className="border rounded-lg px-4 py-2 w-72 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      onChange={(e) => onSearchChange?.(e.target.value)}
    />
    <div className="flex gap-2">
      <button
        className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50"
        onClick={onExport}
      >
        Export
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
        onClick={onCreate}
      >
        <span className="text-lg">+</span> {createLabel}
      </button>
    </div>
  </div>
);

export default TableToolbar;
