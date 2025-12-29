/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        screens: {
            // Extra small phones (iPhone 5/SE 1st gen, legacy devices, WCAG accessibility min)
            'xs': '320px',
            // Small phones (Samsung Galaxy S series, budget Android)
            'sm': '360px',
            // Standard phones (iPhone 6/7/8/SE, iPhone 12/13/14)
            'mobile': '375px',
            // Modern phones (iPhone 14/15 Pro, Pixel, Xiaomi)
            'phone': '393px',
            // Large phones (iPhone Plus/Max variants, phablets)
            'phablet': '428px',
            // Small tablets (iPad Mini, Fire tablets, Android tablets portrait)
            'tablet-sm': '600px',
            // Tablets (iPad standard, Android tablets)
            'md': '768px',
            // iPad Air/Pro 11" portrait
            'tablet': '834px',
            // Small desktops, tablets landscape (1366x768 laptops)
            'lg': '1024px',
            // iPad Pro 12.9" landscape
            'tablet-lg': '1194px',
            // Medium desktops (standard laptops)
            'xl': '1280px',
            // Large desktops (high-res laptops, QHD monitors)
            '2xl': '1440px',
            // MacBook Pro 14"
            'laptop': '1512px',
            // Extra large desktops (Full HD monitors)
            '3xl': '1920px',
            // 4K and ultrawide monitors
            '4xl': '2560px',
        },
        extend: {
            // Safe area insets for notched devices (iPhone X+)
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            // Max content widths for readability
            maxWidth: {
                'readable': '65ch',
                'content': '1280px',
                'content-lg': '1440px',
            },
            // Device-optimized font sizes
            fontSize: {
                'xs-mobile': ['0.625rem', { lineHeight: '1rem' }],    // 10px
                'sm-mobile': ['0.75rem', { lineHeight: '1.125rem' }], // 12px
                'base-mobile': ['0.875rem', { lineHeight: '1.375rem' }], // 14px
            },
            // Touch-friendly minimum sizes (44px = Apple, 48px = Google recommendation)
            minWidth: {
                'touch': '44px',
                'touch-lg': '48px',
            },
            minHeight: {
                'touch': '44px',
                'touch-lg': '48px',
            },
            // Blur budget (performance optimization)
            backdropBlur: {
                'xs': '4px',
                'mobile': '12px',  // Mobile max for performance
                'desktop': '20px', // Desktop standard
                'max': '40px',     // Desktop max
            },
            // Animation utilities
            transitionProperty: {
                'safe': 'opacity, transform, color, background-color, border-color',
            },
        },
    },
    plugins: [],
}
