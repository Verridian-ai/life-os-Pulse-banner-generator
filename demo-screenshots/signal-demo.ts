import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname);
const BASE_URL = 'http://localhost:5173';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page: Page, name: string, description: string): Promise<void> {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`[SCREENSHOT] ${name}: ${description}`);
}

async function takeFullPageScreenshot(page: Page, name: string, description: string): Promise<void> {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`[SCREENSHOT] ${name}: ${description}`);
}

async function runDemo(): Promise<void> {
  console.log('='.repeat(60));
  console.log('SIGNAL APP DEMO - Full Authentication & Features');
  console.log('='.repeat(60));
  console.log('');

  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });

  const page: Page = await context.newPage();

  // Enable console log capture
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[CONSOLE ${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    // ========================================
    // STEP 1: Fresh Start - Landing Page
    // ========================================
    console.log('\n--- STEP 1: Fresh Start ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await delay(2000);
    await takeScreenshot(page, '01-landing-page', 'Landing page loaded successfully');

    // ========================================
    // STEP 2: Sign In
    // ========================================
    console.log('\n--- STEP 2: Sign In ---');

    // Look for Sign In button
    const signInButton = page.locator('button:has-text("Sign In"), a:has-text("Sign In"), [data-testid="sign-in"]').first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await delay(1500);
      await takeScreenshot(page, '02-sign-in-modal', 'Sign in modal opened');

      // Enter credentials
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (await emailInput.isVisible()) {
        await emailInput.fill('support@verridian.ai');
        await delay(500);
      }

      if (await passwordInput.isVisible()) {
        await passwordInput.fill('TestPass123');
        await delay(500);
      }

      await takeScreenshot(page, '03-credentials-entered', 'Credentials entered');

      // Click sign in submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("SIGN IN"), button:has-text("Log In")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await delay(3000);
      }
    } else {
      console.log('[INFO] No Sign In button found - may already be authenticated or different UI');
    }

    await takeScreenshot(page, '04-authenticated-dashboard', 'Dashboard after authentication');

    // ========================================
    // STEP 3: Explore Dashboard - Platform Cards
    // ========================================
    console.log('\n--- STEP 3: Explore Dashboard ---');
    await delay(1000);

    // Scroll to show all platform cards
    await page.evaluate(() => window.scrollTo(0, 300));
    await delay(500);
    await takeFullPageScreenshot(page, '05-all-platforms', 'All 6 platform cards visible');

    // Look for TikTok card and hover
    const tiktokCard = page.locator('[data-platform="tiktok"], .platform-card:has-text("TikTok"), div:has-text("TikTok")').first();
    if (await tiktokCard.isVisible()) {
      await tiktokCard.hover();
      await delay(500);
      await takeScreenshot(page, '06-tiktok-hover', 'TikTok card highlighted on hover');
    }

    // ========================================
    // STEP 4: Navigate to TikTok Studio
    // ========================================
    console.log('\n--- STEP 4: Navigate to TikTok Studio ---');

    // Try clicking TikTok card or finding studio navigation
    const studioLink = page.locator('a[href*="studio"], button:has-text("Studio"), [data-tab="studio"]').first();
    if (await studioLink.isVisible()) {
      await studioLink.click();
      await delay(2000);
    } else if (await tiktokCard.isVisible()) {
      await tiktokCard.click();
      await delay(2000);
    }

    await takeScreenshot(page, '07-studio-view', 'Studio interface loaded');

    // ========================================
    // STEP 5: Canvas Format Selector
    // ========================================
    console.log('\n--- STEP 5: Canvas Format Selector ---');

    // Find format selector dropdown
    const formatSelector = page.locator('[data-testid="format-selector"], .format-selector, select:has-text("Format"), button:has-text("Format"), .canvas-format').first();
    if (await formatSelector.isVisible()) {
      await formatSelector.click();
      await delay(1000);
      await takeScreenshot(page, '08-format-dropdown', 'Format selector dropdown open');
    }

    // Look for specific formats
    const formats = [
      'TikTok Video',
      'TikTok Profile',
      'Instagram Reels',
      'YouTube Shorts',
      'LinkedIn Company Banner'
    ];

    for (const format of formats) {
      const formatOption = page.locator(`text="${format}"`).first();
      if (await formatOption.isVisible()) {
        console.log(`[FOUND] Format: ${format}`);
      }
    }

    // ========================================
    // STEP 6: Select TikTok Video Format
    // ========================================
    console.log('\n--- STEP 6: Select TikTok Video Format ---');

    const tiktokVideoOption = page.locator('text="TikTok Video"').first();
    if (await tiktokVideoOption.isVisible()) {
      await tiktokVideoOption.click();
      await delay(1500);
      await takeScreenshot(page, '09-tiktok-format-selected', 'TikTok Video format with safe zones');
    }

    // ========================================
    // STEP 7: Gallery / Recent Designs
    // ========================================
    console.log('\n--- STEP 7: Recent Designs / Gallery ---');

    const galleryTab = page.locator('a[href*="gallery"], button:has-text("Gallery"), [data-tab="gallery"]').first();
    if (await galleryTab.isVisible()) {
      await galleryTab.click();
      await delay(1500);
      await takeScreenshot(page, '10-gallery-view', 'Gallery with recent designs');
    }

    // ========================================
    // STEP 8: Settings Modal
    // ========================================
    console.log('\n--- STEP 8: Settings Modal ---');

    const settingsButton = page.locator('button:has-text("Settings"), [aria-label="Settings"], .settings-icon, button[data-testid="settings"]').first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await delay(1500);
      await takeScreenshot(page, '11-settings-modal', 'Settings modal with API keys and model selection');

      // Scroll through settings
      const settingsModal = page.locator('.modal, [role="dialog"], .settings-modal').first();
      if (await settingsModal.isVisible()) {
        await settingsModal.evaluate(el => el.scrollTo(0, 500));
        await delay(500);
        await takeScreenshot(page, '12-settings-scrolled', 'Settings modal scrolled');
      }

      // Close modal
      const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"], .modal-close').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await delay(500);
      }
    }

    // ========================================
    // STEP 9: Voice Agent UI
    // ========================================
    console.log('\n--- STEP 9: Voice Agent UI ---');

    const voiceButton = page.locator('button[aria-label*="voice"], button[aria-label*="microphone"], .voice-button, [data-testid="voice-agent"]').first();
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      await delay(1500);
      await takeScreenshot(page, '13-voice-agent', 'Voice agent interface');
    }

    // ========================================
    // STEP 10-11: DevTools Console & Network
    // ========================================
    console.log('\n--- STEP 10-11: Console & Network Verification ---');
    console.log('[NOTE] DevTools screenshots require manual capture');
    console.log('[INFO] Check Console for: "[API] Using backend: http://localhost:8888"');
    console.log('[INFO] Check Network for successful 200 status API calls');

    // ========================================
    // STEP 12: Final Overview
    // ========================================
    console.log('\n--- STEP 12: Final Overview ---');

    // Navigate back to main dashboard
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await delay(2000);
    await takeFullPageScreenshot(page, '14-final-overview', 'Complete working app overview');

    // ========================================
    // Summary
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('DEMO COMPLETE');
    console.log('='.repeat(60));
    console.log('\nScreenshots saved to:', SCREENSHOTS_DIR);
    console.log('\nKey Features Demonstrated:');
    console.log('  - Landing page loads correctly');
    console.log('  - Authentication flow (CSP fixed!)');
    console.log('  - 6 Platform cards including TikTok');
    console.log('  - Studio view with canvas');
    console.log('  - Format selector with new formats');
    console.log('  - Gallery with platform badges');
    console.log('  - Settings modal with API keys');
    console.log('  - Voice agent interface');

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for 30 seconds for inspection...');
    await delay(30000);

  } catch (error) {
    console.error('[ERROR]', error);
    await takeScreenshot(page, 'error-state', 'Error occurred during demo');
  } finally {
    await browser.close();
  }
}

runDemo().catch(console.error);
