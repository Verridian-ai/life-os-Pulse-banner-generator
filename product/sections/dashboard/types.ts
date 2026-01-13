/**
 * Dashboard Section Types
 */

export interface DashboardStats {
  creditsUsed: number;
  creditsTotal: number;
  designsThisMonth: number;
  activeProjects: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  description: string;
}

export interface RecentDesign {
  id: string;
  title: string;
  thumbnailUrl: string;
  platform: string;
  updatedAt: string;
  status: 'draft' | 'completed';
}

export interface DashboardViewProps {
  user: {
    name: string;
    avatarUrl?: string;
    subscriptionTier: 'free' | 'pro' | 'team';
  };
  stats: DashboardStats;
  quickActions: QuickAction[];
  recentDesigns: RecentDesign[];
  onCreateNew: () => void;
  onNavigateTo: (path: string) => void;
  onOpenDesign: (designId: string) => void;
  onViewAllDesigns: () => void;
}
