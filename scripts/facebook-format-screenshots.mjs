/**
 * Facebook Format Screenshot Script
 *
 * Takes screenshots of all Facebook canvas formats in the app.
 * Run with: node scripts/facebook-format-screenshots.mjs
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    slowMo: 300
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '00-landing-page.png'),
      fullPage: false
    });
    console.log('Captured landing page');

    // Look for Facebook platform card
    console.log('Looking for Facebook entry point...');

    // Check page content
    const pageContent = await page.content();
    console.log('Page has Facebook mention:', pageContent.includes('Facebook'));

    // Take screenshot of current state
    await page.screenshot({
      path: path.join(screenshotDir, '01-initial-state.png'),
      fullPage: false
    });

    // Try to find Facebook card/button
    const facebookElement = await page.locator('text=Facebook').first();
    if (await facebookElement.count() > 0) {
      console.log('Found Facebook text element, clicking...');
      await facebookElement.click();
      await page.waitForTimeout(2000);
    } else {
      // Try direct navigation
      console.log('No Facebook element found, trying direct URLs...');

      // Try /facebook route first
      await page.goto('http://localhost:5173/facebook', { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // Check if we got redirected or landed on 404
      const url = page.url();
      console.log('Current URL after /facebook:', url);

      if (url.includes('404') || !(await page.locator('canvas, [data-testid="canvas"]').count())) {
        // Try studio route
        await page.goto('http://localhost:5173/studio/facebook', { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(1000);
        console.log('Current URL after /studio/facebook:', page.url());
      }
    }

    // Take screenshot of current state
    await page.screenshot({
      path: path.join(screenshotDir, '02-after-navigation.png'),
      fullPage: false
    });

    // Check for auth wall or skip button
    const skipButton = await page.locator('button:has-text("Skip"), button:has-text("Continue as Guest"), a:has-text("Skip")').first();
    if (await skipButton.count() > 0) {
      console.log('Found Skip/Guest button, clicking...');
      await skipButton.click();
      await page.waitForTimeout(1500);
    }

    // Now try to find the format selector
    console.log('\nLooking for format selector...');

    // Log all buttons on page for debugging
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      const text = await buttons[i].textContent();
      if (text && text.trim()) {
        console.log(`  Button ${i}: "${text.trim().substring(0, 50)}"`);
      }
    }

    // Try to find and click format dropdown
    const formatDropdown = await page.locator('button:has-text("Cover"), button:has-text("Story"), button:has-text("Post"), button:has-text("Format"), [data-testid="format-selector"]').first();
    if (await formatDropdown.count() > 0) {
      console.log('Found format dropdown');
      await formatDropdown.click();
      await page.waitForTimeout(500);

      // Screenshot the dropdown open
      await page.screenshot({
        path: path.join(screenshotDir, '03-format-dropdown-open.png'),
        fullPage: false
      });
    }

    // Now iterate through each format
    for (const format of FACEBOOK_FORMATS) {
      console.log(`\n=== Processing ${format.name} (${format.id}) ===`);
      console.log(`Expected: ${format.width}x${format.height} (${format.aspectRatio})`);

      // Try to click on this format option
      const formatOption = await page.locator(`text="${format.name}", [data-format="${format.id}"], button:has-text("${format.name}")`).first();

      if (await formatOption.count() > 0) {
        await formatOption.click();
        console.log(`Clicked on ${format.name}`);
        await page.waitForTimeout(1500);
      } else {
        // Try opening dropdown first
        const dropdown = await page.locator('button[aria-haspopup], select, [role="combobox"]').first();
        if (await dropdown.count() > 0) {
          await dropdown.click();
          await page.waitForTimeout(500);

          // Now look for option
          const option = await page.locator(`[role="option"]:has-text("${format.name}"), li:has-text("${format.name}"), option:has-text("${format.name}")`).first();
          if (await option.count() > 0) {
            await option.click();
            console.log(`Selected ${format.name} from dropdown`);
            await page.waitForTimeout(1500);
          }
        }
      }

      // Take screenshot
      const filename = `fb-${format.id.replace('facebook_', '')}.png`;
      await page.screenshot({
        path: path.join(screenshotDir, filename),
        fullPage: false
      });
      console.log(`Saved: ${filename}`);

      // Try to toggle safe zones ON
      const safeZonesToggle = await page.locator('button:has-text("Safe Zones"), label:has-text("Safe Zones"), input[type="checkbox"]').first();
      if (await safeZonesToggle.count() > 0) {
        // Check if already on by looking at state
        await safeZonesToggle.click();
        await page.waitForTimeout(800);

        const safeFilename = `fb-${format.id.replace('facebook_', '')}-safezones.png`;
        await page.screenshot({
          path: path.join(screenshotDir, safeFilename),
          fullPage: false
        });
        console.log(`Saved: ${safeFilename}`);

        // Toggle back
        await safeZonesToggle.click();
        await page.waitForTimeout(300);
      }

      // Special check for facebook_cover profile overlay
      if (format.hasProfileOverlay) {
        console.log('Checking for 176px profile overlay...');
        const profileOverlay = await page.locator('[data-testid="profile-overlay"], .profile-overlay, text="176"').first();
        if (await profileOverlay.count() > 0) {
          console.log('Profile overlay found!');
        } else {
          console.log('Profile overlay NOT found - may need to check manually');
        }
      }
    }

    console.log('\n=== Screenshot capture complete ===');
    console.log(`Screenshots saved to: ${screenshotDir}`);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({
      path: path.join(screenshotDir, 'error-state.png'),
      fullPage: false
    });
  } finally {
    // Keep browser open for 5 seconds to inspect
    console.log('\nClosing browser in 3 seconds...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

main().catch(console.error);
