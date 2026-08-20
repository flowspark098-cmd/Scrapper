export interface FCommerceLead {
  id: number | string;
  page_id?: string;
  page_name?: string;
  phone_number?: string;
  category: string;
  ad_status?: 'active' | 'inactive';
  messaged_status?: boolean;
  created_at?: string;
  raw_ad_text?: string;
  // UI legacy aliases
  name?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  facebookUrl?: string;
  whatsappNumber?: string;
  wa_link?: string;
}

export interface DatabaseStats {
  totalPages: number;
  activeAdvertisers: number;
  messagedCount?: number;
}
