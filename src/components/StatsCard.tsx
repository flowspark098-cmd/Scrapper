import React from 'react';

interface StatsCardProps {
  totalPages?: number;
  activeAdvertisers?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  totalPages = 324,
  activeAdvertisers = 189,
}) => {
  return (
    <div className="bg-white border border-blue-100/90 rounded-xl p-4 shadow-xs mb-3.5 relative overflow-hidden">
      {/* Decorative Network Circuit Header */}
      <div className="relative flex items-center justify-between mb-3 px-1">
        {/* Left Circuit Path with Facebook Node */}
        <div className="flex-1 flex items-center">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
            {/* Top small dot */}
            <circle cx="10" cy="8" r="3" fill="#2c5898" />
            {/* Connecting line */}
            <path
              d="M 10 8 L 10 18 Q 10 22 15 22 L 95 22"
              stroke="#2c5898"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Facebook node circle */}
            <circle cx="20" cy="22" r="5.5" fill="#1877F2" />
            <text x="20" y="25" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">f</text>
          </svg>
        </div>

        {/* Center Node + Title + Right Node */}
        <div className="flex items-center gap-1.5 px-2.5 shrink-0 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2c5898]" />
          <h2 className="font-bold text-gray-900 text-[16px] sm:text-[17px] font-['Hind_Siliguri',sans-serif] tracking-normal whitespace-nowrap">
            ডাটাবেস এক নজরে
          </h2>
          <div className="w-2.5 h-2.5 rounded-full bg-[#2c5898]" />
        </div>

        {/* Right Circuit Path with Google Node */}
        <div className="flex-1 flex items-center">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
            {/* Line extending right and branching */}
            <path
              d="M 5 22 L 75 22 Q 80 22 80 18 L 80 8"
              stroke="#2c5898"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 75 22 L 90 22"
              stroke="#2c5898"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Top right dot */}
            <circle cx="80" cy="8" r="4.5" fill="#2c5898" />
            {/* Google node circle */}
            <circle cx="85" cy="22" r="5.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Google 'G' letter icon with colors */}
            <text x="85" y="24.5" textAnchor="middle" fill="#4285F4" fontSize="7" fontWeight="bold" fontFamily="sans-serif">G</text>
          </svg>
        </div>
      </div>

      {/* Stats Data Table / Key-Values */}
      <div className="space-y-1.5 px-4 font-['Hind_Siliguri',sans-serif]">
        <div className="flex justify-between items-center text-gray-800">
          <span className="text-[15px] sm:text-base font-medium">মোট সংগৃহীত পেজ:</span>
          <span className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">{totalPages}</span>
        </div>
        <div className="flex justify-between items-center text-gray-800">
          <span className="text-[15px] sm:text-base font-medium">সক্রিয় বিজ্ঞাপনদাতা:</span>
          <span className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">{activeAdvertisers}</span>
        </div>
      </div>
    </div>
  );
};
