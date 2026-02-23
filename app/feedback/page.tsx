'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function FeedbackForm() {
  const params = useSearchParams();
  const router = useRouter();
  const overallScore = params.get('score') || '';

  const [enjoyment, setEnjoyment] = useState(0);
  const [accurate, setAccurate] = useState('');
  const [useful, setUseful] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overallScore: Number(overallScore), enjoyment, accurate, useful, suggestion }),
    });
    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Lora, serif' }}>
            ¡Gracias!
          </h2>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            Tu opinión nos ayuda a mejorar la experiencia.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-2xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)' }}
          >
            Volver al check-in →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💌</div>
          <p className="text-xs font-semibold tracking-[4px] uppercase text-pink-400 mb-1"
             style={{ fontFamily: 'Inter, sans-serif' }}>
            Feedback rápido
          </p>
          <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Lora, serif' }}>
            ¿Cómo te fue?
          </h1>
          {overallScore && (
            <p className="text-slate-400 text-sm mt-1">
              Tu puntaje: <span className="text-pink-400 font-medium">{overallScore}/100</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Q1: Utilidad */}
          <div>
            <p className="text-slate-600 font-medium text-sm mb-3">¿Qué tan útil fue este check-in?</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnjoyment(n)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {n <= enjoyment ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Preciso */}
          <div>
            <p className="text-slate-600 font-medium text-sm mb-3">
              ¿Tu puntaje refleja bien cómo va la relación?
            </p>
            <div className="flex gap-2">
              {[
                { val: 'yes', label: '✅ Sí, exacto' },
                { val: 'somewhat', label: '🤔 Más o menos' },
                { val: 'no', label: '❌ No mucho' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAccurate(opt.val)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                    accurate === opt.val
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-pink-100 bg-white/60 text-slate-500 hover:border-pink-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: ¿Lo usarías de nuevo? */}
          <div>
            <p className="text-slate-600 font-medium text-sm mb-3">
              ¿Lo usarías de nuevo con tu pareja?
            </p>
            <div className="flex gap-2">
              {[
                { val: 'yes', label: '🚀 Definitivamente' },
                { val: 'maybe', label: '🤷 Quizás' },
                { val: 'no', label: '🚫 Probablemente no' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setUseful(opt.val)}
                  className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
                    useful === opt.val
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-pink-100 bg-white/60 text-slate-500 hover:border-pink-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q4: Sugerencias */}
          <div>
            <p className="text-slate-600 font-medium text-sm mb-3">
              ¿Alguna sugerencia? <span className="text-slate-300 font-normal">(opcional)</span>
            </p>
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              rows={3}
              placeholder="¿Qué lo haría mejor?"
              className="w-full rounded-2xl border border-pink-100 bg-white/60 px-4 py-3 text-sm text-slate-600 placeholder-slate-300 outline-none focus:border-pink-300 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !enjoyment || !accurate || !useful}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)' }}
          >
            {submitting ? 'Enviando...' : 'Enviar 💌'}
          </button>

          <p className="text-center text-slate-300 text-xs">— nos ayuda a mejorar para todos —</p>
        </form>
      </div>
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Cargando...</div>}>
      <FeedbackForm />
    </Suspense>
  );
}
