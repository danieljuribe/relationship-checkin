'use client';

import { useEffect, useState } from 'react';
import type { FeedbackEntry } from '../../api/feedback/route';

export default function SummaryPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback')
      .then(r => r.json())
      .then((data: FeedbackEntry[]) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-slate-400">
        Loading insights...
      </main>
    );
  }

  const total = entries.length;

  const avgEnjoyment = total > 0
    ? (entries.reduce((s, e) => s + e.enjoyment, 0) / total).toFixed(1)
    : '—';

  const avgScore = total > 0
    ? Math.round(entries.reduce((s, e) => s + e.overallScore, 0) / total)
    : null;

  const accurateCounts = { yes: 0, somewhat: 0, no: 0 };
  entries.forEach(e => {
    if (e.accurate in accurateCounts) accurateCounts[e.accurate as keyof typeof accurateCounts]++;
  });

  const usefulCounts = { yes: 0, maybe: 0, no: 0 };
  entries.forEach(e => {
    if (e.useful in usefulCounts) usefulCounts[e.useful as keyof typeof usefulCounts]++;
  });

  const suggestions = entries.filter(e => e.suggestion?.trim()).map(e => ({
    text: e.suggestion.trim(),
    date: new Date(e.submittedAt).toLocaleDateString(),
    score: e.overallScore,
  }));

  function pct(n: number) {
    return total > 0 ? Math.round((n / total) * 100) + '%' : '—';
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-xs font-semibold tracking-[4px] uppercase text-pink-400 mb-1"
             style={{ fontFamily: 'Inter, sans-serif' }}>
            Check-In Feedback
          </p>
          <h1 className="text-2xl font-bold text-slate-700 mb-1" style={{ fontFamily: 'Lora, serif' }}>
            Insights
          </h1>
          <p className="text-slate-400 text-sm">{total} response{total !== 1 ? 's' : ''} collected</p>
        </div>

        {total === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 p-10 text-center">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-slate-400 text-sm">No feedback yet. Complete a check-in to start collecting responses!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Top-line stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Avg Usefulness', value: `${avgEnjoyment} / 5`, emoji: '⭐' },
                { label: 'Felt Accurate', value: pct(accurateCounts.yes), emoji: '✅' },
                { label: 'Would Use Again', value: pct(usefulCounts.yes), emoji: '🚀' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-4 text-center">
                  <div className="text-2xl mb-1">{stat.emoji}</div>
                  <div className="text-xl font-bold text-slate-700">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Avg score distribution */}
            {avgScore !== null && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-5 text-center">
                <p className="text-xs text-slate-400 mb-1">Average relationship health score submitted</p>
                <div className="text-4xl font-bold text-slate-700" style={{ fontFamily: 'Lora, serif' }}>
                  {avgScore}<span className="text-xl text-slate-300">/100</span>
                </div>
              </div>
            )}

            {/* Accuracy breakdown */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-5">
              <h2 className="text-sm font-semibold text-slate-600 mb-4">Did the score feel accurate?</h2>
              {([
                { key: 'yes', label: '✅ Yes, spot on', color: '#f9a8d4' },
                { key: 'somewhat', label: '🤔 Kind of', color: '#fcd9e8' },
                { key: 'no', label: '❌ Not really', color: '#fce7f3' },
              ] as const).map(row => {
                const count = accurateCounts[row.key];
                const width = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={row.key} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-slate-500 w-28 flex-shrink-0">{row.label}</span>
                    <div className="flex-1 bg-pink-50 rounded-full h-4 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: row.color }} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Would use again */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-5">
              <h2 className="text-sm font-semibold text-slate-600 mb-4">Would use again with partner?</h2>
              {([
                { key: 'yes', label: '🚀 Definitely', color: '#f9a8d4' },
                { key: 'maybe', label: '🤷 Maybe', color: '#fcd9e8' },
                { key: 'no', label: '🚫 Probably not', color: '#fce7f3' },
              ] as const).map(row => {
                const count = usefulCounts[row.key];
                const width = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={row.key} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-slate-500 w-28 flex-shrink-0">{row.label}</span>
                    <div className="flex-1 bg-pink-50 rounded-full h-4 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: row.color }} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-5">
                <h2 className="text-sm font-semibold text-slate-600 mb-4">
                  💬 Suggestions ({suggestions.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="bg-pink-50 border border-pink-100 rounded-xl px-4 py-3">
                      <p className="text-sm text-slate-600 italic leading-relaxed">&ldquo;{s.text}&rdquo;</p>
                      <p className="text-xs text-slate-300 mt-1">Score: {s.score}/100 · {s.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All responses table */}
            <details className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-5">
              <summary className="text-sm font-semibold text-slate-600 cursor-pointer">
                📋 All Responses ({total})
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-slate-500 border-collapse">
                  <thead>
                    <tr className="text-left border-b border-pink-100">
                      <th className="pb-2 pr-3">Score</th>
                      <th className="pb-2 pr-3">Stars</th>
                      <th className="pb-2 pr-3">Accurate</th>
                      <th className="pb-2 pr-3">Use again</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...entries].reverse().map(e => (
                      <tr key={e.id} className="border-b border-pink-50">
                        <td className="py-1.5 pr-3 font-medium">{e.overallScore}/100</td>
                        <td className="py-1.5 pr-3">{'⭐'.repeat(e.enjoyment)}</td>
                        <td className="py-1.5 pr-3">{e.accurate}</td>
                        <td className="py-1.5 pr-3">{e.useful}</td>
                        <td className="py-1.5 text-slate-300">{new Date(e.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

          </div>
        )}
      </div>
    </main>
  );
}
