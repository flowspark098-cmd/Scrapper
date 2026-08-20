import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { SearchFilterCard } from './components/SearchFilterCard';
import { LeadCard } from './components/LeadCard';
import { Pagination } from './components/Pagination';
import { SelectionStatusBar } from './components/SelectionStatusBar';
import { BulkWhatsAppModal } from './components/BulkWhatsAppModal';
import { AddLeadModal } from './components/AddLeadModal';
import { ColabScraperModal } from './components/ColabScraperModal';
import { FCommerceLead, DatabaseStats } from './types';

const DEFAULT_META_TOKEN =
  'EAAO1PApF55UBSe0S22zLZB84EH13ZCGGaXZCpivNyWf060XvGbl9rRb7Qe8ZAv2OQO1FvgEIYXvWZBUYTF0ZAZCnNufot1LIBWrygKdQG9we5Cppgq7E6ZBnHk4ZBqaCT8DCFdqXQSOQ3gdE0g6zZCiCxXZAsMGEZCEESCCbCNPvM6RxsVJUZBZCP5mRl4xRFSYkvRcdbGFIX6GgJx2Ok2DGpVZAPx6N2UrC9HVzRFncXlCnafHcXXnroxqTjIVFvch5rDgfGYrcRos2IePDwhOt4YtznSq';

