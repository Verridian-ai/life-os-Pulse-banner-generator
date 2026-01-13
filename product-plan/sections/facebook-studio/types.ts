// Facebook Studio Types

export interface FacebookContent {
  id: string;
  userId: string;
  pageId?: string;
  groupId?: string;
  contentType: FacebookContentType;
  text: string;
  mediaUrls: string[];
  linkUrl?: string;
  linkPreview?: LinkPreview;
  poll?: PollConfig;
  audience: AudienceConfig;
  engagementScore: EngagementScore;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type FacebookContentType = 'post' | 'ad' | 'event' | 'cover' | 'story';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  domain: string;
}

export interface PollConfig {
  question: string;
  options: string[];
  duration: PollDuration;
  allowAddOptions: boolean;
}

export type PollDuration = '1d' | '1w' | 'custom';

export interface AudienceConfig {
  type: AudienceType;
  targetingCriteria?: TargetingCriteria;
  estimatedReach: number;
  excludedAudiences?: string[];
}

export type AudienceType = 'public' | 'friends' | 'friends_except' | 'specific_friends' | 'only_me' | 'custom';

export interface TargetingCriteria {
  locations?: string[];
  ageMin?: number;
  ageMax?: number;
  genders?: ('male' | 'female' | 'all')[];
  interests?: string[];
  behaviors?: string[];
}

export interface EngagementScore {
  overall: number;
  reach: number;
  reactions: number;
  comments: number;
  shares: number;
  factors: EngagementFactor[];
  boostRecommendation?: BoostRecommendation;
  bestTimes: TimeSlot[];
}

export interface EngagementFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

export interface BoostRecommendation {
  recommended: boolean;
  estimatedReach: number;
  suggestedBudget: number;
  reasoning: string;
}

export interface TimeSlot {
  day: number; // 0-6
  hour: number; // 0-23
  score: number;
}

export interface AdVariant {
  id: string;
  headline: string;
  body: string;
  imageUrl: string;
  cta: CTAType;
  predictedCTR: number;
  predictedCPC: number;
}

export type CTAType =
  | 'learn_more'
  | 'shop_now'
  | 'sign_up'
  | 'book_now'
  | 'contact_us'
  | 'download'
  | 'get_offer'
  | 'get_quote'
  | 'subscribe'
  | 'watch_more';

export interface EventDetails {
  name: string;
  date: Date;
  endDate?: Date;
  location: string;
  description: string;
  ticketUrl?: string;
  isOnline: boolean;
  category: EventCategory;
}

export type EventCategory =
  | 'networking'
  | 'class'
  | 'conference'
  | 'meetup'
  | 'party'
  | 'concert'
  | 'festival'
  | 'sports'
  | 'other';

export interface FacebookFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  contentType: FacebookContentType;
}
