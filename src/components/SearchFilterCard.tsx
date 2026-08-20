import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../data/mockLeads';

interface SearchFilterCardProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onlyActiveAds: boolean;
  onOnlyActiveAdsChange: (checked: boolean) => void;
  onPerformSearch: () => void;
  isSearchingLive?: boolean;
}

export const SearchFilterCard: React.FC<SearchFilterCardProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onlyActiveAds,
  onOnlyActiveAdsChange,
  onPerformSearch,
  isSearchingLive = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPerformSearch();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white border border-blue-100/90 rounded-xl p-4 shadow-xs mb-3.5 font-['Hind_Siliguri',sans-serif]"
    >
      {/* Search Input Box */}
      <div className="mb-2.5">
        <input
          id="search-page-input"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="অনুসন্ধান (পেজের নাম বা কী-ওয়ার্ড)"
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Category Label */}
      <div className="mb-1.5">
        <label htmlFor="category-select" className="text-sm font-bold text-gray-900 block">
          ক্যাটাগরি
        </label>
      </div>

      {/* Category Dropdown and Only Active Ads Checkbox Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center mb-3">
        {/* Dropdown Select */}
        <div className="relative">
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Checkbox: শুধুমাত্র বিজ্ঞাপন চলছে */}
        <div className="flex items-center space-x-2 sm:justify-end">
          <input
            id="checkbox-active-ads"
            type="checkbox"
            checked={onlyActiveAds}
            onChange={(e) => onOnlyActiveAdsChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <label 
            htmlFor="checkbox-active-ads"
            className="text-sm font-medium text-gray-900 cursor-pointer select-none"
          >
            শুধুমাত্র বিজ্ঞাপন চলছে
          </label>
        </div>
      </div>

      {/* Blue Action Button */}
      <button
        id="btn-search-submit"
        type="submit"
        disabled={isSearchingLive}
        className="w-full bg-[#2c5898] hover:bg-[#23477c] disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-lg text-base transition-colors shadow-xs active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
      >
        {isSearchingLive ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Meta Ad Library লাইভ অনুসন্ধান হচ্ছে...</span>
          </>
        ) : (
          <>
            <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
              f
            </span>
            <span>Meta Ad Library লাইভ অনুসন্ধান শুরু করুন</span>
          </>
        )}
      </button>
    </form>
  );
};
