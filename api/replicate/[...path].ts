/**
 * Vercel Serverless Function - Replicate API Proxy
 *
 * Proxies requests to Replicate API to avoid CORS issues
 * Path: /api/replicate/*
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS with specific allowed origins
  const allowedOrigins = [
    'https://life-os-banner.verridian.ai',
    'https://nanobanna-pro.vercel.app',
    'https://nanobanna-pro-237245874937.us-central1.run.app',
    'https://nanobanna-pro-237245874937.australia-southeast1.run.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const origin = (req.headers['origin'] || req.headers['Origin']) as string | undefined;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests without origin (same-origin, curl, etc)
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Replicate-Token');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get API token from header
    const token = req.headers['x-replicate-token'] as string;

    if (!token) {
      return res.status(401).json({
        error: 'Missing API key',
        message: 'Please configure your Replicate API key in Settings'
      });
    }

    // Get the path after /api/replicate/
    const path = (req.query.path as string[])?.join('/') || '';
    const replicateUrl = `https://api.replicate.com/${path}`;

    console.log('[Replicate Proxy] Request:', {
      method: req.method,
      path,
      url: replicateUrl,
      hasToken: !!token,
    });

    // Forward request to Replicate
    const response = await fetch(replicateUrl, {
      method: req.method,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    console.log('[Replicate Proxy] Response:', {
      status: response.status,
      ok: response.ok,
    });

    // Forward response
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('[Replicate Proxy] Error:', error);
    return res.status(500).json({
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
