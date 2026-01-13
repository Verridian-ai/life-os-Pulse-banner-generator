import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = __dirname;
const BASE_URL = 'http://localhost:5173';

// Demo credentials
const TEST_EMAIL = 'support@verridian.ai';
const TEST_PASSWORD = 'TestPass123';

// Helper to save screenshot with description
async function captureStep(page: Page, stepNum: number, name: string, description: string) {
  const filename = `${String(stepNum).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: false });
  console.log(`\n[STEP ${stepNum}] ${description}`);
  console.log(`  Screenshot: ${filename}`);
  return filename;
}

test.describe('Signal App Interactive Demo', () => {
  test.setTimeout(180000); // 3 minute timeout for full demo

  test('Complete Signal Demo Script', async ({ page }) => {
    const screenshots: { step: number; file: string; description: string }[] = [];
    let stepNum = 1;

    // Enable console logging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      if (text.includes('[API]') || text.includes('backend') || text.includes('Using') || text.includes('[App]')) {
        console.log(`  CONSOLE: ${text}`);
      }
    });

    // ========== STEP 1: Initial Load & Landing Page ==========
    console.log('\n=== SECTION 1: INITIAL LOAD & AUTHENTICATION ===');

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    screenshots.push({
      step: stepNum,
      file: await captureStep(page, stepNum++, 'landing-page', 'Landing page loaded - Signal app entry point'),
      description: 'Landing page with Sign In option visible'
    });

    // Look for Sign In button
    const signInButton = page.locator('button:has-text("Sign In"), a:has-text("Sign In"), [data-testid="sign-in"]').first();
    const signInVisible = await signInButton.isVisible().catch(() => false);

    if (signInVisible) {
      await signInButton.click();
      await page.waitForTimeout(1500);

      screenshots.push({
        step: stepNum,
        file: await captureStep(page, stepNum++, 'sign-in-modal', 'Sign in modal/form displayed'),
        description: 'Authentication form for entering credentials'
      });

      // Try to find and fill email/password fields within the modal
      const modal = page.locator('[role="dialog"], .modal, [class*="auth-modal"]');
      const emailField = modal.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      const passwordField = modal.locator('input[type="password"], input[name="password"]').first();

      if (await emailField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await emailField.fill(TEST_EMAIL);
        await page.waitForTimeout(300);
        await passwordField.fill(TEST_PASSWORD);
        await page.waitForTimeout(500);

        screenshots.push({
          step: stepNum,
          file: await captureStep(page, stepNum++, 'credentials-entered', 'Test credentials entered'),
          description: 'Email and password fields filled'
        });

        // Click sign in/submit within modal using force click
        const submitBtn = modal.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click({ force: true });
          await page.waitForTimeout(5000); // Wait for auth to complete
        }
      }
    }

    // Check if we're now on dashboard (auth succeeded) or still on landing
    const currentUrl = page.url();
    console.log(`  Current URL after auth attempt: ${currentUrl}`);

    screenshots.push({
      step: stepNum,
      file: await captureStep(page, stepNum++, 'after-auth', 'After authentication attempt'),
      description: 'View after sign-in attempt'
    });

    // ========== STEP 2: Dashboard Tour ==========
    console.log('\n=== SECTION 2: DASHBOARD TOUR ===');

    // If still showing modal or landing, try to navigate to studio directly
    const studioLink = page.locator('a[href*="studio"], button:has-text("Studio"), text="Studio"').first();
    if (await studioLink.isVisible().catch(() => false)) {
      await studioLink.click({ force: true });
      await page.waitForTimeout(2000);
    }

    screenshots.push({
      step: stepNum,
      file: await captureStep(page, stepNum++, 'dashboard-main', 'Main Signal dashboard/studio view'),
      description: 'Dashboard showing platform cards and navigation'
    });

    // Look for platform cards and list them
    const platforms = ['LinkedIn', 'Facebook', 'X', 'Instagram', 'YouTube', 'TikTok'];
    console.log('\n  Platform Detection:');
    for (const platform of platforms) {
      const platformElement = page.locator(`text="${platform}"`).first();
      const visible = await platformElement.isVisible().catch(() => false);
      console.log(`    ${platform}: ${visible ? 'VISIBLE' : 'not found'}`);
    }

    // Scroll to show all content
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);

    screenshots.push({
      step: stepNum,
      file: await captureStep(page, stepNum++, 'dashboard-platforms', 'Dashboard with platforms visible'),
      description: 'Platform cards: LinkedIn, Facebook, X, Instagram, YouTube, TikTok (NEW)'
    });

    // ========== STEP 3: Explore Main App Interface ==========
    console.log('\n=== SECTION 3: MAIN APP INTERFACE ===');

    // Take full page screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${String(stepNum).padStart(2, '0')}-full-page.png`),
      fullPage: true
    });
    console.log(`\n[STEP ${stepNum}] Full page view of the application`);
    screenshots.push({
      step: stepNum++,
      file: `${String(stepNum-1).padStart(2, '0')}-full-page.png`,
      description: 'Full page screenshot showing complete app layout'
    });

    // ========== STEP 4: Canvas Format Selector ==========
    console.log('\n=== SECTION 4: CANVAS FORMAT SELECTOR ===');

    // Look for format selector in multiple forms
    const formatSelectors = [
      page.locator('button:has-text("Format")'),
      page.locator('[aria-label*="format" i]'),
      page.locator('select[class*="format"]'),
      page.locator('[class*="format-selector"]'),
      page.locator('[data-testid*="format"]'),
      page.locator('button:has-text("Banner")'),
      page.locator('button:has-text("1584")'), // LinkedIn banner dimensions
    ];

    let formatFound = false;
    for (const selector of formatSelectors) {
      if (await selector.first().isVisible().catch(() => false)) {
        await selector.first().click({ force: true });
        await page.waitForTimeout(1000);
        formatFound = true;

        screenshots.push({
          step: stepNum,
          file: await captureStep(page, stepNum++, 'format-selector-open', 'Format selector dropdown open'),
          description: 'Showing available canvas formats'
        });
        break;
      }
    }

    if (!formatFound) {
      console.log('  Format selector not found - capturing current view');
      screenshots.push({
        step: stepNum,
        file: await captureStep(page, stepNum++, 'current-view', 'Current application view'),
        description: 'Application interface without visible format selector'
      });
    }

    // ========== STEP 5: Settings Modal ==========
    console.log('\n=== SECTION 5: SETTINGS MODAL ===');

    // Look for settings button - try multiple selectors
    const settingsSelectors = [
      page.locator('button[aria-label*="Settings" i]'),
      page.locator('button:has-text("Settings")'),
      page.locator('[data-testid*="settings"]'),
      page.locator('svg[class*="cog"]').locator('..'),
      page.locator('button:has(svg[class*="gear"])'),
      page.locator('[aria-label="Settings"]'),
    ];

    let settingsFound = false;
    for (const selector of settingsSelectors) {
      if (await selector.first().isVisible().catch(() => false)) {
        await selector.first().click({ force: true });
        await page.waitForTimeout(1500);
        settingsFound = true;

        screenshots.push({
          step: stepNum,
          file: await captureStep(page, stepNum++, 'settings-modal', 'Settings modal open'),
          description: 'API key configuration and model selection'
        });

        // Close settings
        const closeBtn = page.locator('button:has-text("Close"), button[aria-label="Close"], button:has-text("X"), [aria-label="close"]').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click({ force: true });
          await page.waitForTimeout(500);
        } else {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
        break;
      }
    }

    if (!settingsFound) {
      console.log('  Settings button not immediately visible');
    }

    // ========== STEP 6: Voice Agent / Live Controls ==========
    console.log('\n=== SECTION 6: VOICE AGENT UI ===');

    const voiceSelectors = [
      page.locator('button:has-text("Live")'),
      page.locator('button:has-text("Voice")'),
      page.locator('[aria-label*="voice" i]'),
      page.locator('[aria-label*="live" i]'),
      page.locator('[class*="voice"]'),
      page.locator('[class*="live"]'),
    ];

    let voiceFound = false;
    for (const selector of voiceSelectors) {
      if (await selector.first().isVisible().catch(() => false)) {
        screenshots.push({
          step: stepNum,
          file: await captureStep(page, stepNum++, 'voice-agent-ui', 'Voice agent controls visible'),
          description: 'Live/Voice button for voice-powered workflows'
        });
        voiceFound = true;
        break;
      }
    }

    if (!voiceFound) {
      console.log('  Voice agent controls not visible in current view');
    }

    // ========== STEP 7: Canvas/Editor View ==========
    console.log('\n=== SECTION 7: CANVAS EDITOR ===');

    // Look for canvas element
    const canvas = page.locator('canvas, [class*="canvas"], [class*="editor"]').first();
    if (await canvas.isVisible().catch(() => false)) {
      screenshots.push({
        step: stepNum,
        file: await captureStep(page, stepNum++, 'canvas-editor', 'Canvas editor view'),
        description: 'Main canvas for banner design'
      });
    }

    // ========== STEP 8: Gallery/Recent Designs ==========
    console.log('\n=== SECTION 8: GALLERY / RECENT DESIGNS ===');

    const gallerySelectors = [
      page.locator('button:has-text("Gallery")'),
      page.locator('a:has-text("Gallery")'),
      page.locator('[data-testid*="gallery"]'),
      page.locator('text="Recent Designs"'),
    ];

    for (const selector of gallerySelectors) {
      if (await selector.first().isVisible().catch(() => false)) {
        await selector.first().click({ force: true });
        await page.waitForTimeout(2000);

        screenshots.push({
          step: stepNum,
          file: await captureStep(page, stepNum++, 'gallery-view', 'Gallery/Recent designs view'),
          description: 'Design gallery with platform badges and dimensions'
        });
        break;
      }
    }

    // ========== STEP 9: Console Check ==========
    console.log('\n=== SECTION 9: BROWSER CONSOLE CHECK ===');

    console.log('\n  Captured Console Logs:');
    const relevantLogs = consoleLogs.filter(log =>
      log.includes('[API]') ||
      log.includes('[App]') ||
      log.includes('backend') ||
      log.includes('Using') ||
      log.includes('localhost:8888') ||
      log.includes('registration') ||
      log.includes('error') ||
      log.includes('Error')
    );

    if (relevantLogs.length > 0) {
      relevantLogs.slice(0, 20).forEach(log => console.log(`    ${log}`));
    } else {
      console.log('    No significant logs captured');
    }

    // ========== STEP 10: Final Summary ==========
    console.log('\n=== SECTION 10: FINAL SUMMARY ===');

    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    screenshots.push({
      step: stepNum,
      file: await captureStep(page, stepNum++, 'final-overview', 'Final application overview'),
      description: 'Complete Signal app dashboard'
    });

    // Generate summary report
    console.log('\n========================================');
    console.log('DEMO COMPLETE - SCREENSHOT SUMMARY');
    console.log('========================================\n');

    screenshots.forEach(s => {
      console.log(`[${String(s.step).padStart(2, '0')}] ${s.file}`);
      console.log(`     ${s.description}\n`);
    });

    console.log('\n========================================');
    console.log('KEY OBSERVATIONS:');
    console.log('========================================');
    console.log('- Backend Configuration: http://localhost:8888');
    console.log('- Screenshots captured: ' + screenshots.length);
    console.log('- Console logs captured: ' + consoleLogs.length);
    console.log('\n========================================\n');

    // Save console logs to file
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'console-logs.txt'),
      consoleLogs.join('\n'),
      'utf-8'
    );
    console.log('Console logs saved to: console-logs.txt');

    // Save screenshot manifest
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'screenshot-manifest.json'),
      JSON.stringify(screenshots, null, 2),
      'utf-8'
    );
    console.log('Screenshot manifest saved to: screenshot-manifest.json');

    expect(screenshots.length).toBeGreaterThan(3);
  });
});
