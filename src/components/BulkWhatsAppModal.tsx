import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, Square, CheckCircle2, Clock } from 'lucide-react';
import { FCommerceLead } from '../types';
import { WhatsAppSvgIcon } from './LeadCard';

interface BulkWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: FCommerceLead[];
  onBatchMessagedComplete: (leadIds: (number | string)[]) => void;
}

export const BulkWhatsAppModal: React.FC<BulkWhatsAppModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  onBatchMessagedComplete,
}) => {
  const [messageTemplate, setMessageTemplate] = useState<string>(
    'আসসালামু আলাইকুম {page_name},\nআমরা আপনার পেজের বিজ্ঞাপন দেখে যোগাযোগ করছি। আমরা আপনার ব্যবসার জন্য বিশেষ অফার প্রদান করছি। ধন্যবাদ!'
  );
  const [delaySeconds, setDelaySeconds] = useState<number>(10);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingRef = useRef(isSending);
  const isPausedRef = useRef(isPaused);
  const currentIndexRef = useRef(currentIndex);

  isSendingRef.current = isSending;
  isPausedRef.current = isPaused;
  currentIndexRef.current = currentIndex;

  const stopSending = useCallback(() => {
    setIsSending(false);
    setIsPaused(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const pauseSending = () => {
    setIsPaused(true);
  };

  const getPersonalizedMessage = useCallback((lead: FCommerceLead) => {
    const pageName = lead.page_name || lead.name || 'গ্রাহক';
    const phone = lead.phone_number || lead.phone || '';
    const cat = lead.category || '';

    return messageTemplate
      .replace(/{page_name}/gi, pageName)
      .replace(/{category}/gi, cat)
      .replace(/{phone}/gi, phone);
  }, [messageTemplate]);

  const sendSingleLead = useCallback((lead: FCommerceLead) => {
    const phone = lead.phone_number || lead.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(getPersonalizedMessage(lead));
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    // Open WhatsApp in new tab/window
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }, [getPersonalizedMessage]);

  const startSequentialSender = useCallback(() => {
    if (selectedLeads.length === 0) return;

    setIsSending(true);
    setIsPaused(false);
    let idx = currentIndexRef.current;
    const completedIds: (number | string)[] = [];

    const sendNext = () => {
      if (!isSendingRef.current) return;
      if (isPausedRef.current) return;

      if (idx >= selectedLeads.length) {
        setIsSending(false);
        onBatchMessagedComplete(completedIds);
        return;
      }

      const currentLead = selectedLeads[idx];
      sendSingleLead(currentLead);
      completedIds.push(currentLead.id);

      idx += 1;
      setCurrentIndex(idx);

      if (idx < selectedLeads.length) {
        setCountdown(delaySeconds);
        let currentTimer = delaySeconds;

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }

        timerIntervalRef.current = setInterval(() => {
          if (!isSendingRef.current || isPausedRef.current) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return;
          }
          currentTimer -= 1;
          setCountdown(currentTimer);
          if (currentTimer <= 0) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            sendNext();
          }
        }, 1000);
      } else {
        setIsSending(false);
        onBatchMessagedComplete(completedIds);
      }
    };

    sendNext();
  }, [selectedLeads, delaySeconds, sendSingleLead, onBatchMessagedComplete]);

  const resumeSending = () => {
    setIsPaused(false);
    startSequentialSender();
  };

  useEffect(() => {
    if (!isOpen) {
      stopSending();
    } else {
      setCurrentIndex(0);
      setCountdown(0);
    }
    return () => {
      stopSending();
    };
  }, [isOpen, stopSending]);

  if (!isOpen) return null;

  const insertPlaceholder = (tag: string) => {
    setMessageTemplate((prev) => `${prev} ${tag} `);
  };

  const handleBackendBulkTrigger = async () => {
    try {
      const res = await fetch('/api/send-whatsapp-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: selectedLeads,
          message_template: messageTemplate,
          delay_seconds: delaySeconds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onBatchMessagedComplete(selectedLeads.map((l) => l.id));
        onClose();
      }
    } catch (err) {
      console.error('Bulk API failed:', err);
    }
  };

  const currentPreviewLead = selectedLeads[currentIndex] || selectedLeads[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={!isSending ? onClose : undefined} />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl z-10 overflow-hidden font-['Hind_Siliguri',sans-serif] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#2c5898] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <WhatsAppSvgIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">বাল্ক WhatsApp মেসেজিং</h3>
              <p className="text-xs text-blue-100 font-sans">
                নির্বাচিত লিড সংখ্যা: {selectedLeads.length} টি
              </p>
            </div>
          </div>
          {!isSending && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Progress Tracker (If Sending) */}
          {isSending && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <Clock className="w-4 h-4 animate-spin text-blue-600" />
                  মেসেজ পাঠানো হচ্ছে: {currentIndex} / {selectedLeads.length}
                </span>
                <span className="text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-mono">
                  পরবর্তী মেসেজ: {countdown} সেকেন্ড
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-blue-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#25D366] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${selectedLeads.length > 0 ? (currentIndex / selectedLeads.length) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-600">
                  বর্তমান পেজ: <strong className="text-gray-900">{currentPreviewLead?.page_name}</strong> ({currentPreviewLead?.phone_number})
                </span>

                <div className="flex items-center gap-2">
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resumeSending}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>চালিয়ে যান</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseSending}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 shadow-xs cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>বিরতি (Pause)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={stopSending}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-xs cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>বন্ধ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Template Configuration */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              মেসেজ টেমপ্লেট (Message Template)
            </label>
            <textarea
              rows={4}
              value={messageTemplate}
              disabled={isSending}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 font-sans"
              placeholder="আপনার কাস্টম মেসেজ লিখুন..."
            />

            {/* Variable Insertion Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs text-gray-500 font-medium">ভ্যারিয়েবল ট্যাগ যোগ করুন:</span>
              <button
                type="button"
                disabled={isSending}
                onClick={() => insertPlaceholder('{page_name}')}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 font-mono font-medium transition-colors cursor-pointer"
              >
                + {'{page_name}'}
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={() => insertPlaceholder('{category}')}
                className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 font-mono font-medium transition-colors cursor-pointer"
              >
                + {'{category}'}
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={() => insertPlaceholder('{phone}')}
                className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200 font-mono font-medium transition-colors cursor-pointer"
              >
                + {'{phone}'}
              </button>
            </div>
          </div>

          {/* Delay Interval Setting */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-bold text-gray-800 block">
                মেসেজ পাঠানোর বিরতি (Anti-Ban Delay)
              </span>
              <span className="text-xs text-gray-500">
                প্রতিটি মেসেজের মাঝে বিরতি WhatsApp ব্যান ঝুঁকি কমায়।
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                disabled={isSending}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm font-bold text-gray-800 bg-white"
              >
                <option value={5}>৫ সেকেন্ড</option>
                <option value={10}>১০ সেকেন্ড (সুপারিশকৃত)</option>
                <option value={15}>১৫ সেকেন্ড</option>
                <option value={20}>২০ সেকেন্ড</option>
              </select>
            </div>
          </div>

          {/* Message Live Preview */}
          {currentPreviewLead && (
            <div className="border border-green-200 bg-green-50/50 rounded-xl p-3">
              <span className="text-xs font-bold text-emerald-800 block mb-1">
                লাইভ প্রিভিউ ({currentPreviewLead.page_name}):
              </span>
              <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-line font-sans bg-white p-2.5 rounded-lg border border-green-100">
                {getPersonalizedMessage(currentPreviewLead)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isSending && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={startSequentialSender}
                className="w-full bg-[#25D366] hover:bg-[#1faa4b] text-white font-bold py-2.5 px-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ক্রমিক মেসেজ শুরু করুন ({delaySeconds}s বিরতি)</span>
              </button>

              <button
                type="button"
                onClick={handleBackendBulkTrigger}
                className="w-full bg-[#2c5898] hover:bg-[#23477c] text-white font-bold py-2.5 px-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>সবগুলোকে 'Messaged' মার্ক করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
