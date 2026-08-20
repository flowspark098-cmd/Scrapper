import asyncio
import re
import json
import nest_asyncio
from playwright.async_api import async_playwright

nest_asyncio.apply()

async def scrape_massive_fcommerce_leads(target_count=200):
    keywords = [
        "smartwatch", "earbuds", "airpods", "power bank", "wireless speaker", 
        "bluetooth headphone", "স্মার্টওয়াচ", "এয়ারপডস", "গ্যাজেট", "নেকব্যান্ড",
        "boutique", "saree", "three piece", "borkha", "abaya", 
        "kurti", "panjabi", "বুটিক", "শাড়ি", "থ্রি পিস", 
        "বোরকা", "আবায়া", "কুর্তি", "পাঞ্জাবী", "ড্রেস",
        "leather wallet", "leather belt", "leather shoe", "চামড়ার জুতো", "লেদার ওয়ালেট",
        "গাওয়া ঘি", "সুন্দরবনের মধু", "অর্গানিক ফুড", "dry fruits", "খাঁটি ঘি",
        "hair oil", "skincare", "organic beauty", "হেয়ার অয়েল", "ফেসওয়াশ"
    ]
    
    leads = []
    seen_phones = set()
    phone_regex = r"(?:\+880|880|0)[-_\s]?1[3-9]\d{8}"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        context = await browser.new_context()
        page = await context.new_page()

        for kw in keywords:
            if len(seen_phones) >= target_count:
                break
            url = f"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BD&q={kw}"
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                await page.wait_for_timeout(3000)
            except Exception:
                continue

            for _ in range(15):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(1500)

            cards = await page.query_selector_all('div')
            for card in cards:
                try:
                    text = await card.inner_text()
                    phones = re.findall(phone_regex, text)
                    if phones:
                        lines = [l.strip() for l in text.split('\n') if l.strip()]
                        page_name = lines[0] if lines else "F-Commerce Page"
                        for p_num in phones:
                            clean_phone = re.sub(r'\D', '', p_num)[-11:]
                            if clean_phone not in seen_phones and len(clean_phone) == 11 and clean_phone.startswith("01"):
                                seen_phones.add(clean_phone)
                                leads.append({"page_name": page_name[:30], "phone": clean_phone, "messaged": False})
                except Exception:
                    continue

        await browser.close()
        with open("leads.json", "w", encoding="utf-8") as f:
            json.dump(leads, f, ensure_ascii=False, indent=2)

asyncio.run(scrape_massive_fcommerce_leads(target_count=200))
