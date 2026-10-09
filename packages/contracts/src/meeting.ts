import type { Bundle } from './model';
export const MEETING_AGENDAS = ['Trade', 'Emergency Aid', 'Alliance', 'Security', 'General Discussion'] as const;
export type Meeting = {
  id: string;
  participants: string[];
  joined: string[];
  requestedBy: string;
  agenda: (typeof MEETING_AGENDAS)[number];
  status: 'requested' | 'active' | 'proposed' | 'agreed' | 'signed' | 'declined' | 'closed';
  createdAt: number;
  delayedUntil?: number;
  messages: { id: string; author: string; text: string; at: number }[];
  terms: { offer: Bundle; want: Bundle; years: number; startInMonths: number };
  revision: number;
  proposedBy?: string;
  signatures: string[];
  dealId?: string;
};
