export type OfficeMatter = {
  id: string;
  kind: 'governor' | 'business';
  source: string;
  title: string;
  summary: string;
  region: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: number;
  dueAt: number;
  status: 'open' | 'resolved' | 'expired';
  outcome?: string;
};
