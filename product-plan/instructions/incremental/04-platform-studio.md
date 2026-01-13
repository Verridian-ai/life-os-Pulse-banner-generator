# Platform Studio — Implementation Instructions

AI-powered design studio for each social platform.

---

## Overview

The Platform Studio provides:
- Canvas-based design editor
- AI image generation
- Platform-specific format presets
- Voice command integration
- Template library access

---

## Components to Create

### StudioPage

Main page component.

```typescript
interface StudioPageProps {
  platform: PlatformType;
  onBack: () => void;
  onOpenSettings: () => void;
}

type StudioTab = 'canvas' | 'templates' | 'media' | 'posts';
```

**Structure:**
```tsx
<div className="min-h-screen bg-zinc-950">
  <StudioHeader platform={platform} activeTab={tab} onTabChange={setTab} onBack={onBack} />

  <main className="flex">
    <div className="flex-1">
      {tab === 'canvas' && <CanvasView />}
      {tab === 'templates' && <TemplatesView />}
      {tab === 'media' && <MediaGallery />}
      {tab === 'posts' && <PostsView />}
    </div>

    {tab === 'canvas' && <GenerativeSidebar />}
  </main>

  <VoiceAgentButton />
</div>
```

---

### StudioHeader

Fixed header with navigation.

```typescript
interface StudioHeaderProps {
  platform: PlatformType;
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onBack: () => void;
}
```

**Structure:**
```tsx
<header className="fixed top-0 left-0 right-0 h-14 bg-zinc-900/95 backdrop-blur-xl border-b border-white/10 z-50">
  <div className="flex items-center h-full px-4">
    {/* Back button */}
    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg">
      <ArrowLeft className="w-5 h-5" />
    </button>

    {/* Platform indicator */}
    <div className="flex items-center gap-2 ml-4">
      <PlatformIcon className="w-5 h-5 text-sky-400" />
      <span className="font-bold">{platformName} Studio</span>
    </div>

    {/* Tab navigation */}
    <nav className="flex gap-1 ml-8">
      {tabs.map(tab => (
        <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)}>
          {tab.label}
        </TabButton>
      ))}
    </nav>

    {/* Actions */}
    <div className="ml-auto flex items-center gap-2">
      <VoiceToggle />
      <RefreshButton />
      <SettingsButton />
    </div>
  </div>
</header>
```

---

### CanvasView

Main design canvas.

**Features:**
- Centered canvas area
- Resize handles (corners)
- Safe zone overlay (toggleable)
- Zoom controls

**Canvas Toolbar:**
```tsx
<div className="flex items-center gap-2 p-2 bg-zinc-900/80 rounded-xl">
  <FormatSelector formats={platformFormats} value={format} onChange={setFormat} />
  <Separator />
  <SafeZoneToggle checked={showSafeZones} onChange={setShowSafeZones} />
  <Separator />
  <ZoomControls value={zoom} onChange={setZoom} />
</div>
```

**Platform Formats:**
```typescript
const PLATFORM_FORMATS = {
  linkedin: [
    { id: 'banner', name: 'Banner', width: 1584, height: 396 },
    { id: 'profile', name: 'Profile', width: 800, height: 800 },
    { id: 'post', name: 'Post', width: 1200, height: 627 },
  ],
  youtube: [
    { id: 'thumbnail', name: 'Thumbnail', width: 1280, height: 720 },
    { id: 'banner', name: 'Banner', width: 2560, height: 1440 },
  ],
  instagram: [
    { id: 'post', name: 'Post', width: 1080, height: 1080 },
    { id: 'story', name: 'Story', width: 1080, height: 1920 },
    { id: 'reel', name: 'Reel', width: 1080, height: 1920 },
  ],
  facebook: [
    { id: 'cover', name: 'Cover', width: 820, height: 312 },
    { id: 'post', name: 'Post', width: 1200, height: 630 },
  ],
  tiktok: [
    { id: 'profile', name: 'Profile', width: 200, height: 200 },
    { id: 'video', name: 'Video', width: 1080, height: 1920 },
  ],
  x: [
    { id: 'header', name: 'Header', width: 1500, height: 500 },
    { id: 'post', name: 'Post', width: 1200, height: 675 },
  ],
};
```

---

### GenerativeSidebar

AI generation controls.

```tsx
<aside className="w-80 bg-zinc-900/80 border-l border-white/10 p-4 space-y-6">
  {/* Prompt input */}
  <div>
    <label className="text-sm font-medium text-zinc-400 mb-2 block">Describe your design</label>
    <textarea
      className="w-full h-24 bg-zinc-800 rounded-xl p-3 resize-none"
      placeholder="A professional LinkedIn banner with..."
    />
  </div>

  {/* Size selector */}
  <div>
    <label className="text-sm font-medium text-zinc-400 mb-2 block">Output Size</label>
    <div className="flex gap-2">
      <SizeButton active={size === '1k'}>1K</SizeButton>
      <SizeButton active={size === '2k'}>2K</SizeButton>
      <SizeButton active={size === '4k'}>4K</SizeButton>
    </div>
  </div>

  {/* Generate button */}
  <button className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl font-bold">
    Generate
  </button>

  {/* Enhance tools */}
  <div className="flex gap-2">
    <EnhanceButton>Enhance Prompt</EnhanceButton>
    <MagicButton>Magic</MagicButton>
  </div>

  {/* Edit tools */}
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-zinc-400">Edit Tools</h4>
    <ToolButton icon={Eraser}>Remove Background</ToolButton>
    <ToolButton icon={ArrowUp}>Upscale 2x</ToolButton>
  </div>

  {/* Reference images */}
  <div>
    <h4 className="text-sm font-medium text-zinc-400 mb-2">Reference Images</h4>
    <ReferenceImagesGrid />
  </div>
</aside>
```

---

### MediaGallery

User's uploaded images.

```tsx
<div className="p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold">Media Library</h2>
    <UploadButton />
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {images.map(img => (
      <MediaCard
        key={img.id}
        image={img}
        selected={selected === img.id}
        onClick={() => setSelected(img.id)}
      />
    ))}
  </div>
</div>
```

---

## Voice Commands

**Supported Commands:**
- "Generate a professional banner"
- "Add my logo"
- "Change the background to [color]"
- "Make the text bigger"
- "Remove the background"
- "Upscale the image"
- "Undo"
- "Redo"
- "Save"

**Implementation:**
1. Voice input via LiveKit or WebSpeech API
2. Parse command to action
3. Execute action on canvas
4. Provide audio feedback

---

## Responsive Behavior

**Desktop:**
- Full canvas + sidebar layout
- Keyboard shortcuts enabled

**Tablet:**
- Canvas takes full width
- Sidebar as bottom sheet

**Mobile:**
- Canvas with pinch-to-zoom
- Tools in bottom toolbar

---

## Completion Checklist

- [ ] StudioPage with tab navigation
- [ ] StudioHeader with back, platform, tabs
- [ ] CanvasView with resize handles
- [ ] FormatSelector with platform presets
- [ ] SafeZone overlay
- [ ] ZoomControls
- [ ] GenerativeSidebar
- [ ] Prompt input
- [ ] Size selector (1K, 2K, 4K)
- [ ] Generate button with loading
- [ ] Enhance/Magic buttons
- [ ] Edit tools (Remove BG, Upscale)
- [ ] MediaGallery with upload
- [ ] Voice command integration

---

*Next: Milestone 5 — Templates*
