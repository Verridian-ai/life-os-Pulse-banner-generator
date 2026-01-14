import React, { useState } from 'react';
import { BANNER_TEMPLATES } from '../../constants/templates';
import { generateImage } from '../../services/imageGenerationService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAI } from '../../context/AIContext';

// Simple progress bar component
const ProgressBar = ({
  progress,
  total,
  label,
}: {
  progress: number;
  total: number;
  label: string;
}) => (
  <div className='w-full space-y-2'>
    <div className='flex justify-between text-xs uppercase font-bold text-zinc-400'>
      <span>{label}</span>
      <span>
        {progress} / {total}
      </span>
    </div>
    <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
      <div
        className='h-full bg-blue-500 transition-all duration-300'
        style={{ width: `${(progress / total) * 100}%` }}
      />
    </div>
  </div>
);

export const AssetGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [generatedBlobs, setGeneratedBlobs] = useState<Map<string, Blob>>(new Map());
  const { brandProfile } = useAI();

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleGenerateAll = async () => {
    if (
      !window.confirm(
        `This will generate ${BANNER_TEMPLATES.length} images using your connected AI provider. This may take a while and incur costs. Continue?`,
      )
    ) {
      return;
    }

    setIsGenerating(true);
    setGeneratedCount(0);
    setFailedCount(0);
    setGeneratedBlobs(new Map()); // Reset
    setLogs([]);

    const batchSize = 3; // Processing 3 at a time to avoid rate limits
    const zip = new JSZip();

    for (let i = 0; i < BANNER_TEMPLATES.length; i += batchSize) {
      const batch = BANNER_TEMPLATES.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (template) => {
          try {
            addLog(`Starting: ${template.title} (${template.id})`);

            // Enhance prompt locally slightly
            let prompt = template.prompt;
            if (!prompt.includes('masterpiece')) prompt += ', masterpiece, 8k, high res';

            const imageUrl = await generateImage(
              prompt,
              [],
              '4K',
              { width: 1536, height: 864 }, // Standard banner size
              [],
              false,
              brandProfile,
            );

            // Fetch the image to get blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // Store in zip immediately to save memory? Better to accumulate?
            // Adding to zip
            const fileName = `${template.id}.png`;
            zip.file(fileName, blob);

            setGeneratedBlobs((prev) => new Map(prev).set(template.id, blob));
            setGeneratedCount((prev) => prev + 1);
            addLog(`✅ Success: ${template.title}`);
          } catch (error) {
            console.error(error);
            setFailedCount((prev) => prev + 1);
            addLog(`❌ Failed: ${template.title} - ${error}`);
          }
        }),
      );

      // Small pause between batches
      await new Promise((r) => setTimeout(r, 1000));
    }

    setIsGenerating(false);
    addLog('Generation Complete! Ready to download.');

    // Prepare zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'template_assets.zip');
  };

  const handleDownloadZip = async () => {
    // Logic to re-zip if needed, but we did it on the fly.
    // If user wants to re-download, we might need to regenerate the zip from the blobs map.
    const zip = new JSZip();
    generatedBlobs.forEach((blob, id) => {
      zip.file(`${id}.png`, blob);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'template_assets_manual.zip');
  };

  return (
    <div className='min-h-screen bg-black text-white p-8 font-sans'>
      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-white/10 pb-6'>
          <div>
            <h1 className='text-3xl font-black uppercase tracking-tighter mb-2'>
              Template Asset Generator
            </h1>
            <p className='text-zinc-400'>
              Batch generate high-fidelity assets for the {BANNER_TEMPLATES.length} template
              definitions using <span className='text-blue-400 font-bold'>Nano Banana Pro</span>{' '}
              engine.
            </p>
          </div>
          <div className='flex gap-4'>
            <button
              type='button'
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className={`
                px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2
                ${
                  isGenerating
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40'
                }
              `}
            >
              {isGenerating ? (
                <RefreshCw className='animate-spin w-5 h-5' />
              ) : (
                <RefreshCw className='w-5 h-5' />
              )}
              {isGenerating ? 'Generating...' : 'Start Job (Nano Banana Pro)'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-zinc-900 border border-white/10 p-6 rounded-2xl'>
            <div className='text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2'>
              Total Templates
            </div>
            <div className='text-4xl font-black'>{BANNER_TEMPLATES.length}</div>
          </div>
          <div className='bg-zinc-900 border border-white/10 p-6 rounded-2xl'>
            <div className='text-green-500 text-xs font-bold uppercase tracking-wider mb-2'>
              Generated
            </div>
            <div className='text-4xl font-black text-green-400'>{generatedCount}</div>
          </div>
          <div className='bg-zinc-900 border border-white/10 p-6 rounded-2xl'>
            <div className='text-red-500 text-xs font-bold uppercase tracking-wider mb-2'>
              Failed
            </div>
            <div className='text-4xl font-black text-red-500'>{failedCount}</div>
          </div>
        </div>

        {/* Progress */}
        {isGenerating && (
          <div className='bg-zinc-900/50 border border-white/5 p-6 rounded-2xl animate-pulse'>
            <ProgressBar
              progress={generatedCount + failedCount}
              total={BANNER_TEMPLATES.length}
              label='Batch Progress'
            />
            <div className='mt-4 text-center text-sm text-blue-400 animate-bounce'>
              Generating assets... Please do not close this tab.
            </div>
          </div>
        )}

        {/* Results/Logs */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[500px]'>
            <div className='p-4 bg-zinc-900 border-b border-white/10 font-bold text-xs uppercase tracking-wider flex items-center gap-2'>
              <ImageIcon className='w-4 h-4' /> Live Previews
            </div>
            <div className='flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4'>
              {Array.from(generatedBlobs.entries()).map(([id, blob]) => (
                <div
                  key={id}
                  className='aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-white/5 relative group'
                >
                  <img
                    src={URL.createObjectURL(blob)}
                    alt={`Generated asset for template ${id}`}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center'>
                    <span className='text-[10px] uppercase font-bold'>{id}</span>
                  </div>
                </div>
              ))}
              {generatedBlobs.size === 0 && (
                <div className='col-span-2 flex flex-col items-center justify-center text-zinc-600 h-full'>
                  <ImageIcon className='w-12 h-12 mb-2 opacity-20' />
                  <div>No images generated yet</div>
                </div>
              )}
            </div>
            {generatedBlobs.size > 0 && !isGenerating && (
              <div className='p-4 border-t border-white/10 bg-zinc-900'>
                <button
                  type='button'
                  onClick={handleDownloadZip}
                  className='w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2'
                >
                  <Download className='w-5 h-5' /> Download Zip ({generatedBlobs.size})
                </button>
              </div>
            )}
          </div>

          <div className='bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[500px]'>
            <div className='p-4 bg-zinc-900 border-b border-white/10 font-bold text-xs uppercase tracking-wider flex items-center gap-2'>
              <AlertCircle className='w-4 h-4' /> Activity Log
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs'>
              {logs.map((log, i) => (
                <div
                  key={i}
                  className='text-zinc-400 border-b border-white/5 pb-1 mb-1 last:border-0'
                >
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className='flex flex-col items-center justify-center text-zinc-600 h-full'>
                  <div>Waiting to start...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetGenerator;
