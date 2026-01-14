import { useState } from 'react';
import { generateImage } from '../../services/imageGenerationService';
import { useCanvas } from '../../context/CanvasContext';
import { useToast } from '../../hooks/useToast';
import { BTN_BASE, BTN_NEU_SOLID } from '../../styles';
import { BANNER_WIDTH, BANNER_HEIGHT } from '../../constants';

interface QuickGenerateWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

const QUESTIONS = [
  {
    id: 'industry',
    question: 'What is your industry?',
    options: ['Technology', 'Finance', 'Healthcare', 'Creative', 'Sales', 'Other'],
  },
  {
    id: 'style',
    question: 'What style do you prefer?',
    options: ['Modern & Techy', 'Corporate & Clean', 'Vibrant & Bold', 'Minimalist', 'Abstract'],
  },
  {
    id: 'message',
    question: 'What is your key message?',
    placeholder: 'e.g., Building the future of AI, Strategic Growth Leader...',
  },
];

export const QuickGenerateWizard: React.FC<QuickGenerateWizardProps> = ({
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const { setBgImage } = useCanvas();
  const toast = useToast();

  const handleAnswer = (answer: string) => {
    const currentQ = QUESTIONS[step];
    setAnswers({ ...answers, [currentQ.id]: answer });
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generateVariants({ ...answers, [currentQ.id]: answer });
    }
  };

  const generateVariants = async (finalAnswers: Record<string, string>) => {
    setIsGenerating(true);
    setStep(QUESTIONS.length); // Show generation state

    const basePrompt = `A professional LinkedIn banner background for the ${finalAnswers.industry} industry. Style: ${finalAnswers.style}. Theme: ${finalAnswers.message}. High resolution, 4K, professional composition, negative space for text on the right.`;

    try {
      // For MVP, we'll generate 4 variants by calling generate 4 times or similar.
      // But since that's slow/expensive, we'll generate 1 high quality and 3 "variations" if possible.
      // Actually, I'll just generate 4 separate ones for the true "4 variant" experience requested.

      const results = await Promise.all([
        generateImage(`${basePrompt}, variant 1`, [], '1K', {
          width: BANNER_WIDTH,
          height: BANNER_HEIGHT,
        }),
        generateImage(`${basePrompt}, variant 2, different colors`, [], '1K', {
          width: BANNER_WIDTH,
          height: BANNER_HEIGHT,
        }),
        generateImage(`${basePrompt}, variant 3, alternative layout`, [], '1K', {
          width: BANNER_WIDTH,
          height: BANNER_HEIGHT,
        }),
        generateImage(`${basePrompt}, variant 4, minimalist approach`, [], '1K', {
          width: BANNER_WIDTH,
          height: BANNER_HEIGHT,
        }),
      ]);

      setVariants(results.filter(Boolean) as string[]);
    } catch {
      toast.error('Failed to generate variants');
      setStep(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (url: string) => {
    setBgImage(url);
    toast.success('Banner applied to canvas!');
    onComplete();
  };

  return (
    <div className='fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-md p-4'>
      <div className='bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto'>
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'
        >
          <span className='material-icons'>close</span>
        </button>

        {step < QUESTIONS.length ? (
          <div className='animate-fadeIn'>
            <div className='text-center mb-8'>
              <span className='text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 block'>
                Step {step + 1} of {QUESTIONS.length}
              </span>
              <h2 className='text-2xl font-black text-white uppercase tracking-wider'>
                {QUESTIONS[step].question}
              </h2>
            </div>

            {QUESTIONS[step].options ? (
              <div className='grid grid-cols-2 gap-4'>
                {QUESTIONS[step].options?.map((opt) => (
                  <button
                    key={opt}
                    type='button'
                    onClick={() => handleAnswer(opt)}
                    className={`${BTN_NEU_SOLID} py-4 rounded-2xl text-sm font-bold hover:border-purple-500/50 hover:bg-purple-500/5 transition-all`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className='space-y-4'>
                <input
                  type='text'
                  autoFocus
                  placeholder={QUESTIONS[step].placeholder}
                  className='w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-purple-500 transition'
                  onKeyDown={() => {
                    // ...
                  }}
                />
                <button
                  type='button'
                  onClick={(e) =>
                    handleAnswer(
                      ((e.target as HTMLElement).previousSibling as HTMLInputElement).value,
                    )
                  }
                  className={`w-full ${BTN_BASE} bg-purple-600 text-white`}
                >
                  Generate Variants
                </button>
              </div>
            )}
          </div>
        ) : isGenerating ? (
          <div className='text-center py-20 animate-pulse'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-3xl mb-6'>
              <span className='material-icons text-4xl text-purple-500 animate-spin'>sync</span>
            </div>
            <h2 className='text-xl font-black text-white uppercase tracking-widest mb-2'>
              Generating 4 Variants
            </h2>
            <p className='text-zinc-500 text-sm'>Our AI is crafting your professional designs...</p>
          </div>
        ) : (
          <div className='animate-fadeIn'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-black text-white uppercase tracking-wider mb-2'>
                Your Custom Variants
              </h2>
              <p className='text-zinc-500 text-sm'>
                Pick your favorite to start editing or export immediately.
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-8'>
              {variants.map((v, i) => (
                <div
                  key={i}
                  className='group relative aspect-video rounded-2xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer'
                  onClick={() => handleSelect(v)}
                >
                  <img src={v} alt={`Variant ${i + 1}`} className='w-full h-full object-cover' />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <span className='bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg'>
                      Select
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex gap-4'>
              <button
                type='button'
                onClick={() => setStep(0)}
                className={`flex-1 ${BTN_NEU_SOLID}`}
              >
                Try Again
              </button>
              <button
                type='button'
                onClick={onClose}
                className={`flex-1 ${BTN_BASE} bg-zinc-800 text-white`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
