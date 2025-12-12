
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/layout/Header';
import GenerativeSidebar from './components/features/GenerativeSidebar';
import CanvasEditor from './components/features/CanvasEditor';
import ChatInterface from './components/ChatInterface';
import ImageGallery from './components/features/ImageGallery';
import LiveActionPanel from './components/features/LiveActionPanel';
import ChatHistoryPanel from './components/features/ChatHistoryPanel';
import { SettingsModal } from './components/features/SettingsModal';
import { ScreenReaderAnnouncerProvider, useAnnouncer } from './components/accessibility/ScreenReaderAnnouncer';
import { useKeyboardShortcuts, getDefaultShortcuts } from './hooks/useKeyboardShortcuts';
import { generateImage, generatePromptFromRefImages as generateMagicPrompt } from './services/llm';
import { Tab } from './constants';
import { CanvasProvider, useCanvas } from './context/CanvasContext';
import { AIProvider } from './context/AIContext';
import { LiveClient, ToolCall, TranscriptEntry } from './services/liveClient';
import { OpenAIRealtimeClient } from './services/openaiRealtimeClient';
import { ActionExecutor, ActionResult } from './services/actionExecutor';
import { getUserAPIKeys, migrateLocalStorageToSupabase } from './services/apiKeyStorage';

const AppContent = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.STUDIO);
    const [showSettings, setShowSettings] = useState(false);
    const [isLiveConnected, setIsLiveConnected] = useState(false);
    const [liveClient, setLiveClient] = useState<LiveClient | OpenAIRealtimeClient | null>(null);
    const [notification, setNotification] = useState<{ message: string, type: 'warning' | 'info' } | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Live Action states
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [pendingAction, setPendingAction] = useState<{ toolCall: ToolCall; result: ActionResult } | null>(null);
    const [actionExecutor, setActionExecutor] = useState<ActionExecutor | null>(null);
    const [executingAction, setExecutingAction] = useState(false);

    // Accessibility states
    const [showChatHistory, setShowChatHistory] = useState(false);
    const { announce } = useAnnouncer();

    // Context hooks for shared state
    const {
        bgImage,
        setBgImage,
        refImages
    } = useCanvas();

    // Generation States
    const [genPrompt, setGenPrompt] = useState('');
    const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isMagicPrompting, setIsMagicPrompting] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [magicEditSuggestions, setMagicEditSuggestions] = useState<string[]>([]);
    const [generationSuggestions, setGenerationSuggestions] = useState<string[]>([]);

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
            const modelName = currentModel === 'gemini-3-pro-image-preview' ? 'Nano Banana Pro' :
                currentModel === 'gemini-2.5-flash-image' ? 'Nano Banana' :
                    currentModel;

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
                        type: 'info'
                    });
                    announce(msg, 'polite');
                } else {
                    const msg = `Image generated successfully with ${modelName}`;
                    setNotification({
                        message: `✓ GENERATED WITH ${modelName.toUpperCase()}`,
                        type: 'info'
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
            const prompt = await generateMagicPrompt(refImages, 'Create a matching background related to these images');
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

    // Initialize ActionExecutor
    useEffect(() => {
        const executor = new ActionExecutor(
            (imageUrl: string, type: 'background' | 'profile') => {
                if (type === 'background') {
                    setBgImage(imageUrl);
                    announce('Image applied to canvas', 'polite');
                } else {
                    // For profile images - would need access to canvas context
                    console.log('[App] Profile image update not yet implemented');
                }
            },
            true // Start in preview mode
        );
        setActionExecutor(executor);
    }, [setBgImage, announce]);

    // Cleanup live client on unmount
    useEffect(() => {
        return () => {
            // Clean up voice chat connection when component unmounts
            if (liveClient) {
                console.log('[App] Component unmounting, disconnecting live client...');
                liveClient.disconnect().catch((error) => {
                    console.error('[App] Error during unmount cleanup:', error);
                });
            }
        };
    }, [liveClient]);

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
                setShowChatHistory(prev => !prev);
                announce(showChatHistory ? 'Chat history closed' : 'Chat history opened', 'polite');
            },
            onClosePanels: () => {
                setShowChatHistory(false);
                setShowSettings(false);
                setPendingAction(null);
            },
            onOpenSettings: () => {
                setShowSettings(true);
                announce('Settings opened', 'polite');
            }
        })
    });

    // Handle tool calls from live client
    const handleToolCall = async (toolCall: ToolCall) => {
        console.log('[App] Tool call received:', toolCall);

        if (!actionExecutor) {
            console.error('[App] ActionExecutor not initialized');
            return;
        }

        // Execute the tool call
        const result = await actionExecutor.executeToolCall(toolCall);

        // Set as pending action for user approval
        setPendingAction({ toolCall, result });

        if (result.success) {
            setNotification({
                message: `ACTION READY: ${toolCall.name.toUpperCase()}`,
                type: 'info'
            });
        } else {
            setNotification({
                message: `ACTION FAILED: ${result.error}`,
                type: 'warning'
            });
        }
    };

    // Handle transcript updates
    const handleTranscriptUpdate = (entry: TranscriptEntry) => {
        setTranscript(prev => [...prev, entry]);
    };

    // Approve pending action
    const handleApproveAction = async () => {
        if (!pendingAction || !actionExecutor) return;

        setExecutingAction(true);
        try {
            // Apply the preview to canvas
            if (pendingAction.result.preview) {
                actionExecutor.applyPreview(pendingAction.result.preview);
                setNotification({
                    message: 'ACTION APPLIED TO CANVAS',
                    type: 'info'
                });
            }
        } catch (error) {
            console.error('[App] Failed to apply action:', error);
            setNotification({
                message: 'FAILED TO APPLY ACTION',
                type: 'warning'
            });
        } finally {
            setPendingAction(null);
            setExecutingAction(false);
        }
    };

    // Reject pending action
    const handleRejectAction = () => {
        setPendingAction(null);
        setNotification({
            message: 'ACTION REJECTED',
            type: 'info'
        });
    };

    const handleLiveToggle = async () => {
        // Guard against concurrent connection attempts
        if (isConnecting) {
            console.log('[Live] Connection operation already in progress, ignoring...');
            return;
        }

        if (!isLiveConnected) {
            // START LIVE CONNECTION
            setIsConnecting(true);

            // Load API keys from Supabase
            const apiKeys = await getUserAPIKeys();
            const voiceProvider = apiKeys.voice_provider || 'gemini';

            if (voiceProvider === 'openai') {
                // Use OpenAI Realtime
                const openaiKey = apiKeys.openai_api_key;

                if (!openaiKey) {
                    setNotification({
                        message: 'OPENAI API KEY REQUIRED. Check Settings.',
                        type: 'warning'
                    });
                    setIsConnecting(false);
                    return;
                }

                try {
                    console.log('[Live] Starting OpenAI Realtime connection...');
                    const client = new OpenAIRealtimeClient(openaiKey);

                    await client.connect(
                        (message: string) => {
                            // Handle incoming message from AI
                            console.log('[Live] Received message:', message);
                        },
                        (connected: boolean) => {
                            console.log('[Live] Connection status changed:', connected);
                            setIsLiveConnected(connected);
                            if (connected) {
                                setNotification({
                                    message: 'OPENAI REALTIME CONNECTED',
                                    type: 'info'
                                });
                            } else {
                                setNotification({
                                    message: 'OPENAI REALTIME DISCONNECTED',
                                    type: 'info'
                                });
                            }
                        },
                        handleToolCall,
                        handleTranscriptUpdate
                    );

                    setLiveClient(client);
                    setIsConnecting(false);
                    console.log('[Live] ✅ OpenAI Realtime connected successfully');
                } catch (error: any) {
                    console.error('[Live] OpenAI connection failed:', error);

                    let errorMsg = 'OPENAI REALTIME CONNECTION FAILED';

                    if (error.message?.includes('Permission denied') || error.message?.includes('permission')) {
                        errorMsg = 'MIC BLOCKED. Click lock icon in address bar to Allow.';
                    } else if (error.message?.includes('not supported')) {
                        errorMsg = 'MICROPHONE NOT SUPPORTED IN THIS BROWSER';
                    } else if (error.message?.includes('No microphone found')) {
                        errorMsg = 'NO MICROPHONE FOUND. Check system settings.';
                    } else if (error.message?.includes('already in use')) {
                        errorMsg = 'MICROPHONE BUSY. Close other apps using mic.';
                    } else if (error.message?.includes('API') || error.message?.includes('Unauthorized')) {
                        errorMsg = 'INVALID OPENAI API KEY. Check Settings.';
                    }

                    setNotification({ message: errorMsg, type: 'warning' });
                    setIsLiveConnected(false);
                    setIsConnecting(false);
                }
            } else {
                // Use Gemini Live
                const geminiKey = apiKeys.gemini_api_key;

                if (!geminiKey) {
                    setNotification({
                        message: 'GEMINI API KEY REQUIRED. Check Settings.',
                        type: 'warning'
                    });
                    setIsConnecting(false);
                    return;
                }

                try {
                    console.log('[Live] Starting Gemini Live connection...');
                    const client = new LiveClient(geminiKey);

                    await client.connect(
                        (message: string) => {
                            // Handle incoming message from AI
                            console.log('[Live] Received message:', message);
                        },
                        (connected: boolean) => {
                            console.log('[Live] Connection status changed:', connected);
                            setIsLiveConnected(connected);
                            if (connected) {
                                setNotification({
                                    message: 'GEMINI LIVE CONNECTED',
                                    type: 'info'
                                });
                            } else {
                                setNotification({
                                    message: 'GEMINI LIVE DISCONNECTED',
                                    type: 'info'
                                });
                            }
                        },
                        handleToolCall,
                        handleTranscriptUpdate
                    );

                    setLiveClient(client);
                    setIsConnecting(false);
                    console.log('[Live] ✅ Gemini Live connected successfully');
                } catch (error: any) {
                    console.error('[Live] Gemini connection failed:', error);

                    let errorMsg = 'GEMINI LIVE CONNECTION FAILED';

                    if (error.message?.includes('Permission denied') || error.message?.includes('permission')) {
                        errorMsg = 'MIC BLOCKED. Click lock icon in address bar to Allow.';
                    } else if (error.message?.includes('not supported')) {
                        errorMsg = 'MICROPHONE NOT SUPPORTED IN THIS BROWSER';
                    } else if (error.message?.includes('No microphone found')) {
                        errorMsg = 'NO MICROPHONE FOUND. Check system settings.';
                    } else if (error.message?.includes('already in use')) {
                        errorMsg = 'MICROPHONE BUSY. Close other apps using mic.';
                    } else if (error.message?.includes('API')) {
                        errorMsg = 'INVALID API KEY. Check Settings.';
                    }

                    setNotification({ message: errorMsg, type: 'warning' });
                    setIsLiveConnected(false);
                    setIsConnecting(false);
                }
            }
        } else {
            // STOP LIVE CONNECTION
            setIsConnecting(true);
            console.log('[Live] Stopping Live Audio connection...');
            if (liveClient) {
                try {
                    await liveClient.disconnect();
                    console.log('[Live] ✅ Live Audio disconnected successfully');
                } catch (error) {
                    console.error('[Live] Disconnect error:', error);
                }
                setLiveClient(null);
            }
            setIsLiveConnected(false);
            setTranscript([]);
            setPendingAction(null);
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLiveConnected={isLiveConnected}
                onLiveToggle={handleLiveToggle}
                onOpenSettings={() => setShowSettings(true)}
            />

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            <main className="flex-1 relative flex flex-col md:flex-row bg-black w-full">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

                {notification && (
                    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all animate-bounce border border-white/10 backdrop-blur-md ${notification.type === 'warning' ? 'bg-yellow-500/90 text-black' : 'bg-blue-600/90 text-white'}`}>
                        <span className="material-icons text-sm">{notification.type === 'warning' ? 'warning' : 'info'}</span>
                        <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-50"><span className="material-icons text-sm">close</span></button>
                    </div>
                )}

                {activeTab === Tab.STUDIO && (
                    <div className="flex-1 flex flex-col xl:flex-row h-auto w-full relative z-10">
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
                            magicEditSuggestions={magicEditSuggestions}
                            generationSuggestions={generationSuggestions}
                            bgImage={bgImage}
                            onImageUpdate={(img) => setBgImage(img)}
                        />
                    </div>
                )}

                {activeTab === Tab.GALLERY && (
                    <ImageGallery />
                )}

                {activeTab === Tab.BRAINSTORM && (
                    <div className="flex-1 flex flex-col h-full relative z-10 p-4 md:p-8">
                        <ChatInterface
                            onGenerateFromPrompt={handleGenerate}
                        />
                    </div>
                )}
            </main>

            {/* Live Action Panel - Shows when live audio is connected */}
            {isLiveConnected && (
                <LiveActionPanel
                    isConnected={isLiveConnected}
                    transcript={transcript}
                    pendingAction={pendingAction}
                    onApproveAction={handleApproveAction}
                    onRejectAction={handleRejectAction}
                    executingAction={executingAction}
                />
            )}

            {/* Chat History Panel - Accessible via Ctrl+H */}
            <ChatHistoryPanel
                isOpen={showChatHistory}
                onClose={() => setShowChatHistory(false)}
                transcript={transcript}
            />
        </div>
    );
};

function App() {
    return (
        <ScreenReaderAnnouncerProvider>
            <AIProvider>
                <CanvasProvider>
                    <AppContent />
                </CanvasProvider>
            </AIProvider>
        </ScreenReaderAnnouncerProvider>
    );
}

export default App;
