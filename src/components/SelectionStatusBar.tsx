import React from 'react';
import { CheckSquare, Square, MessageSquare, X, Send } from 'lucide-react';
import { WhatsAppSvgIcon } from './LeadCard';

interface SelectionStatusBarProps {
  selectedCount: number;
  totalVisibleCount: number;
  onSelectAllPage: () => void;
  onSelectTop20: () => void;
  onSelectTop50: () => void;
  onClearSelection: () => void;
  onOpenBulkModal: () => void;
}

export const SelectionStatusBar: React.FC<SelectionStatusBarProps> = ({
  selectedCount,
  totalVisibleCount,
  onSelectAllPage,
  onSelectTop20,
  onSelectTop50,
  onClearSelection,
  onOpenBulkModal,
}) => {
  return (
    <div className="sticky bottom-4 z-40 w-full max-w-xl mx-auto px-2 font-['Hind_Siliguri',sans-serif]">
      <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-gray-700/80 animate-in slide-in-from-bottom-3 duration-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Left: Selected Count & Quick Actions */}
          <div className="flex items-center flex-wrap gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                নির্বাচিত: <span className="text-emerald-400 font-sans">{selectedCount}</span> টি
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onSelectAllPage}
                className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-200 px-2 py-1 rounded-md border border-gray-700 transition-colors cursor-pointer"
                title="বর্তমান পেজের সব সিলেক্ট করুন"
              >
                পৃষ্ঠার সব
              </button>
              <button
                type="button"
                onClick={onSelectTop20}
                className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-200 px-2 py-1 rounded-md border border-gray-700 transition-colors cursor-pointer"
                title="প্রথম ২০টি সিলেক্ট করুন"
              >
                শীর্ষ ২০
              </button>
              <button
                type="button"
                onClick={onSelectTop50}
                className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-200 px-2 py-1 rounded-md border border-gray-700 transition-colors cursor-pointer"
                title="প্রথম ৫০টি সিলেক্ট করুন"
              >
                শীর্ষ ৫০
              </button>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="text-[11px] text-gray-400 hover:text-rose-300 p-1 rounded hover:bg-gray-800 transition-colors"
                  title="সিলেকশন মুছুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Send WhatsApp Bulk Message Action */}
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={onOpenBulkModal}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer ${
              selectedCount > 0
                ? 'bg-[#25D366] hover:bg-[#1faa4b] text-white shadow-green-900/40'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <WhatsAppSvgIcon className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>বাল্ক WhatsApp পাঠান ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
