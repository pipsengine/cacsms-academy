import { getAllLessons } from './apps/web-client/src/lib/learning/curriculum.ts';

const BASE = 'http://localhost:3001';
const lessons = getAllLessons();

function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4)
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let i = 0;
  for (const t of a) if (b.has(t)) i += 1;
  const u = a.size + b.size - i;
  return u ? i / u : 0;
}

const units = [];
for (const lesson of lessons) {
  const qs = new URLSearchParams({
    topic_title: lesson.title,
    week_number: String(lesson.week),
    day_of_week: lesson.day,
    topic_type: lesson.type,
  });
  const res = await fetch(`${BASE}/api/learning/unit?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) {
    console.log(`ERROR ${lesson.slug} status=${res.status}`);
    continue;
  }
  const unit = await res.json();
  units.push({ lesson, unit });
}

const pairHits = [];
for (let i = 0; i < units.length; i += 1) {
  const a = units[i];
  const ta = tokenize(`${a.unit.title}\n${a.unit.summary}\n${a.unit.content}\n${a.unit.example}`);
  for (let j = i + 1; j < units.length; j += 1) {
    const b = units[j];
    const tb = tokenize(`${b.unit.title}\n${b.unit.summary}\n${b.unit.content}\n${b.unit.example}`);
    const score = jaccard(ta, tb);
    if (score >= 0.70) {
      pairHits.push({
        score,
        aSlug: a.lesson.slug,
        aTitle: a.lesson.title,
        bSlug: b.lesson.slug,
        bTitle: b.lesson.title,
      });
    }
  }
}
pairHits.sort((x, y) => y.score - x.score);

const lineFreq = new Map();
for (const { unit } of units) {
  const lines = String(unit.content || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 48 && !l.startsWith('#'));
  for (const line of lines) lineFreq.set(line, (lineFreq.get(line) || 0) + 1);
}
const repeatedLines = [...lineFreq.entries()]
  .filter(([, c]) => c >= 15)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

console.log(`LESSONS=${lessons.length}`);
console.log(`UNITS_FETCHED=${units.length}`);
console.log(`HIGH_SIMILARITY_PAIRS(>=0.70)=${pairHits.length}`);
for (const hit of pairHits.slice(0, 25)) {
  console.log(`SIM=${hit.score.toFixed(3)} | ${hit.aSlug} <> ${hit.bSlug}`);
}
console.log('TOP_REPEATED_LINES(>=15):');
for (const [line, c] of repeatedLines) {
  console.log(`[${c}] ${line}`);
}
