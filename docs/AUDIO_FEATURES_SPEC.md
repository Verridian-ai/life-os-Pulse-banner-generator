# Audio Features Technical Specification
## Signal Audio/Music/TTS Integration

**Priority:** P0 (Highest)  
**Target Release:** Q1 2026  
**Estimated Effort:** 4-6 weeks

---

## Overview

Add comprehensive audio capabilities to Signal, enabling users to:
1. Transcribe videos automatically
2. Generate AI voiceovers from text
3. Add background music to videos
4. Clone voices for consistent branding
5. Add sound effects to silent videos

---

## Feature 1: Auto-Transcription

### Model
**openai/whisper** (128M runs, proven reliability)

### API Integration
```typescript
// server/src/routes/replicate.ts
replicateRouter.post('/transcribe', authMiddleware, async (c) => {
    const { audioUrl, language, task } = await c.req.json();
    
    const output = await callReplicate(replicateKey, 'openai/whisper', {
        audio: audioUrl,
        language: language || 'auto',
        task: task || 'transcribe', // or 'translate'
        timestamp: 'word' // word-level timestamps for captions
    });
    
    return c.json({ 
        text: output.text,
        segments: output.segments, // for caption timing
        language: output.detected_language
    });
});
```

### UI Components
```typescript
// src/components/AudioTools/TranscriptionPanel.tsx
interface TranscriptionPanelProps {
    videoUrl: string;
    onTranscriptionComplete: (result: TranscriptionResult) => void;
}

// Features:
// - Auto-detect language or manual selection
// - Word-level timestamp display
// - Edit transcription inline
// - Export as SRT/VTT for captions
// - One-click add to video as text overlay
```

### Use Cases
1. **Auto-Captions:** Add captions to videos for accessibility
2. **Content Repurposing:** Extract quotes from videos
3. **SEO:** Generate searchable text from video content
4. **Translation:** Translate speech to English

### Pricing
- **Cost:** $0.006 per minute
- **User Pricing:** Include in Pro plan, $0.01/min for free users

---

## Feature 2: Text-to-Speech (AI Voiceover)

### Model
**jaaari/kokoro-82m** (46M runs, high quality, low cost)

### API Integration
```typescript
// server/src/routes/replicate.ts
replicateRouter.post('/text-to-speech', authMiddleware, async (c) => {
    const { text, voice, speed, language } = await c.req.json();
    
    const output = await callReplicate(replicateKey, 'jaaari/kokoro-82m', {
        text: text,
        voice: voice || 'af_bella', // Multiple voice options
        speed: speed || 1.0,
        language: language || 'en'
    });
    
    return c.json({ audioUrl: output });
});
```

### Voice Options
```typescript
export const TTS_VOICES = {
    female: [
        { id: 'af_bella', name: 'Bella', style: 'Professional' },
        { id: 'af_sarah', name: 'Sarah', style: 'Friendly' },
        { id: 'af_nicole', name: 'Nicole', style: 'Energetic' }
    ],
    male: [
        { id: 'am_adam', name: 'Adam', style: 'Professional' },
        { id: 'am_michael', name: 'Michael', style: 'Authoritative' }
    ]
};
```

### UI Components
```typescript
// src/components/AudioTools/VoiceoverPanel.tsx
interface VoiceoverPanelProps {
    onAudioGenerated: (audioUrl: string) => void;
}

// Features:
// - Text input with character count
// - Voice preview (play sample)
// - Speed control (0.5x - 2x)
// - Emotion/style selection
// - Real-time preview
// - Add to timeline at cursor position
```

### Use Cases
1. **Video Narration:** Add professional voiceover to explainer videos
2. **Product Demos:** Narrate product features
3. **Social Media:** Create audio for carousel posts
4. **Accessibility:** Provide audio version of text content

### Pricing
- **Cost:** $0.01 per 100 words
- **User Pricing:** Include in Pro plan, $0.02/100 words for free users

---

## Feature 3: Background Music Generation

### Model
**meta/musicgen** (3M runs, royalty-free)

### API Integration
```typescript
// server/src/routes/replicate.ts
replicateRouter.post('/generate-music', authMiddleware, async (c) => {
    const { prompt, duration, genre, mood } = await c.req.json();
    
    const output = await callReplicate(replicateKey, 'meta/musicgen', {
        prompt: `${genre} music, ${mood} mood, ${prompt}`,
        duration: duration || 30, // seconds
        model_version: 'stereo-large' // best quality
    });
    
    return c.json({ audioUrl: output });
});
```

### Music Presets
```typescript
export const MUSIC_PRESETS = {
    upbeat: {
        prompt: 'upbeat energetic background music',
        genres: ['pop', 'electronic', 'rock']
    },
    calm: {
        prompt: 'calm relaxing ambient music',
        genres: ['ambient', 'acoustic', 'piano']
    },
    corporate: {
        prompt: 'professional corporate background music',
        genres: ['corporate', 'motivational', 'inspiring']
    },
    cinematic: {
        prompt: 'epic cinematic orchestral music',
        genres: ['orchestral', 'epic', 'dramatic']
    }
};
```

