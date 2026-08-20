import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase, LeadRow } from '../db.js';

export const leadsRouter = Router();

/**
 * Helper to format SQLite row into client Lead object
 */
function formatLead(row: any[]) {
  return {
    id: Number(row[0]),
    page_name: String(row[1] || ''),
    phone_number: String(row[2] || ''),
    category: String(row[3] || ''),
    ad_status: (row[4] === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    messaged_status: Boolean(row[5]),
    created_at: String(row[6] || ''),
  };
}

/**
 * GET /api/leads
 * Query params: search, category, ad_status, messaged_status
 */
leadsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { search, category, ad_status, messaged_status } = req.query;

    let query = 'SELECT id, page_name, phone_number, category, ad_status, messaged_status, created_at FROM leads WHERE 1=1';
    const params: any[] = [];

    // Filter by search keyword (page_name or phone_number)
    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ' AND (page_name LIKE ? OR phone_number LIKE ? OR category LIKE ?)';
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by category
    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'সব ক্যাটাগরি') {
      query += ' AND category LIKE ?';
      params.push(`%${category.trim()}%`);
    }

    // Filter by ad_status ('active' or 'inactive')
    if (ad_status && (ad_status === 'active' || ad_status === 'inactive')) {
      query += ' AND ad_status = ?';
      params.push(ad_status);
    }

    // Filter by messaged_status
    if (messaged_status !== undefined) {
      const isMessaged = messaged_status === 'true' || messaged_status === '1';
      query += ' AND messaged_status = ?';
      params.push(isMessaged ? 1 : 0);
    }

    query += ' ORDER BY id DESC';

    const stmt = db.prepare(query);
    stmt.bind(params);

    const leads: any[] = [];
    while (stmt.step()) {
      leads.push(formatLead(stmt.get()));
    }
    stmt.free();

    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve leads',
      details: error.message || 'Internal Server Error',
    });
  }
});

/**
 * GET /api/leads/stats
 * Get overview dashboard stats
 */
leadsRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    // Total count
    const totalRes = db.exec('SELECT COUNT(*) FROM leads');
    const totalPages = (totalRes[0]?.values[0]?.[0] as number) || 0;

    // Active ads count
    const activeRes = db.exec("SELECT COUNT(*) FROM leads WHERE ad_status = 'active'");
    const activeAdvertisers = (activeRes[0]?.values[0]?.[0] as number) || 0;

    // Messaged count
    const messagedRes = db.exec('SELECT COUNT(*) FROM leads WHERE messaged_status = 1');
    const messagedCount = (messagedRes[0]?.values[0]?.[0] as number) || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalPages,
        activeAdvertisers,
        messagedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats',
      details: error.message,
    });
  }
});

/**
 * POST /api/leads
 * Insert new scraped lead or batch of leads
 */
leadsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const body = req.body;

    // Support single lead or array of scraped leads
    const leadsToInsert = Array.isArray(body) ? body : [body];

    if (leadsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body cannot be empty',
      });
    }

    const insertedLeads: any[] = [];

    const stmt = db.prepare(`
      INSERT INTO leads (page_name, phone_number, category, ad_status, messaged_status)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const lead of leadsToInsert) {
      const { page_name, phone_number, category, ad_status, messaged_status } = lead;

      // Validation
      if (!page_name || typeof page_name !== 'string' || page_name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Validation Error: page_name is required and must be a non-empty string',
        });
      }

      if (!phone_number || typeof phone_number !== 'string' || phone_number.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Validation Error: phone_number is required',
        });
      }

      const validCategory = category && typeof category === 'string' ? category.trim() : 'পোশাক, ফ্যাশন';
      const validAdStatus = ad_status === 'inactive' ? 'inactive' : 'active';
      const validMessagedStatus = Boolean(messaged_status) ? 1 : 0;

      stmt.run([page_name.trim(), phone_number.trim(), validCategory, validAdStatus, validMessagedStatus]);

      // Get last inserted id
      const lastIdRes = db.exec('SELECT last_insert_rowid()');
      const insertedId = lastIdRes[0]?.values[0]?.[0];

      insertedLeads.push({
        id: insertedId,
        page_name: page_name.trim(),
        phone_number: phone_number.trim(),
        category: validCategory,
        ad_status: validAdStatus,
        messaged_status: Boolean(validMessagedStatus),
      });
    }

    stmt.free();
    saveDatabase();

    return res.status(201).json({
      success: true,
      message: `${insertedLeads.length} lead(s) inserted successfully`,
      data: leadsToInsert.length === 1 ? insertedLeads[0] : insertedLeads,
    });
  } catch (error: any) {
    console.error('Error inserting lead:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to insert lead',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/leads/:id/status
 * Update messaged_status of a lead
 */
leadsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leadId = parseInt(id, 10);

    if (isNaN(leadId) || leadId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead ID parameter',
      });
    }

    const { messaged_status } = req.body;

    if (messaged_status === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: messaged_status field (boolean) is required in body',
      });
    }

    const statusValue = Boolean(messaged_status) ? 1 : 0;
    const db = await getDatabase();

    // Check if lead exists
    const checkStmt = db.prepare('SELECT id FROM leads WHERE id = ?');
    checkStmt.bind([leadId]);
    const exists = checkStmt.step();
    checkStmt.free();

    if (!exists) {
      return res.status(404).json({
        success: false,
        error: `Lead with id ${leadId} not found`,
      });
    }

    // Update status
    const updateStmt = db.prepare('UPDATE leads SET messaged_status = ? WHERE id = ?');
    updateStmt.run([statusValue, leadId]);
    updateStmt.free();
    saveDatabase();

    // Fetch updated lead
    const fetchStmt = db.prepare('SELECT id, page_name, phone_number, category, ad_status, messaged_status, created_at FROM leads WHERE id = ?');
    fetchStmt.bind([leadId]);
    fetchStmt.step();
    const updatedLead = formatLead(fetchStmt.get());
    fetchStmt.free();

    return res.status(200).json({
      success: true,
      message: 'Messaged status updated successfully',
      data: updatedLead,
    });
  } catch (error: any) {
    console.error('Error updating messaged status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update lead status',
      details: error.message,
    });
  }
});

/**
 * POST /api/leads/batch-status
 * Update messaged_status for multiple leads at once
 */
leadsRouter.post('/batch-status', async (req: Request, res: Response) => {
  try {
    const { lead_ids, messaged_status } = req.body;

    if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'lead_ids must be a non-empty array of IDs',
      });
    }

    const statusValue = messaged_status !== undefined ? (Boolean(messaged_status) ? 1 : 0) : 1;
    const db = await getDatabase();

    const stmt = db.prepare('UPDATE leads SET messaged_status = ? WHERE id = ?');
    let updatedCount = 0;

    for (const id of lead_ids) {
      stmt.run([statusValue, id]);
      updatedCount++;
    }
    stmt.free();
    saveDatabase();

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} leads`,
      updated_count: updatedCount,
      messaged_status: Boolean(statusValue),
    });
  } catch (error: any) {
    console.error('Error batch updating leads:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to batch update leads',
      details: error.message,
    });
  }
});

/**
 * POST /api/send-whatsapp-bulk
 * Backend endpoint for bulk WhatsApp queue processing
 */
