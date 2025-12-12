// AI-specific TypeScript interfaces for Nanobanna Pro

export interface ModelMetadata {
  id: string;
  provider: 'gemini' | 'openrouter' | 'replicate';
  name: string;
  capabilities: ('text' | 'vision' | 'thinking' | 'image_gen' | 'image_edit')[];
  costPerCall: number;
  avgResponseTime: number;
  qualityScore: number;
  contextWindow?: number;
}

export interface PerformanceMetric {
  id: string;
  modelId: string;
  provider: 'gemini' | 'openrouter' | 'replicate';
  operation: 'text_gen' | 'image_gen' | 'image_edit' | 'upscale' | 'removebg' | 'inpaint' | 'outpaint' | 'restore' | 'faceenhance';
  timestamp: number;
  responseTime: number; // ms
  tokenUsage?: { input: number; output: number };
  cost: number; // USD
  success: boolean;
  errorMessage?: string;
}

export interface ToolChain {
  id: string;
  name?: string;
  steps: ChainStep[];
  currentStep: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
}

export interface ChainStep {
  id: string;
  tool: 'generate' | 'upscale' | 'edit' | 'removebg' | 'inpaint' | 'outpaint' | 'restore' | 'faceenhance';
  params: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string; // image URL or base64
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface BrandProfile {
  colors: { hex: string; name: string; usage: 'primary' | 'accent' | 'background' }[];
  fonts: { name: string; usage: 'heading' | 'body' }[];
  styleKeywords: string[]; // ["modern", "minimalist", "tech"]
  logoUrl?: string;
  industry?: string;
  targetAudience?: string;
  lastUpdated: number;
  version: number; // For schema migration
}

export interface ImageEditTurn {
  id: string;
  prompt: string;
  inputImage: string; // base64
  outputImage: string; // base64
  timestamp: number;
  referenceImages?: string[];
  model?: string;
}

export interface ReplicateOperation {
  id: string;
  type: 'upscale' | 'removebg' | 'inpaint' | 'outpaint' | 'restore' | 'faceenhance';
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  progress: number; // 0-100
  predictionId?: string;
  inputImage?: string;
  outputImage?: string;
  error?: string;
}

export interface ModelSelectionCache {
  autoSelectEnabled: boolean;
  manualOverride: string | null;
  preferredProvider: 'gemini' | 'openrouter' | 'replicate';
  qualityPreference: 'fast' | 'balanced' | 'best';
  costLimit: number; // Max $ per operation
  recentModels: string[]; // Last 5 used models
}

export interface EditSession {
  id: string;
  startedAt: number;
  baseImage: string;
  turns: ImageEditTurn[];
  currentImage: string;
  referenceImages: string[];
}

export interface MetricsSummary {
  totalCalls: number;
  totalCost: number;
  avgResponseTime: number;
  successRate: number;
  byModel: Record<string, { calls: number; cost: number; avgTime: number }>;
  lastUpdated: number;
}

export interface AIContextType {
  // Model Selection
  selectedProvider: 'gemini' | 'openrouter' | 'replicate';
  selectedModel: string;
  availableModels: ModelMetadata[];
  modelOverride: string | null;
  setModelOverride: (model: string | null) => void;

  // Performance Tracking
  performanceMetrics: PerformanceMetric[];
  addMetric: (metric: PerformanceMetric) => void;
  getTotalCost: () => number;
  getAvgResponseTime: () => number;

  // Tool Chaining
  activeChain: ToolChain | null;
  setActiveChain: (chain: ToolChain | null) => void;
  chainProgress: number;

  // Brand Consistency
  brandProfile: BrandProfile | null;
  updateBrandProfile: (profile: Partial<BrandProfile>) => void;

  // Multi-turn Image Editing
  editHistory: ImageEditTurn[];
  addEditTurn: (turn: ImageEditTurn) => void;
  clearEditHistory: () => void;

  // Replicate Operations
  replicateOperation: ReplicateOperation | null;
  setReplicateOperation: (op: ReplicateOperation | null | ((prev: ReplicateOperation | null) => ReplicateOperation | null)) => void;
}
