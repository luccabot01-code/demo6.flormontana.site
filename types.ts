
export interface Host {
  id: string;
  slug: string;        // e.g. 'mary-and-john'
  couple_name: string; // e.g. 'Mary & John'
  created_at?: string;
}

export interface RsvpResponse {
  id: string;
  host_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  attendance: 'yes' | 'no';
  guests_count: number;
  message?: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  accepted: number;
  declined: number;
  totalGuests: number;
}

export type ViewState = 'setup' | 'link' | 'form' | 'dashboard' | 'success';
