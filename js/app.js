import { erApen, iDag, tekst } from './tider.js';
import { svar } from './veiviser.js';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const IKON = { Dagligvare: ['🛒', '#e6f4ec'], Helse: ['➕', '#e5f0fb'], Dyr: ['🐾', '#fff1d6'], Trening: ['🏋️', '#ffe6dc'], Skjønnhet: ['✂️', '#fbe7f3'], Mat: ['🍔', '#fff1d6'], Butikk: ['🛍️', '#efe9ff'], Tjenester: ['🧰', '#eef1f4'], Bil: ['🚗', '#e5f0fb'], Fellesskap: ['⛪', '#efe9ff'], Kontor: ['💼', '#e6f4ec'] };
let data, kat = '';
const status = (b) => { const a = erApen(b.apningstider); return a === null ? ['ukjent', b.apningstider_tekst || 'Åpningstider ikke oppgitt'] : a ? ['', 'Åpent nå · ' + iDag(b.apningstider)] : ['stengt', 'Stengt nå · i dag ' + iDag(b.apningstider)]; };
function kort(b) {
  const [ik, bg] = IKON[b.kategori] || ['•', '#eee'], [k, t] = status(b);
  return `<button class="kort" data-navn="${esc(b.navn)}"><span class="kort-topp"><span class="ikon" style="background:${bg}" aria-hidden="true">${ik}</span><span><h3>${esc(b.navn)}</h3><span class="kat">${esc(b.kategori)}${b.etasje ? ' · ' + esc(b.etasje) : ''}</span></span></span><p>${esc(b.beskrivelse)}</p><span class="na ${k}">${esc(t)}</span></button>`;
}
function vis() {
  const q = $('#sok').value.toLowerCase().trim(), na = $('#aapen-na').checked;
  const r = data.butikker.filter((b) => (!kat || b.kategori === kat) && (!na || erApen(b.apningstider) === true) && (!q || (b.navn + ' ' + b.beskrivelse + ' ' + b.sokeord + ' ' + b.kategori).toLowerCase().includes(q)));
  $('#rutenett').innerHTML = r.map(kort).join('') || '<p>Ingen treff.</p>';
  $('#treff').textContent = `${r.length} av ${data.butikker.length}`;
}
function apne(navn) {
  const b = data.butikker.find((x) => x.navn === navn); if (!b) return;
  const rad = (n, v) => `<dt>${n}</dt><dd>${v ?? '<span class="dempet">Ikke oppgitt</span>'}</dd>`;
  $('#m-innhold').innerHTML = `<h2 id="m-navn">${esc(b.navn)}</h2><p>${esc(b.beskrivelse)}</p><dl class="felt">
    ${rad('Kategori', esc(b.kategori))}${rad('Åpningstider', tekst(b.apningstider) ? esc(tekst(b.apningstider)) + (b.apningstider_tekst ? '<br>' + esc(b.apningstider_tekst) : '') : b.apningstider_tekst && esc(b.apningstider_tekst))}
    ${rad('Telefon', b.telefon && `<a href="tel:${b.telefon.replace(/\s/g, '')}">${esc(b.telefon)}</a>`)}${rad('E-post', b.epost && `<a href="mailto:${esc(b.epost)}">${esc(b.epost)}</a>`)}
    ${rad('Nettside', b.nettside && `<a href="https://${esc(b.nettside)}" rel="noopener">${esc(b.nettside)}</a>`)}${rad('Plassering', b.etasje && esc(b.etasje))}</dl>
    <p class="dempet">Kilde: <a href="${esc(b.kilde)}" rel="noopener">${esc(b.kilde)}</a> (hentet ${data.hentet}). Sjekk med bedriften for oppdatert info.</p>`;
  $('#modal').showModal();
}
function boble(h, k) { const d = document.createElement('div'); d.className = 'boble ' + k; d.innerHTML = h; $('#chat').append(d); $('#chat').scrollTop = 1e6; }
async function spor(t) {
  if (!t.trim()) return; boble(esc(t), 'bruker');
  const s = await svar(t, data);
  boble(esc(s.tekst) + (s.treff || []).map((b) => `<button class="mini" data-navn="${esc(b.navn)}">${esc(b.navn)} – ${esc(status(b)[1])}</button>`).join(''), 'bot');
}
async function init() {
  data = await (await fetch('data/senteret.json')).json();
  const s = data.senter, apen = erApen(s.apningstider);
  $('#status-topp').textContent = apen ? 'Senteret er åpent nå' : 'Senteret er stengt nå';
  $('#status-topp').classList.toggle('stengt', !apen);
  $('#tid-senter').textContent = 'I dag: ' + iDag(s.apningstider);
  $('#tid-bunnpris').textContent = 'I dag: ' + iDag(data.butikker.find((b) => b.navn.startsWith('Bunnpris')).apningstider);
  $('#hentet').textContent = `(hentet ${data.hentet})`; $('#antall').textContent = data.butikker.length;
  const kats = ['', ...new Set(data.butikker.map((b) => b.kategori))];
  $('#chips').innerHTML = kats.map((k) => `<button type="button" aria-pressed="${k === ''}" data-kat="${k}">${k || 'Alle'}</button>`).join('');
  $('#chips').onclick = (e) => { const b = e.target.closest('[data-kat]'); if (!b) return; kat = b.dataset.kat; $('#chips').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); vis(); };
  $('#sok').oninput = vis; $('#aapen-na').onchange = vis; vis();
  document.addEventListener('click', (e) => { const k = e.target.closest('[data-navn]'); if (k) apne(k.dataset.navn); });
  $('#m-lukk').onclick = () => $('#modal').close();
  $('#chat-skjema').onsubmit = (e) => { e.preventDefault(); spor($('#chat-felt').value); $('#chat-felt').value = ''; };
  $('#forslag').onclick = (e) => { if (e.target.tagName === 'BUTTON') spor(e.target.textContent); };
  boble('Hei! Hva leter du etter i dag? Jeg kan finne butikker og tjenester og si hvem som har åpent nå.', 'bot');
}
init();
