// Brand Consistency Panel - Manage brand profiles and check consistency

import React, { useState } from 'react';
import { useAI } from '../../context/AIContext';
import {
  extractBrandFromImages,
  checkBrandConsistency,
  exportBrandProfile,
  importBrandProfile,
  clearBrandProfile,
} from '../../services/brandEngine';
import type { BrandProfile } from '../../types/ai';

interface BrandConsistencyPanelProps {
  refImages: string[];
  currentImage: string | null;
}

export const BrandConsistencyPanel: React.FC<BrandConsistencyPanelProps> = ({
  refImages,
  currentImage,
}) => {
  const { brandProfile, updateBrandProfile } = useAI();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [consistencyResult, setConsistencyResult] = useState<{
    consistent: boolean;
    score: number;
    issues: string[];
  } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExtractBrand = async () => {
    if (refImages.length === 0) {
      alert('Please add reference images first');
      return;
    }

    setIsExtracting(true);
    try {
      const extracted = await extractBrandFromImages(refImages);
      updateBrandProfile(extracted);
      alert('Brand profile extracted successfully!');
    } catch (error: any) {
      alert(`Failed to extract brand: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCheckConsistency = async () => {
    if (!currentImage) {
      alert('No image to check. Generate or upload an image first.');
      return;
    }

    if (!brandProfile) {
      alert('No brand profile found. Extract brand from reference images first.');
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkBrandConsistency(currentImage, brandProfile);
      setConsistencyResult(result);
    } catch (error: any) {
      alert(`Failed to check consistency: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleExport = () => {
    const jsonString = exportBrandProfile();
    if (!jsonString) {
      alert('No brand profile to export');
      return;
    }

    // Download as file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const success = importBrandProfile(importText);
      if (success) {
        alert('Brand profile imported successfully!');
        setShowImport(false);
        setImportText('');
        window.location.reload(); // Reload to update context
      } else {
        alert('Invalid brand profile format');
      }
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the brand profile?')) {
      clearBrandProfile();
      window.location.reload();
    }
  };

  return (
    <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
      <h4 className="text-xs font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
        <span className="material-icons text-sm">palette</span>
        Brand Consistency
      </h4>

      {/* Extract Brand Section */}
      {!brandProfile && (
        <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-white font-bold mb-2">No Brand Profile</p>
          <p className="text-[10px] text-zinc-400 mb-3">
            Extract brand colors, style, and identity from your reference images using AI
          </p>
          <button
            onClick={handleExtractBrand}
            disabled={isExtracting || refImages.length === 0}
            className="w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {isExtracting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-icons text-base">auto_awesome</span>
                Extract Brand from {refImages.length} Images
              </>
            )}
          </button>
        </div>
      )}

      {/* Brand Profile Display */}
      {brandProfile && (
        <div className="space-y-4">
          {/* Colors */}
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <label className="text-[10px] text-zinc-500 mb-2 block font-bold">BRAND COLORS</label>
            <div className="flex flex-wrap gap-2">
              {brandProfile.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-zinc-800 rounded-lg p-2 border border-white/10"
                >
                  <div
                    className="w-8 h-8 rounded border border-white/20"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div>
                    <p className="text-xs text-white font-bold">{color.name}</p>
                    <p className="text-[9px] text-zinc-500 font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Style Keywords */}
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <label className="text-[10px] text-zinc-500 mb-2 block font-bold">STYLE KEYWORDS</label>
            <div className="flex flex-wrap gap-2">
              {brandProfile.styleKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 font-bold"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Industry & Audience */}
          {(brandProfile.industry || brandProfile.targetAudience) && (
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <label className="text-[10px] text-zinc-500 mb-2 block font-bold">BRAND INFO</label>
              <div className="space-y-2 text-sm">
                {brandProfile.industry && (
                  <div>
                    <span className="text-zinc-400">Industry:</span>{' '}
                    <span className="text-white font-bold">{brandProfile.industry}</span>
                  </div>
                )}
                {brandProfile.targetAudience && (
                  <div>
                    <span className="text-zinc-400">Target Audience:</span>{' '}
                    <span className="text-white font-bold">{brandProfile.targetAudience}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consistency Check */}
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <label className="text-[10px] text-zinc-500 mb-2 block font-bold">
              CONSISTENCY CHECK
            </label>
            <button
              onClick={handleCheckConsistency}
              disabled={isChecking || !currentImage}
              className="w-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm mb-3"
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Checking...
                </>
              ) : (
                <>
                  <span className="material-icons text-base">check_circle</span>
                  Check Current Image
                </>
              )}
            </button>

            {/* Consistency Result */}
            {consistencyResult && (
              <div
                className={`rounded-lg p-3 border ${
                  consistencyResult.consistent
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-orange-900/20 border-orange-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-bold ${
                      consistencyResult.consistent ? 'text-green-300' : 'text-orange-300'
                    }`}
                  >
                    {consistencyResult.consistent ? 'Brand Consistent ✓' : 'Needs Improvement'}
                  </span>
                  <span
                    className={`text-lg font-black ${
                      consistencyResult.consistent ? 'text-green-400' : 'text-orange-400'
                    }`}
                  >
                    {consistencyResult.score}/100
                  </span>
                </div>

                {consistencyResult.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-zinc-400 mb-1 font-bold">ISSUES:</p>
                    <ul className="space-y-1">
                      {consistencyResult.issues.map((issue, idx) => (
                        <li key={idx} className="text-[10px] text-orange-200 flex items-start gap-1">
                          <span className="material-icons text-[12px] mt-0.5">warning</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Import/Export/Clear */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleExport}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-3 rounded-lg transition flex flex-col items-center gap-1 text-xs border border-white/10"
            >
              <span className="material-icons text-sm">download</span>
              Export
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-3 rounded-lg transition flex flex-col items-center gap-1 text-xs border border-white/10"
            >
              <span className="material-icons text-sm">upload</span>
              Import
            </button>
            <button
              onClick={handleClear}
              className="bg-red-900/50 hover:bg-red-900/70 text-red-300 font-bold py-2 px-3 rounded-lg transition flex flex-col items-center gap-1 text-xs border border-red-500/30"
            >
              <span className="material-icons text-sm">delete</span>
              Clear
            </button>
          </div>

          {/* Import Modal */}
          {showImport && (
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
              <label className="text-[10px] text-zinc-500 mb-2 block font-bold">
                PASTE BRAND PROFILE JSON
              </label>
              <textarea
                className="w-full bg-zinc-800 border border-white/10 rounded-lg p-3 text-xs text-white font-mono resize-none h-32 mb-2"
                placeholder='{"colors": [...], "styleKeywords": [...], ...}'
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition text-xs"
                >
                  Import
                </button>
                <button
                  onClick={() => setShowImport(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg transition text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Text */}
      <p className="text-[9px] text-zinc-600 text-center mt-4">
        Brand consistency ensures all generated designs match your visual identity
      </p>
    </div>
  );
};
