'use client';

import { useState, useEffect } from 'react';
import {
  questions,
  categories,
  calculateResult,
  encodeScores,
  decodeScores,
  emojiScale,
  type CategoryKey,
  type CheckInResult,
} from './data/checkin';

type Stage = 'welcome' | 'checkin' | 'results' | 'compare';

const categoryOrder: CategoryKey[] = ['connection', 'communication', 'patterns', 'vision'];

const tierConfig = {
  thriving: { label: 'Thriving', emoji: '🌱', color: '#86efac', bg: 'bg-green-50', text: 'text-green-700' },
  growing: { label: 'Growing', emoji: '🌤️', color: '#fcd34d', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  attention: { label: 'Needs attention', emoji: '🌧️', color: '#fca5a5', bg: 'bg-red-50', text: 'text-red-600' },
};

function overallEmoji(score: number) {
  if (score >= 80) return '💖';
  if (score >= 60) return '💛';
  if (score >= 40) return '🌸';
  return '🤍';
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [partnerResult, setPartnerResult] = useState<CheckInResult | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Check for partner's scores in the URL hash on load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeScores(hash);
      if (decoded) setPartnerResult(decoded);
    }
  }, []);

  function handleStart() {
    setStage('checkin');
    setCurrentIndex(0);
    setAnswers({});
  }

  function handleAnswer(value: number) {
    if (animating) return;
    const q = questions[currentIndex];
    const newAnswers = { ...answers, [q.id]: value };

    setAnimating(true);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setAnswers(newAnswers);
        setCurrentIndex(currentIndex + 1);
        setAnimating(false);
      } else {
        const finalResult = calculateResult(newAnswers);
        setResult(finalResult);
        const encoded = encodeScores(newAnswers);
        const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
        setShareUrl(url);
        setStage('results');
        setAnimating(false);
      }
    }, 250);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // === WELCOME SCREEN ===
  if (stage === 'welcome') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-10 max-w-md w-full text-center">
          {partnerResult ? (
            <>
              <div className="text-5xl mb-3">💌</div>
              <p className="text-xs font-semibold tracking-[4px] uppercase text-pink-400 mb-2"
                 style={{ fontFamily: 'Inter, sans-serif' }}>
                Your partner checked in
              </p>
              <h1 className="text-2xl font-bold text-slate-700 mb-2 leading-tight"
                  style={{ fontFamily: 'Lora, serif' }}>
                Now it&apos;s your turn
              </h1>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                Fill out your own check-in and see how your answers compare side by side.
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">💑</div>
              <p className="text-xs font-semibold tracking-[4px] uppercase text-pink-400 mb-2"
                 style={{ fontFamily: 'Inter, sans-serif' }}>
                Weekly Check-In
              </p>
              <h1 className="text-2xl font-bold text-slate-700 mb-2 leading-tight"
                  style={{ fontFamily: 'Lora, serif' }}>
                How are we doing?
              </h1>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                16 honest questions. Based on Gottman &amp; Terry Real.
                Takes 3 minutes. No wrong answers.
              </p>
            </>
          )}

          <div className="flex gap-2 justify-center mb-6">
            {categoryOrder.map(key => (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="text-xl">{categories[key].emoji}</span>
                <span className="text-xs text-slate-300">{categories[key].label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)' }}
          >
            Begin Check-In →
          </button>
          <p className="text-xs text-slate-300 mt-3">🕊️ Just for you — fill it out honestly</p>
        </div>
      </main>
    );
  }

  // === CHECKIN SCREEN ===
  if (stage === 'checkin') {
    const q = questions[currentIndex];
    const cat = categories[q.category];
    const progress = Math.round(((currentIndex) / questions.length) * 100);

    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-8 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{cat.emoji}</span>
              <p className="text-xs font-semibold tracking-[3px] uppercase text-pink-400"
                 style={{ fontFamily: 'Inter, sans-serif' }}>
                {cat.label}
              </p>
            </div>
            <p className="text-sm text-slate-300">{currentIndex + 1} / {questions.length}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-pink-50 rounded-full h-1.5 mb-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f9a8d4, #ec4899)' }}
            />
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-slate-700 mb-8 leading-snug text-center"
              style={{ fontFamily: 'Lora, serif' }}>
            {q.text}
          </h2>

          {/* Emoji scale */}
          <div className="flex justify-between gap-2 mb-4">
            {emojiScale.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                disabled={animating}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 ${
                  answers[q.id] === opt.value
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-pink-100 bg-white/60 hover:border-pink-200'
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className="text-xs text-slate-400 leading-tight text-center">{opt.label}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-slate-200 text-xs mt-4">— answer honestly, for yourself —</p>
        </div>
      </main>
    );
  }

  // === RESULTS SCREEN ===
  if (stage === 'results' && result) {
    const focusCat = categories[result.focusArea];
    const starters = focusCat.conversationStarters;

    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full flex flex-col gap-4">

          {/* Overall score card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-8 text-center">
            <div className="text-6xl mb-2">{overallEmoji(result.overall)}</div>
            <p className="text-xs font-semibold tracking-[4px] uppercase text-pink-400 mb-1"
               style={{ fontFamily: 'Inter, sans-serif' }}>
              Your check-in
            </p>
            <h2 className="text-4xl font-bold text-slate-700 mb-1" style={{ fontFamily: 'Lora, serif' }}>
              {result.overall}<span className="text-2xl text-slate-300">/100</span>
            </h2>
            <p className="text-slate-400 text-sm">overall relationship health</p>
          </div>

          {/* Category breakdown */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-4">Breakdown</h3>
            {result.categories.map(cs => {
              const cat = categories[cs.category];
              const tier = tierConfig[cs.tier];
              return (
                <div key={cs.category} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className="text-sm font-medium text-slate-600">{cat.label}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tier.bg} ${tier.text}`}>
                      {tier.emoji} {tier.label}
                    </span>
                  </div>
                  <div className="w-full bg-pink-50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cs.score}%`, background: tier.color }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 text-right">{cs.score}%</p>
                </div>
              );
            })}
          </div>

          {/* Partner comparison (if partner filled it out) */}
          {partnerResult && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-6">
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Side-by-side comparison</h3>
              <p className="text-xs text-slate-300 mb-4">You vs your partner</p>
              {result.categories.map((cs, i) => {
                const cat = categories[cs.category];
                const partnerScore = partnerResult.categories[i]?.score ?? 0;
                return (
                  <div key={cs.category} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span>{cat.emoji}</span>
                      <span className="text-sm font-medium text-slate-600">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-pink-400 w-6 text-right">You</span>
                      <div className="flex-1 bg-pink-50 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${cs.score}%`, background: '#f9a8d4' }} />
                      </div>
                      <span className="text-xs text-slate-400 w-6">{cs.score}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-purple-400 w-6 text-right">💜</span>
                      <div className="flex-1 bg-purple-50 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${partnerScore}%`, background: '#c084fc' }} />
                      </div>
                      <span className="text-xs text-slate-400 w-6">{partnerScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Focus area + conversation starters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{focusCat.emoji}</span>
              <h3 className="text-sm font-semibold text-slate-600">
                Talk about: <span className="text-pink-500">{focusCat.label}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">{focusCat.source}</p>
            <div className="flex flex-col gap-2">
              {starters.map((s, i) => (
                <div key={i} className="bg-pink-50 border border-pink-100 rounded-xl px-4 py-3 text-sm text-slate-600 italic leading-relaxed">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Share link */}
          {!partnerResult && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-6 text-center">
              <div className="text-2xl mb-2">💌</div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Invite your partner</h3>
              <p className="text-xs text-slate-400 mb-4">
                Send them this link. They fill it out, then you see your scores side by side.
              </p>
              <button
                onClick={handleCopy}
                className="w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)' }}
              >
                {copied ? '✅ Copied!' : '📋 Copy partner link'}
              </button>
            </div>
          )}

          {/* Retake */}
          <button
            onClick={() => { setStage('welcome'); setCurrentIndex(0); setAnswers({}); setResult(null); }}
            className="w-full py-3 rounded-2xl border-2 border-pink-200 text-pink-400 font-semibold text-sm transition-all hover:bg-pink-50"
          >
            🌸 Start over
          </button>

        </div>
      </main>
    );
  }

  return null;
}