export default function App() {
  // LocalStorage Persistence & Zero-Mock Policy
  const [allLeads, setAllLeads] = useState<FCommerceLead[]>(() => {
    try {
      const saved = localStorage.getItem('f_commerce_leads_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('f_commerce_leads_v2', JSON.stringify(allLeads));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [allLeads]);

  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব ক্যাটাগরি');
  const [onlyActiveAds, setOnlyActiveAds] = useState<boolean>(false);

  // Error Debugging Panel state
  const [metaErrorLog, setMetaErrorLog] = useState<{
    status_code: number;
    error: {
      message?: string;
      code?: number;
      type?: string;
      fbtrace_id?: string;
      [key: string]: any;
    };
  } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Multi-Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number | string>>(new Set());

  // Modals State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isColabModalOpen, setIsColabModalOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Flexible Instant Search & Filter
  const filteredLeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const cleanQueryNumbers = query.replace(/[^0-9]/g, '');

    return allLeads.filter((lead) => {
      const pageName = (lead.page_name || lead.name || '').toLowerCase();
      const cat = (lead.category || '').toLowerCase();
      const phone = (lead.phone_number || lead.phone || '').replace(/[^0-9]/g, '');

      if (query) {
        const matchName = pageName.includes(query);
        const matchCategory = cat.includes(query);
        const matchPhone = cleanQueryNumbers ? phone.includes(cleanQueryNumbers) : false;

        if (!matchName && !matchCategory && !matchPhone) {
          return false;
        }
      }

      if (selectedCategory && selectedCategory !== 'সব ক্যাটাগরি') {
        const primaryCat = selectedCategory.split(',')[0].trim().toLowerCase();
        if (!cat.includes(primaryCat)) {
          return false;
        }
      }

      if (onlyActiveAds) {
        const status = lead.ad_status || lead.status;
        if (status !== 'active') {
          return false;
        }
      }

      return true;
    });
  }, [allLeads, searchTerm, selectedCategory, onlyActiveAds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, onlyActiveAds, pageSize]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  const stats: DatabaseStats = useMemo(() => {
    const totalPagesCount = allLeads.length;
    let activeAdvertisersCount = 0;
    let messagedCount = 0;

    for (const lead of allLeads) {
      if ((lead.ad_status || lead.status) === 'active') {
        activeAdvertisersCount++;
      }
      if (lead.messaged_status) {
        messagedCount++;
      }
    }

    return {
      totalPages: totalPagesCount,
      activeAdvertisers: activeAdvertisersCount,
      messagedCount,
    };
  }, [allLeads]);

  const handleToggleSelect = (lead: FCommerceLead) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(lead.id)) {
        next.delete(lead.id);
      } else {
        next.add(lead.id);
      }
      return next;
    });
  };

  const handleSelectAllPage = () => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      paginatedLeads.forEach((lead) => next.add(lead.id));
      return next;
    });
    showToast(`বর্তমান পৃষ্ঠার ${paginatedLeads.length}টি পেজ নির্বাচিত হয়েছে`);
  };

  const handleSelectTop20 = () => {
    const top20 = filteredLeads.slice(0, 20);
    setSelectedLeadIds(new Set(top20.map((l) => l.id)));
    showToast('শীর্ষ ২০টি লিড নির্বাচন করা হয়েছে');
  };

  const handleSelectTop50 = () => {
    const top50 = filteredLeads.slice(0, 50);
    setSelectedLeadIds(new Set(top50.map((l) => l.id)));
    showToast('শীর্ষ ৫০টি লিড নির্বাচন করা হয়েছে');
  };

  const handleClearSelection = () => {
    setSelectedLeadIds(new Set());
    showToast('সকল সিলেকশন মুছে ফেলা হয়েছে');
  };

  const handleCall = (phone: string) => {
    const clean = phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${clean}`;
    showToast(`ডায়াল করা হচ্ছে: ${phone}`);
  };

  const handleWhatsAppSingle = (lead: FCommerceLead) => {
    const displayName = lead.page_name || lead.name || '';
    const phone = lead.phone_number || lead.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `আসসালামু আলাইকুম! আমি "${displayName}" পেজের বিষয়ে যোগাযোগ করছি।`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    showToast(`${displayName} এর সাথে WhatsApp ওপেন হচ্ছে...`);
  };

  const handleToggleMessaged = async (lead: FCommerceLead) => {
    const newStatus = !lead.messaged_status;
    setAllLeads((prev) =>
      prev.map((item) => (item.id === lead.id ? { ...item, messaged_status: newStatus } : item))
    );
  };

  const handleBatchMessagedComplete = async (completedIds: (number | string)[]) => {
    const idSet = new Set(completedIds);
    setAllLeads((prev) =>
      prev.map((item) => (idSet.has(item.id) ? { ...item, messaged_status: true } : item))
    );
    showToast(`সফলভাবে ${completedIds.length}টি লিড 'Messaged' চিহ্নিত করা হয়েছে!`);
    setSelectedLeadIds(new Set());
    setIsBulkModalOpen(false);
  };

  const selectedLeadsList = useMemo(() => {
    return allLeads.filter((l) => selectedLeadIds.has(l.id));
  }, [allLeads, selectedLeadIds]);

  const handleAddLead = (newLeadData: any) => {
    const newLead: FCommerceLead = {
      id: Date.now(),
      page_name: newLeadData.name || newLeadData.page_name,
      phone_number: newLeadData.phone || newLeadData.phone_number,
      category: newLeadData.category,
      ad_status: newLeadData.status || newLeadData.ad_status || 'active',
      messaged_status: false,
    };
    setAllLeads((prev) => [newLead, ...prev]);
    showToast('নতুন পেজ ডাটাবেসে সফলভাবে যোগ হয়েছে!');
  };

  const handleLeadsImported = (importedLeads: FCommerceLead[]) => {
    setAllLeads((prev) => {
      const existingPhones = new Set(
        prev.map((l) => (l.phone_number || l.phone || '').replace(/[^0-9]/g, ''))
      );
      const merged = [...prev];
      let addedCount = 0;

      for (const item of importedLeads) {
        const phoneClean = (item.phone_number || item.phone || '').replace(/[^0-9]/g, '');
        if (phoneClean && !existingPhones.has(phoneClean)) {
          existingPhones.add(phoneClean);
          merged.unshift(item);
          addedCount++;
        }
      }

      showToast(`সফলভাবে ${addedCount}টি নতুন লাইভ লিড আমদানি করা হয়েছে! (LocalStorage সেভড)`);
      return merged;
    });
  };

  // Live Meta Ad Library API Fetch with CORS bypass
  const handlePerformSearch = async () => {
    setIsSearchingLive(true);
    setMetaErrorLog(null);
    const query = searchTerm.trim() || 'online shop';

    const apiUrl = `https://graph.facebook.com/v19.0/ads_archive?ad_reached_countries=['BD']&ad_active_status=ACTIVE&search_terms=${encodeURIComponent(
      query
    )}&limit=50&fields=page_id,page_name,ad_creative_bodies,ad_snapshot_url&access_token=${DEFAULT_META_TOKEN}`;

    let responseData: any = null;
    let statusCode = 200;

    try {
      let res = await fetch(apiUrl);
      statusCode = res.status;
      responseData = await res.json();
    } catch (directErr) {
      console.warn('Direct fetch blocked by CORS, trying CORS proxy...', directErr);
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        let res = await fetch(proxyUrl);
        statusCode = res.status;
        responseData = await res.json();
      } catch (proxyErr) {
        console.warn('CORS proxy failed, trying backend proxy route...', proxyErr);
        try {
          let res = await fetch(`/api/leads/meta-ads?search=${encodeURIComponent(query)}`);
          statusCode = res.status;
          responseData = await res.json();
        } catch (serverErr: any) {
          setMetaErrorLog({
            status_code: 500,
            error: {
              message: serverErr.message || 'Network request failed',
              type: 'NetworkError',
              code: 500,
            },
          });
          setIsSearchingLive(false);
          return;
        }
      }
    }

    if (!responseData || responseData.error || responseData.status_code >= 400 || statusCode >= 400) {
      const errObj = responseData?.error || {
        message: 'Meta Ad Library API request failed',
        code: statusCode,
        type: 'APIError',
        fbtrace_id: responseData?.fbtrace_id || 'N/A',
      };
      setMetaErrorLog({
        status_code: responseData?.status_code || statusCode,
        error: errObj,
      });
      showToast('Meta API রিকোয়েস্টে ত্রুটি পাওয়া গেছে। নিচের ডিবাগ লগ দেখুন।');
      setIsSearchingLive(false);
      return;
    }

    const adsData = Array.isArray(responseData.data) ? responseData.data : [];
    const extractedLeads: FCommerceLead[] = [];
    const seenPhones = new Set<string>();

    const BD_PHONE_REGEX = /(?:\+880|880|0)?1[3-9]\d{8}/g;

    for (const ad of adsData) {
      const pageName = ad.page_name || 'F-Commerce পেজ';
      const bodies: string[] = Array.isArray(ad.ad_creative_bodies) ? ad.ad_creative_bodies : [];
      const combinedText = bodies.join(' \n ');

      const matches = combinedText.matchAll(BD_PHONE_REGEX);
      for (const match of matches) {
        const rawMatch = match[0];
        let digits = rawMatch.replace(/[^0-9]/g, '');
        if (digits.startsWith('880')) {
          digits = '+' + digits;
        } else if (digits.startsWith('0')) {
          digits = '+88' + digits;
        } else if (digits.length === 10) {
          digits = '+880' + digits;
        }

        if (!seenPhones.has(digits)) {
          seenPhones.add(digits);
          const cleanDigits = digits.replace(/[^0-9]/g, '');
          const waLink = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
            `আসসালামু আলাইকুম! ${pageName} এর বিজ্ঞাপন দেখে যোগাযোগ করছি।`
          )}`;

          extractedLeads.push({
            id: ad.page_id ? `${ad.page_id}_${cleanDigits}` : Date.now() + Math.random(),
            page_id: ad.page_id,
            page_name: pageName,
            phone_number: digits,
            category: 'পোশাক, ফ্যাশন',
            ad_status: 'active',
            messaged_status: false,
            wa_link: waLink,
            raw_ad_text: combinedText.slice(0, 300),
          });
        }
      }
    }

    handleLeadsImported(extractedLeads);
    setIsSearchingLive(false);
  };

  const handleResetData = () => {
    if (window.confirm('আপনি কি সমস্ত সংরক্ষিত লিড মুছে ফেলতে চান?')) {
      setAllLeads([]);
      localStorage.removeItem('f_commerce_leads_v2');
      setSearchTerm('');
      setSelectedCategory('সব ক্যাটাগরি');
      setOnlyActiveAds(false);
      setSelectedLeadIds(new Set());
      setMetaErrorLog(null);
      showToast('ডাটাবেস সম্পূর্ণ রিসেট করা হয়েছে!');
    }
  };

  return (
    <div className="min-h-screen bg-[#e9f0f8] flex flex-col font-['Hind_Siliguri',sans-serif] selection:bg-blue-200">
      {/* Top Fixed / Sticky Navigation Bar */}
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenColabModal={() => setIsColabModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3 sm:px-4 py-3 pb-24">
        {/* Database Stats Overview */}
        <StatsCard
          totalPages={stats.totalPages}
          activeAdvertisers={stats.activeAdvertisers}
        />

        {/* Search & Flexible Instant Filter Card */}
        <SearchFilterCard
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onlyActiveAds={onlyActiveAds}
          onOnlyActiveAdsChange={setOnlyActiveAds}
          onPerformSearch={handlePerformSearch}
          isSearchingLive={isSearchingLive}
        />

        {/* ERROR DEBUGGING PANEL */}
        {metaErrorLog && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 my-3 text-xs sm:text-sm text-red-900 shadow-md">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-red-200">
              <span className="font-bold flex items-center gap-1.5 text-red-800 text-sm">
                <span>🔴 Meta API Error Debug Log</span>
              </span>
              <button
                type="button"
                onClick={() => setMetaErrorLog(null)}
                className="text-red-600 hover:text-red-900 font-bold px-1.5 py-0.5 rounded bg-red-100"
              >
                ✕ বন্ধ করুন
              </button>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-700">Status Code:</span>
                <span className="bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-semibold">
                  {metaErrorLog.status_code}
                </span>
              </div>
              <div>
                <span className="font-bold text-red-700">Error Message:</span>{' '}
                {metaErrorLog.error?.message || 'Unknown error'}
              </div>
              <div>
                <span className="font-bold text-red-700">Error Type:</span>{' '}
                {metaErrorLog.error?.type || 'N/A'}
              </div>
              <div>
                <span className="font-bold text-red-700">Error Code:</span>{' '}
                {metaErrorLog.error?.code ?? 'N/A'}
              </div>
              <div>
                <span className="font-bold text-red-700">FBTrace ID:</span>{' '}
                {metaErrorLog.error?.fbtrace_id || 'N/A'}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-red-200 text-[11px] text-red-700 font-sans flex items-center justify-between">
              <span>* বিকল্প উপায়: Google Colab পাইথন স্ক্রিপ্ট ব্যবহার করে জিরো-ইনস্টলেশন লিড সংগ্রহ করুন।</span>
              <button
                type="button"
                onClick={() => setIsColabModalOpen(true)}
                className="text-blue-700 font-bold underline hover:text-blue-900 cursor-pointer"
              >
                Colab Scraper খুলুন &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Pagination Controls Top */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredLeads.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

        {/* Leads Feed List */}
        <div className="space-y-2.5">
          {paginatedLeads.length > 0 ? (
            paginatedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isSelected={selectedLeadIds.has(lead.id)}
                onToggleSelect={handleToggleSelect}
                onCall={handleCall}
                onWhatsApp={handleWhatsAppSingle}
                onToggleMessaged={handleToggleMessaged}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-xs space-y-3">
              <p className="text-gray-700 font-bold text-base">
                কোনো লাইভ লিড পাওয়া যায়নি।
              </p>
              <p className="text-gray-500 text-xs max-w-sm mx-auto">
                আপনি সরাসরি API সার্চ করতে পারেন অথবা <strong>Google Colab Python Scraper</strong> ব্যবহার করে <code className="bg-gray-100 px-1 py-0.5 rounded">leads.json</code> ফাইল আপলোড করতে পারেন।
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsColabModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Google Colab Scraper খুলুন</span>
                </button>
                <button
                  type="button"
                  onClick={handlePerformSearch}
                  className="px-4 py-2 bg-[#2c5898] hover:bg-[#23477c] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Meta API লাইভ সার্চ করুন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls Bottom */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredLeads.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </main>

      {/* Floating Multi-Selection & Bulk Actions Bar */}
      <SelectionStatusBar
        selectedCount={selectedLeadIds.size}
        totalVisibleCount={paginatedLeads.length}
        onSelectAllPage={handleSelectAllPage}
        onSelectTop20={handleSelectTop20}
        onSelectTop50={handleSelectTop50}
        onClearSelection={handleClearSelection}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
      />

      {/* Toast Popup Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/95 text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 border border-gray-700">
          {toastMessage}
        </div>
      )}

      {/* Bulk WhatsApp Messaging Modal */}
      <BulkWhatsAppModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedLeads={selectedLeadsList}
        onBatchMessagedComplete={handleBatchMessagedComplete}
      />

      {/* Add New Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddLead}
      />

      {/* Google Colab Scraper & JSON Uploader Modal */}
      <ColabScraperModal
        isOpen={isColabModalOpen}
        onClose={() => setIsColabModalOpen(false)}
        onLeadsImported={handleLeadsImported}
      />
    </div>
  );
}
