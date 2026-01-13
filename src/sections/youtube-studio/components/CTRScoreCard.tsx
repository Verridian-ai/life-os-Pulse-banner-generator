
interface CTRFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  suggestion?: string;
}

interface CTRScoreCardProps {
  score: number; // 0-10 percentage
  factors: CTRFactor[];
}

export function CTRScoreCard({ score, factors }: CTRScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 7) return 'text-green-400';
    if (value >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
            CTR Prediction
          </h3>
          <p className="text-sm text-zinc-500">Click-through rate estimate</p>
        </div>
        <div className="text-right">
          <span className={`text-4xl font-bold ${getScoreColor(score)} drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]`}>
            {score.toFixed(1)}%
          </span>
          <p className="text-xs text-zinc-500">Predicted CTR</p>
        </div>
      </div>

      {/* Benchmark */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Average CTR:</span>
          <span className="text-zinc-300">2-10%</span>
        </div>
        <div className="mt-2 h-2 bg-zinc-800/50 rounded-full relative overflow-hidden">
          <div
            className="absolute h-full w-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 rounded-full"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-zinc-900"
            style={{ left: `${Math.min(score * 10, 100)}%` }}
          />
        </div>
      </div>

      {/* Factors */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-zinc-400">Score Breakdown</h4>
        {factors.map((factor) => (
          <div key={factor.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-zinc-300">{factor.name}</span>
              <span className="text-sm font-medium text-white">
                {factor.score}/{factor.maxScore}
              </span>
            </div>
            <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-rose-400 rounded-full transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
              />
            </div>
            {factor.suggestion && (
              <p className="text-xs text-zinc-500 mt-1">{factor.suggestion}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CTRScoreCard;
