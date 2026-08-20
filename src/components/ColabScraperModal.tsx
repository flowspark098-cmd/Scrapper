import React, { useState } from 'react';
import { X, Copy, Check, Upload, Terminal, FileCode, ArrowRight } from 'lucide-react';
import { FCommerceLead } from '../types';

interface ColabScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsImported: (leads: FCommerceLead[]) => void;
}

const COLAB_PYTHON_CODE = `# ==========================================
# GOOGLE COLAB META AD LIBRARY SCRAPER (BD)
# ==========================================
# Run this entire script inside a Google Colab notebook cell.
# Prerequisites (Run this in the first cell if needed):
# pip install playwright nest-asyncio
# playwright install

import asyncio
import json
import re
from google.colab import files
import nest_asyncio

nest_asyncio.apply()

from playwright.async_api import async_playwright

SEARCH_KEYWORD = "online shop"  # Change keyword if needed (e.g. "boutique", "gadget")
COUNTRY = "BD"

async def scrape_meta_ads():
    print(f"[*] Launching Playwright Headless Browser for Meta Ad Library (Country: {COUNTRY}, Keyword: {SEARCH_KEYWORD})...")
    leads = []
    seen_phones = set()
    
    # Bangladeshi Phone Number Regex
    bd_phone_regex = re.compile(r'(?:\\+880|880|0)?1[3-9]\\d{8}')

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        encoded_query = SEARCH_KEYWORD.replace(" ", "%20")
        url = f"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country={COUNTRY}&q={encoded_query}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped"
        
        print(f"[*] Navigating to: {url}")
        await page.goto(url, timeout=60000)
        await asyncio.sleep(5)
        
        print("[*] Scrolling page dynamically 5 times to load active ads...")
        for i in range(5):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            print(f"    - Scroll iteration {i+1}/5 complete...")
            await asyncio.sleep(4)
            
        print("[*] Extracting ad texts and page names...")
        ad_cards = await page.locator("div._7jj-").all()
        if not ad_cards:
            ad_cards = await page.locator("div[role='article']").all()
            
        print(f"[*] Found {len(ad_cards)} ad blocks. Parsing data & phone numbers...")
        
        for card in ad_cards:
            try:
                text_content = await card.inner_text()
                lines = [line.strip() for line in text_content.split('\\n') if line.strip()]
                page_name = lines[0] if lines else "F-Commerce পেজ"
                
                found_numbers = bd_phone_regex.findall(text_content)
                for raw_num in found_numbers:
                    digits = re.sub(r'[^0-9]', '', raw_num)
                    if digits.startswith('880'):
                        formatted = '+' + digits
                    elif digits.startswith('0'):
                        formatted = '+88' + digits
                    elif len(digits) == 10:
                        formatted = '+880' + digits
                    else:
                        formatted = '+880' + digits
                        
                    if formatted not in seen_phones:
                        seen_phones.add(formatted)
                        clean_digits = re.sub(r'[^0-9]', '', formatted)
                        wa_link = f"https://wa.me/{clean_digits}?text=Assalamualikum!"
                        
                        leads.append({
                            "id": f"colab_{len(leads)+1}_{clean_digits}",
                            "page_name": page_name,
                            "phone_number": formatted,
                            "category": "পোশাক, ফ্যাশন",
                            "ad_status": "active",
                            "messaged_status": False,
                            "wa_link": wa_link,
                            "raw_ad_text": text_content[:250]
                        })
            except Exception as e:
                continue
                
        await browser.close()
        
    print(f"[+] Scraping complete! Extracted {len(leads)} unique Bangladeshi mobile numbers.")
    
    output_filename = "leads.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)
        
    print(f"[+] Saved leads to {output_filename}")
    files.download(output_filename)
    print("[+] Download triggered successfully!")

asyncio.run(scrape_meta_ads())`;

