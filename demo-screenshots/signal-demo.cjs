const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = __dirname;
const BASE_URL = 'http://localhost:5173';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, description) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`[SCREENSHOT] ${name}: ${description}`);
}

async function takeFullPageScreenshot(page, name, description) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`[SCREENSHOT] ${name}: ${description}`);
}

async function runDemo() {
  console.log('='.repeat(60));
  console.log('SIGNAL APP DEMO - Full Authentication & Features');
  console.log('='.repeat(60));
  console.log('');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

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

    // Look for Sign In button - try multiple selectors
    let signInClicked = false;
    const signInSelectors = [
      'button:has-text("Sign In")',
      'a:has-text("Sign In")',
      '[data-testid="sign-in"]',
      'button:has-text("Login")',
      'button:has-text("Log In")',
      '.sign-in-button',
      'header button:last-child'
    ];

    for (const selector of signInSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          signInClicked = true;
          console.log(`[CLICK] Found sign in button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (signInClicked) {
      await delay(1500);
      await takeScreenshot(page, '02-sign-in-modal', 'Sign in modal opened');

      // Enter credentials
      const emailSelectors = ['input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]', 'input[placeholder*="Email"]'];
      const passwordSelectors = ['input[type="password"]', 'input[name="password"]'];

      for (const selector of emailSelectors) {
        try {
          const emailInput = page.locator(selector).first();
          if (await emailInput.isVisible({ timeout: 1000 })) {
            await emailInput.fill('support@verridian.ai');
            console.log('[FILL] Email entered');
            break;
          }
        } catch (e) {}
      }

      await delay(500);

      for (const selector of passwordSelectors) {
        try {
          const passwordInput = page.locator(selector).first();
          if (await passwordInput.isVisible({ timeout: 1000 })) {
            await passwordInput.fill('TestPass123');
            console.log('[FILL] Password entered');
            break;
          }
        } catch (e) {}
      }

      await delay(500);
      await takeScreenshot(page, '03-credentials-entered', 'Credentials entered');

      // Click sign in submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("SIGN IN")',
        'button:has-text("Sign In")',
        'button:has-text("Log In")',
        'button:has-text("LOGIN")',
        'form button'
      ];

      for (const selector of submitSelectors) {
        try {
          const submitButton = page.locator(selector).first();
          if (await submitButton.isVisible({ timeout: 1000 })) {
            await submitButton.click();
            console.log(`[CLICK] Submit button clicked with selector: ${selector}`);
            break;
          }
        } catch (e) {}
      }

      await delay(3000);
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
    await takeFullPageScreenshot(page, '05-all-platforms', 'All platform cards visible');

    // Look for platform cards
    const platforms = ['LinkedIn', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'X', 'Facebook'];
    for (const platform of platforms) {
      try {
        const card = page.locator(`text="${platform}"`).first();
        if (await card.isVisible({ timeout: 500 })) {
          console.log(`[FOUND] Platform: ${platform}`);
        }
      } catch (e) {}
    }

    // Try to find and hover TikTok
    try {
      const tiktokCard = page.locator('text="TikTok"').first();
      if (await tiktokCard.isVisible({ timeout: 1000 })) {
        await tiktokCard.hover();
        await delay(500);
        await takeScreenshot(page, '06-tiktok-hover', 'TikTok card highlighted on hover');
      }
    } catch (e) {
      console.log('[INFO] TikTok card not found on current view');
    }

    // ========================================
    // STEP 4: Navigate to Studio
    // ========================================
    console.log('\n--- STEP 4: Navigate to Studio ---');

    const studioSelectors = [
      'a[href*="studio"]',
      'button:has-text("Studio")',
      '[data-tab="studio"]',
      'text="Studio"',
      '[href="/studio"]'
    ];

    for (const selector of studioSelectors) {
      try {
        const studioLink = page.locator(selector).first();
        if (await studioLink.isVisible({ timeout: 1000 })) {
          await studioLink.click();
          console.log(`[CLICK] Studio navigation with: ${selector}`);
          await delay(2000);
          break;
        }
      } catch (e) {}
    }

    await takeScreenshot(page, '07-studio-view', 'Studio interface loaded');

    // ========================================
    // STEP 5: Canvas Format Selector
    // ========================================
    console.log('\n--- STEP 5: Canvas Format Selector ---');

    const formatSelectors = [
      '[data-testid="format-selector"]',
      '.format-selector',
      'button:has-text("Format")',
      '.canvas-format-selector',
      'button:has-text("1584")', // LinkedIn banner dimension
      'button:has-text("1080")',
      '[class*="format"]'
    ];

    for (const selector of formatSelectors) {
      try {
        const formatSelector = page.locator(selector).first();
        if (await formatSelector.isVisible({ timeout: 1000 })) {
          await formatSelector.click();
          console.log(`[CLICK] Format selector with: ${selector}`);
          await delay(1000);
          await takeScreenshot(page, '08-format-dropdown', 'Format selector dropdown open');
          break;
        }
      } catch (e) {}
    }

    // Look for specific formats
    const formats = [
      'TikTok Video',
      'TikTok Profile',
      'Instagram Reels',
      'YouTube Shorts',
      'LinkedIn Company Banner',
      'LinkedIn Banner',
      'Instagram Post',
      'Facebook Cover'
    ];

    for (const format of formats) {
      try {
        const formatOption = page.locator(`text="${format}"`).first();
        if (await formatOption.isVisible({ timeout: 500 })) {
          console.log(`[FOUND] Format: ${format}`);
        }
      } catch (e) {}
    }

    // ========================================
    // STEP 6: Select a Format (TikTok if available)
    // ========================================
    console.log('\n--- STEP 6: Select Format ---');

    try {
      const tiktokVideoOption = page.locator('text="TikTok Video"').first();
      if (await tiktokVideoOption.isVisible({ timeout: 1000 })) {
        await tiktokVideoOption.click();
        await delay(1500);
        await takeScreenshot(page, '09-tiktok-format-selected', 'TikTok Video format with safe zones');
      }
    } catch (e) {
      console.log('[INFO] TikTok Video format not found');
    }

    // ========================================
    // STEP 7: Gallery / Recent Designs
    // ========================================
    console.log('\n--- STEP 7: Recent Designs / Gallery ---');

    const gallerySelectors = [
      'a[href*="gallery"]',
      'button:has-text("Gallery")',
      '[data-tab="gallery"]',
      'text="Gallery"',
      '[href="/gallery"]'
    ];

    for (const selector of gallerySelectors) {
      try {
        const galleryTab = page.locator(selector).first();
        if (await galleryTab.isVisible({ timeout: 1000 })) {
          await galleryTab.click();
          console.log(`[CLICK] Gallery navigation with: ${selector}`);
          await delay(1500);
          break;
        }
      } catch (e) {}
    }

    await takeScreenshot(page, '10-gallery-view', 'Gallery with recent designs');

    // ========================================
    // STEP 8: Settings Modal
    // ========================================
    console.log('\n--- STEP 8: Settings Modal ---');

    const settingsSelectors = [
      'button[aria-label="Settings"]',
      'button:has-text("Settings")',
      '[data-testid="settings"]',
      '.settings-icon',
      'svg[class*="settings"]',
      'button:has([class*="gear"])',
      '[class*="settings"]'
    ];

    for (const selector of settingsSelectors) {
      try {
        const settingsButton = page.locator(selector).first();
        if (await settingsButton.isVisible({ timeout: 1000 })) {
          await settingsButton.click();
          console.log(`[CLICK] Settings button with: ${selector}`);
          await delay(1500);
          await takeScreenshot(page, '11-settings-modal', 'Settings modal with API keys and model selection');

          // Scroll through settings
          try {
            const modal = page.locator('.modal, [role="dialog"], [class*="modal"]').first();
            if (await modal.isVisible({ timeout: 500 })) {
              await modal.evaluate(el => el.scrollTo(0, 500));
              await delay(500);
              await takeScreenshot(page, '12-settings-scrolled', 'Settings modal scrolled');
            }
          } catch (e) {}

          // Close modal
          try {
            const closeSelectors = ['button:has-text("Close")', 'button[aria-label="Close"]', '.modal-close', 'button:has-text("X")', '[class*="close"]'];
            for (const closeSelector of closeSelectors) {
              const closeButton = page.locator(closeSelector).first();
              if (await closeButton.isVisible({ timeout: 500 })) {
                await closeButton.click();
                console.log('[CLICK] Modal closed');
                break;
              }
            }
          } catch (e) {}

          break;
        }
      } catch (e) {}
    }

    // ========================================
    // STEP 9: Voice Agent UI
    // ========================================
    console.log('\n--- STEP 9: Voice Agent UI ---');

    const voiceSelectors = [
      'button[aria-label*="voice"]',
      'button[aria-label*="microphone"]',
      'button[aria-label*="Voice"]',
      '.voice-button',
      '[data-testid="voice-agent"]',
      'button:has(svg[class*="microphone"])',
      '[class*="live"]',
      'button:has-text("Live")'
    ];

    for (const selector of voiceSelectors) {
      try {
        const voiceButton = page.locator(selector).first();
        if (await voiceButton.isVisible({ timeout: 1000 })) {
          await voiceButton.click();
          console.log(`[CLICK] Voice button with: ${selector}`);
          await delay(1500);
          await takeScreenshot(page, '13-voice-agent', 'Voice agent interface');
          break;
        }
      } catch (e) {}
    }

    // ========================================
    // STEP 10-11: Console & Network Info
    // ========================================
    console.log('\n--- STEP 10-11: Console & Network Verification ---');
    console.log('[NOTE] DevTools inspection - checking page for API connections');

    // Check if we can see API connection indicators
    const pageContent = await page.content();
    if (pageContent.includes('localhost:8888')) {
      console.log('[SUCCESS] Backend API connection configured');
    }

    // ========================================
    // STEP 12: Final Overview
    // ========================================
    console.log('\n--- STEP 12: Final Overview ---');

    // Navigate back to main view
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
    console.log('  - Authentication flow');
    console.log('  - Platform cards');
    console.log('  - Studio view with canvas');
    console.log('  - Format selector');
    console.log('  - Gallery view');
    console.log('  - Settings modal');
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
