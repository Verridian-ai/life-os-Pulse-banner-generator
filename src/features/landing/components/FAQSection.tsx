/**
 * FAQ Section Component
 *
 * Frequently asked questions with accordion.
 * Life OS Design: Collapsible cards with smooth animations.
 */

import React, { useState } from 'react';

const FAQS = [
    {
        question: 'How does the AI image generation work?',
        answer:
            'Our platform uses multiple state-of-the-art AI models including Gemini, GPT, and specialized image models. Simply describe what you want in natural language, and our AI will generate professional-quality banner designs tailored to your specifications.',
    },
    {
        question: 'What are credits and how do they work?',
        answer:
            'Credits are our usage currency. Each generation or edit uses a certain number of credits based on complexity. Basic generations use 1-5 credits, while advanced edits like face enhancement use 5-10 credits. Credits refresh monthly with your plan.',
    },
    {
        question: 'Can I use the generated images commercially?',
        answer:
            'Yes! All images generated through our platform are yours to use commercially. This includes using them for your business profiles, marketing materials, client work, and more. We recommend reviewing AI-generated content guidelines for your specific use case.',
    },
    {
        question: 'What platforms are supported?',
        answer:
            'We support all major social media platforms including LinkedIn, YouTube, Instagram, Facebook, TikTok, and X (Twitter). Each platform has optimized templates with the correct dimensions and safe zones for profile elements.',
    },
    {
        question: 'How do voice commands work?',
        answer:
            'Voice commands use advanced speech recognition to understand your design requests. Simply speak naturally to generate images, add text, remove backgrounds, and more. This feature requires a Premium plan and works best in Chrome or Edge browsers.',
    },
    {
        question: 'Can I cancel my subscription anytime?',
        answer:
            "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access to your plan features until the end of your billing period. We also offer a 14-day money-back guarantee for new subscribers.",
    },
    {
        question: 'Is my data and content secure?',
        answer:
            "Security is our top priority. We use enterprise-grade encryption for all data in transit and at rest. Your designs and personal information are never shared or used to train AI models. We're compliant with GDPR and SOC 2 standards.",
    },
    {
        question: 'Do you offer team or enterprise plans?',
        answer:
            "Yes! We offer custom enterprise solutions with features like SSO, dedicated support, custom integrations, and volume pricing. Contact our sales team to discuss your organization's needs.",
    },
];

export function FAQSection(): React.ReactElement {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative py-24 sm:py-32 overflow-hidden" id="faq">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[120px]" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
                        <span className="material-icons text-yellow-400 text-sm">help</span>
                        <span className="text-sm text-zinc-300">FAQ</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                        Frequently Asked
                        <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h2>
                    <p className="text-lg text-zinc-400">
                        Everything you need to know about Nanobanna.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition"
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-answer-${index}`}
                            >
                                <span className="font-semibold text-white pr-4">{faq.question}</span>
                                <span
                                    className={`material-icons text-zinc-400 transition-transform duration-300 shrink-0 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                >
                                    expand_more
                                </span>
                            </button>
                            <div
                                id={`faq-answer-${index}`}
                                className={`overflow-hidden transition-all duration-300 ${
                                    openIndex === index ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-5 text-zinc-400 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="text-center mt-12">
                    <p className="text-zinc-500 mb-4">Still have questions?</p>
                    <a
                        href="mailto:support@nanobanna.ai"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition"
                    >
                        <span className="material-icons">mail</span>
                        Contact Support
                    </a>
                </div>
            </div>

            {/* Accessibility */}
            <style>{`
                @media (prefers-contrast: more) {
                    button {
                        border: 1px solid white !important;
                    }
                    button:focus {
                        outline: 3px solid white;
                        outline-offset: 2px;
                    }
                }
                @media (forced-colors: active) {
                    button {
                        border: 2px solid ButtonText !important;
                    }
                }
            `}</style>
        </section>
    );
}
