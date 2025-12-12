import { useState, useRef, useEffect, useCallback } from 'react';
import { generateAgentResponse } from '../services/llm';

interface UseVoiceAgentProps {
    onToolCall: (toolName: string, args: any) => Promise<string>; // Returns tool output result
    getCanvasScreenshot: () => string | null;
}

export const useVoiceAgent = ({ onToolCall, getCanvasScreenshot }: UseVoiceAgentProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');

    // Refs for Web Speech API
    const recognitionRef = useRef<any>(null); // Type any because webkitSpeechRecognition is not standard TS
    const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window) {
            // @ts-ignore
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = async (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                setIsListening(false);
                await processInput(text);
            };

            recognitionRef.current = recognition;
        } else {
            console.error("Web Speech API not supported");
        }
    }, []);

    const speak = (text: string) => {
        if (!text) return;
        setIsSpeaking(true);
        const utter = new SpeechSynthesisUtterance(text);
        utter.onend = () => setIsSpeaking(false);
        // Clean text of markdown
        utter.text = text.replace(/\*/g, '');
        synthesisRef.current.speak(utter);
    };

    const processInput = async (input: string) => {
        setIsThinking(true);
        try {
            const screenshot = getCanvasScreenshot();

            // 1. Get Agent Plan/Response
            const response = await generateAgentResponse(input, screenshot);

            // 2. Speak initial thought if any (and execute tools concurrently ideally, but serial is safer for now)
            if (response.text) {
                speak(response.text);
            }

            // 3. Execute Tools
            if (response.toolCalls && response.toolCalls.length > 0) {
                // Determine what to do
                for (const call of response.toolCalls) {
                    console.log("Agent Tool Call:", call.name, call.args);
                    await onToolCall(call.name, call.args);
                }
            }

        } catch (err) {
            console.error("Voice Agent Error", err);
            speak("Sorry, I had a glitch.");
        } finally {
            setIsThinking(false);
        }
    };

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    }, [isListening]);

    return {
        isListening,
        isThinking,
        isSpeaking,
        transcript,
        toggleListening
    };
};
