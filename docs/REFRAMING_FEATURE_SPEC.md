# Image/Video Reframing Feature Specification
## Multi-Platform Content Adaptation

**Priority:** P0 (Critical)  
**Target Release:** Q1 2026  
**Estimated Effort:** 2 weeks

---

## Problem Statement

Social media platforms require different aspect ratios:
- **Instagram Feed:** 1:1 (square)
- **Instagram Stories:** 9:16 (vertical)
- **Instagram Reels:** 9:16 (vertical)
- **TikTok:** 9:16 (vertical)
- **YouTube:** 16:9 (horizontal)
- **YouTube Shorts:** 9:16 (vertical)
- **LinkedIn:** 1.91:1 (horizontal)
- **Twitter/X:** 16:9 or 1:1

**Current Pain Point:** Users must manually crop or recreate content for each platform, losing important visual elements or creating awkward compositions.

**Solution:** AI-powered reframing that intelligently expands or reframes content to any aspect ratio while preserving the subject and maintaining visual quality.

---

## Feature Overview

### Capabilities
1. **Smart Reframe Images** - Change aspect ratio without cropping
2. **Smart Reframe Videos** - Adapt video aspect ratios
3. **Platform Presets** - One-click conversion for each platform
4. **Batch Reframe** - Convert entire campaigns at once
5. **Subject Detection** - Keep important elements in frame

---

## Technical Implementation

### Models

#### Image Reframing
**Primary:** `luma/reframe-image` (37K runs, $0.02/image)

```typescript
// server/src/routes/replicate.ts
replicateRouter.post('/reframe-image', authMiddleware, async (c) => {
    const { imageUrl, targetAspectRatio, focusPoint } = await c.req.json();
    
    const output = await callReplicate(replicateKey, 'luma/reframe-image', {
        image: imageUrl,
        aspect_ratio: targetAspectRatio, // e.g., "9:16", "16:9", "1:1"
        focus_point: focusPoint // optional: { x: 0.5, y: 0.5 }
    });
    
    return c.json({ 
        url: output,
        originalRatio: calculateAspectRatio(imageUrl),
        newRatio: targetAspectRatio
    });
});
```

**Alternative:** `bria/expand-image` (21K runs, $0.01/image)
- Use when expanding borders is preferred over reframing
- Better for product photography

#### Video Reframing
**Primary:** `luma/reframe-video` (15K runs, $0.05/video)

```typescript
// server/src/routes/replicate.ts
replicateRouter.post('/reframe-video', authMiddleware, async (c) => {
    const { videoUrl, targetAspectRatio, maxDuration } = await c.req.json();
    
    // Validate duration (max 30 seconds)
    if (maxDuration > 30) {
        return c.json({ error: 'Video must be 30 seconds or less' }, 400);
    }
    
    const output = await callReplicate(replicateKey, 'luma/reframe-video', {
        video: videoUrl,
        aspect_ratio: targetAspectRatio,
        output_resolution: '720p' // Always 720p output
    });
    
    return c.json({ url: output });
});
```

---

## UI/UX Design

### Reframe Panel

