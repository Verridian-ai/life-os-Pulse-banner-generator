// Dashboard Section Types
// Based on nanobanna-pro database types

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
  credits: number;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  design_url: string;
  canvas_data?: Record<string, unknown>;
  width: number;
  height: number;
  tags?: string[];
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformStudio {
  id: string;
  name: string;
  description: string;
  icon: string;
  logoUrl: string;
  route: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface DashboardData {
  user: User;
  recentDesigns: Design[];
  platforms: PlatformStudio[];
}

export interface UserStats {
  total_designs: number;
  total_brand_profiles: number;
  total_reference_images: number;
  total_cost_usd: number;
  total_operations: number;
}
