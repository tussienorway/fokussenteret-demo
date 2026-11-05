import { erApen } from './tider.js';
// Regelbasert veiviser. Valgfri lokal backend: localStorage 'fs-ai-url' (se server/).
const REGLER = [
  [/spise|mat|sulten|middag|lunsj|burger|sushi|thai|burrito/, ['Mat']],
  [/\btren(e|ing)\b|treningssenter|gym|yoga|spinning|zumba|\bpt\b|\bform\b/, ['Trening']],
  [/medisin|apotek|resept|såle|bandasj|kompresjon/, null, ['Fokus Apotek']],
  [/hund|katt|dyr|veterinær|kjæledyr/, ['Dyr']],
  [/hår|frisør|klipp|hud|vipper|bryn|negl|massasje|voks/, ['Skjønnhet']],
  [/hørsel|øre|tinnitus/, null, ['HØR']],
  [/fot|liktorn|negl/, null, ['Fotterapi']],
  [/lade|elbil|bensin|diesel|tanke|bilvask|vaske bil|drivstoff/, ['Bil']],
  [/kontor|leie|lokale|coworking|møterom/, ['Kontor']],
  [/dagligvare|handle|melk|brød|matvare|søndag/, ['Dagligvare']],
  [/brukt|gjenbruk|selge/, null, ['Gjenbruk']],
  [/kirke|menighet|gudstjeneste/, ['Fellesskap']],
  [/varmepumpe|renhold|vask|eiendom/, ['Tjenester']],
];
export async function svar(t, data) {
  const q = t.toLowerCase(), B = data.butikker;
  if (/parker/.test(q)) return { tekst: 'Det er gratis parkering for besøkende på Fokussenteret, Storgaten 90.' };
  if (/adresse|hvor ligger|finne fram|veibeskrivelse/.test(q)) return { tekst: 'Fokussenteret ligger i Storgaten 90, 4877 Grimstad, rett ved E18 og Storgaten.' };
  if (/senterleder|kontakt|telefon|e-post/.test(q) && !/kontor/.test(q)) return { tekst: 'Senteret: 370 21 499, post@fokussenteret.no. Senterleder Lars Henrik Wold: 975 48 487.' };
  const url = localStorage.getItem('fs-ai-url');
  if (url) {
    try { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sporsmal: t }), signal: AbortSignal.timeout(15000) }); if (r.ok) { const j = await r.json(); if (j.svar) return { tekst: j.svar + ' (lokal AI)' }; } } catch (_) {}
  }
  const bareApne = /åpen|åpent|nå\b/.test(q);
  let treff = [];
  for (const [re, kat, navn] of REGLER) if (re.test(q)) treff.push(...B.filter((b) => (kat && kat.includes(b.kategori)) || (navn && navn.some((n) => b.navn.includes(n)))));
  if (!treff.length) treff = B.filter((b) => q.split(/\s+/).some((o) => o.length > 3 && (b.navn + ' ' + b.sokeord + ' ' + b.beskrivelse).toLowerCase().includes(o)));
  if (!treff.length && bareApne) treff = B;
  treff = [...new Set(treff)];
  if (bareApne) treff = treff.filter((b) => erApen(b.apningstider) === true);
  if (!treff.length) return { tekst: bareApne ? 'Fant ingen med kjente åpningstider som har åpent akkurat nå.' : 'Jeg fant ikke noe som passer. Prøv f.eks. «mat», «trening», «apotek» eller «lade elbil», eller ring senteret på 370 21 499.' };
  return { tekst: `${treff.length === 1 ? 'Dette' : 'Disse'} kan hjelpe deg${bareApne ? ' (åpent nå)' : ''}:`, treff: treff.slice(0, 6) };
}
