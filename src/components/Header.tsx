import React, { useState } from 'react';
import { Menu, X, Database, PlusCircle, Download, RefreshCw, Terminal, Upload } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal?: () => void;
  onOpenColabModal?: () => void;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenColabModal,
  onResetData
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-[#2c5898] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Hamburger Menu Icon */}
          <button 
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-6 h-6 text-white" strokeWidth={2.2} />
          </button>

          {/* Center Title */}
          <h1 className="text-xl md:text-2xl font-bold tracking-normal font-['Hind_Siliguri',sans-serif] text-center select-none">
            আমার F-Commerce ডাটাবেস
          </h1>

          {/* Right Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="header-colab-modal-btn"
              type="button"
              onClick={onOpenColabModal}
              title="Google Colab Scraper & JSON Upload"
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 rounded-lg text-xs font-bold font-['Hind_Siliguri',sans-serif] text-white transition-colors cursor-pointer shadow-xs"
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">Colab Scraper</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Drawer / Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="bg-[#2c5898] text-white p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg font-['Hind_Siliguri']">আমার F-Commerce</h2>
                <p className="text-xs text-blue-100 font-['Hind_Siliguri']">পেজ ও লিড ম্যানেজমেন্ট</p>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-1 overflow-y-auto flex-1 font-['Hind_Siliguri'] text-gray-700">
              <button 
                onClick={() => { setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-[#2c5898] font-medium text-left transition-colors cursor-pointer"
              >
                <Database className="w-5 h-5" />
                <span>সকল লিড তালিকা</span>
              </button>

              <button 
                onClick={() => { setIsMenuOpen(false); onOpenColabModal?.(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 text-amber-800 font-medium text-left transition-colors cursor-pointer border border-amber-200 bg-amber-50/40"
              >
                <Terminal className="w-5 h-5 text-amber-600" />
                <span>Google Colab Scraper & JSON আপলোড</span>
              </button>

              <button 
                onClick={() => { setIsMenuOpen(false); onOpenAddModal?.(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 font-medium text-left transition-colors cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>নতুন পেজ যোগ করুন</span>
              </button>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <button 
                  onClick={() => { 
                    setIsMenuOpen(false);
                    const csvContent = "data:text/csv;charset=utf-8,নাম,ক্যাটাগরি,ফোন,স্ট্যাটাস\n" + 
                      "স্টাইলিশ ফ্যাশন,পোশাক ফ্যাশন,+8801712345678,বিজ্ঞাপন চলছে";
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "f_commerce_leads.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm text-left transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gray-500" />
                  <span>ডাটাবেস এক্সপোর্ট (CSV)</span>
                </button>

                <button 
                  onClick={() => { 
                    setIsMenuOpen(false);
                    onResetData?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm text-left transition-colors mt-1 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                  <span>ডাটা রিফ্রেশ করুন</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 text-center text-xs text-gray-500 border-t font-['Hind_Siliguri']">
              F-Commerce Lead Database v2.0
            </div>
          </div>
        </div>
      )}
    </>
  );
};