export const ColabScraperModal: React.FC<ColabScraperModalProps> = ({
  isOpen,
  onClose,
  onLeadsImported,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'upload'>('script');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(COLAB_PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const parsedData = JSON.parse(jsonContent);

        if (Array.isArray(parsedData)) {
          const formattedLeads: FCommerceLead[] = parsedData.map((item, idx) => ({
            id: item.id || `uploaded_${Date.now()}_${idx}`,
            page_name: item.page_name || item.name || 'F-Commerce পেজ',
            phone_number: item.phone_number || item.phone || '',
            category: item.category || 'পোশাক, ফ্যাশন',
            ad_status: item.ad_status || item.status || 'active',
            messaged_status: Boolean(item.messaged_status),
            wa_link: item.wa_link || `https://wa.me/${(item.phone_number || item.phone || '').replace(/[^0-9]/g, '')}`,
            raw_ad_text: item.raw_ad_text || '',
          }));

          onLeadsImported(formattedLeads);
          onClose();
        } else {
          alert('অবৈধ JSON ফাইল ফরম্যাট। অনুগ্রহ করে সঠিক leads.json ফাইল আপলোড করুন।');
        }
      } catch (err) {
        console.error('JSON Parse Error:', err);
        alert('JSON ফাইল পড়তে সমস্যা হয়েছে। অনুগ্রহ করে সঠিক ফাইল নিশ্চিত করুন।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Hind_Siliguri',sans-serif]">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#2c5898] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Google Colab Python Scraper & JSON Uploader</h3>
              <p className="text-xs text-blue-100 font-sans">
                জিরো-ইনস্টলেশন পাইথন স্ক্রিপ্ট ও লোকাল পার্সিস্টেন্ট লিড ম্যানেজমেন্ট
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'border-[#2c5898] text-[#2c5898] bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>১. Google Colab পাইথন স্ক্রিপ্ট</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#2c5898] text-[#2c5898] bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>২. leads.json আপলোড করুন</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'script' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs sm:text-sm text-blue-900 space-y-1.5">
                <p className="font-bold">কীভাবে ব্যবহার করবেন:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>
                    <a
                      href="https://colab.research.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold text-blue-700 hover:text-blue-900"
                    >
                      Google Colab (colab.research.google.com)
                    </a>{' '}
                    এ গিয়ে একটি নতুন নোটবুক খুলুন।
                  </li>
                  <li>নিচের পাইথন কোডটি কপি করে Colab সেলে পেস্ট করুন এবং রান করুন।</li>
                  <li>স্ক্রিপ্টটি সম্পন্ন হলে স্বয়ংক্রিয়ভাবে <code className="bg-blue-200 px-1 py-0.5 rounded font-mono">leads.json</code> ফাইল ডাউনলোড হবে।</li>
                  <li>ডাউনলোড করা ফাইলটি এখানে "leads.json আপলোড করুন" ট্যাবে আপলোড করুন।</li>
                </ol>
              </div>

              {/* Code Box */}
              <div className="relative">
                <div className="absolute top-2.5 right-2.5">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 bg-[#2c5898] hover:bg-[#23477c] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কোড কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                  {COLAB_PYTHON_CODE}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center gap-2 bg-[#2c5898] hover:bg-[#23477c] text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  <span>JSON আপলোড ট্যাবে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <div className="max-w-md mx-auto border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-8 transition-colors flex flex-col items-center justify-center relative cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-1">
                  এখানে leads.json ফাইল ড্রপ করুন বা ব্রাউজ করুন
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  Google Colab থেকে ডাউনলোড করা ফাইলটি সিলেক্ট করুন। ব্রাউজারের LocalStorage-এ স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 max-w-md mx-auto">
                💡 <strong>টিপ:</strong> একাধিকবার JSON আপলোড করলেও ডুপ্লিকেট ফোন নম্বর স্বয়ংক্রিয়ভাবে ফিল্টার হয়ে যাবে এবং আগের সেভ করা লিডের সাথে মার্জ হয়ে যাবে।
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
