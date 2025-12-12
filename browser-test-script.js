/**
 * NanoBanna Pro - Comprehensive Image Generation Test Suite
 *
 * HOW TO USE:
 * 1. Open http://localhost:3002/ in Chrome
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 * 6. Follow the prompts in the console
 */

(function NanoBannaImageGenTest() {
    'use strict';

    const TEST_PROMPTS = {
        basic: "Professional LinkedIn banner with blue gradient background",
        complex: "Modern tech startup office with large windows, city skyline view, clean minimalist design with geometric patterns",
        creative: "Abstract art with flowing colors in purple, blue and gold, professional aesthetic suitable for LinkedIn"
    };

    // State tracking
    const testState = {
        logs: [],
        errors: [],
        screenshots: [],
        startTime: null,
        currentTest: null
    };

    // Console log interceptor
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    function interceptLogs() {
        console.log = function(...args) {
            const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            if (message.includes('[Image Gen]') || message.includes('[App]') || message.includes('[Image Edit]')) {
                testState.logs.push({
                    type: 'log',
                    time: new Date().toISOString(),
                    message: message
                });
            }
            originalLog.apply(console, args);
        };

        console.error = function(...args) {
            const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            testState.errors.push({
                type: 'error',
                time: new Date().toISOString(),
                message: message
            });
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            if (message.includes('[Image Gen]') || message.includes('[App]')) {
                testState.logs.push({
                    type: 'warn',
                    time: new Date().toISOString(),
                    message: message
                });
            }
            originalWarn.apply(console, args);
        };
    }

    function restoreLogs() {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
    }

    // UI Helpers
    function findElement(selectors) {
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) return el;
        }
        return null;
    }

    function findButtonByText(text) {
        return Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent.toLowerCase().includes(text.toLowerCase())
        );
    }

    function findTextareaByPlaceholder(placeholder) {
        return Array.from(document.querySelectorAll('textarea')).find(t =>
            t.placeholder.toLowerCase().includes(placeholder.toLowerCase())
        );
    }

    // Test helpers
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function printSection(title) {
        console.log('\n' + '='.repeat(50));
        console.log(title);
        console.log('='.repeat(50));
    }

    function printSubSection(title) {
        console.log('\n--- ' + title + ' ---');
    }

    // Settings check
    function checkSettings() {
        printSubSection('Current Settings');

        const settings = {
            provider: localStorage.getItem('llm_provider') || 'gemini (default)',
            imageModel: localStorage.getItem('llm_image_model') || 'gemini-3-pro-image-preview (default)',
            hasGeminiKey: !!localStorage.getItem('gemini_api_key'),
            hasReplicateKey: !!localStorage.getItem('replicate_api_key'),
            hasOpenRouterKey: !!localStorage.getItem('openrouter_api_key'),
            lastFallback: localStorage.getItem('llm_image_fallback') || 'none'
        };

        console.table(settings);

        if (!settings.hasGeminiKey) {
            console.warn('WARNING: No Gemini API key found. Image generation will fail.');
            console.log('Go to Settings (gear icon) to add your API key.');
        }

        return settings;
    }

    // UI Element check
    function checkUIElements() {
        printSubSection('UI Elements Check');

        const elements = {
            studioTab: !!findButtonByText('studio'),
            generateButton: !!findButtonByText('generate background'),
            promptTextarea: !!findTextareaByPlaceholder('vision'),
            resolution1K: !!findButtonByText('1k'),
            resolution2K: !!findButtonByText('2k'),
            resolution4K: !!findButtonByText('4k'),
            magicEditTextarea: !!findTextareaByPlaceholder('laptop'),
            magicEditButton: !!findButtonByText('magic edit'),
            removeBgButton: !!findButtonByText('remove bg'),
            upscaleButton: !!findButtonByText('upscale')
        };

        console.table(elements);

        const missing = Object.entries(elements).filter(([k, v]) => !v).map(([k]) => k);
        if (missing.length > 0) {
            console.warn('Missing UI elements:', missing.join(', '));
        } else {
            console.log('All UI elements found!');
        }

        return elements;
    }

    // Test: Empty prompt
    async function testEmptyPrompt() {
        printSubSection('Test: Empty Prompt Handling');
        testState.currentTest = 'emptyPrompt';

        const textarea = findTextareaByPlaceholder('vision');
        const generateBtn = findButtonByText('generate background');

        if (!textarea || !generateBtn) {
            console.error('Cannot find required elements');
            return false;
        }

        // Clear textarea
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await delay(100);

        // Click generate
        generateBtn.click();
        await delay(500);

        // Check for warning notification
        const notification = document.querySelector('[class*="notification"]') ||
                            document.querySelector('.fixed.top-20');

        if (notification && notification.textContent.includes('PLEASE ENTER A PROMPT')) {
            console.log('PASS: Empty prompt warning shown correctly');
            return true;
        } else {
            console.warn('FAIL: Expected warning notification for empty prompt');
            return false;
        }
    }

    // Test: Basic generation
    async function testBasicGeneration(prompt = TEST_PROMPTS.basic, resolution = '1K') {
        printSubSection(`Test: Basic Generation (${resolution})`);
        testState.currentTest = 'basicGeneration';
        testState.startTime = Date.now();
        testState.logs = [];

        const textarea = findTextareaByPlaceholder('vision');
        const generateBtn = findButtonByText('generate background');
        const resBtn = findButtonByText(resolution.toLowerCase());

        if (!textarea || !generateBtn) {
            console.error('Cannot find required elements');
            return false;
        }

        // Set resolution if button found
        if (resBtn) {
            resBtn.click();
            await delay(100);
            console.log(`Resolution set to ${resolution}`);
        }

        // Enter prompt
        textarea.value = prompt;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('Prompt entered:', prompt.substring(0, 50) + '...');
        await delay(100);

        // Click generate
        console.log('Clicking Generate Background...');
        generateBtn.click();

        // Monitor for loading state
        await delay(500);

        if (generateBtn.textContent.includes('CREATING')) {
            console.log('PASS: Loading state detected');
        } else {
            console.warn('Note: Loading state not visible (may have completed very fast)');
        }

        // Wait for completion (max 60 seconds)
        let attempts = 0;
        const maxAttempts = 120; // 60 seconds

        while (attempts < maxAttempts) {
            await delay(500);

            const btn = findButtonByText('generate background') || findButtonByText('creating');

            if (btn && btn.textContent.includes('Generate Background')) {
                // Generation complete
                const elapsed = ((Date.now() - testState.startTime) / 1000).toFixed(1);
                console.log(`Generation completed in ${elapsed} seconds`);

                // Check for success notification
                const notification = document.querySelector('.fixed.top-20');
                if (notification) {
                    console.log('Notification:', notification.textContent.trim());
                }

                console.log('\nCaptured [Image Gen] logs:');
                testState.logs.forEach((log, i) => {
                    console.log(`  ${i + 1}. [${log.type}] ${log.message}`);
                });

                return true;
            }

            attempts++;
        }

        console.error('TIMEOUT: Generation did not complete within 60 seconds');
        return false;
    }

    // Test: Resolution switching
    async function testResolutionSwitching() {
        printSubSection('Test: Resolution Switching');

        const resolutions = ['1K', '2K', '4K'];
        const results = {};

        for (const res of resolutions) {
            const btn = findButtonByText(res.toLowerCase());
            if (btn) {
                btn.click();
                await delay(100);

                // Check if button has active styling
                const isActive = btn.className.includes('bg-zinc-700') ||
                               btn.className.includes('text-white');

                results[res] = isActive ? 'active' : 'clicked';
                console.log(`${res}: ${results[res]}`);
            } else {
                results[res] = 'not found';
                console.warn(`${res} button not found`);
            }
        }

        console.table(results);
        return results;
    }

    // Test: Fallback system
    function testFallbackConfig() {
        printSubSection('Test: Fallback Configuration');

        console.log('Fallback Chain:');
        console.log('1. gemini-3-pro-image-preview (Nano Banana Pro)');
        console.log('2. gemini-2.5-flash-image (Nano Banana)');
        console.log('3. Replicate FLUX.1-schnell');

        const currentModel = localStorage.getItem('llm_image_model') || 'gemini-3-pro-image-preview';
        console.log('\nCurrent model:', currentModel);

        if (localStorage.getItem('llm_image_fallback') === 'replicate') {
            console.warn('Note: Last generation used Replicate fallback');
        }

        console.log('\nTo test fallback manually:');
        console.log("  localStorage.setItem('llm_image_model', 'invalid-model-123')");
        console.log('  Then try generating - should trigger fallback');
    }

    // Print test report
    function printReport() {
        printSection('TEST REPORT');

        console.log('\nAll captured logs:');
        testState.logs.forEach((log, i) => {
            console.log(`${i + 1}. [${log.type}] ${log.time}: ${log.message}`);
        });

        console.log('\nAll captured errors:');
        if (testState.errors.length === 0) {
            console.log('  No errors captured');
        } else {
            testState.errors.forEach((err, i) => {
                console.log(`${i + 1}. ${err.time}: ${err.message}`);
            });
        }

        console.log('\nTest Summary:');
        console.log('  Total logs:', testState.logs.length);
        console.log('  Total errors:', testState.errors.length);
    }

    // Main test runner
    async function runTests(options = {}) {
        const {
            skipGeneration = false,
            prompt = TEST_PROMPTS.basic,
            resolution = '1K'
        } = options;

        printSection('NanoBanna Pro - Image Generation Test Suite');
        console.log('Started at:', new Date().toISOString());

        // Intercept logs
        interceptLogs();

        try {
            // 1. Check settings
            checkSettings();

            // 2. Check UI elements
            checkUIElements();

            // 3. Test empty prompt
            await testEmptyPrompt();
            await delay(2000); // Wait for notification to clear

            // 4. Test resolution switching
            await testResolutionSwitching();

            // 5. Check fallback config
            testFallbackConfig();

            // 6. Test actual generation (unless skipped)
            if (!skipGeneration) {
                console.log('\n*** Starting actual image generation test ***');
                console.log('This will make an API call. Press Ctrl+C to abort.');
                await delay(3000);

                const success = await testBasicGeneration(prompt, resolution);
                console.log('Generation test:', success ? 'PASSED' : 'FAILED');
            } else {
                console.log('\nGeneration test skipped (skipGeneration: true)');
            }

            // Print report
            printReport();

        } finally {
            // Restore original console
            restoreLogs();
        }

        console.log('\n' + '='.repeat(50));
        console.log('Tests completed at:', new Date().toISOString());
        console.log('='.repeat(50));
    }

    // Expose functions globally
    window.NanoBannaTest = {
        runTests,
        checkSettings,
        checkUIElements,
        testEmptyPrompt,
        testBasicGeneration,
        testResolutionSwitching,
        testFallbackConfig,
        printReport,
        TEST_PROMPTS,
        state: testState
    };

    // Print usage
    printSection('NanoBanna Test Suite Loaded');
    console.log('\nAvailable commands:');
    console.log('  NanoBannaTest.runTests()           - Run all tests (including generation)');
    console.log('  NanoBannaTest.runTests({ skipGeneration: true }) - Run UI tests only');
    console.log('  NanoBannaTest.checkSettings()      - Check current settings');
    console.log('  NanoBannaTest.checkUIElements()    - Check UI elements');
    console.log('  NanoBannaTest.testEmptyPrompt()    - Test empty prompt handling');
    console.log("  NanoBannaTest.testBasicGeneration('prompt', '2K') - Test generation");
    console.log('  NanoBannaTest.testResolutionSwitching() - Test resolution buttons');
    console.log('  NanoBannaTest.printReport()        - Print captured logs');
    console.log('\nTest prompts available:');
    console.log('  NanoBannaTest.TEST_PROMPTS.basic');
    console.log('  NanoBannaTest.TEST_PROMPTS.complex');
    console.log('  NanoBannaTest.TEST_PROMPTS.creative');
    console.log('\n');

})();
