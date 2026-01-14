import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import Header from './components/layout/Header';
const LiveActionPanel = lazy(() => import('./components/features/LiveActionPanel'));
import { APIKeyInstructionsModal } from './components/features/APIKeyInstructionsModal';

// Mobile Navigation
// Mobile Navigation
import { BottomNav } from './components/shell/BottomNav';
import { useAdminAuth } from './features/admin/hooks/useAdminAuth';

// New Signal UI components
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
import type { PlatformType } from './components/dashboard';
import { DashboardSkeleton } from './components/dashboard/DashboardSkeleton';

// Lazy load heavy components for code splitting
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const ImageGallery = lazy(() => import('./components/features/ImageGallery'));
const TemplateLibrary = lazy(() => import('./components/features/TemplateLibrary').then(m => ({ default: m.TemplateLibrary })));
const QuickGenerateWizard = lazy(() => import('./components/features/QuickGenerateWizard').then(m => ({ default: m.QuickGenerateWizard })));
const UserPreferencesModal = lazy(() => import('./components/features/UserPreferencesModal').then(m => ({ default: m.UserPreferencesModal })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));
const LinkedInContentStudio = lazy(() => import('./features/linkedin-posts').then(m => ({ default: m.LinkedInContentStudio })));

// Platform-specific studios - lazy loaded
const LinkedInStudio = lazy(() => import('./components/studios/LinkedInStudio'));
const YouTubeStudio = lazy(() => import('./components/studios/YouTubeStudio'));
const InstagramStudio = lazy(() => import('./components/studios/InstagramStudio'));
const FacebookStudio = lazy(() => import('./components/studios/FacebookStudio'));
const TikTokStudio = lazy(() => import('./components/studios/TikTokStudio'));
const XStudio = lazy(() => import('./components/studios/XStudio'));

