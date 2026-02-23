import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'feedback-data.json');

async function readData(): Promise<FeedbackEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeData(entries: FeedbackEntry[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
}

export interface FeedbackEntry {
  id: string;
  overallScore: number;
  enjoyment: number;       // 1–5
  accurate: string;        // 'yes' | 'somewhat' | 'no'
  useful: string;          // 'yes' | 'maybe' | 'no'
  suggestion: string;
  submittedAt: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry: FeedbackEntry = {
    id: crypto.randomUUID(),
    overallScore: Number(body.overallScore) || 0,
    enjoyment: Number(body.enjoyment) || 0,
    accurate: body.accurate || '',
    useful: body.useful || '',
    suggestion: body.suggestion || '',
    submittedAt: new Date().toISOString(),
  };

  const entries = await readData();
  entries.push(entry);
  await writeData(entries);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const entries = await readData();
  return NextResponse.json(entries);
}
