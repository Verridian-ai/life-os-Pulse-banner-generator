/**
 * Pricing Section Component
 *
 * Displays pricing tiers with feature comparison.
 * Life OS Design: Glass cards with gradient highlights.
 */

import React, { useState } from 'react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    credits: 100,
    description: 'Perfect for trying out',
    features: [
      { text: '100 credits/month', included: true },
      { text: 'Basic image generation', included: true },
      { text: 'Standard templates', included: true },
      { text: 'Community support', included: true },
      { text: 'Priority generation', included: false },
      { text: 'Background removal', included: false },
      { text: 'Voice commands', included: false },
    ],
    cta: 'Start Free',
    highlighted: false,
    badge: null,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    period: '/month',
    credits: 500,
    description: 'Great for regular use',
    features: [
      { text: '500 credits/month', included: true },
      { text: 'Priority generation', included: true },
      { text: 'All templates', included: true },
      { text: 'Background removal', included: true },
      { text: 'Email support', included: true },
      { text: 'Voice commands', included: false },
      { text: 'Face enhancement', included: false },
    ],
    cta: 'Get Basic',
    highlighted: false,
    badge: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    period: '/month',
    credits: 2000,
    description: 'For power users',
    features: [
      { text: '2,000 credits/month', included: true },
      { text: 'Fastest generation', included: true },
      { text: 'All templates + exclusive', included: true },
      { text: 'All image processing', included: true },
      { text: 'Face enhancement', included: true },
      { text: 'Voice commands', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Go Premium',
    highlighted: true,
    badge: 'Most Popular',
  },
];

interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps): React.ReactElement {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (basePrice: number): number => {
    if (basePrice === 0) return 0;
    return billingPeriod === 'yearly' ? basePrice * 0.8 : basePrice;
  };

  return (
    <section className='relative py-24 sm:py-32 overflow-hidden' id='pricing'>
      {/* Background */}
      <div className='absolute inset-0 bg-zinc-950' />
      <div className='absolute top-1/4 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]' />
      <div className='absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]' />

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm'>
            <span className='material-icons text-green-400 text-sm'>local_offer</span>
            <span className='text-sm text-zinc-300'>Simple Pricing</span>
          </div>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4'>
            Choose Your
            <span className='block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'>
              Perfect Plan
            </span>
          </h2>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className='flex items-center justify-center gap-4 mb-12'>
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              billingPeriod === 'monthly'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Yearly
            <span className='px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full'>
              Save 20%
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto'>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl transition-all duration-300 ${
                plan.highlighted ? 'scale-105 z-10' : 'hover:-translate-y-1'
              }`}
            >
              {/* Glow for highlighted */}
              {plan.highlighted && (
                <div className='absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl' />
              )}

              {/* Card */}
              <div
                className={`relative h-full border rounded-3xl p-8 backdrop-blur-sm ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30'
                    : 'bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg'>
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div className='mb-6'>
                  <h3 className='text-xl font-bold text-white mb-1'>{plan.name}</h3>
                  <p className='text-sm text-zinc-400'>{plan.description}</p>
                </div>

                {/* Price */}
                <div className='mb-6'>
                  <div className='flex items-baseline gap-1'>
                    <span className='text-4xl font-black text-white'>
                      ${getPrice(plan.price).toFixed(plan.price === 0 ? 0 : 2)}
                    </span>
                    <span className='text-zinc-400'>
                      {plan.price === 0 ? '' : billingPeriod === 'yearly' ? '/mo' : plan.period}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <p className='text-xs text-zinc-500 mt-1'>
                      Billed ${(getPrice(plan.price) * 12).toFixed(2)}/year
                    </p>
                  )}
                  <p className='text-sm text-purple-400 mt-2'>
                    {plan.credits.toLocaleString()} credits
                  </p>
                </div>

                {/* Features */}
                <ul className='space-y-3 mb-8'>
                  {plan.features.map((feature, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm'>
                      <span
                        className={`material-icons text-lg shrink-0 ${
                          feature.included ? 'text-green-400' : 'text-zinc-600'
                        }`}
                      >
                        {feature.included ? 'check_circle' : 'remove_circle_outline'}
                      </span>
                      <span className={feature.included ? 'text-zinc-300' : 'text-zinc-600'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => onSelectPlan?.(plan.id)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25'
                      : plan.id === 'free'
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                        : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className='text-center text-sm text-zinc-500 mt-10'>
          All plans include a 14-day money-back guarantee. Cancel anytime.
        </p>
      </div>

      {/* Accessibility */}
      <style>{`
                @media (prefers-contrast: more) {
                    button:focus {
                        outline: 3px solid white;
                        outline-offset: 2px;
                    }
                }
                @media (forced-colors: active) {
                    .bg-gradient-to-r {
                        background: ButtonFace !important;
                        color: ButtonText !important;
                        border: 2px solid ButtonText !important;
                    }
                }
            `}</style>
    </section>
  );
}
