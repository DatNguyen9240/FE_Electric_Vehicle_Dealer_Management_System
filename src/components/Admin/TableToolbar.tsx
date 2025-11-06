import React from "react";

interface TableToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onExport?: () => void;
  onCreate?: () => void;
  createLabel?: string;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchPlaceholder = "Search",
  searchValue = "",
  onSearchChange,
  onExport,
  onCreate,
  createLabel = "Create",
}) => (
  <div className="flex items-center justify-between mb-4">
    <input
      type="text"
      placeholder={searchPlaceholder}
      value={searchValue}
      className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
      onChange={(e) => onSearchChange?.(e.target.value)}
    />
    <div className="flex gap-2">
      <button
        className="flex items-center gap-2 border px-5 py-1 rounded-lg text-sm font-medium bg-white hover:bg-[#333333] hover:text-white"
        onClick={onExport}
      >
        Export
      </button>
      <button
        className="flex items-center gap-2 px-7 py-1 rounded-lg text-sm font-medium bg-[#4094F7] text-white hover:bg-blue-500"
        onClick={onCreate}
      >
        <span className="text-lg">+</span> {createLabel}
      </button>
    </div>
  </div>
);

export default TableToolbar;
