import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import GenerativeSidebar from './components/features/GenerativeSidebar';
import CanvasEditor from './components/features/CanvasEditor';
import ChatInterface from './components/ChatInterface';
import ImageGallery from './components/features/ImageGallery';
import { SettingsModal } from './components/features/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { APIKeyInstructionsModal } from './components/features/APIKeyInstructionsModal';
import {
  ScreenReaderAnnouncerProvider,
  useAnnouncer,
} from './components/accessibility/ScreenReaderAnnouncer';
import { useKeyboardShortcuts, getDefaultShortcuts } from './hooks/useKeyboardShortcuts';
import { generateImage, generatePromptFromRefImages as generateMagicPrompt } from './services/llm';
import { Tab } from './constants';
import { CanvasProvider, useCanvas } from './context/CanvasContext';
import { AIProvider } from './context/AIContext';
import { AuthProvider } from './context/AuthContext';
import { migrateLocalStorageToSupabase } from './services/apiKeyStorage';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.STUDIO);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'warning' | 'info';
  } | null>(null);

  // Accessibility states
  const [showChatHistory, setShowChatHistory] = useState(false);
  const { announce } = useAnnouncer();

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

      const result = await generateImage(promptToUse, refImages, genSize);
      if (result) {
        setBgImage(result);

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
      if (result) setBgImage(result);
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
      if (result) setBgImage(result);
    } catch (error) {
      console.error(error);
      setNotification({ message: 'UPSCALE FAILED', type: 'warning' });
    } finally {
      setIsEditing(false);
    }
  };

  // Migrate localStorage API keys to Supabase on first load
  useEffect(() => {
    migrateLocalStorageToSupabase().catch((error) => {
      console.error('[App] Migration failed:', error);
    });
  }, []);

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

  return (
    <div className='min-h-screen bg-black text-white font-sans flex flex-col'>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenInstructions={() => setShowInstructions(true)}
      />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setNotification({ message: '✓ SIGNED IN SUCCESSFULLY', type: 'info' });
          announce('Signed in successfully', 'polite');
        }}
      />
      <APIKeyInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      <main className='flex-1 relative flex flex-col md:flex-row bg-black w-full'>
        <div className='absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none'></div>

        {notification && (
          <div
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all animate-bounce border border-white/10 backdrop-blur-md ${notification.type === 'warning' ? 'bg-yellow-500/90 text-black' : 'bg-blue-600/90 text-white'}`}
          >
            <span className='material-icons text-sm'>
              {notification.type === 'warning' ? 'warning' : 'info'}
            </span>
            <span className='text-xs font-bold uppercase tracking-wider'>
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className='ml-2 hover:opacity-50'>
              <span className='material-icons text-sm'>close</span>
            </button>
          </div>
        )}

        {activeTab === Tab.STUDIO && (
          <div className='flex-1 flex flex-col xl:flex-row h-auto w-full relative z-10'>
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
          <div className='flex-1 flex flex-col h-full relative z-10 p-4 md:p-8'>
            <ChatInterface onGenerateFromPrompt={handleGenerate} />
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <ScreenReaderAnnouncerProvider>
      <AuthProvider>
        <AIProvider>
          <CanvasProvider>
            <AppContent />
          </CanvasProvider>
        </AIProvider>
      </AuthProvider>
    </ScreenReaderAnnouncerProvider>
  );
}

export default App;