### UI Components
```typescript
// src/components/AudioTools/MusicPanel.tsx
interface MusicPanelProps {
    videoDuration: number;
    onMusicGenerated: (audioUrl: string) => void;
}

// Features:
// - Genre/mood selector
// - Duration auto-match to video
// - Custom prompt input
// - Preview before adding
// - Volume control
// - Fade in/out options
```

### Use Cases
1. **Video Background:** Add music to product videos
2. **Intros/Outros:** Create branded audio signatures
3. **Transitions:** Musical transitions between scenes
4. **Mood Setting:** Set emotional tone for content

### Pricing
- **Cost:** $0.05 per 30 seconds
- **User Pricing:** Include in Pro plan, $0.10/30s for free users

---

## Feature 4: Voice Cloning

### Model
**lucataco/xtts-v2** (4.3M runs, multilingual)

### API Integration
```typescript
// server/src/routes/replicate.ts
replicateRouter.post('/clone-voice', authMiddleware, async (c) => {
    const { text, voiceSampleUrl, language } = await c.req.json();
    
    const output = await callReplicate(replicateKey, 'lucataco/xtts-v2', {
        text: text,
        speaker: voiceSampleUrl, // 6-30 second sample
        language: language || 'en'
    });
    
    return c.json({ audioUrl: output });
});
```

### UI Components
```typescript
// src/components/AudioTools/VoiceClonePanel.tsx
interface VoiceClonePanelProps {
    onVoiceCloned: (audioUrl: string) => void;
}

// Features:
// - Upload voice sample (6-30s)
// - Voice quality indicator
// - Save voice profile for reuse
// - Multi-language support (23 languages)
// - Emotion control
```

### Use Cases
1. **Brand Voice:** Create consistent brand spokesperson
2. **Personal Branding:** Use your own voice at scale
3. **Multilingual:** Speak in languages you don't know
4. **Accessibility:** Preserve voice for those losing speech

### Pricing
- **Cost:** $0.10 per generation
- **User Pricing:** Pro plan only, $0.20/generation

---

## Feature 5: Video-to-Audio (Sound Effects)

### Model
**zsxkib/mmaudio** (3.3M runs, video-aware)

### API Integration
```typescript
// server/src/routes/replicate.ts
replicateRouter.post('/video-to-audio', authMiddleware, async (c) => {
    const { videoUrl, prompt } = await c.req.json();
    
    const output = await callReplicate(replicateKey, 'zsxkib/mmaudio', {
        video: videoUrl,
        prompt: prompt || 'realistic sound effects matching the video'
    });
    
    return c.json({ audioUrl: output });
});
```

### Use Cases
1. **Silent Videos:** Add realistic sound to screen recordings
2. **Animation:** Add sound effects to animated content
3. **Product Videos:** Add ambient sounds to product demos

### Pricing
- **Cost:** $0.08 per video
- **User Pricing:** Pro plan only, $0.15/video

---

## Database Schema

```sql
-- Add to existing schema
CREATE TABLE audio_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'transcription', 'tts', 'music', 'voice_clone', 'video_audio'
    input_text TEXT,
    input_url TEXT,
    output_url TEXT NOT NULL,
    settings JSONB, -- voice, speed, genre, etc.
    cost DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    sample_url TEXT NOT NULL,
    language VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI/UX Design

### Audio Panel Location
Add new "Audio" tab in the right sidebar, alongside "Layers", "Assets", "AI Tools"

### Panel Sections
1. **Transcribe** - Upload video, get text
2. **Voiceover** - Text to speech
3. **Music** - Generate background music
4. **Voice Clone** - Clone and use custom voice
5. **Sound FX** - Add sound to video

### Workflow Integration
- Audio tracks appear in timeline
- Waveform visualization
- Volume/fade controls
- Sync with video playback
- Export with video

---

## Testing Plan

### Unit Tests
- API endpoint responses
- Audio file validation
- Cost calculation
- User quota limits

### Integration Tests
- End-to-end audio generation
- Timeline integration
- Export with audio
- Multi-track mixing

### User Testing
- Voice quality assessment
- Music relevance to prompts
- Transcription accuracy
- UI/UX feedback

---

## Success Metrics

### Adoption
- % of users who try audio features
- Audio generations per user per month
- Retention impact

### Quality
- Transcription accuracy (>95% target)
- Voice quality ratings (>4/5 target)
- Music relevance ratings (>4/5 target)

### Revenue
- Conversion to Pro plan
- Audio feature usage vs. cost
- ROI per feature

---

## Next Steps

1. ✅ Review spec with product team
2. ✅ Design UI mockups for audio panel
3. ✅ Set up Replicate API keys for audio models
4. ✅ Implement backend endpoints (Week 1-2)
5. ✅ Build UI components (Week 3-4)
6. ✅ Integration testing (Week 5)
7. ✅ Beta launch to Pro users (Week 6)
8. ✅ Public launch with marketing campaign

