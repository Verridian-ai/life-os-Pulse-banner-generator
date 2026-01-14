import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError } from './api';

describe('API Service', () => {
  // Mock global fetch
  const globalFetch = global.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    // Reset pending requests map if exposed, but it's not.
    // We rely on unique keys (method+url+body) or just fresh mocks.
  });

  afterEach(() => {
    global.fetch = globalFetch;
    vi.clearAllMocks();
  });

  it('should perform a GET request', async () => {
    const mockResponse = { data: 'test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await api.get('/test');
    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('should perform a POST request with body', async () => {
    const mockResponse = { success: true };
    const body = { key: 'value' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await api.post('/submit', body);
    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/submit'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
  });

  it('should throw ApiError on failure', async () => {
    const errorMessage = 'Bad Request';
    // The api.ts reads text() first, then tries JSON.parse()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify({ error: errorMessage }),
    });

    await expect(api.get('/error')).rejects.toThrow(ApiError);
  });

  it('should handle non-JSON error response', async () => {
    const errorText = 'Server Error';
    // The api.ts reads text() first, then tries JSON.parse()
    // So we mock text() to return non-JSON text
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => errorText,
    });

    await expect(api.get('/server-error')).rejects.toThrow(errorText);
  });
});
