import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import * as apiKeyStorage from '../services/apiKeyStorage';
import * as llm from '../services/llm';

// Mock dependencies
vi.mock('../services/apiKeyStorage', () => ({
  getUserAPIKeys: vi.fn(),
}));

vi.mock('../services/llm', () => ({
  generateDesignChatResponse: vi.fn(),
  generateSearchResponse: vi.fn(),
}));

describe('ChatInterface', () => {
  const mockOnGenerateFromPrompt = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  describe('API Key Validation', () => {
    it('should show error when no API keys are configured', async () => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: null,
        gemini_api_key: null,
        replicate_api_key: null,
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
        gemini_api_key: null,
        replicate_api_key: null,
      });

      vi.mocked(llm.generateDesignChatResponse).mockResolvedValue({
        text: 'Response from AI',
      });

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(llm.generateDesignChatResponse).toHaveBeenCalled();
      });
    });

    it('should send message when Gemini API key is configured', async () => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: null,
        gemini_api_key: 'test-gemini-key',
        replicate_api_key: null,
      });

      vi.mocked(llm.generateDesignChatResponse).mockResolvedValue({
        text: 'Response from AI',
      });

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(llm.generateDesignChatResponse).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
        openrouter_api_key: 'test-key',
        gemini_api_key: null,
        replicate_api_key: null,
      });
    });

    it('should show API key error message on 401 unauthorized', async () => {
      vi.mocked(llm.generateDesignChatResponse).mockRejectedValue(
        new Error('Unauthorized: Invalid API key'),
      );

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
      vi.mocked(llm.generateDesignChatResponse).mockRejectedValue(
        new Error('Rate limit exceeded'),
      );

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
      vi.mocked(llm.generateDesignChatResponse).mockRejectedValue(
        new Error('Network connection failed'),
      );

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
      vi.mocked(llm.generateDesignChatResponse).mockRejectedValue(
        new Error('Something went wrong'),
      );

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
        gemini_api_key: null,
        replicate_api_key: null,
      });
    });

    it('should display user message in chat', async () => {
      vi.mocked(llm.generateDesignChatResponse).mockResolvedValue({
        text: 'AI response',
      });

      render(<ChatInterface onGenerateFromPrompt={mockOnGenerateFromPrompt} />);

      const input = screen.getByPlaceholderText(/CHAT WITH NANO/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[buttons.length - 1]; // Last button is the send button

      fireEvent.change(input, { target: { value: 'Hello AI' } });
      fireEvent.click(sendButton);

      expect(screen.getByText('Hello AI')).toBeInTheDocument();
    });

    it('should clear input after sending message', async () => {
      vi.mocked(llm.generateDesignChatResponse).mockResolvedValue({
        text: 'AI response',
      });

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
