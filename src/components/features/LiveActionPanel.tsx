import React, { useState, useEffect, useRef } from 'react';
import { TranscriptEntry, ToolCall } from '../../services/liveClient';
import { ActionResult } from '../../services/actionExecutor';
import { BTN_NEU_SOLID } from '../../styles';

interface LiveActionPanelProps {
    isConnected: boolean;
    transcript: TranscriptEntry[];
    pendingAction: {
        toolCall: ToolCall;
        result: ActionResult;
    } | null;
    onApproveAction: () => void;
    onRejectAction: () => void;
    executingAction: boolean;
}

const LiveActionPanel: React.FC<LiveActionPanelProps> = ({
    isConnected,
    transcript,
    pendingAction,
    onApproveAction,
    onRejectAction,
    executingAction
}) => {
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll transcript to bottom
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    // Format timestamp
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Get tool icon
    const getToolIcon = (toolName: string) => {
        switch (toolName) {
            case 'generate_background': return 'auto_awesome';
            case 'magic_edit': return 'edit';
            case 'remove_background': return 'layers_clear';
            case 'upscale_image': return 'hd';
            case 'restore_image': return 'restore';
            case 'enhance_face': return 'face_retouching_natural';
            default: return 'build';
        }
    };

    // Get tool display name
    const getToolDisplayName = (toolName: string) => {
        switch (toolName) {
            case 'generate_background': return 'Generate Background';
            case 'magic_edit': return 'Magic Edit';
            case 'remove_background': return 'Remove Background';
            case 'upscale_image': return 'Upscale Image';
            case 'restore_image': return 'Restore Image';
            case 'enhance_face': return 'Enhance Face';
            default: return toolName;
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10">
            {/* Connection Status Bar */}
            <div className={`px-6 py-2 flex items-center justify-between border-b ${isConnected ? 'border-green-500/30 bg-green-950/20' : 'border-zinc-700/30 bg-zinc-950/20'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {isConnected ? 'Live Session Active' : 'Not Connected'}
                    </span>
                </div>
                {transcript.length > 0 && (
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                        {transcript.length} Messages
                    </span>
                )}
            </div>

            {/* Main Panel Content */}
            <div className="flex flex-col md:flex-row max-h-[300px]">
                {/* Transcript Panel */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
                    {transcript.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider">
                                {isConnected ? 'Start speaking to begin...' : 'Connect to start live session'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {transcript.map((entry, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-3 ${entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        entry.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-purple-600 text-white'
                                    }`}>
                                        <span className="material-icons text-sm">
                                            {entry.role === 'user' ? 'person' : 'smart_toy'}
                                        </span>
                                    </div>

                                    {/* Message Content */}
                                    <div className={`flex-1 ${entry.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${
                                            entry.role === 'user'
                                                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                                                : 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                                        }`}>
                                            <p className="text-xs font-medium">{entry.text}</p>

                                            {/* Tool Calls */}
                                            {entry.toolCalls && entry.toolCalls.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {entry.toolCalls.map((tool, toolIdx) => (
                                                        <div
                                                            key={toolIdx}
                                                            className="flex items-center gap-2 bg-black/30 rounded px-2 py-1"
                                                        >
                                                            <span className="material-icons text-xs text-yellow-400">
                                                                {getToolIcon(tool.name)}
                                                            </span>
                                                            <span className="text-[9px] font-bold uppercase text-yellow-400">
                                                                {getToolDisplayName(tool.name)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                                            {formatTime(entry.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </>
                    )}
                </div>

                {/* Action Preview Panel */}
                {pendingAction && (
                    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 p-4 bg-zinc-950/50">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-icons text-sm text-yellow-400">
                                {getToolIcon(pendingAction.toolCall.name)}
                            </span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                Action Preview
                            </h3>
                        </div>

                        {/* Tool Info */}
                        <div className="mb-3 p-2 bg-white/5 rounded border border-white/10">
                            <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">
                                {getToolDisplayName(pendingAction.toolCall.name)}
                            </p>
                            {pendingAction.toolCall.args.prompt && (
                                <p className="text-[9px] text-zinc-500 line-clamp-2">
                                    {pendingAction.toolCall.args.prompt}
                                </p>
                            )}
                        </div>

                        {/* Image Preview */}
                        {pendingAction.result.preview && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                                <img
                                    src={pendingAction.result.preview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover"
                                />
                            </div>
                        )}

                        {/* Error Message */}
                        {!pendingAction.result.success && (
                            <div className="mb-3 p-2 bg-red-950/50 border border-red-500/30 rounded">
                                <p className="text-[9px] text-red-400 font-medium">
                                    {pendingAction.result.error}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {pendingAction.result.success && (
                            <div className="flex gap-2">
                                <button
                                    onClick={onApproveAction}
                                    disabled={executingAction}
                                    className="flex-1 h-9 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-1.5 font-black uppercase text-[9px] tracking-wider transition-colors"
                                >
                                    {executingAction ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Applying...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons text-sm">check</span>
                                            Apply
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onRejectAction}
                                    disabled={executingAction}
                                    className="flex-1 h-9 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-1.5 font-black uppercase text-[9px] tracking-wider transition-colors"
                                >
                                    <span className="material-icons text-sm">close</span>
                                    Reject
                                </button>
                            </div>
                        )}

                        {/* Retry Button for Failed Actions */}
                        {!pendingAction.result.success && (
                            <button
                                onClick={onRejectAction}
                                className="w-full h-9 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg flex items-center justify-center gap-1.5 font-black uppercase text-[9px] tracking-wider transition-colors"
                            >
                                <span className="material-icons text-sm">close</span>
                                Dismiss
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveActionPanel;