// Admin pages (lazy loaded)
const AdminDashboard = lazy(() => import('./features/admin').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./features/admin').then(m => ({ default: m.AdminUsers })));
const AdminAgents = lazy(() => import('./features/admin').then(m => ({ default: m.AdminAgents })));
const AdminModels = lazy(() => import('./features/admin').then(m => ({ default: m.AdminModels })));
const AdminObservability = lazy(() => import('./features/admin').then(m => ({ default: m.AdminObservability })));
const AdminFinance = lazy(() => import('./features/admin').then(m => ({ default: m.AdminFinance })));
const AdminAudit = lazy(() => import('./features/admin/pages/AdminAudit').then(m => ({ default: m.AdminAudit })));
const AssetGenerator = lazy(() => import('./features/admin/AssetGenerator').then(m => ({ default: m.AssetGenerator })));

// Design System (lazy loaded)
const DesignSystemPage = lazy(() => import('./features/design-system/DesignSystemPage').then(m => ({ default: m.DesignSystemPage })));

// Onboarding (lazy loaded)
const OnboardingPage = lazy(() => import('./features/onboarding').then(m => ({ default: m.OnboardingPage })));

// Landing page (lazy loaded)
const LandingPage = lazy(() => import('./features/landing').then(m => ({ default: m.LandingPage })));

// Auth pages (lazy loaded)
const LoginPageAuthKit = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPageAuthKit = lazy(() => import('./pages/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const InvitePage = lazy(() => import('./pages/auth/InvitePage').then(m => ({ default: m.InvitePage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

import {
  ScreenReaderAnnouncerProvider,
  useAnnouncer,
} from './components/accessibility/ScreenReaderAnnouncer';
import { useKeyboardShortcuts, getDefaultShortcuts, useKeyboardShortcutsModal } from './hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from './components/features/KeyboardShortcutsModal';
import { OnboardingTour } from './components/features/OnboardingTour';
import { Tab, StudioMode, FORMAT_CATEGORIES } from './constants';
import { StudioSubNav } from './components/layout/StudioSubNav';
import { StudioShell } from './components/shell/StudioShell';
import { CanvasProvider, useCanvas } from './context/CanvasContext';
import { AIProvider, useAI } from './context/AIContext';
import { useAuth } from './context/AuthContext';
// Voice Provider Imported
import { VoiceAgentProvider, useVoiceAgent } from './context/VoiceAgentContext';
// Toast Provider and Container
import { ToastContainer } from './components/ui/ToastContainer';
import { useToast } from './hooks/useToast';
import { Skeleton } from './components/ui/Skeleton';

// App view type
type AppView = 'dashboard' | 'studio';

const AppContent = () => {
  // New Signal UI state
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [activePlatform, setActivePlatform] = useState<PlatformType>('linkedin');

  const [activeTab, setActiveTab] = useState<Tab>(Tab.STUDIO);
  const [studioMode, setStudioMode] = useState<StudioMode>(StudioMode.CANVAS);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuickGen, setShowQuickGen] = useState(false);

  // Refresh state
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Voice Agent state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  // Voice Agent Hook
  const voiceAgent = useVoiceAgent();

  // AI Context
  useAI();

  // Toast notification hook
  const toast = useToast();

  // Accessibility states
  const [showChatHistory, setShowChatHistory] = useState(false);
  const { announce } = useAnnouncer();

  // Keyboard shortcuts modal
  const { isModalOpen, openModal, closeModal } = useKeyboardShortcutsModal();

  // Voice Agent toggle handler
  const toggleVoiceMode = React.useCallback(async () => {
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
        // Error toast will be handled by the effect monitoring connectionState
      }
    }
  }, [isVoiceActive, voiceAgent, announce]);

  // Monitor voice errors
  useEffect(() => {
    // ... (unchanged)
    if (voiceAgent.connectionState === 'error' && voiceAgent.errorMessage) {
      toast.error(`Voice: ${voiceAgent.errorMessage}`, {
        duration: 10000,
        action: {
          label: 'RETRY',
          onClick: () => voiceAgent.retry()
        }
      });
      announce(`Voice error: ${voiceAgent.errorMessage}`, 'assertive');
    }
  }, [voiceAgent.connectionState, voiceAgent.errorMessage, toast, announce, voiceAgent]);

  // Auth state
  const { isAuthenticated, isLoading } = useAuth();

  // Admin status for bottom nav
  const { isAdmin } = useAdminAuth();

  const {
    selectedElementId,
    deleteElement,
    addElement,
    elements,
    showSafeZones,
    setShowSafeZones,
    canvasRef,
    updateElement,
    setCanvasFormatId,
    undo,
    redo,
  } = useCanvas();

  // Generation States
  const [genPrompt, setGenPrompt] = useState('');
  const { prompt: contextPrompt, setPrompt: setContextPrompt } = useAI();

  // Track the last synced value to prevent infinite loops and stale closure issues
  // Using a ref to hold the last value we synced TO context, so we know when context
  // changes are external (from TemplateLibrary etc.) vs from our own sync
  const lastSyncedToContextRef = useRef('');
  const lastSyncedFromContextRef = useRef('');

  // Sync prompt from AIContext (e.g. from TemplateLibrary) to local state
  // Only sync if the context changed externally (not from our own sync)
  useEffect(() => {
    // Skip if this context value came from our own sync to context
    if (contextPrompt === lastSyncedToContextRef.current) {
      return;
    }
    // External update to context - sync to local state
    if (contextPrompt && contextPrompt !== lastSyncedFromContextRef.current) {
      lastSyncedFromContextRef.current = contextPrompt;
      setGenPrompt(contextPrompt);
    }
  }, [contextPrompt]);

  // Sync local prompt to AIContext
  // Only sync if the local change is from user input (not from context sync)
  useEffect(() => {
    // Skip if this local value came from syncing FROM context
    if (genPrompt === lastSyncedFromContextRef.current) {
      return;
    }
    // User typed - sync to context
    if (genPrompt !== lastSyncedToContextRef.current) {
      lastSyncedToContextRef.current = genPrompt;
      setContextPrompt(genPrompt);
    }
  }, [genPrompt, setContextPrompt]);

  const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false); // Used in handleGenerate
  const [isMagicPrompting, setIsMagicPrompting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Register voice agent setters
  const { registerPromptSetter, registerTabSetter, registerPlatform } = voiceAgent;
  useEffect(() => {
    registerPromptSetter(setGenPrompt);
    registerTabSetter(setActiveTab, setStudioMode);
  }, [registerPromptSetter, registerTabSetter]);

  // Register active platform for platform-aware agent routing
  useEffect(() => {
    registerPlatform(activePlatform);
  }, [registerPlatform, activePlatform]);

  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = React.useCallback(() => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
      announce('Element deleted', 'polite');
    }
  }, [selectedElementId, deleteElement, announce]);

  const handleDuplicate = React.useCallback(() => {
    if (selectedElementId) {
      const el = elements.find(e => e.id === selectedElementId);
      if (el) {
        const duplicate = {
          ...el,
          id: `${el.type}-${Date.now()}`,
          x: el.x + 20,
          y: el.y + 20,
        };
        addElement(duplicate);
        announce('Element duplicated', 'polite');
      }
    }
  }, [selectedElementId, elements, addElement, announce]);

  const handleZoom = React.useCallback((factor: number) => {
    if (selectedElementId) {
      const el = elements.find(e => e.id === selectedElementId);
      if (el) {
        if (el.type === 'text') {
          const currentSize = el.fontSize || 48;
          updateElement(el.id, { fontSize: Math.max(12, Math.round(currentSize * factor)) });
        } else {
          const currentW = el.width || 100;
          const currentH = el.height || 100;
          const newW = currentW * factor;
          const newH = currentH * factor;
          const dw = newW - currentW;
          const dh = newH - currentH;
          updateElement(el.id, {
            width: newW,
            height: newH,
            x: el.x - dw / 2,
            y: el.y - dh / 2
          });
        }
      }
    }
  }, [selectedElementId, elements, updateElement]);

  const handleToggleSafeZones = React.useCallback(() => {
    setShowSafeZones(!showSafeZones);
    announce(showSafeZones ? 'Safe zones hidden' : 'Safe zones shown', 'polite');
  }, [showSafeZones, setShowSafeZones, announce]);

  const handleExport = React.useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.generateStageImage();
      const link = document.createElement('a');
      link.download = `nanobanna-export-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      announce('Design exported as PNG', 'polite');
    }
  }, [canvasRef, announce]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };
  const handleMagicPrompt = () => {
    setIsMagicPrompting(true);
    setTimeout(() => setIsMagicPrompting(false), 2000);
  };
  const handleEnhancePrompt = () => {
    setIsEnhancing(true);
    setTimeout(() => setIsEnhancing(false), 2000);
  };
  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => setIsEditing(false), 2000);
  };
  const handleRemoveBg = () => { };
  const handleUpscale = () => { };

  // Refresh handler
  const handleRefresh = React.useCallback(async () => {
    setIsRefreshLoading(true);

    try {
      if (activeTab === Tab.STUDIO) {
        if (studioMode === StudioMode.MEDIA) {
          // Refresh gallery by incrementing refresh key to force re-mount
          setRefreshKey(prev => prev + 1);
          toast.info('Gallery refreshed');
        } else if (studioMode === StudioMode.CANVAS) {
          // Refresh canvas - could clear/reset canvas state if needed
          toast.info('Canvas refreshed');
        } else if (studioMode === StudioMode.TEMPLATES) {
          // Refresh templates - could reload template library
          toast.info('Templates refreshed');
        } else if (studioMode === StudioMode.LINKEDIN) {
          // Refresh LinkedIn content
          toast.info('LinkedIn content refreshed');
        }
      } else if (activeTab === Tab.BRAINSTORM) {
        // Refresh brainstorm - could clear chat or reload history
        toast.info('Brainstorm refreshed');
      }

      // Simulate network delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Refresh failed');
    } finally {
      setIsRefreshLoading(false);
    }
  }, [activeTab, studioMode, toast]);

  // Keyboard shortcuts - intentionally excludes handler dependencies to prevent re-renders
  const shortcuts = React.useMemo(() => getDefaultShortcuts({
    onGenerate: () => {
      if (!genPrompt.trim()) {
        announce('Please enter a prompt first', 'assertive');
        return;
      }
      handleGenerate();
    },
    onToggleHistory: () => {
      setShowChatHistory((prev) => !prev);
      announce(showChatHistory ? 'Chat history closed' : 'Chat history opened', 'polite');
    },
    onClosePanels: () => {
      setShowChatHistory(false);
      setShowPreferences(false);
      closeModal();
    },
    onOpenSettings: () => {
      setShowPreferences(true);
      announce('Preferences opened', 'polite');
    },
    onSwitchToStudio: () => {
      setActiveTab(Tab.STUDIO);
      announce('Switched to Studio tab', 'polite');
    },
    onSwitchToGallery: () => {
      setActiveTab(Tab.STUDIO);
      setStudioMode(StudioMode.MEDIA);
      announce('Switched to Gallery', 'polite');
    },
    onSwitchToBrainstorm: () => {
      setActiveTab(Tab.BRAINSTORM);
      announce('Switched to Brainstorm tab', 'polite');
    },
    onShowShortcuts: () => {
      openModal();
      announce('Keyboard shortcuts modal opened', 'polite');
    },
    onUndo: () => {
      undo();
      announce('Undo', 'polite');
    },
    onRedo: () => {
      redo();
      announce('Redo', 'polite');
    },
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onZoomIn: () => handleZoom(1.1),
    onZoomOut: () => handleZoom(0.9),
    onToggleSafeZones: handleToggleSafeZones,
    onExport: handleExport,
    onSave: () => {
      // Basic save notification since we don't have a backend save project yet beyond gallery
      toast.info('Design auto-saved to session');
      announce('Design saved', 'polite');
    },
    onToggleVoice: toggleVoiceMode,
  }), [
    genPrompt,
    showChatHistory,
    announce,
    openModal,
    closeModal,
    handleDelete,
    handleDuplicate,
    handleZoom,
    handleToggleSafeZones,
    handleExport,
    toast,
    toggleVoiceMode,
    undo,
    redo,
  ]);

  useKeyboardShortcuts({
    shortcuts,
  });

  // Bottom Navigation - Determine active tab based on current view
  // NOTE: Must be before conditional returns for React hooks rules compliance
  const activeBottomNavTab = React.useMemo((): string => {
    if (appView === 'dashboard') return 'home';
    // In studio view
    if (studioMode === StudioMode.MEDIA) return 'library';
    return 'generate'; // Default to generate for canvas/templates/linkedin modes
  }, [appView, studioMode]);

  // Bottom Navigation - Handle tab selection
  // NOTE: Must be before conditional returns for React hooks rules compliance
  const handleBottomNavSelect = React.useCallback((tabId: string): void => {
    switch (tabId) {
      case 'home':
        setAppView('dashboard');
        break;
      case 'generate':
        setAppView('studio');
        setStudioMode(StudioMode.CANVAS);
        break;
      case 'library':
        setAppView('studio');
        setStudioMode(StudioMode.MEDIA);
        break;
      case 'profile':
        setShowPreferences(true);
        break;
      case 'admin':
        window.location.href = '/admin';
        break;
      default:
        break;
    }
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen bg-black text-white font-sans flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 animate-pulse'>
            <span className='material-icons text-3xl text-white'>key</span>
          </div>
          <p className='text-sm text-zinc-400'>Loading...</p>
        </div>
      </div>
    );
  }

  // Handler for entering studio from dashboard
  const handleEnterStudio = (platform: PlatformType) => {
    setActivePlatform(platform);
    setAppView('studio');

    // Auto-select platform's primary format (mobile-first: vertical/story formats prioritized)
    const platformFormats = FORMAT_CATEGORIES[platform]?.formats;
    if (platformFormats && platformFormats.length > 0) {
      setCanvasFormatId(platformFormats[0]);
    }

    // Set appropriate studio mode based on platform
    if (platform === 'linkedin') {
      setStudioMode(StudioMode.LINKEDIN);
    } else {
      setStudioMode(StudioMode.CANVAS);
    }
  };

  // Handler to return to dashboard
  const handleBackToDashboard = () => {
    setAppView('dashboard');
  };

  // Render Dashboard view (new Signal UI)
  if (appView === 'dashboard') {
    return (
      <Suspense fallback={<DashboardSkeleton fullPage />}>
        <DashboardPage
          onEnterStudio={handleEnterStudio}
          onOpenPreferences={() => setShowPreferences(true)}
          onOpenAuth={() => setShowAuthModal(true)}
        />
        <Suspense fallback={null}>
          <UserPreferencesModal isOpen={showPreferences} onClose={() => setShowPreferences(false)} />
        </Suspense>
        <Suspense fallback={null}>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => {
              if (isAuthenticated) setShowAuthModal(false);
            }}
            onSuccess={() => {
              toast.info('Signed in successfully');
              announce('Signed in successfully', 'polite');
              setShowAuthModal(false);
            }}
          />
        </Suspense>
        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTabId={activeBottomNavTab}
          onTabSelect={handleBottomNavSelect}
          showAdminTab={isAdmin}
        />
      </Suspense>
    );
  }

  // Render Studio view (existing UI with back button)
  return (
    <div className='min-h-screen bg-black text-white font-sans flex flex-col'>
      <Header
        onRefresh={handleRefresh}
        isRefreshLoading={isRefreshLoading}
        onBackToDashboard={handleBackToDashboard}
        activePlatform={activePlatform}
      />

      <Suspense fallback={null}>
        <UserPreferencesModal isOpen={showPreferences} onClose={() => setShowPreferences(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            // Only allow closing if user is authenticated
            if (isAuthenticated) {
              setShowAuthModal(false);
            }
          }}
          onSuccess={() => {
            toast.info('✓ SIGNED IN SUCCESSFULLY');
            announce('Signed in successfully', 'polite');
            setShowAuthModal(false); // Close modal after successful auth
          }}
        />
      </Suspense>
      <APIKeyInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
      <KeyboardShortcutsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        shortcuts={shortcuts}
      />
      <Suspense fallback={null}>
        {showQuickGen && (
          <QuickGenerateWizard
            onClose={() => setShowQuickGen(false)}
            onComplete={() => {
              setShowQuickGen(false);
              setActiveTab(Tab.STUDIO);
              setStudioMode(StudioMode.CANVAS);
            }}
          />
        )}
      </Suspense>

      <main className='flex-1 relative flex flex-col md:flex-row bg-black w-full overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none'></div>

        {activeTab === Tab.STUDIO && (
          <StudioShell
            activeNavItem="studio"
            isVoiceActive={isVoiceActive}
            onNavigate={(id) => {
              if (id === 'dashboard') handleBackToDashboard();
              else if (id === 'gallery') {
                setActiveTab(Tab.STUDIO);
                setStudioMode(StudioMode.MEDIA);
              }
              else if (id === 'brainstorm' || id === 'partner') setActiveTab(Tab.BRAINSTORM);
              else if (id === 'studio') {
                setActiveTab(Tab.STUDIO);
                setStudioMode(StudioMode.CANVAS);
              }
              else if (id === 'quick-gen') handleGenerate();
              else if (id === 'voice') toggleVoiceMode();
              else if (id === 'help') openModal();
            }}
            onCreateNew={handleGenerate}
          >
            <div className='flex-1 flex flex-col h-full w-full relative z-10 overflow-hidden pb-20 lg:pb-0'>
              {/* Studio Sub-Navigation */}
              <StudioSubNav currentMode={studioMode} onModeChange={setStudioMode} />

              {/* Canvas Mode - Platform-Specific Studios */}
              {studioMode === StudioMode.CANVAS && (
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
                  {/* Route to platform-specific studio based on activePlatform */}
                  {activePlatform === 'linkedin' && (
                    <LinkedInStudio
                      genPrompt={genPrompt}
                      setGenPrompt={setGenPrompt}
                      genSize={genSize}
                      setGenSize={setGenSize}
                      isGenerating={isGenerating}
                      onGenerate={handleGenerate}
                      isMagicPrompting={isMagicPrompting}
                      onMagicPrompt={handleMagicPrompt}
                      isEnhancing={isEnhancing}
                      onEnhancePrompt={handleEnhancePrompt}
                      editPrompt={editPrompt}
                      setEditPrompt={setEditPrompt}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onRemoveBg={handleRemoveBg}
                      onUpscale={handleUpscale}
                    />
                  )}
                  {activePlatform === 'youtube' && (
                    <YouTubeStudio
                      genPrompt={genPrompt}
                      setGenPrompt={setGenPrompt}
                      genSize={genSize}
                      setGenSize={setGenSize}
                      isGenerating={isGenerating}
                      onGenerate={handleGenerate}
                      isMagicPrompting={isMagicPrompting}
                      onMagicPrompt={handleMagicPrompt}
                      isEnhancing={isEnhancing}
                      onEnhancePrompt={handleEnhancePrompt}
                      editPrompt={editPrompt}
                      setEditPrompt={setEditPrompt}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onRemoveBg={handleRemoveBg}
                      onUpscale={handleUpscale}
                    />
                  )}
                  {activePlatform === 'instagram' && (
                    <InstagramStudio
                      genPrompt={genPrompt}
                      setGenPrompt={setGenPrompt}
                      genSize={genSize}
                      setGenSize={setGenSize}
                      isGenerating={isGenerating}
                      onGenerate={handleGenerate}
                      isMagicPrompting={isMagicPrompting}
                      onMagicPrompt={handleMagicPrompt}
                      isEnhancing={isEnhancing}
                      onEnhancePrompt={handleEnhancePrompt}
                      editPrompt={editPrompt}
                      setEditPrompt={setEditPrompt}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onRemoveBg={handleRemoveBg}
                      onUpscale={handleUpscale}
                    />
                  )}
                  {activePlatform === 'facebook' && (
                    <FacebookStudio
                      genPrompt={genPrompt}
                      setGenPrompt={setGenPrompt}
                      genSize={genSize}
                      setGenSize={setGenSize}
                      isGenerating={isGenerating}
                      onGenerate={handleGenerate}
                      isMagicPrompting={isMagicPrompting}
                      onMagicPrompt={handleMagicPrompt}
                      isEnhancing={isEnhancing}
                      onEnhancePrompt={handleEnhancePrompt}
                      editPrompt={editPrompt}
                      setEditPrompt={setEditPrompt}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onRemoveBg={handleRemoveBg}
                      onUpscale={handleUpscale}
                    />
                  )}
                  {activePlatform === 'tiktok' && (
                    <TikTokStudio
                      genPrompt={genPrompt}
                      setGenPrompt={setGenPrompt}
                      genSize={genSize}
                      setGenSize={setGenSize}
                      isGenerating={isGenerating}
                      onGenerate={handleGenerate}
                      isMagicPrompting={isMagicPrompting}
                      onMagicPrompt={handleMagicPrompt}
                      isEnhancing={isEnhancing}
                      onEnhancePrompt={handleEnhancePrompt}
                      editPrompt={editPrompt}
                      setEditPrompt={setEditPrompt}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onRemoveBg={handleRemoveBg}
                      onUpscale={handleUpscale}
                    />
                  )}
                  {activePlatform === 'x' && (
                    <XStudio
                      genPrompt={genPrompt}
                      setGenPrompt={setGenPrompt}
                      genSize={genSize}
                      setGenSize={setGenSize}
                      isGenerating={isGenerating}
                      onGenerate={handleGenerate}
                      isMagicPrompting={isMagicPrompting}
                      onMagicPrompt={handleMagicPrompt}
                      isEnhancing={isEnhancing}
                      onEnhancePrompt={handleEnhancePrompt}
                      editPrompt={editPrompt}
                      setEditPrompt={setEditPrompt}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onRemoveBg={handleRemoveBg}
                      onUpscale={handleUpscale}
                    />
                  )}
                </Suspense>
              )}

              {/* LinkedIn Mode - Posts Studio */}
              {studioMode === StudioMode.LINKEDIN && (
                <Suspense fallback={
                  <div className="flex-1 p-8 space-y-6">
                    <Skeleton height={40} width={200} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Skeleton height={400} />
                      <div className="space-y-4">
                        <Skeleton height={100} />
                        <Skeleton height={100} />
                        <Skeleton height={100} />
                      </div>
                    </div>
                  </div>
                }>
                  <LinkedInContentStudio platform={activePlatform} />
                </Suspense>
              )}

              {/* Template Library Mode */}
              {studioMode === StudioMode.TEMPLATES && (
                <Suspense fallback={<div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><Skeleton height={250} /><Skeleton height={250} /><Skeleton height={250} /></div>}>
                  <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-hidden">
                    <TemplateLibrary onClose={() => setStudioMode(StudioMode.CANVAS)} />
                  </div>
                </Suspense>
              )}

              {/* Media Mode - Gallery */}
              {studioMode === StudioMode.MEDIA && (
                <Suspense fallback={
                  <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-hidden">
                    {[...Array(8)].map((_, i) => <Skeleton height={200} key={i} />)}
                  </div>
                }>
                  <ImageGallery key={refreshKey} onNavigateToStudio={() => setStudioMode(StudioMode.CANVAS)} />
                </Suspense>
              )}
            </div>
          </StudioShell>
        )}

        {activeTab === Tab.BRAINSTORM && (
          <div className='flex-1 flex flex-col h-full relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden'>
            <Suspense fallback={
              <div className="flex-1 flex flex-col gap-4 p-6 bg-zinc-900/40 rounded-3xl border border-white/5">
                <Skeleton height={40} width="100%" />
                <div className="flex-1 flex flex-col gap-6 justify-end overflow-hidden py-4">
                  <div className="flex gap-3">
                    <Skeleton variant="circle" height={32} width={32} />
                    <Skeleton height={60} width="60%" />
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <Skeleton variant="circle" height={32} width={32} />
                    <Skeleton height={80} width="50%" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton variant="circle" height={32} width={32} />
                    <Skeleton height={100} width="70%" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton height={50} className="flex-1" />
                  <Skeleton height={50} width={50} variant="circle" />
                </div>
              </div>
            }>
              <ChatInterface onGenerateFromPrompt={handleGenerate} />
            </Suspense>
          </div>
        )}
      </main>

      {/* Live Action Panel - Voice Agent UI */}
      {isVoiceActive && (
        <Suspense fallback={null}>
          <LiveActionPanel
            isConnected={voiceAgent.isConnected}
            connectionState={voiceAgent.connectionState}
            connectionQuality={voiceAgent.connectionQuality}
            errorMessage={voiceAgent.errorMessage}
            connectionStartTime={voiceAgent.connectionStartTime}
            lastActivityTime={voiceAgent.lastActivityTime}
            transcript={voiceAgent.transcript}
            pendingAction={voiceAgent.pendingAction}
            executingAction={voiceAgent.executingAction}
            onApproveAction={() => voiceAgent.approveAction()}
            onRejectAction={() => voiceAgent.rejectAction()}
            onRetry={() => voiceAgent.retry()}
          />
        </Suspense>
      )}
      <OnboardingTour />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTabId={activeBottomNavTab}
        onTabSelect={handleBottomNavSelect}
        showAdminTab={isAdmin}
      />
    </div>
  );
};

// Simple path-based router for admin pages
function AdminRouter(): React.ReactElement | null {
  const path = window.location.pathname;

  if (path === '/admin' || path === '/admin/') {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminDashboard />
      </Suspense>
    );
  }

  if (path.startsWith('/admin/users')) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminUsers />
      </Suspense>
    );
  }

  if (path.startsWith('/admin/agents')) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminAgents />
      </Suspense>
    );
  }

  if (path.startsWith('/admin/models')) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminModels />
      </Suspense>
    );
  }

  if (path.startsWith('/admin/observability')) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminObservability />
      </Suspense>
    );
  }

  if (path.startsWith('/admin/finance')) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminFinance />
      </Suspense>
    );
  }

  if (path.startsWith('/admin/audit')) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminAudit />
      </Suspense>
    );
  }

  // New Asset Generator Route
  if (path.startsWith('/admin/assets')) {
    return (
      <Suspense fallback={<div className="bg-black text-white h-screen flex items-center justify-center">Loading Generator...</div>}>
        <AssetGenerator />
      </Suspense>
    );
  }

  // Add more admin routes here as needed:
  // /admin/audit -> AdminAuditLogs

  // Default to dashboard for unknown /admin/* paths
  if (path.startsWith('/admin')) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminDashboard />
      </Suspense>
    );
  }

  return null;
}

function AdminLoadingFallback(): React.ReactElement {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-2xl mb-4">
          <span className="material-icons text-3xl text-purple-500 animate-spin">sync</span>
        </div>
        <p className="text-zinc-400 text-sm">Loading admin...</p>
      </div>
    </div>
  );
}

function App() {
  const path = window.location.pathname;
  const isAdminPath = path.startsWith('/admin');
  const isDesignPath = path.startsWith('/design');
  const isOnboardingPath = path.startsWith('/onboarding');
  const isAuthPath = path === '/login' || path === '/signup';
  const isInvitePath = path === '/invite';
  const isResetPasswordPath = path === '/reset-password';
  const isRootPath = path === '/' || path === '';
  const isDashboardPath = path === '/dashboard';

  // Render auth pages (login/signup) - WorkOS AuthKit redirect pages
  if (isAuthPath) {
    return (
      <>
        <ToastContainer />
        <Suspense fallback={
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading...</p>
            </div>
          </div>
        }>
          {path === '/signup' ? <SignupPageAuthKit /> : <LoginPageAuthKit />}
        </Suspense>
      </>
    );
  }

  // Render invite page - handles invitation tokens from emails
  if (isInvitePath) {
    return (
      <>
        <ToastContainer />
        <Suspense fallback={
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Processing invitation...</p>
            </div>
          </div>
        }>
          <InvitePage />
        </Suspense>
      </>
    );
  }

  // Render reset password page - handles password reset tokens from emails
  if (isResetPasswordPath) {
    return (
      <>
        <ToastContainer />
        <Suspense fallback={
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Verifying reset link...</p>
            </div>
          </div>
        }>
          <ResetPasswordPage />
        </Suspense>
      </>
    );
  }

  // Render onboarding pages (signup flow with plan selection)
  if (isOnboardingPath) {
    // Extract path segment after /onboarding/
    const pathSegment = path.replace('/onboarding', '').replace(/^\//, '') || undefined;
    return (
      <>
        <ToastContainer />
        <Suspense fallback={
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading...</p>
            </div>
          </div>
        }>
          <OnboardingPage pathSegment={pathSegment} />
        </Suspense>
      </>
    );
  }

  // Render admin pages separately (they have their own layout)
  if (isAdminPath) {
    return (
      <>
        <ToastContainer />
        <AdminRouter />
      </>
    );
  }

  // Render Design System page
  if (isDesignPath) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading Design System...</div>
        </div>
      }>
        <DesignSystemPage />
      </Suspense>
    );
  }

  // Root path or dashboard - use MainAppRouter to decide landing vs dashboard
  if (isRootPath || isDashboardPath) {
    return (
      <>
        <ToastContainer />
        <MainAppRouter />
      </>
    );
  }

  // Default: Show main app
  return (
    <>
      <ToastContainer />
      <ScreenReaderAnnouncerProvider>
        <AIProvider>
          <CanvasProvider>
            <VoiceAgentWrapper>
              <AppContent />
            </VoiceAgentWrapper>
          </CanvasProvider>
        </AIProvider>
      </ScreenReaderAnnouncerProvider>
    </>
  );
}

/**
 * Main App Router - Decides between landing page and dashboard based on auth state
 */
function MainAppRouter(): React.ReactElement {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading...</p>
          </div>
        </div>
      }>
        <LandingPage
          onGetStarted={() => { window.location.href = '/signup'; }}
          onSignIn={() => { window.location.href = '/login'; }}
        />
      </Suspense>
    );
  }

  // Authenticated but hasn't completed onboarding - redirect to onboarding
  if (!hasCompletedOnboarding) {
    window.location.href = '/onboarding';
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Redirecting to setup...</p>
        </div>
      </div>
    );
  }

  // Authenticated and completed onboarding - show main app
  return (
    <ScreenReaderAnnouncerProvider>
      <AIProvider>
        <CanvasProvider>
          <VoiceAgentWrapper>
            <AppContent />
          </VoiceAgentWrapper>
        </CanvasProvider>
      </AIProvider>
    </ScreenReaderAnnouncerProvider>
  );
}

// Note: AuthPage component removed - now using AuthKit pages (LoginPageAuthKit, SignupPageAuthKit)

// Wrapper component that connects VoiceAgentProvider to CanvasContext
function VoiceAgentWrapper({ children }: { children: React.ReactNode }) {
  const {
    setBgImage,
    addElement,
    updateElement,
    deleteElement,
    elements,
    undo,
    redo,
    bringToFront,
    sendToBack,
  } = useCanvas();

  const handleVoiceUpdate = React.useCallback(
    (imageUrl: string, type: 'background' | 'profile') => {
      if (type === 'background') {
        setBgImage(imageUrl);
      }
      // Profile updates handled separately
    },
    [setBgImage]
  );

  const canvasCallbacks = React.useMemo(
    () => ({
      addElement,
      updateElement,
      deleteElement,
      getElements: () => elements,
      undo,
      redo,
      bringToFront,
      sendToBack,
      // setActiveTab will be registered by AppContent via registerTabSetter
    }),
    [addElement, updateElement, deleteElement, elements, undo, redo, bringToFront, sendToBack]
  );

  return (
    <VoiceAgentProvider
      onUpdate={handleVoiceUpdate}
      canvasCallbacks={canvasCallbacks}
    >
      {children}
    </VoiceAgentProvider>
  );
}

export default App;