leadsRouter.post('/send-whatsapp-bulk', async (req: Request, res: Response) => {
  try {
    const { leads, message_template, delay_seconds } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'leads array is required and cannot be empty',
      });
    }

    const template = message_template || 'আসসালামু আলাইকুম {page_name}, আপনার পেজের বিজ্ঞাপন দেখে যোগাযোগ করছি।';
    const delay = Number(delay_seconds) || 10;
    const processedLeads: any[] = [];
    const leadIdsToUpdate: any[] = [];

    for (const lead of leads) {
      const pageName = lead.page_name || lead.name || 'গ্রাহক';
      const rawPhone = lead.phone_number || lead.phone || '';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

      // Replace variable placeholders like {page_name}, {category}, {phone}
      const personalizedMessage = template
        .replace(/{page_name}/gi, pageName)
        .replace(/{category}/gi, lead.category || '')
        .replace(/{phone}/gi, rawPhone);

      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;

      processedLeads.push({
        id: lead.id,
        page_name: pageName,
        phone_number: rawPhone,
        personalized_message: personalizedMessage,
        wa_link: waLink,
        status: 'queued',
      });

      if (lead.id) {
        leadIdsToUpdate.push(lead.id);
      }
    }

    // Mark updated in SQLite DB
    if (leadIdsToUpdate.length > 0) {
      const db = await getDatabase();
      const stmt = db.prepare('UPDATE leads SET messaged_status = 1 WHERE id = ?');
      for (const id of leadIdsToUpdate) {
        stmt.run([1, id]);
      }
      stmt.free();
      saveDatabase();
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${processedLeads.length} bulk WhatsApp messages with ${delay}s interval recommendation`,
      total_contacts: processedLeads.length,
      recommended_delay_seconds: delay,
      results: processedLeads,
    });
  } catch (error: any) {
    console.error('Error handling bulk WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process bulk WhatsApp messages',
      details: error.message,
    });
  }
});

const DEFAULT_META_ACCESS_TOKEN =
  process.env.META_ACCESS_TOKEN ||
  'EAAO1PApF55UBSe0S22zLZB84EH13ZCGGaXZCpivNyWf060XvGbl9rRb7Qe8ZAv2OQO1FvgEIYXvWZBUYTF0ZAZCnNufot1LIBWrygKdQG9we5Cppgq7E6ZBnHk4ZBqaCT8DCFdqXQSOQ3gdE0g6zZCiCxXZAsMGEZCEESCCbCNPvM6RxsVJUZBZCP5mRl4xRFSYkvRcdbGFIX6GgJx2Ok2DGpVZAPx6N2UrC9HVzRFncXlCnafHcXXnroxqTjIVFvch5rDgfGYrcRos2IePDwhOt4YtznSq';

// Bangladeshi Phone Number Regex
const BD_PHONE_REGEX = /(?:\+?880|0)?[\s-]*(1[3-9]\d{2})[\s-]*(\d{6})/g;

function extractBdPhoneNumbers(text: string): string[] {
  if (!text) return [];
  const numbers: string[] = [];
  const matches = text.matchAll(BD_PHONE_REGEX);
  for (const match of matches) {
    const prefix = match[1];
    const suffix = match[2];
    const fullNumber = `+880${prefix}${suffix}`;
    if (!numbers.includes(fullNumber)) {
      numbers.push(fullNumber);
    }
  }
  return numbers;
}

/**
 * GET /api/meta-ads
 * Query params: search (default: 'online shop'), access_token (optional override)
 */
leadsRouter.get('/meta-ads', async (req: Request, res: Response) => {
  try {
    const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const searchTerm = rawSearch || 'online shop';
    const accessToken =
      (typeof req.query.access_token === 'string' && req.query.access_token.trim()) ||
      DEFAULT_META_ACCESS_TOKEN;

    const metaApiUrl = `https://graph.facebook.com/v19.0/ads_archive?ad_reached_countries=['BD']&ad_active_status=ACTIVE&search_terms=${encodeURIComponent(
      searchTerm
    )}&limit=50&fields=page_id,page_name,ad_creative_bodies,ad_snapshot_url&access_token=${accessToken}`;

    console.log(`[*] Fetching Live Meta Ad Library API for search: "${searchTerm}"`);

    const response = await fetch(metaApiUrl);
    const data: any = await response.json();

    if (!response.ok || data.error) {
      console.error('[!] Meta API Error:', data.error);
      return res.status(response.status >= 400 ? response.status : 400).json({
        success: false,
        status_code: response.status,
        error: data.error || { message: 'Meta Ad Library API request failed', code: response.status, type: 'APIError' },
      });
    }

    const adsData = Array.isArray(data.data) ? data.data : [];
    const extractedLeads: any[] = [];
    const seenPhones = new Set<string>();

    const db = await getDatabase();
    const insertStmt = db.prepare(
      'INSERT OR IGNORE INTO leads (page_name, phone_number, category, ad_status, messaged_status) VALUES (?, ?, ?, ?, 0)'
    );

    let newInsertedCount = 0;

    for (const ad of adsData) {
      const pageName = ad.page_name || 'F-Commerce পেজ';
      const bodies: string[] = Array.isArray(ad.ad_creative_bodies) ? ad.ad_creative_bodies : [];
      const combinedText = bodies.join(' \n ');

      const foundNumbers = extractBdPhoneNumbers(combinedText);

      for (const phone of foundNumbers) {
        if (!seenPhones.has(phone)) {
          seenPhones.add(phone);
          const cleanDigits = phone.replace(/[^0-9]/g, '');
          const waLink = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
            `আসসালামু আলাইকুম! ${pageName} এর বিজ্ঞাপন দেখে যোগাযোগ করছি।`
          )}`;

          const leadItem = {
            id: Date.now() + Math.floor(Math.random() * 100000),
            page_id: ad.page_id,
            page_name: pageName,
            phone_number: phone,
            category: 'পোশাক, ফ্যাশন',
            ad_status: 'active' as const,
            messaged_status: false,
            wa_link: waLink,
            raw_ad_text: combinedText.slice(0, 300),
          };

          extractedLeads.push(leadItem);

          try {
            insertStmt.run([leadItem.page_name, leadItem.phone_number, leadItem.category, 'active']);
            newInsertedCount++;
          } catch (dbErr) {
            // Ignore duplicates
          }
        }
      }
    }

    insertStmt.free();
    if (newInsertedCount > 0) {
      saveDatabase();
    }

    return res.status(200).json({
      success: true,
      status_code: 200,
      search_term: searchTerm,
      total_ads_returned: adsData.length,
      extracted_leads_count: extractedLeads.length,
      new_database_saved: newInsertedCount,
      data: extractedLeads,
    });
  } catch (error: any) {
    console.error('Error querying Meta Ad Library API:', error);
    return res.status(500).json({
      success: false,
      status_code: 500,
      error: {
        message: error.message || 'Failed to connect to Meta Ad Library API',
        type: 'NetworkError',
        code: 500
      },
    });
  }
});


