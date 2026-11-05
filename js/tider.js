// Åpningstider: [[dager(0=man..6=søn), "HH:MM", "HH:MM"], ...] eller "alltid" eller null (ukjent)
const DAG = ['man', 'tir', 'ons', 'tor', 'fre', 'lør', 'søn'];
export const idag = (d = new Date()) => (d.getDay() + 6) % 7;
const min = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
export function erApen(tider, d = new Date()) {
  if (tider === 'alltid') return true;
  if (!Array.isArray(tider)) return null;
  const n = d.getHours() * 60 + d.getMinutes(), dag = idag(d);
  return tider.some(([dager, fra, til]) => dager.includes(dag) && n >= min(fra) && n < min(til));
}
export function iDag(tider, d = new Date()) {
  if (tider === 'alltid') return 'Alltid åpent';
  if (!Array.isArray(tider)) return null;
  const r = tider.find(([dager]) => dager.includes(idag(d)));
  return r ? `${r[1]}–${r[2]}` : 'Stengt i dag';
}
export function tekst(tider) {
  if (tider === 'alltid') return 'Alltid åpent';
  if (!Array.isArray(tider)) return null;
  return tider.map(([dager, f, t]) => `${dager.length > 2 && dager.every((x, i) => i === 0 || x === dager[i - 1] + 1) ? DAG[dager[0]] + '–' + DAG[dager.at(-1)] : dager.map((x) => DAG[x]).join(', ')} ${f}–${t}`).join(' · ');
}
