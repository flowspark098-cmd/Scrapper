import React from 'react';
import { Phone, CheckCircle2 } from 'lucide-react';
import { FCommerceLead } from '../types';

interface LeadCardProps {
  lead: FCommerceLead;
  isSelected?: boolean;
  onToggleSelect?: (lead: FCommerceLead) => void;
  onCall?: (phone: string) => void;
  onWhatsApp?: (lead: FCommerceLead) => void;
  onToggleMessaged?: (lead: FCommerceLead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  isSelected = false,
  onToggleSelect,
  onCall,
  onWhatsApp,
  onToggleMessaged,
}) => {
  const displayName = lead.page_name || lead.name || 'F-Commerce পেজ';
  const displayPhone = lead.phone_number || lead.phone || '';
  const displayStatus = lead.ad_status || lead.status || 'active';
  const cleanPhone = displayPhone.replace(/[^0-9+]/g, '');

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWhatsApp) {
      onWhatsApp(lead);
      return;
    }
    const message = encodeURIComponent(
      `আসসালামু আলাইকুম! আমি "${displayName}" পেজের বিষয়ে যোগাযোগ করতে চাই।`
    );
    window.open(`https://wa.me/${cleanPhone.replace('+', '')}?text=${message}`, '_blank');
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) {
      onCall(displayPhone);
      return;
    }
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleMessaged) {
      onToggleMessaged(lead);
    }
  };

  const handleCardClick = () => {
    if (onToggleSelect) {
      onToggleSelect(lead);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white border rounded-xl p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all font-['Hind_Siliguri',sans-serif] cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-400/30' : 'border-blue-100/90'
      }`}
    >
      {/* Top Row: Brand Header & Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-1">
        {/* Left: Checkbox + Facebook Logo + Page Name */}
        <div className="flex items-center gap-2.5">
          {/* Item Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.(lead);
            }}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />

          {/* Facebook Icon */}
          <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-xs">
            <span className="text-white font-bold font-sans text-xs sm:text-sm leading-none -mt-0.5 ml-0.5 select-none">
              f
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-[15px] sm:text-base leading-snug">
            {displayName}
          </h3>
        </div>

        {/* Status Badges: Ad Status & Messaged Status */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Messaged indicator toggle */}
          {onToggleMessaged && (
            <button
              type="button"
              onClick={handleStatusToggle}
              title={lead.messaged_status ? 'মেসেজ পাঠানো সম্পন্ন' : 'মেসেজ পাঠানোর স্ট্যাটাস আপডেট করুন'}
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                lead.messaged_status
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <CheckCircle2 className={`w-3 h-3 ${lead.messaged_status ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{lead.messaged_status ? 'মেসেজড' : 'নতুন'}</span>
            </button>
          )}

          {/* Ad Status Badge */}
          <div>
            {displayStatus === 'active' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d1f4e0] text-[#1b7e47] border border-green-200/60">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                বিজ্ঞাপন চলছে
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#b91c1c] border border-rose-200/60">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                বিজ্ঞাপন বন্ধ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Category */}
      <div className="pl-13.5 mb-2">
        <p className="text-xs sm:text-sm text-gray-600 font-medium">
          {lead.category}
        </p>
      </div>

      {/* Bottom Row: Phone Number & WhatsApp Quick Link */}
      <div className="flex items-center justify-between text-xs sm:text-sm pl-6 sm:pl-7 pt-0.5" onClick={(e) => e.stopPropagation()}>
        {/* Left: Phone handset & Number + WhatsApp mini icon */}
        <div className="flex items-center gap-1.5 text-gray-900 font-semibold font-sans">
          <button
            type="button"
            onClick={handlePhoneClick}
            className="flex items-center gap-1 hover:text-blue-700 transition-colors cursor-pointer"
            title="কল করুন"
          >
            <Phone className="w-3.5 h-3.5 fill-current text-gray-900 transform -rotate-12" />
            <span className="tracking-tight">{displayPhone}</span>
          </button>

          {/* Small circular WhatsApp icon next to phone */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform cursor-pointer ml-1"
            title="হোয়াটসঅ্যাপে চ্যাট করুন"
          >
            <WhatsAppSvgIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: WhatsApp Label + WhatsApp Icon */}
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="flex items-center gap-1.5 text-gray-900 hover:text-green-700 font-sans font-medium text-xs sm:text-sm transition-colors cursor-pointer group"
          title="WhatsApp এ মেসেজ পাঠান"
        >
          <span className="font-['Hind_Siliguri',sans-serif] text-xs sm:text-sm text-gray-800 group-hover:text-green-700">
            WhatsApp
          </span>
          <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <WhatsAppSvgIcon className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
};

// WhatsApp SVG Icon Component
export const WhatsAppSvgIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893 0-3.177-1.238-6.164-3.48-8.407" />
  </svg>
);
