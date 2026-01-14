import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import * as apiKeyStorage from '../services/apiKeyStorage';

// Mock dependencies
vi.mock('../services/apiKeyStorage', () => ({
  getUserAPIKeys: vi.fn(),
}));

vi.mock('../services/chatService', () => ({
  generateDesignChatResponse: vi.fn(),
  generateSearchResponse: vi.fn(),
}));

vi.mock('../services/chatPersistence', () => ({
  createConversation: vi.fn().mockResolvedValue('mock-conv-id'),
  saveMessage: vi.fn(),
  getConversations: vi.fn().mockResolvedValue([]),
  deleteConversation: vi.fn(),
  getConversationMessages: vi.fn().mockResolvedValue([]),
}));

// Mock Contexts
vi.mock('../context/CanvasContext', () => ({
  useCanvas: () => ({
    setBgImage: vi.fn(),
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
  }),
}));

// Mock ChatAgent
const mockChat = vi.fn();
vi.mock('@/services/chatAgent', () => ({
  ChatAgent: vi.fn().mockImplementation(function () {
    return {
      chat: mockChat,
    };
  }),
}));

describe('ChatInterface', () => {
  const mockOnGenerateFromPrompt = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockChat.mockResolvedValue('Response from ChatAgent');

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  describe('API Key Validation', () => {
    it('should show error when no API keys are configured', async () => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: undefined,
        gemini_api_key: undefined,
        replicate_api_key: undefined,
      });

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/NO API KEYS CONFIGURED/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Please add at least one API key in Settings/i),
        ).toBeInTheDocument();
      });
    });

    it('should send message when OpenRouter API key is configured', async () => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: 'test-openrouter-key',
        gemini_api_key: undefined,
        replicate_api_key: undefined,
      });

      mockChat.mockResolvedValue('Response from AI');

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalled();
      });
    });

    it('should send message when Gemini API key is configured', async () => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: undefined,
        gemini_api_key: 'test-gemini-key',
        replicate_api_key: undefined,
      });

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: 'test-key',
        gemini_api_key: undefined,
        replicate_api_key: undefined,
      });
    });

    it('should show API key error message on 401 unauthorized', async () => {
      mockChat.mockRejectedValue(new Error('Unauthorized: Invalid API key'));

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/API KEY ERROR/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid or expired/i)).toBeInTheDocument();
      });
    });

    it('should show quota exceeded error on 429 rate limit', async () => {
      mockChat.mockRejectedValue(new Error('Rate limit exceeded'));

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/QUOTA EXCEEDED/i)).toBeInTheDocument();
      });
    });

    it('should show network error message on connection failure', async () => {
      mockChat.mockRejectedValue(new Error('Network connection failed'));

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/NETWORK ERROR/i)).toBeInTheDocument();
        expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
      });
    });

    it('should show generic error message for unknown errors', async () => {
      mockChat.mockRejectedValue(new Error('Something went wrong'));

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Chat Flow', () => {
    beforeEach(() => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: 'test-key',
        gemini_api_key: undefined,
        replicate_api_key: undefined,
      });
    });

    it('should display user message in chat', async () => {
      mockChat.mockResolvedValue('AI response');

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Hello AI' } });
      fireEvent.click(sendButton);

      expect(screen.getByText('Hello AI')).toBeInTheDocument();
    });

    it('should clear input after sending message', async () => {
      mockChat.mockResolvedValue('AI response');

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i) as HTMLTextAreaElement;
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });
});
