import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'leads.db');

export interface LeadRow {
  id: number;
  page_name: string;
  phone_number: string;
  category: string;
  ad_status: 'active' | 'inactive';
  messaged_status: number; // 0 or 1
  created_at: string;
}

let dbInstance: Database | null = null;

/**
 * Persist in-memory database to leads.db file
 */
export function saveDatabase() {
  if (dbInstance) {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Initialize SQLite database and create 'leads' table
 */
export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Failed to load existing database file, creating fresh database:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Create table 'leads' according to exact requirements
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      category TEXT NOT NULL,
      ad_status TEXT NOT NULL CHECK(ad_status IN ('active', 'inactive')),
      messaged_status INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Check if database is empty; if so, seed initial F-commerce leads
  const checkCount = dbInstance.exec("SELECT COUNT(*) as count FROM leads");
  const count = checkCount[0]?.values[0]?.[0] as number || 0;

  if (count === 0) {
    console.log('Seeding initial F-Commerce leads into SQLite database...');
    const initialLeads = [
      ['স্টাইলিশ ফ্যাশন', '+91 733329455', 'পোশাক, ফ্যাশন', 'active', 0],
      ['টেক গ্যাজেট BD', '+91 455209940', 'পোশাক, ইলেকট্রনিক্স', 'active', 0],
      ['আজাবা সাগট BD', '+91 772271133', 'পোশাক, বলে', 'active', 0],
      ['রোজাদিশ ফ্যাশন', '+91 723227307', 'পোশাক, ইলেকট্রনিক্স', 'active', 0],
      ['মাহাকাদিম ফ্যাশন', '+91 772271336', 'পোশাক, ইলেকট্রনিক্স', 'active', 0],
      ['স্টাইলিশ ফ্যাশন', '+91 707731629', 'পোশাক, ইলেকট্রনিক্স', 'active', 0],
      ['আডার ফ্যাশন', '+91 823809244', 'পোশাক, ইলেকট্রনিক্স', 'inactive', 0],
      ['স্টাইলিশ ফ্যাশন', '+91 93232217', 'পোশাক, ইলেকট্রনিক্স', 'active', 0],
      ['স্টাইলিশ ফ্যাশন', '+91 03693561', 'পোশাক, ইলেকট্রনিক্স', 'active', 0],
      ['টেক গ্যাজেট BD', '+91 88550001', 'পোশাক, বলে', 'active', 0],
      ['স্টাইলিশ ফ্যাশন', '+91 83350005', 'কাইলল, কাশন', 'inactive', 0],
      ['স্মার্ট শপ বাংলাদেশ', '+880 1712345678', 'পোশাক, ইলেকট্রনিক্স', 'active', 0],
      ['রুপচর্চা ও রূপসী', '+880 1819876543', 'কসমেটিকস, রূপচর্চা', 'active', 0],
      ['নবাবী পাঞ্জাবি কালেকশন', '+880 1911223344', 'পোশাক, ফ্যাশন', 'inactive', 0],
      ['ডিজিটাল গ্যাজেট হাব', '+880 1622334455', 'পোশাক, ইলেকট্রনিক্স', 'active', 0]
    ];

    const stmt = dbInstance.prepare(`
      INSERT INTO leads (page_name, phone_number, category, ad_status, messaged_status)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const lead of initialLeads) {
      stmt.run(lead);
    }
    stmt.free();
    saveDatabase();
  }

  return dbInstance;
}
