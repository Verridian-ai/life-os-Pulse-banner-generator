import { validatePrompt, validateChatHistory, ValidationError } from './inputValidation';

describe('Input Validation', () => {
  describe('validatePrompt', () => {
    it('should return sanitized string for valid input', () => {
      const result = validatePrompt('  Hello World  ');
      expect(result).toBe('Hello World');
    });

    it('should remove null bytes', () => {
      const result = validatePrompt('Hello\0World');
      expect(result).toBe('HelloWorld');
    });

    it('should truncate prompts exceeding max length', () => {
      const longPrompt = 'a'.repeat(10);
      const result = validatePrompt(longPrompt, 5);
      expect(result).toBe('aaaaa');
      expect(result).toHaveLength(5);
    });

    it('should handle undefined/null gracefuly (if types were loose) or empty string', () => {
      expect(validatePrompt('')).toBe('');
    });
  });

  describe('validateChatHistory', () => {
    it('should pass for short history', () => {
      const history = [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there' }] },
      ];
      expect(() => validateChatHistory(history)).not.toThrow();
    });

    it('should throw error for history exceeding max context', () => {
      // Mock a very long history
      const longText = 'a'.repeat(20001);
      const history = [{ role: 'user', parts: [{ text: longText }] }];
      expect(() => validateChatHistory(history)).toThrow(ValidationError);
    });
  });
});
