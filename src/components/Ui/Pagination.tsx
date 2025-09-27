import React from "react";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage = 1, 
  totalPages = 10, 
  onPageChange 
}) => {
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
      <button 
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &larr; Previous
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            currentPage === page
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}
      
      <button 
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next &rarr;
      </button>
    </div>
  );
};

export default Pagination;
