// A/B Testing Panel - Generate and compare design variants

import React, { useState } from 'react';
import { generateImage } from '../../services/llm';
import type { BrandProfile } from '../../types/ai';

interface ABTestingPanelProps {
  basePrompt: string;
  referenceImages: string[];
  brandProfile: BrandProfile | null;
  onSelectVariant: (variant: string) => void;
}

interface Variant {
  id: string;
  image: string;
  prompt: string;
  style: string;
}

export const ABTestingPanel: React.FC<ABTestingPanelProps> = ({
  basePrompt,
  referenceImages,
  brandProfile: _brandProfile,
  onSelectVariant,
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [variantCount, setVariantCount] = useState<3 | 5>(3);

  const styleVariations = [
    { name: 'Cool Blue', modifier: 'with cool blue tones and professional atmosphere' },
    { name: 'Warm Orange', modifier: 'with warm orange accents and energetic feel' },
    { name: 'Minimalist', modifier: 'minimalist style with clean lines and negative space' },
    { name: 'Bold & Vibrant', modifier: 'bold and vibrant with strong contrast' },
    { name: 'Corporate', modifier: 'professional corporate style with subtle elegance' },
  ];

  const generateVariants = async () => {
    if (!basePrompt) {
      alert('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);
    setVariants([]);
    setSelectedVariant(null);

    try {
      const selectedStyles = styleVariations.slice(0, variantCount);
      const generatedVariants: Variant[] = [];

      for (const style of selectedStyles) {
        try {
          const variantPrompt = `${basePrompt} ${style.modifier}`;
          const image = await generateImage(
            variantPrompt,
            referenceImages,
            '2K',
            [] // No edit history for variants
          );

          generatedVariants.push({
            id: `variant-${Date.now()}-${style.name}`,
            image,
            prompt: variantPrompt,
            style: style.name,
          });

          // Update UI progressively
          setVariants([...generatedVariants]);
        } catch (error) {
          console.error(`Failed to generate ${style.name} variant:`, error);
        }
      }
    } catch (error: unknown) {
      alert(`Failed to generate variants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariant(variantId);
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      onSelectVariant(variant.image);
    }
  };

  const handleDownloadVariant = (variant: Variant) => {
    const link = document.createElement('a');
    link.href = variant.image;
    link.download = `${variant.style.toLowerCase().replace(/\s+/g, '-')}-variant.png`;
    link.click();
  };

  const handleClearVariants = () => {
    if (confirm('Clear all variants?')) {
      setVariants([]);
      setSelectedVariant(null);
    }
  };

  return (
    <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
      <h4 className="text-xs font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
        <span className="material-icons text-sm">compare</span>
        A/B Testing
      </h4>

      {/* Control Panel */}
      <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
        <label className="text-[10px] text-zinc-500 mb-2 block font-bold">VARIANT COUNT</label>
        <div className="flex gap-2 mb-4">
          {[3, 5].map((count) => (
            <button
              key={count}
              onClick={() => setVariantCount(count as 3 | 5)}
              disabled={isGenerating}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition ${
                variantCount === count
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {count} Variants
            </button>
          ))}
        </div>

        <button
          onClick={generateVariants}
          disabled={isGenerating || !basePrompt}
          className="w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating {variants.length}/{variantCount}...
            </>
          ) : (
            <>
              <span className="material-icons text-base">auto_awesome</span>
              Generate {variantCount} Variants
            </>
          )}
        </button>

        {variants.length > 0 && (
          <button
            onClick={handleClearVariants}
            className="w-full mt-2 bg-red-900/50 hover:bg-red-900/70 text-red-300 font-bold py-2 px-4 rounded-lg transition text-xs"
          >
            Clear All Variants
          </button>
        )}
      </div>

      {/* Variants Grid */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition ${
                  selectedVariant === variant.id
                    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                    : 'border-white/10 hover:border-white/30'
                }`}
                onClick={() => handleSelectVariant(variant.id)}
              >
                {/* Image */}
                <img
                  src={variant.image}
                  alt={variant.style}
                  className="w-full aspect-video object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-bold text-white mb-1">{variant.style}</p>
                    <p className="text-[9px] text-zinc-300 line-clamp-2">{variant.prompt}</p>
                  </div>
                </div>

                {/* Style Badge */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <p className="text-[9px] font-bold text-white">{variant.style}</p>
                </div>

                {/* Selected Badge */}
                {selectedVariant === variant.id && (
                  <div className="absolute top-2 right-2 bg-blue-600 px-3 py-1 rounded-full border border-blue-400 shadow-lg">
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-[12px] text-white">check_circle</span>
                      <p className="text-[9px] font-bold text-white">Selected</p>
                    </div>
                  </div>
                )}

                {/* Download Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadVariant(variant);
                  }}
                  className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <span className="material-icons text-sm text-white">download</span>
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Stats */}
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <p className="text-[10px] text-zinc-500 mb-2 font-bold">COMPARISON</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-400">Variants Generated</p>
                <p className="text-2xl font-black text-white">{variants.length}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Selected Variant</p>
                <p className="text-lg font-black text-blue-400">
                  {selectedVariant
                    ? variants.find((v) => v.id === selectedVariant)?.style
                    : 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          {selectedVariant && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="material-icons text-sm text-blue-400">info</span>
                <div>
                  <p className="text-xs font-bold text-blue-300">Variant Selected</p>
                  <p className="text-[10px] text-blue-200 mt-1">
                    The selected variant has been set as your current background. You can continue
                    editing or generate more variants.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {variants.length === 0 && !isGenerating && (
        <div className="bg-zinc-900/50 rounded-xl p-6 text-center">
          <span className="material-icons text-4xl text-zinc-600 mb-2">compare_arrows</span>
          <p className="text-sm text-zinc-400 mb-1">No Variants Generated</p>
          <p className="text-[10px] text-zinc-600">
            Generate multiple style variations to compare and choose the best one
          </p>
        </div>
      )}

      {/* Info Text */}
      <p className="text-[9px] text-zinc-600 text-center mt-4">
        A/B testing helps you explore different design directions and choose the best option
      </p>
    </div>
  );
};
