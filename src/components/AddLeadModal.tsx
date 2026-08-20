import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { FCommerceLead } from '../types';
import { CATEGORIES } from '../data/mockLeads';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Omit<FCommerceLead, 'id'>) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAddLead }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'পোশাক, ইলেকট্রনিক্স');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddLead({
      name: name.trim(),
      category,
      phone: phone.trim(),
      status,
      facebookUrl: 'https://facebook.com',
      whatsappNumber: phone.trim(),
    });

    setName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-['Hind_Siliguri',sans-serif] animate-in zoom-in-95 duration-150">
        <div className="bg-[#2c5898] text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-lg">নতুন F-Commerce পেজ যুক্ত করুন</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পেজের নাম *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: ফ্যাশন হাউজ বিডি"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ক্যাটাগরি
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.filter(c => c !== 'সব ক্যাটাগরি').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ফোন নম্বর / WhatsApp *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: +91 733329455 অথবা +880 1712345678"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              বিজ্ঞাপন স্ট্যাটাস
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border text-center transition-colors ${
                  status === 'active'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🟢 বিজ্ঞাপন চলছে
              </button>
              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border text-center transition-colors ${
                  status === 'inactive'
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🔴 বিজ্ঞাপন বন্ধ
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#2c5898] hover:bg-[#23477c] text-white font-bold py-2.5 px-4 rounded-xl text-base flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>পেজ ডাটাবেসে যোগ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