```typescript
// src/components/ReframeTools/ReframePanel.tsx
interface ReframePanelProps {
    currentImage: string;
    currentAspectRatio: string;
    onReframeComplete: (result: ReframeResult) => void;
}

export function ReframePanel({ currentImage, currentAspectRatio, onReframeComplete }: ReframePanelProps) {
    return (
        <div className="reframe-panel">
            {/* Current Aspect Ratio Display */}
            <div className="current-ratio">
                <span>Current: {currentAspectRatio}</span>
            </div>
            
            {/* Platform Presets */}
            <div className="platform-presets">
                <h3>Quick Presets</h3>
                <div className="preset-grid">
                    <PresetButton platform="instagram-feed" ratio="1:1" />
                    <PresetButton platform="instagram-story" ratio="9:16" />
                    <PresetButton platform="youtube" ratio="16:9" />
                    <PresetButton platform="tiktok" ratio="9:16" />
                    <PresetButton platform="linkedin" ratio="1.91:1" />
                    <PresetButton platform="twitter" ratio="16:9" />
                </div>
            </div>
            
            {/* Custom Aspect Ratio */}
            <div className="custom-ratio">
                <h3>Custom Ratio</h3>
                <AspectRatioSelector />
            </div>
            
            {/* Focus Point (Optional) */}
            <div className="focus-point">
                <h3>Focus Point (Optional)</h3>
                <ImageFocusSelector image={currentImage} />
            </div>
            
            {/* Preview */}
            <div className="preview">
                <h3>Preview</h3>
                <BeforeAfterSlider 
                    before={currentImage} 
                    after={previewUrl} 
                />
            </div>
            
            {/* Actions */}
            <div className="actions">
                <Button onClick={handleReframe}>Reframe</Button>
                <Button onClick={handleBatchReframe}>Batch Reframe</Button>
            </div>
        </div>
    );
}
```

### Platform Presets

```typescript
export const PLATFORM_PRESETS = {
    'instagram-feed': {
        name: 'Instagram Feed',
        ratio: '1:1',
        icon: 'instagram',
        color: '#E4405F'
    },
    'instagram-story': {
        name: 'Instagram Story',
        ratio: '9:16',
        icon: 'instagram',
        color: '#E4405F'
    },
    'instagram-reel': {
        name: 'Instagram Reel',
        ratio: '9:16',
        icon: 'instagram',
        color: '#E4405F'
    },
    'tiktok': {
        name: 'TikTok',
        ratio: '9:16',
        icon: 'tiktok',
        color: '#000000'
    },
    'youtube': {
        name: 'YouTube',
        ratio: '16:9',
        icon: 'youtube',
        color: '#FF0000'
    },
    'youtube-shorts': {
        name: 'YouTube Shorts',
        ratio: '9:16',
        icon: 'youtube',
        color: '#FF0000'
    },
    'linkedin': {
        name: 'LinkedIn',
        ratio: '1.91:1',
        icon: 'linkedin',
        color: '#0A66C2'
    },
    'twitter': {
        name: 'Twitter/X',
        ratio: '16:9',
        icon: 'twitter',
        color: '#1DA1F2'
    },
    'facebook': {
        name: 'Facebook',
        ratio: '1.91:1',
        icon: 'facebook',
        color: '#1877F2'
    }
};
```

---

## Batch Reframing

### Workflow

```typescript
// src/services/batchReframe.ts
export async function batchReframe(
    images: string[],
    targetPlatforms: string[]
): Promise<BatchReframeResult> {
    const results: ReframeResult[] = [];
    
    for (const image of images) {
        for (const platform of targetPlatforms) {
            const preset = PLATFORM_PRESETS[platform];
            
            const result = await api.post('/api/replicate/reframe-image', {
                imageUrl: image,
                targetAspectRatio: preset.ratio
            });
            
            results.push({
                originalImage: image,
                platform: platform,
                reframedImage: result.url,
                ratio: preset.ratio
            });
        }
    }
    
    return {
        totalImages: images.length,
        totalPlatforms: targetPlatforms.length,
        totalGenerated: results.length,
        results: results
    };
}
```

### UI Component

