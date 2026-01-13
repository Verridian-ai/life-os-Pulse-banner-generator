/**
 * Facebook Format Screenshot Script
 *
 * Takes screenshots of all Facebook canvas formats in the app.
 * Run with: npx playwright test scripts/facebook-format-screenshots.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FACEBOOK_FORMATS = [
  { id: 'facebook_story', name: 'Facebook Story', width: 1080, height: 1920, aspectRatio: '9:16' },
  { id: 'facebook_post', name: 'Facebook Post', width: 1200, height: 630, aspectRatio: '1.91:1' },
  { id: 'facebook_cover', name: 'Facebook Cover', width: 851, height: 315, aspectRatio: '2.7:1', hasProfileOverlay: true },
  { id: 'facebook_event', name: 'Facebook Event Cover', width: 1920, height: 1005, aspectRatio: '1.91:1' },
  { id: 'facebook_group', name: 'Facebook Group Cover', width: 1640, height: 856, aspectRatio: '1.91:1' },
];

async function main() {
  const screenshotDir = path.join(__dirname, '..', 'demo-screenshots');

  // Ensure screenshot directory exists
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false, // Show the browser for debugging
    slowMo: 500 // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '00-landing-page.png'),
      fullPage: false
    });
    console.log('Captured landing page');

    // Look for Facebook platform card or navigation to Facebook Studio
    console.log('Looking for Facebook entry point...');

    // Try different selectors for Facebook
    const facebookSelectors = [
      'text=Facebook',
      '[data-platform="facebook"]',
      'button:has-text("Facebook")',
      'a:has-text("Facebook")',
      '.platform-card:has-text("Facebook")',
      '[href*="facebook"]',
    ];

    let foundFacebook = false;
    for (const selector of facebookSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`Found Facebook element with selector: ${selector}`);
        await element.click();
        foundFacebook = true;
        await page.waitForTimeout(2000);
        break;
      }
    }

    if (!foundFacebook) {
      // Try navigating directly to Facebook studio
      console.log('Trying direct navigation to /studio/facebook...');
      await page.goto('http://localhost:5173/studio/facebook', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }

    // Take screenshot after Facebook navigation
    await page.screenshot({
      path: path.join(screenshotDir, '01-facebook-studio-initial.png'),
      fullPage: false
    });
    console.log('Captured Facebook studio initial view');

    // Check if there's an auth wall
    const skipButton = await page.$('button:has-text("Skip")');
    if (skipButton) {
      console.log('Found Skip button, clicking...');
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for format selector dropdown
    const formatSelectors = [
      '[data-testid="format-selector"]',
      'select[name="format"]',
      '.format-selector',
      'button:has-text("Format")',
      '[aria-label*="format"]',
      'button:has-text("Cover")',
      'button:has-text("Story")',
    ];

    // Now iterate through each format
    for (const format of FACEBOOK_FORMATS) {
      console.log(`\n--- Processing ${format.name} (${format.id}) ---`);
      console.log(`Expected dimensions: ${format.width}x${format.height} (${format.aspectRatio})`);

      // Try to select this format
      const formatSelectAttempts = [
        `button:has-text("${format.name}")`,
        `[data-format="${format.id}"]`,
        `option:has-text("${format.name}")`,
        `li:has-text("${format.name}")`,
        `text=${format.name}`,
      ];

      let formatSelected = false;

      // First try to open a dropdown if exists
      const dropdownTriggers = await page.$$('button[aria-haspopup="listbox"], button[aria-haspopup="menu"], select');
      for (const trigger of dropdownTriggers) {
        const text = await trigger.textContent();
        if (text && (text.includes('Format') || text.includes('facebook') || text.includes('Cover') || text.includes('Story') || text.includes('Post'))) {
          await trigger.click();
          await page.waitForTimeout(500);
          break;
        }
      }

      for (const selector of formatSelectAttempts) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            formatSelected = true;
            console.log(`Selected format using: ${selector}`);
            await page.waitForTimeout(1500);
            break;
          }
        } catch (e) {
          // Continue trying other selectors
        }
      }

      // Take screenshot
      const filename = `facebook-${format.id.replace('facebook_', '')}.png`;
      await page.screenshot({
        path: path.join(screenshotDir, filename),
        fullPage: false
      });
      console.log(`Saved screenshot: ${filename}`);

      // Try to toggle safe zones ON
      const safeZoneSelectors = [
        'button:has-text("Safe Zones")',
        'input[name="safeZones"]',
        '[data-testid="safe-zones-toggle"]',
        'label:has-text("Safe Zones")',
        'text=Safe Zones',
      ];

      for (const selector of safeZoneSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            console.log('Toggled Safe Zones');
            await page.waitForTimeout(1000);

            // Take screenshot with safe zones
            const safeFilename = `facebook-${format.id.replace('facebook_', '')}-safezones.png`;
            await page.screenshot({
              path: path.join(screenshotDir, safeFilename),
              fullPage: false
            });
            console.log(`Saved screenshot with safe zones: ${safeFilename}`);

            // Toggle off for next iteration
            await element.click();
            await page.waitForTimeout(500);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }

    console.log('\n=== Screenshot capture complete ===');
    console.log(`Screenshots saved to: ${screenshotDir}`);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({
      path: path.join(screenshotDir, 'error-state.png'),
      fullPage: false
    });
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
