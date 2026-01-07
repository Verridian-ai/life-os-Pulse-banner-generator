import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/layout/Header';
import GenerativeSidebar from './components/features/GenerativeSidebar';
const CanvasEditor = lazy(() => import('./components/features/CanvasEditor'));
const LiveActionPanel = lazy(() => import('./components/features/LiveActionPanel'));
import { APIKeyInstructionsModal } from './components/features/APIKeyInstructionsModal';

// Lazy load heavy components for code splitting
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const ImageGallery = lazy(() => import('./components/features/ImageGallery'));
const TemplateLibrary = lazy(() => import('./components/features/TemplateLibrary').then(m => ({ default: m.TemplateLibrary })));
const QuickGenerateWizard = lazy(() => import('./components/features/QuickGenerateWizard').then(m => ({ default: m.QuickGenerateWizard })));
const SettingsModal = lazy(() => import('./components/features/SettingsModal').then(m => ({ default: m.SettingsModal })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));
const LinkedInContentStudio = lazy(() => import('./features/linkedin-posts').then(m => ({ default: m.LinkedInContentStudio })));

// Admin pages (lazy loaded)
const AdminDashboard = lazy(() => import('./features/admin').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./features/admin').then(m => ({ default: m.AdminUsers })));
const AdminAgents = lazy(() => import('./features/admin').then(m => ({ default: m.AdminAgents })));
import {
  ScreenReaderAnnouncerProvider,
  useAnnouncer,
} from './components/accessibility/ScreenReaderAnnouncer';
import { useKeyboardShortcuts, getDefaultShortcuts, useKeyboardShortcutsModal } from './hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from './components/features/KeyboardShortcutsModal';
import { OnboardingTour } from './components/features/OnboardingTour';
import { Tab, StudioMode } from './constants';
import { StudioSubNav } from './components/layout/StudioSubNav';
import { CanvasProvider, useCanvas } from './context/CanvasContext';
import { AIProvider, useAI } from './context/AIContext';
import { useAuth } from './context/AuthContext';
// Voice Provider Imported
import { VoiceAgentProvider, useVoiceAgent } from './context/VoiceAgentContext';
// Toast Provider and Container
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { useToast } from './hooks/useToast';
import { Skeleton } from './components/ui/Skeleton';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.STUDIO);
  const [studioMode, setStudioMode] = useState<StudioMode>(StudioMode.CANVAS);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuickGen, setShowQuickGen] = useState(false);

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

  const {
    bgImage,
    setBgImage,
    refImages,
    selectedElementId,
    deleteElement,
    addElement,
    elements,
    showSafeZones,
    setShowSafeZones,
    canvasRef,
    updateElement
  } = useCanvas();

  // Generation States
  const [genPrompt, setGenPrompt] = useState('');
  const { prompt: contextPrompt, setPrompt: setContextPrompt } = useAI();

  // Sync prompt from AIContext (e.g. from TemplateLibrary) to local state
  useEffect(() => {
    if (contextPrompt && contextPrompt !== genPrompt) {
      setGenPrompt(contextPrompt);
    }
  }, [contextPrompt, genPrompt]);

  // Sync local prompt to AIContext
  useEffect(() => {
    if (genPrompt && genPrompt !== contextPrompt) {
      setContextPrompt(genPrompt);
    }
  }, [genPrompt, contextPrompt, setContextPrompt]);

  const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false); // Used in handleGenerate
  const [isMagicPrompting, setIsMagicPrompting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Register voice agent setters
  const { registerPromptSetter, registerTabSetter } = voiceAgent;
  useEffect(() => {
    registerPromptSetter(setGenPrompt);
    registerTabSetter(setActiveTab, setStudioMode);
  }, [registerPromptSetter, registerTabSetter]);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);  // Register setGenPrompt with voice agent for voice-to-prompt enhancement
  useEffect(() => {
    voiceAgent.registerPromptSetter(setGenPrompt);
    voiceAgent.registerTabSetter(setActiveTab, setStudioMode);
  }, [voiceAgent, setGenPrompt, setActiveTab, setStudioMode]);

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

  // Keyboard shortcuts
  // eslint-disable-next-line
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
      setShowSettings(false);
      closeModal();
    },
    onOpenSettings: () => {
      setShowSettings(true);
      announce('Settings opened', 'polite');
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
    }
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
    toast
  ]);

  useKeyboardShortcuts({
    shortcuts,
  });

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

  return (
    <div className='min-h-screen bg-black text-white font-sans flex flex-col'>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenInstructions={() => setShowInstructions(true)}
        onOpenQuickGen={() => setShowQuickGen(true)}
        isVoiceActive={isVoiceActive}
        voiceConnectionState={voiceAgent.connectionState}
        onToggleVoice={toggleVoiceMode}
      />

      <Suspense fallback={null}>
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
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
          <div className='flex-1 flex flex-col h-full w-full relative z-10 overflow-hidden'>
            {/* Studio Sub-Navigation */}
            <StudioSubNav currentMode={studioMode} onModeChange={setStudioMode} />

            {/* Canvas Mode - Banner Design */}
            {studioMode === StudioMode.CANVAS && (
              <div className='flex-1 flex flex-col md:flex-row h-auto w-full overflow-hidden'>
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
                  <CanvasEditor />
                </Suspense>
                <GenerativeSidebar
                  refImages={refImages}
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
                  bgImage={bgImage}
                  onImageUpdate={(img: string) => setBgImage(img)}
                />
              </div>
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
                <LinkedInContentStudio />
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
                <ImageGallery onNavigateToStudio={() => setStudioMode(StudioMode.CANVAS)} />
              </Suspense>
            )}
          </div>
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

  // Add more admin routes here as needed:
  // /admin/observability -> AdminObservability
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

  // Render admin pages separately (they have their own layout)
  if (isAdminPath) {
    return (
      <ToastProvider>
        <ToastContainer />
        <AdminRouter />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}

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
