# Platform Studio — Test Instructions

Framework-agnostic test specifications for the platform studio.

---

## Unit Tests

### StudioPage

**Tab Navigation:**
- Initial tab is "canvas"
- Click Templates tab shows templates
- Click Media tab shows gallery
- Click Posts tab shows posts (LinkedIn only)

**Platform Context:**
- Shows correct platform name in header
- Shows correct platform icon
- Loads correct format presets

### StudioHeader

**Display:**
- Shows back button
- Shows platform indicator
- Shows tab navigation
- Shows action buttons

**Actions:**
- Back button calls onBack
- Settings button opens settings
- Voice button toggles voice agent

### CanvasView

**Format Selection:**
- Default format is first option
- Changing format updates canvas size
- Canvas maintains aspect ratio

**Zoom Controls:**
- Fit to screen works
- 50% zoom works
- 100% zoom works
- 200% zoom works

**Safe Zones:**
- Toggle shows/hides safe zone overlay
- Safe zones match platform requirements

### GenerativeSidebar

**Prompt Input:**
- Accepts text input
- Has placeholder text
- Clears on successful generation

**Size Selector:**
- Default is 1K
- Can select 2K
- Can select 4K

**Generate Button:**
- Disabled when prompt empty
- Shows loading state while generating
- Calls generation API on click

**Edit Tools:**
- Remove BG button visible
- Upscale button visible
- Buttons disabled when no image

---

## Integration Tests

### AI Generation Flow

**Generate Image:**
1. Enter prompt
2. Select size (2K)
3. Click Generate
4. Verify loading state shown
5. Verify image appears on canvas
6. Verify prompt clears

**Enhance Prompt:**
1. Enter basic prompt
2. Click "Enhance Prompt"
3. Verify prompt updated with AI suggestions

**Remove Background:**
1. Generate an image
2. Click "Remove Background"
3. Verify loading state
4. Verify background removed

**Upscale Image:**
1. Generate a 1K image
2. Click "Upscale 2x"
3. Verify loading state
4. Verify image quality improved

### Voice Commands

**Basic Commands:**
1. Activate voice agent
2. Say "Generate a professional banner"
3. Verify generation starts
4. Say "Remove the background"
5. Verify background removal starts

### Template Application

**Apply Template:**
1. Go to Templates tab
2. Click a template
3. Verify canvas shows template design
4. Verify prompt pre-filled from template

---

## Accessibility Tests

**Keyboard Navigation:**
- Tab navigates through all controls
- Enter activates buttons
- Arrow keys adjust sliders

**Screen Reader:**
- Canvas state announced
- Generation progress announced
- Errors announced

**Focus Management:**
- Focus on canvas when image generated
- Focus returns after modal close

---

## Edge Cases

**Generation Error:**
- Show error toast
- Enable retry
- Keep prompt intact

**Large Image Upload:**
- Show upload progress
- Handle timeout gracefully
- Compress if too large

**Network Disconnect:**
- Show offline indicator
- Queue actions for retry
- Save work locally

**Platform Format Switch:**
- Warn if content will be cropped
- Offer to resize content

---

## Responsive Tests

**Desktop:**
- Full canvas + sidebar layout
- Keyboard shortcuts work

**Tablet:**
- Canvas takes full width
- Sidebar as bottom sheet
- Touch gestures work

**Mobile:**
- Canvas with pinch-to-zoom
- Tools in bottom toolbar
- Simplified UI

---

## Platform-Specific Tests

### LinkedIn
- Banner format: 1584x396
- Profile format: 800x800
- Safe zones for profile overlap

### YouTube
- Thumbnail format: 1280x720
- Banner format: 2560x1440
- Safe zones for UI overlay

### Instagram
- Post format: 1080x1080
- Story format: 1080x1920
- Reel format matches story

### Facebook
- Cover format: 820x312
- Post format: 1200x630

### TikTok
- Profile format: 200x200
- Video format: 1080x1920

### X (Twitter)
- Header format: 1500x500
- Post format: 1200x675