```typescript
// src/components/ReframeTools/BatchReframeModal.tsx
export function BatchReframeModal({ images, onComplete }: BatchReframeModalProps) {
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    
    return (
        <Modal>
            <h2>Batch Reframe</h2>
            
            {/* Image Selection */}
            <div className="image-selection">
                <p>{images.length} images selected</p>
            </div>
            
            {/* Platform Selection */}
            <div className="platform-selection">
                <h3>Select Target Platforms</h3>
                <CheckboxGroup
                    options={Object.keys(PLATFORM_PRESETS)}
                    selected={selectedPlatforms}
                    onChange={setSelectedPlatforms}
                />
            </div>
            
            {/* Cost Estimate */}
            <div className="cost-estimate">
                <p>Total: {images.length * selectedPlatforms.length} images</p>
                <p>Cost: ${(images.length * selectedPlatforms.length * 0.02).toFixed(2)}</p>
            </div>
            
            {/* Progress */}
            {progress > 0 && (
                <ProgressBar value={progress} max={100} />
            )}
            
            {/* Actions */}
            <Button onClick={handleBatchReframe}>
                Reframe All
            </Button>
        </Modal>
    );
}
```

---

## Integration with Existing Features

### Canvas Integration

```typescript
// Add "Reframe" button to canvas toolbar
<CanvasToolbar>
    <Button onClick={openReframePanel}>
        <Icon name="aspect_ratio" />
        Reframe
    </Button>
</CanvasToolbar>

// When reframe completes, replace canvas content
function handleReframeComplete(result: ReframeResult) {
    // Update canvas dimensions
    canvas.setDimensions({
        width: result.width,
        height: result.height
    });
    
    // Replace background image
    canvas.setBackgroundImage(result.url);
    
    // Notify user
    toast.success(`Reframed to ${result.ratio}`);
}
```

### Project Templates

```typescript
// Add reframe option to project creation
export const PROJECT_TEMPLATES = [
    {
        id: 'multi-platform-campaign',
        name: 'Multi-Platform Campaign',
        description: 'Create content for all platforms at once',
        workflow: [
            'Create master design (16:9)',
            'Auto-reframe for Instagram (1:1, 9:16)',
            'Auto-reframe for TikTok (9:16)',
            'Auto-reframe for LinkedIn (1.91:1)',
            'Export all versions'
        ]
    }
];
```

---

## Database Schema

```sql
-- Add to existing schema
CREATE TABLE reframe_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- 'image' or 'video'
    original_url TEXT NOT NULL,
    original_ratio VARCHAR(20),
    target_ratio VARCHAR(20) NOT NULL,
    target_platform VARCHAR(50),
    output_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    cost DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE batch_reframe_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    total_images INTEGER NOT NULL,
    total_platforms INTEGER NOT NULL,
    completed_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    total_cost DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

---

## Pricing Strategy

### Cost Structure
- **Image Reframe:** $0.02 per image (Luma)
- **Video Reframe:** $0.05 per video (Luma, max 30s)
- **Batch Discount:** 10% off for 10+ images

### User Pricing
- **Free Plan:** 5 reframes/month
- **Pro Plan:** Unlimited reframes included
- **Enterprise:** Custom pricing

### ROI Calculation
```
User saves: 15 minutes per platform × $50/hour = $12.50 per reframe
Our cost: $0.02 per reframe
Value created: $12.48 per reframe
```

---

## Success Metrics

### Adoption
- % of users who try reframe feature
- Reframes per user per month
- Most popular target platforms

### Quality
- User satisfaction ratings
- Before/after quality comparison
- Subject preservation accuracy

### Business Impact
- Conversion to Pro plan
- Feature usage vs. cost
- Time saved per user

---

## Competitive Advantage

### vs. Manual Cropping
- ✅ No loss of visual elements
- ✅ AI-powered composition
- ✅ 10x faster

### vs. Canva
- ✅ Better AI quality
- ✅ Video support
- ✅ Batch processing

### vs. Adobe Express
- ✅ More affordable
- ✅ Easier to use
- ✅ Integrated workflow

---

## Next Steps

1. ✅ Implement backend endpoints (Week 1)
2. ✅ Build UI components (Week 1)
3. ✅ Add platform presets (Week 1)
4. ✅ Implement batch reframing (Week 2)
5. ✅ Integration testing (Week 2)
6. ✅ Beta launch (Week 2)
7. ✅ Marketing campaign highlighting time savings

