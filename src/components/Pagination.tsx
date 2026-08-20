import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white border border-blue-100/90 rounded-xl p-3 shadow-xs my-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 font-['Hind_Siliguri',sans-serif]">
      {/* Item info and Page Size selector */}
      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700">
        <span>
          দেখাচ্ছে <strong className="text-gray-900 font-sans">{startItem}-{endItem}</strong> (মোট <strong className="text-gray-900 font-sans">{totalItems}</strong> টি)
        </span>

        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-xs">প্রতি পৃষ্ঠায়:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-0.5 text-xs font-bold text-gray-800 bg-white"
          >
            <option value={20}>২০ টি</option>
            <option value={50}>৫০ টি</option>
            <option value={100}>১০০ টি</option>
          </select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
          title="প্রথম পৃষ্ঠা"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
          title="পূর্ববর্তী পৃষ্ঠা"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 text-xs sm:text-sm font-bold text-[#2c5898] bg-blue-50 border border-blue-200 rounded-lg font-sans">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
          title="পরবর্তী পৃষ্ঠা"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
          title="শেষ পৃষ্ঠা"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
