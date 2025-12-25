import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import GenerativeSidebar from './components/features/GenerativeSidebar';
import CanvasEditor from './components/features/CanvasEditor';
import ChatInterface from './components/ChatInterface';
import ImageGallery from './components/features/ImageGallery';
import { SettingsModal } from './components/features/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { APIKeyInstructionsModal } from './components/features/APIKeyInstructionsModal';
import LiveActionPanel from './components/features/LiveActionPanel';
import {
  ScreenReaderAnnouncerProvider,
  useAnnouncer,
} from './components/accessibility/ScreenReaderAnnouncer';
import { useKeyboardShortcuts, getDefaultShortcuts } from './hooks/useKeyboardShortcuts';
import { generateImage, generatePromptFromRefImages as generateMagicPrompt } from './services/llm';
import { Tab } from './constants';
import { CanvasProvider, useCanvas } from './context/CanvasContext';
import { AIProvider } from './context/AIContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { migrateLocalStorageToNeon } from './services/apiKeyStorage';
import { createImage } from './services/database';
// Voice Provider Imported
import { VoiceAgentProvider, useVoiceAgent } from './context/VoiceAgentContext';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.STUDIO);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'warning' | 'info';
  } | null>(null);

  // Voice Agent state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  // Voice Agent Hook
  const voiceAgent = useVoiceAgent();

  // Accessibility states
  const [showChatHistory, setShowChatHistory] = useState(false);
  const { announce } = useAnnouncer();

  // Voice Agent toggle handler
  const toggleVoiceMode = async () => {
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
        setNotification({ message: 'VOICE CONNECTION FAILED - CHECK API KEY', type: 'warning' });
      }
    }
  };

  // Auth state
  const { isAuthenticated, isLoading, supabaseUser } = useAuth();

  // Context hooks for shared state
  const { bgImage, setBgImage, refImages } = useCanvas();

  // Generation States
  const [genPrompt, setGenPrompt] = useState('');
  const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMagicPrompting, setIsMagicPrompting] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || genPrompt;
    if (!promptToUse.trim()) {
      setNotification({ message: 'PLEASE ENTER A PROMPT', type: 'warning' });
      announce('Please enter a prompt to generate an image', 'assertive');
      return;
    }
    setIsGenerating(true);
    announce('Generating image, please wait', 'polite');
    try {
      // Check which model will be used
      const currentModel = localStorage.getItem('llm_image_model') || 'gemini-3-pro-image-preview';
      const modelName =
        currentModel === 'gemini-3-pro-image-preview'
          ? 'Nano Banana Pro'
          : currentModel === 'gemini-2.5-flash-image'
            ? 'Nano Banana'
            : currentModel;

      console.log(`[App] Generating with ${modelName} (${currentModel})`);

      const result = await generateImage(promptToUse, refImages, genSize, true);
      if (result) {
        setBgImage(result);

        // Save to gallery if authenticated
        if (isAuthenticated && supabaseUser) {
          createImage({
            storage_url: result,
            file_name: `banner-${Date.now()}.png`,
            prompt: promptToUse,
            model_used: currentModel,
            quality: genSize,
            generation_type: 'generate'
          }).then((saved) => {
            if (saved) {
              setNotification({ message: 'IMAGE SAVED TO GALLERY', type: 'info' });
            }
          }).catch(console.error);
        }

        // Check if model changed (fallback occurred)
        const finalModel = localStorage.getItem('llm_image_model');
        const usedFallback = finalModel !== currentModel;

        if (usedFallback) {
          const msg = 'Image generated successfully with Nano Banana';
          setNotification({
            message: `✓ GENERATED WITH NANO BANANA (Pro unavailable for your API key)`,
            type: 'info',
          });
          announce(msg, 'polite');
        } else {
          const msg = `Image generated successfully with ${modelName}`;
          setNotification({
            message: `✓ GENERATED WITH ${modelName.toUpperCase()}`,
            type: 'info',
          });
          announce(msg, 'polite');
        }
      }
    } catch (error) {
      console.error('[App] Generation error:', error);

      // Show detailed error message to user
      let errorMessage = 'GENERATION FAILED';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'MISSING API KEY - CHECK SETTINGS';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API QUOTA EXCEEDED';
        } else if (error.message.includes('safety')) {
          errorMessage = 'PROMPT BLOCKED - TRY DIFFERENT WORDING';
        } else if (error.message.includes('model')) {
          errorMessage = 'MODEL NOT FOUND - TRY IMAGEN-3.0 IN SETTINGS';
        } else if (error.message.length < 60) {
          // If error message is short enough, show it directly
          errorMessage = error.message.toUpperCase();
        }
      }

      setNotification({ message: errorMessage, type: 'warning' });
      announce(`Generation failed: ${errorMessage}`, 'assertive');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMagicPrompt = async () => {
    if (refImages.length === 0) return;
    setIsMagicPrompting(true);
    try {
      const prompt = await generateMagicPrompt(
        refImages,
        'Create a matching background related to these images',
      );
      setGenPrompt(prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMagicPrompting(false);
    }
  };

  const handleEdit = async () => {
    if (!bgImage) {
      setNotification({ message: 'NO BACKGROUND TO EDIT', type: 'warning' });
      return;
    }
    if (!editPrompt.trim()) {
      setNotification({ message: 'ENTER EDIT PROMPT', type: 'warning' });
      return;
    }

    setIsEditing(true);
    try {
      let imageBase64 = bgImage;
      if (bgImage.startsWith('blob:') || bgImage.startsWith('http')) {
        const response = await fetch(bgImage);
        const blob = await response.blob();
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const { editImage } = await import('./services/llm');
      const result = await editImage(imageBase64, editPrompt);
      if (result) {
        setBgImage(result);
        setNotification({ message: 'IMAGE EDITED SUCCESSFULLY', type: 'info' });

        if (isAuthenticated && supabaseUser) {
          createImage({
            storage_url: result,
            file_name: `edit-${Date.now()}.png`,
            prompt: `Edit: ${editPrompt}`,
            model_used: 'magic-edit',
            generation_type: 'edit'
          }).catch(console.error);
        }
      }
    } catch (error) {
      console.error('[App] Edit error:', error);

      // Show detailed error message to user
      let errorMessage = 'EDIT FAILED';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'MISSING API KEY - CHECK SETTINGS';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API QUOTA EXCEEDED';
        } else if (error.message.includes('safety')) {
          errorMessage = 'EDIT BLOCKED - TRY DIFFERENT WORDING';
        } else if (error.message.length < 60) {
          errorMessage = error.message.toUpperCase();
        }
      }

      setNotification({ message: errorMessage, type: 'warning' });
    } finally {
      setIsEditing(false);
    }
  };

  const handleRemoveBg = async () => {
    if (!bgImage) return;
    setIsEditing(true);
    try {
      let imageBase64 = bgImage;
      if (bgImage.startsWith('blob:') || bgImage.startsWith('http')) {
        const response = await fetch(bgImage);
        const blob = await response.blob();
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const { removeBackground } = await import('./services/llm');
      const result = await removeBackground(imageBase64);
      if (result) {
        setBgImage(result);
        if (isAuthenticated && supabaseUser) {
          createImage({
            storage_url: result,
            file_name: `removebg-${Date.now()}.png`,
            prompt: 'Remove Background',
            model_used: 'rembg',
            generation_type: 'remove-bg'
          }).catch(console.error);
        }
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: 'REMOVE BG FAILED', type: 'warning' });
    } finally {
      setIsEditing(false);
    }
  };

  const handleUpscale = async () => {
    if (!bgImage) return;
    setIsEditing(true);
    try {
      let imageBase64 = bgImage;
      if (bgImage.startsWith('blob:') || bgImage.startsWith('http')) {
        const response = await fetch(bgImage);
        const blob = await response.blob();
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const { upscaleImage } = await import('./services/llm');
      const result = await upscaleImage(imageBase64);
      if (result) {
        setBgImage(result);
        if (isAuthenticated && supabaseUser) {
          createImage({
            storage_url: result,
            file_name: `upscale-${Date.now()}.png`,
            prompt: 'Upscaled Image',
            model_used: 'esrgan',
            generation_type: 'upscale'
          }).catch(console.error);
        }
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: 'UPSCALE FAILED', type: 'warning' });
    } finally {
      setIsEditing(false);
    }
  };

  // Migrate localStorage API keys to Neon on first load
  useEffect(() => {
    migrateLocalStorageToNeon().catch((error: unknown) => {
      console.error('[App] Migration failed:', error);
    });
  }, []);

  // Show auth modal immediately for unauthenticated users (auth-first flow)
  useEffect(() => {
    // Only trigger after auth loading completes
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, isLoading]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: getDefaultShortcuts({
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
      },
      onOpenSettings: () => {
        setShowSettings(true);
        announce('Settings opened', 'polite');
      },
    }),
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
        isVoiceActive={isVoiceActive}
        onToggleVoice={toggleVoiceMode}
      />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          // Only allow closing if user is authenticated
          if (isAuthenticated) {
            setShowAuthModal(false);
          }
        }}
        onSuccess={() => {
          setNotification({ message: '✓ SIGNED IN SUCCESSFULLY', type: 'info' });
          announce('Signed in successfully', 'polite');
          setShowAuthModal(false); // Close modal after successful auth
        }}
      />
      <APIKeyInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      <main className='flex-1 relative flex flex-col lg:flex-row bg-black w-full'>
        <div className='absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none'></div>

        {notification && (
          <div
            className={`fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-[60] px-4 md:px-6 py-2 md:py-3 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 transition-all animate-bounce border border-white/10 backdrop-blur-md max-w-[90vw] ${notification.type === 'warning' ? 'bg-yellow-500/90 text-black' : 'bg-blue-600/90 text-white'}`}
          >
            <span className='material-icons text-sm md:text-base'>
              {notification.type === 'warning' ? 'warning' : 'info'}
            </span>
            <span className='text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate'>
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className='ml-1 md:ml-2 hover:opacity-50 shrink-0'>
              <span className='material-icons text-sm'>close</span>
            </button>
          </div>
        )}

        {activeTab === Tab.STUDIO && (
          <div className='flex-1 flex flex-col lg:flex-row h-auto w-full relative z-10 overflow-hidden'>
            <CanvasEditor />

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
              editPrompt={editPrompt}
              setEditPrompt={setEditPrompt}
              isEditing={isEditing}
              onEdit={handleEdit}
              onRemoveBg={handleRemoveBg}
              onUpscale={handleUpscale}
              bgImage={bgImage}
              onImageUpdate={(img) => setBgImage(img)}
            />
          </div>
        )}

        {activeTab === Tab.GALLERY && <ImageGallery />}

        {activeTab === Tab.BRAINSTORM && (
          <div className='flex-1 flex flex-col h-full relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden'>
            <ChatInterface onGenerateFromPrompt={handleGenerate} />
          </div>
        )}
      </main>

      {/* Live Action Panel - Voice Agent UI */}
      {/* Live Action Panel - Voice Agent UI */}
      {isVoiceActive && (
        <LiveActionPanel
          isConnected={voiceAgent.isConnected}
          transcript={voiceAgent.transcript}
          pendingAction={voiceAgent.pendingAction}
          executingAction={voiceAgent.executingAction}
          onApproveAction={() => voiceAgent.approveAction()}
          onRejectAction={() => voiceAgent.rejectAction()}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <ScreenReaderAnnouncerProvider>
      <AuthProvider>
        <AIProvider>
          <VoiceAgentProvider onUpdate={(action) => console.log('Voice Action:', action)}>
            <CanvasProvider>
              <AppContent />
            </CanvasProvider>
          </VoiceAgentProvider>
        </AIProvider>
      </AuthProvider>
    </ScreenReaderAnnouncerProvider>
  );
}

export default App;
