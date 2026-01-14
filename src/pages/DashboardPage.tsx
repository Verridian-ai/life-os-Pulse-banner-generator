/**
 * DashboardPage - Main hub for Signal
 *
 * Signal Design System: Full navigation with all 16 sections
 * Anti-Slop: Orange/Emerald palette, Spring physics
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  Home,
  FolderOpen,
  Palette,
  Layout,
  Settings,
  Zap,
  MessageSquare,
  PenTool,
  Image,
  ShieldCheck,
} from 'lucide-react';
import { AppShell, NavigationItem } from '../components/shell';
import {
  PlatformCard,
  PlatformType,
  RecentDesigns,
  TemplatesGrid,
  BrandKitPanel,
} from '../components/dashboard';
import type { Design } from '../types/database';
import type { BannerTemplate } from '../constants/templates';
import { getUserDesigns, deleteDesign } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useVoiceAgent } from '../context/VoiceAgentContext';
import { useAnnouncer } from '../components/accessibility/ScreenReaderAnnouncer';
import { useToast } from '../hooks/useToast';
import { useAdminAuth } from '../features/admin/hooks/useAdminAuth';
import { Skeleton } from '../components/ui/Skeleton';

// Lazy load heavy components
const QuickGenerateWizard = lazy(() =>
  import('../components/features/QuickGenerateWizard').then((m) => ({
    default: m.QuickGenerateWizard,
  })),
);
const ImageGallery = lazy(() => import('../components/features/ImageGallery'));
const ChatInterface = lazy(() => import('../components/ChatInterface'));

type ViewType =
  | 'dashboard'
  | 'design-studio'
  | 'projects'
  | 'templates'
  | 'brand'
  | 'settings'
  | 'quick-generate'
  | 'chat-brainstorm'
  | 'gallery';

interface DashboardPageProps {
  onEnterStudio: (platform: PlatformType) => void;
  onOpenPreferences: () => void;
  onOpenAuth: () => void;
  onSelectTemplate?: (template: BannerTemplate) => void;
  onCreateBrand?: () => void;
}

export function DashboardPage({
  onEnterStudio,
  onOpenPreferences,
  onOpenAuth,
  onSelectTemplate,
  onCreateBrand,
}: DashboardPageProps) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const { isAdmin } = useAdminAuth();

  // Voice Agent state and controls
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const voiceAgent = useVoiceAgent();
  const { announce } = useAnnouncer();

  // Voice Agent toggle handler
  const toggleVoiceMode = useCallback(async () => {
    if (isVoiceActive) {
      await voiceAgent.disconnect();
      setIsVoiceActive(false);
      announce('Voice mode disconnected', 'polite');
    } else {
      try {
        await voiceAgent.connect();
        setIsVoiceActive(true);
        announce('Voice mode connected', 'polite');
      } catch (err) {
        console.error('Voice connection failed:', err);
      }
    }
  }, [isVoiceActive, voiceAgent, announce]);

  // Monitor voice errors
  useEffect(() => {
    if (voiceAgent.connectionState === 'error' && voiceAgent.errorMessage) {
      toast.error(`Voice: ${voiceAgent.errorMessage}`, {
        duration: 10000,
        action: {
          label: 'RETRY',
          onClick: () => voiceAgent.retry(),
        },
      });
      announce(`Voice error: ${voiceAgent.errorMessage}`, 'assertive');
    }
  }, [voiceAgent.connectionState, voiceAgent.errorMessage, toast, announce, voiceAgent]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredDesigns(designs);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = designs.filter(
      (d) =>
        d.title.toLowerCase().includes(lowerQuery) ||
        d.description?.toLowerCase().includes(lowerQuery) ||
        d.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
    setFilteredDesigns(filtered);
    if (activeView !== 'dashboard') {
      setActiveView('dashboard');
    }
  };

  // Full navigation items for sidebar
  const navigationItems: NavigationItem[] = [
    // Core
    { id: 'dashboard', label: 'Dashboard', icon: <Home className='w-5 h-5' /> },
    {
      id: 'design-studio',
      label: 'Design Studio',
      icon: <PenTool className='w-5 h-5' />,
      onClick: () => onEnterStudio('linkedin'),
    },
    { id: 'quick-generate', label: 'Quick Generate', icon: <Zap className='w-5 h-5' /> },
    { id: 'templates', label: 'Templates', icon: <Layout className='w-5 h-5' /> },
    { id: 'gallery', label: 'Gallery', icon: <Image className='w-5 h-5' /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className='w-5 h-5' /> },
    { id: 'brand', label: 'Brand Kit', icon: <Palette className='w-5 h-5' /> },
    { id: 'chat-brainstorm', label: 'AI Chat', icon: <MessageSquare className='w-5 h-5' /> },
    // Settings at bottom
    { id: 'settings', label: 'Settings', icon: <Settings className='w-5 h-5' /> },
  ];

  // Add Admin item if user has admin privileges (verified via useAdminAuth hook)
  if (isAdmin) {
    navigationItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: <ShieldCheck className='w-5 h-5' />,
    });
  }

  // Load recent designs
  useEffect(() => {
    async function loadDesigns() {
      if (!isAuthenticated) {
        setIsLoadingDesigns(false);
        return;
      }

      try {
        const userDesigns = await getUserDesigns();
        const recentDesigns = userDesigns.slice(0, 8);
        setDesigns(recentDesigns);
        setFilteredDesigns(recentDesigns);
      } catch (error) {
        console.error('Failed to load designs:', error);
      } finally {
        setIsLoadingDesigns(false);
      }
    }

    loadDesigns();
  }, [isAuthenticated]);

  // Platform list
  const platforms: PlatformType[] = ['linkedin', 'youtube', 'instagram', 'facebook', 'tiktok', 'x'];

  const handlePlatformClick = (platform: PlatformType) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    onEnterStudio(platform);
  };

  const handleDesignClick = (design: Design) => {
    toast.info(`Opening "${design.title}"...`);
  };

  const handleDeleteDesign = async (design: Design) => {
    try {
      await deleteDesign(design.id);
      setDesigns((prev) => prev.filter((d) => d.id !== design.id));
      toast.info('Design deleted');
    } catch (error) {
      console.error('Failed to delete design:', error);
      toast.error('Failed to delete design');
    }
  };

  const handleCreateNew = () => {
    handlePlatformClick('linkedin');
  };

  const handleNavigate = (id: string) => {
    // Handle special navigation
    if (id === 'settings') {
      onOpenPreferences();
      return;
    }
    if (id === 'design-studio') {
      onEnterStudio('linkedin');
      return;
    }
    if (id === 'admin') {
      window.location.href = '/admin';
      return;
    }
    setActiveView(id as ViewType);
  };

  // Section header component
  const SectionHeader = ({
    icon: Icon,
    title,
    description,
    iconColor = 'text-yellow-400',
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    iconColor?: string;
  }) => (
    <div className='flex items-center gap-3 mb-6'>
      <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-yellow-300/20 flex items-center justify-center'>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h1 className='text-2xl font-bold text-white'>{title}</h1>
        <p className='text-stone-400 text-sm'>{description}</p>
      </div>
    </div>
  );

  // Coming Soon placeholder
  const ComingSoon = ({
    title,
    description,
    launchDate = 'Q1 2026',
  }: {
    title: string;
    description: string;
    launchDate?: string;
  }) => (
    <div className='bg-gradient-to-br from-stone-900/80 to-stone-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-10 text-center relative overflow-hidden'>
      <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/5 to-yellow-300/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
      <div className='relative z-10'>
        <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-stone-800/80 to-stone-800/40 flex items-center justify-center mx-auto mb-5 border border-white/5'>
          <Zap className='w-10 h-10 text-yellow-400/50' />
        </div>
        <h3 className='text-xl font-bold text-white mb-2'>{title}</h3>
        <p className='text-sm text-stone-400 max-w-md mx-auto leading-relaxed'>{description}</p>
        <div className='flex items-center justify-center gap-2 mt-6'>
          <span className='px-4 py-2 bg-white/5 rounded-xl text-sm text-stone-400 font-medium'>
            Launching {launchDate}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AppShell
        navigationItems={navigationItems}
        activeItemId={activeView}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
        onOpenSettings={onOpenPreferences}
        onOpenAuth={onOpenAuth}
        showSearch={true}
        onSearch={handleSearch}
        showVoiceAgent={true}
        isVoiceActive={voiceAgent.isConnected || isVoiceActive}
        voiceConnectionState={voiceAgent.connectionState}
        onToggleVoice={toggleVoiceMode}
      >
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className='space-y-10'>
            <div className='relative'>
              <div className='absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-emerald-500/5 rounded-full blur-3xl opacity-50 pointer-events-none' />
              <div className='relative z-10'>
                <h1 className='text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight'>
                  {user ? (
                    <>
                      Welcome back,{' '}
                      <span className='bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent'>
                        {user.first_name || user.full_name?.split(' ')[0] || 'Creator'}
                      </span>
                    </>
                  ) : (
                    <>
                      Welcome to{' '}
                      <span className='bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent'>
                        Signal
                      </span>
                    </>
                  )}
                </h1>
                <p className='text-stone-400 text-sm md:text-base'>
                  Create stunning content with AI-powered design tools
                </p>
              </div>
            </div>

            <section>
              <div className='flex items-center gap-3 mb-5'>
                <div className='w-1 h-6 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full' />
                <h2 className='text-lg font-bold text-white'>Create for Platform</h2>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5'>
                {platforms.map((platform) => (
                  <PlatformCard
                    key={platform}
                    platform={platform}
                    onClick={() => handlePlatformClick(platform)}
                  />
                ))}
              </div>
            </section>

            <RecentDesigns
              designs={searchQuery ? filteredDesigns : designs}
              onDesignClick={handleDesignClick}
              onDeleteDesign={handleDeleteDesign}
              isLoading={isLoadingDesigns}
            />
          </div>
        )}

        {/* Quick Generate View */}
        {activeView === 'quick-generate' && (
          <div className='space-y-6'>
            <SectionHeader
              icon={Zap}
              title='Quick Generate'
              description='Create designs in one click'
            />
            <Suspense fallback={<Skeleton height={400} />}>
              <QuickGenerateWizard
                onClose={() => setActiveView('dashboard')}
                onComplete={() => {
                  setActiveView('dashboard');
                  toast.info('Design created!');
                }}
              />
            </Suspense>
          </div>
        )}

        {/* Templates View */}
        {activeView === 'templates' && (
          <div className='space-y-6'>
            <SectionHeader
              icon={Layout}
              title='Templates'
              description='Browse and use pre-designed templates'
            />
            <TemplatesGrid
              onSelectTemplate={(template) => {
                if (onSelectTemplate) {
                  onSelectTemplate(template);
                } else {
                  toast.info(`Selected "${template.title}" - opening studio...`);
                  onEnterStudio('linkedin');
                }
              }}
            />
          </div>
        )}

        {/* Gallery View */}
        {activeView === 'gallery' && (
          <div className='space-y-6'>
            <SectionHeader
              icon={Image}
              title='Gallery'
              description='View all your generated images'
            />
            <Suspense
              fallback={
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} height={200} />
                  ))}
                </div>
              }
            >
              <ImageGallery onNavigateToStudio={() => onEnterStudio('linkedin')} />
            </Suspense>
          </div>
        )}

        {/* Projects View */}
        {activeView === 'projects' && (
          <div className='space-y-6'>
            <SectionHeader
              icon={FolderOpen}
              title='Projects'
              description='Organize your designs into projects'
            />
            <ComingSoon
              title='Projects Coming Soon'
              description='Project organization will help you keep your designs structured and easy to find. Stay tuned for this exciting update!'
            />
          </div>
        )}

        {/* Brand Kit View */}
        {activeView === 'brand' && (
          <div className='space-y-6'>
            <SectionHeader
              icon={Palette}
              title='Brand Kit'
              description='Manage your brand colors, fonts, and assets'
            />
            <BrandKitPanel
              onCreateBrand={() => {
                if (onCreateBrand) {
                  onCreateBrand();
                } else {
                  toast.info('Brand creation coming soon!');
                }
              }}
            />
          </div>
        )}

        {/* AI Chat / Brainstorm View */}
        {activeView === 'chat-brainstorm' && (
          <div className='space-y-6 h-full'>
            <SectionHeader
              icon={MessageSquare}
              title='AI Chat'
              description='Brainstorm ideas with AI'
            />
            <Suspense fallback={<Skeleton height={500} />}>
              <div className='h-[calc(100vh-280px)]'>
                <ChatInterface onGenerateFromPrompt={() => onEnterStudio('linkedin')} />
              </div>
            </Suspense>
          </div>
        )}
      </AppShell>
    </>
  );
}

export default DashboardPage;
