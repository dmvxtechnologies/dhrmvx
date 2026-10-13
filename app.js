'use strict';
const $ = s => document.querySelector(s), view = $('#view');
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATS = ['Hackathon', 'Workshop', 'Internship', 'Course'], PLURAL = { Hackathon: 'Hackathons', Workshop: 'Workshops', Internship: 'Internships', Course: 'Courses' };
const QUOTES = ['Every expert was once a beginner.', 'Learn today. Build tomorrow.', 'Skills create opportunities.', 'Your next opportunity could be one click away.', 'Learn. Build. Grow. Create Your Opportunity.'];
let me = { user: null, admin: null };
/* Genuine public contact details and social profiles go here. Empty values are simply not shown. */
const SITE = { email: '', phone: '', socials: [] /* e.g. { name: 'LinkedIn', url: 'https://...' } */ };
const BELL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
const ART = {
  Hackathon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 18 8 32l14 14M42 18l14 14-14 14M36 12 28 52"/></svg>',
  Workshop: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="14" width="48" height="32" rx="4"/><path d="M4 52h56M24 30l-6 5 6 5M40 30l6 5-6 5"/></svg>',
  Internship: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="20" width="48" height="34" rx="5"/><path d="M24 20v-6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6M8 34h48"/></svg>',
  Course: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 14h20a6 6 0 0 1 4 2 6 6 0 0 1 4-2h20v34H36a6 6 0 0 0-4 2 6 6 0 0 0-4-2H8zM32 16v34"/></svg>'
};
const EYE_ON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.4 0-10-7-10-7a18 18 0 0 1 4.1-5M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
document.addEventListener('click', ev => { // delegated handlers (no inline handlers, so the strict CSP stays intact)
  const eye = ev.target.closest('.eye');
  if (eye) { const i = eye.previousElementSibling, show = i.type === 'password'; i.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', show); eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); eye.innerHTML = show ? EYE_OFF : EYE_ON; return; }
  if (ev.target.closest('[data-close]')) ev.target.closest('.modal').remove();
  if (ev.target.closest('[data-skip]')) view.focus();
});
document.addEventListener('error', ev => { const t = ev.target; if (t.tagName === 'IMG' && t.dataset.fallback) t.replaceWith(document.createTextNode(t.dataset.fallback)); }, true);
function footer() {
  const c = [SITE.email && `<a href="mailto:${e(SITE.email)}">${e(SITE.email)}</a>`, SITE.phone && `<a href="tel:${e(SITE.phone)}">${e(SITE.phone)}</a>`, ...SITE.socials.map(s => `<a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.name)}</a>`)].filter(Boolean);
  $('#foot').innerHTML = `<div class="wrap"><div class="fgrid"><div><a class="brand" href="#/"><img src="/logo.png" alt="">Dharmovix</a><p>Hackathons, workshops, internships and courses for students.</p></div>
  <div><h4>Explore</h4><a href="#/opportunities">Opportunities</a><a href="#/achieve">Achieve</a><a href="#/ats">ATS Checker</a><a href="#/about">About</a></div><div><h4>Account</h4><a href="#/login">Login</a><a href="#/register">Register</a></div>
  ${c.length ? `<div><h4>Contact</h4>${c.join('')}</div>` : ''}</div><p class="fbot">© Dharmovix. All Rights Reserved.</p></div>`;
}

async function api(url, o = {}) {
  const opt = { method: o.method || 'GET', headers: { 'X-Requested-With': 'dharmovix' }, credentials: 'same-origin' };
  if (o.body instanceof FormData) opt.body = o.body; else if (o.body) { opt.body = JSON.stringify(o.body); opt.headers['Content-Type'] = 'application/json'; }
  const r = await fetch('/api' + url, opt), d = await r.json().catch(() => ({}));
  if (!r.ok) { const err = new Error(d.error || 'Request failed.'); err.status = r.status; throw err; }
  return d;
}
function toast(msg, bad) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; $('#toasts').append(t); setTimeout(() => t.remove(), 4200); }
const pill = s => `<span class="pill ${e(String(s).toLowerCase().replace(/ /g, '-'))}">${e(s)}</span>`;
const fmtDate = d => d ? new Date(d.length === 10 ? d + 'T00:00:00' : d.replace(' ', 'T') + 'Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
const img = o => o.image ? `<img src="/uploads/${e(o.image)}" alt="" loading="lazy">` : '';
function confirmBox(msg, label = 'Delete') {
  return new Promise(res => { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div role="dialog" aria-modal="true"><h3>${e(msg)}</h3><div class="acts" style="margin-top:18px"><button class="btn bad" id="y">${e(label)}</button><button class="btn ghost" id="n">Cancel</button></div></div>`;
    document.body.append(m); m.querySelector('#y').onclick = () => { m.remove(); res(true); }; m.querySelector('#n').onclick = () => { m.remove(); res(false); }; });
}
function modal(html) { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div role="dialog" aria-modal="true">${html}</div>`; document.body.append(m);
  m.addEventListener('mousedown', ev => { if (ev.target === m) m.remove(); }); m.close = () => m.remove(); return m; }


/* ---------- Motion helpers: scroll reveal + count-up (skipped for reduced motion) ---------- */
const RM = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let io, rvT;
function countUp(el) { el.dataset.cu = 1; const n = parseInt(el.textContent, 10); if (isNaN(n) || n === 0 || RM()) return; const t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / 700); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
function reveal() {
  const ph = document.querySelector('#view .pagehead:not([data-bg])');
  if (ph) { ph.dataset.bg = 1; ph.classList.add({ opportunities: 'bg-opps', achieve: 'bg-achieve', ats: 'bg-ats', about: 'bg-about' }[(location.hash || '#/').split(/[\/?]/)[1]] || 'bg-profile'); }
  document.querySelectorAll('#view .stat b:not([data-cu])').forEach(countUp);
  if (!('IntersectionObserver' in window) || RM()) return;
  io = io || new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); setTimeout(() => x.target.style.setProperty('--i', 0), 900); } }), { rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('#view :is(.card,.step,.stat,.panel,.sechead,.tile):not([data-rv])').forEach((el, i) => { el.dataset.rv = 1; el.style.setProperty('--i', i % 8); el.classList.add('rv'); io.observe(el); });
}
new MutationObserver(() => { clearTimeout(rvT); rvT = setTimeout(reveal, 30); }).observe(view, { childList: true, subtree: true });

/* ---------- Guide character (Dharmo): shown once per visit to visitors on the ATS page; any key or tap moves to the next step ---------- */
const MASCOT = '<svg viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dharmo, the Dharmovix guide"><rect x="26" y="98" width="26" height="46" rx="9" fill="#F59E0B"/><rect x="49" y="148" width="16" height="32" rx="7" fill="#1E293B"/><rect x="77" y="148" width="16" height="32" rx="7" fill="#1E293B"/><ellipse cx="55" cy="183" rx="14" ry="6" fill="#F8FAFC"/><ellipse cx="87" cy="183" rx="14" ry="6" fill="#F8FAFC"/><path d="M42 102Q70 90 98 102L102 156Q70 164 38 156Z" fill="#3B82F6"/><path d="M60 102Q70 116 80 102" stroke="#1D4ED8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M45 112Q31 128 37 146" stroke="#3B82F6" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="37" cy="149" r="7.5" fill="#F2C9A0"/><g class="m-arm"><path d="M96 112Q116 104 123 82" stroke="#3B82F6" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="124" cy="77" r="7.5" fill="#F2C9A0"/></g><circle cx="70" cy="66" r="33" fill="#F2C9A0"/><path d="M37 62Q38 32 70 32Q102 32 103 62Q92 48 70 48Q48 48 37 62Z" fill="#2B1B17"/><polygon points="70,14 114,31 70,47 26,31" fill="#111827"/><path d="M50 40v10q20 10 40 0V40" fill="#1F2937"/><path d="M110 32v22" stroke="#FBBF24" stroke-width="3"/><circle cx="110" cy="56" r="4.5" fill="#FBBF24"/><g class="m-eyes"><ellipse cx="58" cy="70" rx="4" ry="5" fill="#0B1120"/><ellipse cx="82" cy="70" rx="4" ry="5" fill="#0B1120"/><circle cx="59.5" cy="68" r="1.3" fill="#fff"/><circle cx="83.5" cy="68" r="1.3" fill="#fff"/></g><circle cx="49" cy="80" r="5" fill="#F29B9B" opacity=".55"/><circle cx="91" cy="80" r="5" fill="#F29B9B" opacity=".55"/><path class="m-mouth" d="M60 81Q70 94 80 81Q70 85 60 81Z" fill="#7F1D1D"/></svg>';
const GUIDE = [
  { k: 'Hello', t: "Hi, I'm Dharmo 👋", p: 'I will show you around Dharmovix in three quick steps.', hint: 'Press any key or tap to start' },
  { k: 'Step 1 of 3 · Registration', t: 'Pls register for the updates', p: "It's not ur biryani cost 🍗😋 It is a one-time ₹49, and that is all you pay. Spot the glowing Register button at the top? That's the one 👆" },
  { k: 'Step 2 of 3 · How to join', t: 'Pay, verify, done', p: 'Scan the QR on the Register page, type your UPI reference, and we email you the moment your account is approved 📩 Still cheaper than a biryani 🍛' },
  { k: 'Step 3 of 3 · What you get', t: 'A lot for ₹49', p: 'Hackathons, workshops, internships and courses, an email alert whenever a new one goes live, career roadmaps in Achieve, and this resume checker 🎓', hint: 'Press any key to finish' }
];
let gEl = null, gStep = 0, gLast = 0, gT = null, gTalk = null;
function guideStop() { clearInterval(gT); clearTimeout(gTalk); if (gEl) gEl.remove(); gEl = null; document.body.classList.remove('guide-on'); }
function guideRender() {
  const s = GUIDE[gStep], b = $('#gb'), m = gEl.querySelector('.mascot'); gLast = Date.now();
  b.innerHTML = `<p class="gk">${e(s.k)}</p><h3 id="gt">${e(s.t)}</h3><p>${e(s.p)}</p><a class="btn sm" href="#/register">Take me to Register</a>
  <div class="gfoot"><span class="dots" aria-hidden="true">${[1, 2, 3].map(n => `<i class="${n <= gStep ? 'on' : ''}"></i>`).join('')}</span><span class="hint">${e(s.hint || 'Press any key or tap to continue')}</span></div>`;
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  m.classList.add('talk'); clearTimeout(gTalk); gTalk = setTimeout(() => m.classList.remove('talk'), 2200);
}
function guideNext() { if (!gEl || Date.now() - gLast < 350) return; if (++gStep >= GUIDE.length) return guideStop(); guideRender(); }
function guideShow() {
  sessionStorage.dvGuide = 1; if (document.activeElement) document.activeElement.blur();
  gEl = document.createElement('div'); gEl.className = 'guide'; gEl.setAttribute('role', 'dialog'); gEl.setAttribute('aria-modal', 'true'); gEl.setAttribute('aria-labelledby', 'gt');
  gEl.innerHTML = `<div class="gbd"></div><div class="gwrap"><div class="bubble" id="gb" aria-live="polite"></div><div class="mascot" aria-hidden="true">${MASCOT}</div></div>`;
  document.body.append(gEl); document.body.classList.add('guide-on'); gStep = 0; guideRender();
}
function guideStart() { guideStop(); if (me.user || sessionStorage.dvGuide) return; gT = setInterval(() => { if (!$('#intro').hidden) return; clearInterval(gT); if (!me.user) guideShow(); }, 600); }
document.addEventListener('keydown', ev => { if (!gEl) return; if (ev.key === 'Escape') return guideStop();
  if (ev.repeat || ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(ev.key) || (ev.target.closest && ev.target.closest('.guide a'))) return; ev.preventDefault(); guideNext(); });
document.addEventListener('click', ev => { if (gEl && !ev.target.closest('a,button')) guideNext(); });

/* ---------- ATS resume analysis (rule-based estimate) ---------- */
const KW = {
  'Data Scientist': ['python', 'sql', 'pandas', 'numpy', 'machine learning', 'statistics', 'scikit-learn', 'tensorflow', 'data visualization', 'tableau', 'power bi', 'deep learning'],
  'Data Analyst': ['excel', 'sql', 'power bi', 'tableau', 'python', 'dashboard', 'data cleaning', 'statistics', 'reporting', 'analysis', 'visualization'],
  'Java Developer': ['java', 'spring boot', 'hibernate', 'jdbc', 'sql', 'rest api', 'microservices', 'junit', 'maven', 'git', 'multithreading', 'oop'],
  'Full Stack Developer': ['javascript', 'react', 'node.js', 'html', 'css', 'sql', 'mongodb', 'rest api', 'git', 'typescript', 'docker'],
  'Frontend Developer': ['html', 'css', 'javascript', 'react', 'typescript', 'responsive', 'accessibility', 'git', 'redux', 'tailwind', 'rest api'],
  'Backend Developer': ['node.js', 'python', 'java', 'sql', 'rest api', 'authentication', 'docker', 'redis', 'microservices', 'git', 'postgresql'],
  'AI / ML Engineer': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'nlp', 'computer vision', 'scikit-learn', 'neural networks', 'llm', 'mlops'],
  'DevOps Engineer': ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform', 'aws', 'linux', 'git', 'ansible', 'monitoring', 'bash'],
  'Cyber Security Analyst': ['networking', 'linux', 'owasp', 'penetration testing', 'siem', 'cryptography', 'vulnerability', 'incident response', 'python', 'wireshark', 'firewall'],
  'Mobile App Developer': ['kotlin', 'swift', 'flutter', 'android', 'ios', 'firebase', 'rest api', 'react native', 'git', 'ui'],
  'Cloud Engineer': ['aws', 'azure', 'gcp', 'terraform', 'docker', 'kubernetes', 'linux', 'networking', 'serverless', 'iam', 'monitoring'],
  'UI/UX Designer': ['figma', 'wireframes', 'prototyping', 'user research', 'usability testing', 'design system', 'accessibility', 'adobe xd', 'typography', 'case study']
};
const VERBS = ['built', 'developed', 'designed', 'implemented', 'created', 'led', 'managed', 'improved', 'optimized', 'optimised', 'delivered', 'launched', 'automated', 'analyzed', 'analysed', 'reduced', 'increased', 'deployed', 'integrated', 'collaborated', 'organized', 'organised', 'achieved', 'engineered', 'trained', 'mentored', 'tested', 'wrote', 'presented', 'coordinated', 'architected', 'migrated', 'resolved'];
function analyzeResume(raw, role) {
  const text = String(raw || '').replace(/\r/g, ''), words = (text.match(/[A-Za-z0-9][\w'+#.-]*/g) || []).length;
  if (words < 40) throw new Error(`We could only read ${words} words. If your PDF is a scanned image, upload a text-based copy or paste the text.`);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean), norm = ' ' + text.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ') + ' ';
  const has = k => norm.includes(' ' + k.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim() + ' ');
  const head = re => lines.some(l => l.length < 45 && re.test(l.toLowerCase().replace(/[:|]/g, '').trim()));
  const checks = [], add = (title, pts, max, ok, part, bad) => checks.push({ title, pts, max, state: pts === max ? 'ok' : pts > 0 ? 'warn' : 'bad', tip: pts === max ? ok : pts > 0 ? part : bad });
  add('Email address', /[\w.+-]+@[\w-]+(\.[\w-]+)+/.test(text) ? 6 : 0, 6, 'Email found.', '', 'Add a professional email address at the top.');
  add('Phone number', /\b[6-9]\d{4}[\s-]?\d{5}\b|\+\d{1,3}[\s-]?\d{3,5}[\s-]?\d{3,5}[\s-]?\d{2,4}|\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/.test(text) ? 5 : 0, 5, 'Phone number found.', '', 'Add a phone number so recruiters can reach you.');
  add('LinkedIn / GitHub / portfolio link', /linkedin\.com|github\.com|gitlab\.com|behance\.net|portfolio/i.test(text) ? 4 : 0, 4, 'Profile link found.', '', 'Add a LinkedIn, GitHub or portfolio link.');
  [['Summary or objective', /^(professional |career )?(summary|objective|profile)|^about me/], ['Education section', /^(education|academic|qualifications)/], ['Experience or internships section', /^(work |professional |relevant )?(experience|internships?|employment)/],
   ['Projects section', /^(academic |personal |key )?projects?/], ['Skills section', /^(technical |key |core )?skills|^technologies|^core competencies/]]
    .forEach(([t, re]) => add(t, head(re) ? 5 : 0, 5, 'Section heading found.', '', `Add a clear "${t.replace(' section', '').replace(' or internships', '')}" heading so the ATS can find it.`));
  add('Length', words >= 250 && words <= 900 ? 10 : (words >= 150 && words <= 1200 ? 5 : 0), 10, `Good length (${words} words).`, `${words} words. Aim for 250-900 (one to two pages).`, `${words} words is too ${words < 150 ? 'short' : 'long'}. Aim for 250-900.`);
  const vs = VERBS.filter(v => new RegExp('\\b' + v + '\\b', 'i').test(text)).length;
  add('Action verbs', vs >= 6 ? 10 : vs >= 3 ? 6 : vs >= 1 ? 3 : 0, 10, `${vs} strong action verbs.`, `${vs} action verbs. Start more bullets with verbs like built, led, improved.`, 'Start bullets with action verbs like built, designed, improved.');
  const qn = (text.match(/\b\d+(?:\.\d+)?\s?(?:%|x\b)|[₹$]\s?\d|\b\d+\+|\b\d{2,}\s+(?:users|students|customers|members|projects|clients|records|requests|downloads|participants|teams)\b/gi) || []).length;
  add('Measurable results', qn >= 3 ? 10 : qn >= 1 ? 5 : 0, 10, `${qn} measurable results.`, 'Add more numbers (%, users, time saved) to show impact.', 'Add numbers that show impact, like "reduced load time by 30%".');
  const bl = lines.filter(l => /^[•●▪◦·‣*\-–—]\s*\S/.test(l)).length, vl = lines.filter(l => VERBS.includes((l.split(/\s+/)[0] || '').toLowerCase())).length;
  add('Bullet points', bl >= 4 || vl >= 4 ? 5 : 0, 5, 'Uses short, scannable points.', '', 'Use short bullet points instead of long paragraphs.');
  add('Dates', (text.match(/\b(?:19|20)\d{2}\b/g) || []).length >= 2 ? 5 : 0, 5, 'Dates found.', '', 'Add years for education and experience.');
  let found = [], missing = [];
  if (role && KW[role]) { found = KW[role].filter(has); missing = KW[role].filter(k => !has(k)); add(`Keywords for ${role}`, Math.round(20 * found.length / KW[role].length), 20, `All ${found.length} keywords found.`, `${found.length} of ${KW[role].length} keywords found. Add the missing ones where they are true.`, `None of the ${KW[role].length} key skills found. Add the ones you really have.`); }
  const got = checks.reduce((s, c) => s + c.pts, 0), max = checks.reduce((s, c) => s + c.max, 0), score = Math.round(got / max * 100);
  return { score, label: score >= 90 ? 'Excellent' : score >= 75 ? 'Strong' : score >= 50 ? 'Good start' : 'Needs work', checks, found, missing, words };
}

/* ---------- Intro (butterflies) ---------- */
const BF = c => `<svg viewBox="0 0 60 50"><g><path d="M30 25C22 4 4 2 3 14c-1 11 12 16 27 11z" fill="${c[0]}"/><path d="M30 25C20 38 10 50 18 48c9-2 14-11 12-23z" fill="${c[1]}"/>
<path d="M30 25C38 4 56 2 57 14c1 11-12 16-27 11z" fill="${c[0]}"/><path d="M30 25C40 38 50 50 42 48c-9-2-14-11-12-23z" fill="${c[1]}"/></g><rect x="29" y="14" width="2" height="26" rx="1" fill="#fff"/></svg>`;
function intro() { // phase 1: logo + loading animation; phase 2: headline and "Get Started"
  if (sessionStorage.dvIntro || location.hash.startsWith('#/admin')) return;
  const el = $('#intro'); el.hidden = false; el.classList.remove('ready'); document.body.style.overflow = 'hidden';
  const cols = [['#60A5FA', '#3B82F6'], ['#F9A8D4', '#F472B6'], ['#34D399', '#10B981'], ['#FCD34D', '#F59E0B']];
  let f = ''; for (let i = 0; i < 5; i++) f += `<div class="bf" style="top:${12 + i * 17}%;--t:${13 + i * 2}s;--d:${i * 1.4}s;--b:${2.2 + i * .3}s;--s:${30 + (i % 3) * 14}px"><div>${BF(cols[i % 4])}</div></div>`;
  for (let i = 0; i < 10; i++) f += `<i class="dot" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%"></i>`;
  el.innerHTML = `${f}<div class="in"><div class="lw"><svg class="spin" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47"/></svg><img class="logo" src="/logo.png" alt="Dharmovix Technologies"></div>
  <div class="ld"><div class="loadbar"><i></i></div><p class="loadtxt">Loading Dharmovix…</p></div>
  <div class="after"><h1>Learn. Build. Grow.<br>Create Your Opportunity.</h1><div class="stage" id="stage">Growth</div><button class="btn lg" id="go">Get Started</button></div></div>`;
  const words = ['Growth', 'Learning', 'Transformation', 'Opportunity']; let i = 0, t;
  const ready = () => { el.classList.add('ready'); t = setInterval(() => { i = (i + 1) % 4; $('#stage').textContent = words[i]; }, 1500); $('#go').focus(); };
  const rt = setTimeout(ready, RM() ? 0 : 1800);
  $('#go').onclick = () => { clearTimeout(rt); clearInterval(t); sessionStorage.dvIntro = 1; el.classList.add('out'); document.body.style.overflow = ''; setTimeout(() => { el.hidden = true; el.innerHTML = ''; el.classList.remove('out', 'ready'); }, 850); };
}

/* ---------- Layout ---------- */
function nav() {
  const r = location.hash || '#/', on = h => r.startsWith(h) ? 'on' : '';
  const L = me.user
    ? `<a href="#/" class="${r === '#/' ? 'on' : ''}">Home</a><a href="#/opportunities" class="${on('#/opportunities')}">Opportunities</a><a href="#/achieve" class="${on('#/achieve')}">Achieve</a><a href="#/ats" class="${on('#/ats')}">ATS Checker</a><a href="#/applications" class="${on('#/applications')}">My Applications</a><a href="#/profile" class="${on('#/profile')}">Profile</a><a href="#/opportunities" id="bell" aria-label="New opportunities" title="New opportunities">${BELL}<b id="bn" hidden></b></a><a href="#" id="out" class="ghostbtn">Logout</a>`
    : `<a href="#/" class="${r === '#/' ? 'on' : ''}">Home</a><a href="#/opportunities" class="${r === '#/opportunities' ? 'on' : ''}">Opportunities</a><a href="#/achieve" class="${on('#/achieve')}">Achieve</a><a href="#/ats" class="${on('#/ats')}">ATS Checker</a><a href="#/about" class="${on('#/about')}">About</a><a href="#/admin-login">Admin Login</a><a href="#/login" class="${on('#/login')}">Login</a><a href="#/register" class="cta">Register</a>`;
  $('#nav').innerHTML = `<div class="wrap"><a class="brand" href="#/"><img src="/logo.png" alt="">Dharmovix</a><button id="burger" aria-label="Menu" aria-expanded="false">☰</button><nav id="links">${L}</nav></div>`;
  $('#burger').onclick = ev => { const o = $('#links').classList.toggle('open'); ev.target.setAttribute('aria-expanded', o); };
  $('#links').onclick = ev => { if (ev.target.id === 'out') { ev.preventDefault(); api('/logout', { method: 'POST' }).finally(() => { me.user = null; location.hash = '#/'; route(); }); } $('#links').classList.remove('open'); };
  bell();
}
async function bell() { // in-site notification: counts opportunities published since the user last opened Opportunities
  if (!me.user) return; const key = 'dvSeen_' + me.user.id;
  try { const l = await api('/opportunities'), mx = Math.max(0, ...l.map(o => o.id)); let s = localStorage.getItem(key);
    if (s === null || (location.hash || '').startsWith('#/opportunities')) { localStorage.setItem(key, mx); s = mx; }
    const n = l.filter(o => o.id > +s).length, b = $('#bn'); if (b) { b.hidden = !n; b.textContent = n; } } catch { }
}
function quote() { return `<p class="quote" id="q">“${e(QUOTES[Math.floor(Math.random() * QUOTES.length)])}”</p>`; }
let qt; function rotateQuotes() { clearInterval(qt); qt = setInterval(() => { const q = $('#q'); if (!q) return clearInterval(qt); q.classList.add('out'); setTimeout(() => { q.textContent = '“' + QUOTES[Math.floor(Math.random() * QUOTES.length)] + '”'; q.classList.remove('out'); }, 500); }, 6000); }
const page = (t, s, inner) => `<section class="pagehead"><div class="wrap"><h1>${e(t)}</h1><p>${e(s)}</p>${inner || ''}</div></section>`;
const card = o => `<article class="card c-${e(o.category)}"><div class="img">${ART[o.category] || ''}${img(o)}</div><div class="body"><span class="badge">${e(o.category)}</span><h3>${e(o.title)}</h3><p>${e(o.description)}</p>
<div class="meta"><span>${fmtDate(o.date)}</span><span>${o.my_status ? pill(o.my_status) : pill('Open')}</span></div><a class="btn navy sm" href="#/opportunity/${o.id}">View Details</a></div></article>`;

/* ---------- Public pages ---------- */
const pages = {};
pages.home = async () => {
  const list = await api('/opportunities').catch(() => []);
  view.innerHTML = `<section class="hero"><div class="wrap"><div><h1><span class="w" style="--n:0">Discover.</span> <span class="w" style="--n:1">Learn.</span> <span class="w" style="--n:2">Compete.</span> <span class="w ul" style="--n:3">Grow.<svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8C20 2 38 12 60 6S100 3 118 7" pathLength="1"/></svg></span></h1><p>Discover hackathons, workshops, internships and courses designed to help you build skills and create new opportunities.</p>
  <div class="actions"><a class="btn lg" href="#/opportunities">Search Opportunities</a><a class="btn lg ghost" href="#/achieve">Explore career roadmaps</a></div></div><img class="logo round" src="/logo.png" alt="Dharmovix Technologies"></div></section>
  <section class="sec"><div class="wrap"><div class="sechead"><div><h2>Latest opportunities</h2><p class="sub">Hackathons, workshops, internships and courses added by the Dharmovix team.</p></div><a href="#/opportunities">View all</a></div>
  <div class="grid">${list.slice(0, 4).map(card).join('') || '<p class="empty">New opportunities will appear here soon.</p>'}</div></div></section>
  <section class="sec alt"><div class="wrap"><div class="grid promos">
  <div class="card promo c-Workshop"><div><h2>Not sure where to start?</h2><p class="sub">Pick the role you want to become and get a step-by-step learning roadmap.</p></div><a class="btn" href="#/achieve">Open Achieve</a></div>
  <div class="card promo c-Hackathon"><div><h2>Is your resume ATS-ready?</h2><p class="sub">Upload your resume and get an instant score with tips to improve it.</p></div><a class="btn" href="#/ats">Check my resume</a></div></div></div></section>
  ${me.user ? '' : `<section class="sec"><div class="wrap"><h2>How it works</h2><div class="grid steps3">
  <div class="card step"><h3>Register and pay ₹49</h3><p>Create your account and pay the one-time registration fee with the QR code.</p></div>
  <div class="card step"><h3>Get approved</h3><p>We verify your payment and approve your account. You get an email when it is done.</p></div>
  <div class="card step"><h3>Apply to opportunities</h3><p>Log in, browse hackathons, workshops, internships and courses, and apply.</p></div></div></div></section>`}
  <section class="sec tint"><div class="wrap">${quote()}</div></section>`;
  rotateQuotes();
};
pages.opportunities = async params => {
  let cat = CATS.includes(params.get('c')) ? params.get('c') : '', q = (params.get('s') || '').slice(0, 80);
  const title = cat ? PLURAL[cat] : 'Opportunities';
  view.innerHTML = page(title, cat ? `Browse current ${PLURAL[cat].toLowerCase()}.` : 'Everything open right now.', `<div class="search"><input id="q" type="search" placeholder="Search opportunities, hackathons, internships, workshops or courses..." aria-label="Search" value="${e(params.get('s') || '')}"></div>
  <div class="chips">${['', ...CATS].map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${c}">${c ? PLURAL[c] : 'All'}</button>`).join('')}</div>`) + `<section class="sec"><div class="wrap"><div class="grid" id="res"></div></div></section>`;
  let tm, seq = 0;
  const load = async () => { const my = ++seq; $('#res').innerHTML = '<div class="skeleton"></div>'.repeat(3);
    try { const d = await api(`/opportunities?q=${encodeURIComponent(q)}&category=${cat}`); if (my !== seq) return; $('#res').innerHTML = d.map(card).join('') || '<p class="empty">No opportunities match your search. Try a different keyword or category.</p>'; }
    catch (x) { $('#res').innerHTML = `<p class="empty">${e(x.message)}</p>`; } };
  $('#q').oninput = ev => { clearTimeout(tm); q = ev.target.value; tm = setTimeout(load, 250); };
  document.querySelectorAll('.chip').forEach(b => b.onclick = () => { cat = b.dataset.c; document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); load(); });
  load();
};
pages.opportunity = async id => {
  try { const o = await api('/opportunities/' + id);
    view.innerHTML = `<div class="wrap detail"><div><div class="big">${img(o)}</div>
    <span class="badge c-${e(o.category)}" style="margin-top:20px">${e(o.category)}</span><h1 style="margin-top:8px">${e(o.title)}</h1><p style="white-space:pre-wrap">${e(o.description)}</p>
    ${o.additional_info ? `<h3>Important information</h3><p style="white-space:pre-wrap">${e(o.additional_info)}</p>` : ''}</div>
    <aside><div class="box"><p><b>Date</b><br>${fmtDate(o.date)}</p>${o.registration_link ? `<p><b>Registration link</b><br><a href="${e(o.registration_link)}" target="_blank" rel="noopener noreferrer">${e(o.registration_link)}</a></p>` : ''}
    ${o.my_status ? `<p>Your application: ${pill(o.my_status)}</p>${o.registration_link ? `<a class="btn ghost block" href="${e(o.registration_link)}" target="_blank" rel="noopener noreferrer">Open registration page ↗</a>` : ''}` : (o.registration_link ? `<a class="btn block" id="apply" href="${e(o.registration_link)}" target="_blank" rel="noopener noreferrer">Apply / Register ↗</a>` : `<button class="btn block" id="apply">Apply / Register</button>`)}</div></aside></div>`;
    const b = $('#apply'); if (b) b.onclick = async ev => { // when the admin set a registration link, this button is a real link that opens it in a new tab
      const link = b.tagName === 'A';
      if (!me.user) { ev.preventDefault(); toast('Please login to apply for this opportunity.', true); sessionStorage.dvReturn = location.hash; return setTimeout(() => location.hash = '#/login', 900); }
      try { await api(`/opportunities/${o.id}/apply`, { method: 'POST' }); toast(link ? 'Application saved. Opening the registration page…' : 'Application submitted.'); setTimeout(route, 700); }
      catch (x) { toast(x.status === 409 ? 'Already applied. Opening the registration page…' : x.message, x.status !== 409); } };
  } catch (x) { view.innerHTML = `<div class="wrap narrow"><h2>${e(x.message)}</h2><a class="btn" href="#/opportunities">Browse opportunities</a></div>`; }
};
pages.about = () => view.innerHTML = page('About Dharmovix', 'A student-focused technology and learning platform.') + `<section class="sec"><div class="wrap" style="max-width:860px">
<p>Dharmovix is a student-focused technology and learning platform designed to connect learners with valuable opportunities for growth. We bring together hackathons, workshops, internships, courses, and other learning opportunities in one easy-to-access platform.</p>
<p>Our goal is to help students discover new opportunities, develop practical skills, gain real-world experience, and move closer to their career goals. Whether you are a beginner looking to learn something new or a student searching for your next opportunity, Dharmovix is built to help you take the next step.</p>
<h2 style="margin-top:40px">What We Provide</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${[['🚀', 'Hackathons', 'Discover competitions where you can solve problems, build projects, and showcase your skills.'], ['📚', 'Courses', 'Explore learning resources and courses to improve your technical and professional knowledge.'], ['🛠️', 'Workshops', 'Participate in practical sessions and learn from hands-on experiences.'], ['💼', 'Internships', 'Find internship opportunities that can help you gain real-world industry exposure.'], ['🌱', 'Learning & Growth', 'Discover opportunities that help you continuously improve your skills and knowledge.']].map(([i, t, d]) => `<div class="tile"><b>${i} ${t}</b><span>${d}</span></div>`).join('')}</div>
<h2 style="margin-top:40px">Our Mission</h2><p>Our mission is to make learning and opportunities easier to discover and accessible to students.</p>
<p>We believe that every student deserves the opportunity to learn, build, participate, and grow. Dharmovix aims to create a platform where students can discover opportunities, develop skills, and turn their learning into real-world experiences.</p>
<h2 style="margin-top:40px">Our Vision</h2><p class="quote" style="margin:18px 0">“Learn. Build. Grow. Create Your Opportunity.”</p>
<p>We envision Dharmovix as a growing ecosystem where students can discover opportunities, gain knowledge, connect with experiences, and build a stronger future.</p></div></section>`;

const STAGES = ['Foundation', 'Core skills', 'Build projects', 'Level up', 'Get job-ready'];
const ROLES = [
['Data Scientist', '📊', 'data', 'Turns data into predictions and decisions using statistics and machine learning.', ['Build models that forecast demand, risk or behaviour', 'Work in healthcare, finance, e-commerce, research and more', 'Grow toward ML engineer, lead data scientist or analytics manager'], ['Python|Statistics & probability|Linear algebra basics', 'SQL|Pandas & NumPy|Data cleaning|Exploratory analysis', 'Dashboards (Power BI/Tableau)|Kaggle datasets|End-to-end analysis project', 'Machine learning (scikit-learn)|Feature engineering|Model evaluation|Intro to deep learning', 'Deploy a model (Flask/FastAPI)|GitHub portfolio|Case-study write-ups|Interview practice']],
['Data Analyst', '📈', 'data', 'Turns raw numbers into reports and dashboards that guide business decisions.', ['Build dashboards that teams use every day', 'Work in almost any industry that collects data', 'Grow toward data scientist, BI developer or analytics manager'], ['Excel|Statistics basics|SQL basics', 'Advanced SQL|Python & Pandas|Data cleaning', 'Power BI or Tableau|Business dashboards|3 portfolio analyses', 'A/B testing|Storytelling with data|Domain knowledge (sales, finance, operations)', 'Portfolio site|Resume with measurable results|Mock interviews|Internships']],
['Java Developer', '☕', 'java', 'Builds reliable backend, enterprise and Android applications with Java.', ['Build secure, large-scale enterprise and banking systems', 'Work on backend services and Android apps', 'Grow toward senior developer, architect or tech lead'], ['Java syntax & OOP|Collections|Exceptions|Git', 'Data structures & algorithms|JDBC & SQL|Multithreading basics', 'Spring Boot REST APIs|Hibernate/JPA|A complete CRUD app', 'Microservices|Spring Security|Testing (JUnit, Mockito)|Docker', 'Deploy to the cloud|System design basics|DSA practice|Interview prep']],
['Full Stack Developer', '🧩', 'web', 'Builds the whole product: the interface, the server and the database.', ['Ship complete products from database to user interface', 'Join startups where one person covers many layers', 'Grow toward tech lead, architect or founder'], ['HTML & CSS|JavaScript|Git & GitHub', 'React (or similar)|Responsive design|Working with APIs', 'Node.js & Express|SQL or MongoDB|Authentication', 'TypeScript|Testing|Docker|CI/CD basics', 'Deploy a full project|Portfolio of 3 apps|System design basics|Interviews']],
['Frontend Developer', '🎨', 'web', 'Creates the fast, accessible interfaces people see and use.', ['Create interfaces used by thousands or millions of people', 'Work in product companies, agencies or freelance', 'Grow toward UI engineer or frontend lead'], ['Semantic HTML|CSS (Flexbox, Grid)|JavaScript fundamentals', 'React|State management|Accessibility', 'Responsive projects|Consuming APIs|Animations', 'TypeScript|Testing|Performance & Core Web Vitals', 'Portfolio site|Open-source contributions|Interview practice']],
['Backend Developer', '🗄️', 'node', 'Builds the servers, APIs and databases that power applications.', ['Design the APIs and systems behind apps', 'Handle scale, data and security', 'Grow toward senior backend, platform or architect roles'], ['One language (Python, Java or Node.js)|HTTP & REST|Git', 'SQL & database design|Authentication|Caching basics', 'Build REST APIs|Background jobs|Write tests', 'Docker|Message queues|Scaling & monitoring|Security basics', 'Deploy to the cloud|Document your APIs|System design|Interviews']],
['AI / ML Engineer', '🤖', 'AI', 'Builds and ships machine-learning and AI features inside real products.', ['Build products that see, read, translate and recommend', 'Add AI features to real applications', 'Grow toward research engineer, ML lead or AI architect'], ['Python|Linear algebra|Probability & statistics|Calculus basics', 'Machine learning|Neural networks|PyTorch or TensorFlow', 'A computer-vision or NLP project|Kaggle competitions', 'LLMs & prompt engineering|Fine-tuning basics|MLOps basics', 'Deploy a model as an API|Read research papers|Portfolio|Interviews']],
['DevOps Engineer', '⚙️', 'cloud', 'Automates how software is built, tested, released and monitored.', ['Automate builds, tests and releases', 'Keep products reliable for many users', 'Grow toward SRE, platform engineer or cloud architect'], ['Linux & shell|Networking basics|Git', 'Docker|CI/CD (GitHub Actions, Jenkins)|Scripting (Bash/Python)', 'Kubernetes|Terraform|A cloud provider (AWS, Azure or GCP)', 'Monitoring (Prometheus, Grafana)|Security basics|Reliability practices', 'A full pipeline project|Cloud certification|Interviews']],
['Cyber Security Analyst', '🛡️', 'security', 'Protects systems, networks and people from attacks.', ['Defend systems and data from real threats', 'Work in security operations, penetration testing or compliance', 'Grow toward security engineer or security lead'], ['Networking|Linux|Operating-system fundamentals|Core security concepts', 'Web security (OWASP Top 10)|Cryptography basics|Scripting', 'A home lab|CTF practice (TryHackMe, Hack The Box)|Vulnerability scanning', 'Incident response|SIEM tools|Penetration-testing basics', 'Certifications (Security+, CEH)|Public write-ups|Interviews']],
['Mobile App Developer', '📱', 'app', 'Builds apps for Android and iOS.', ['Publish apps people install on their phones', 'Work in startups, product companies or independently', 'Grow toward senior mobile engineer or product roles'], ['Programming basics|Kotlin, Swift or Dart (Flutter)|Git', 'UI layouts|Navigation|State management', 'Build 3 apps that use APIs|Local storage|Firebase', 'Authentication|Push notifications|Testing|Performance', 'Publish to Play Store or App Store|Portfolio|Interviews']],
['Cloud Engineer', '☁️', 'cloud', 'Designs and runs applications on cloud platforms.', ['Run applications reliably on the cloud', 'Cut costs and improve security for companies', 'Grow toward cloud or solutions architect'], ['Linux|Networking|Virtualisation concepts', 'One provider (AWS, Azure or GCP)|Compute, storage, databases|IAM', 'Deploy apps|Serverless|Infrastructure as code (Terraform)', 'Security & cost optimisation|Monitoring|Containers & Kubernetes', 'Entry-level cloud certification|Projects|Interviews']],
['UI/UX Designer', '✏️', 'design', 'Designs products that are easy and enjoyable to use.', ['Design products people find easy to use', 'Work in product teams, agencies or freelance', 'Grow toward product designer or design lead'], ['Design principles|Colour & typography|User-research basics', 'Figma|Wireframes & prototypes|Design systems', '3 case studies|Usability testing|Accessibility', 'Interaction design|Handoff to developers|Basic HTML & CSS', 'Portfolio website|Design challenges|Interviews']]
];
pages.achieve = () => {
  view.innerHTML = page('Achieve', 'Pick the role you want to become and see the roadmap to get there.') + `<section class="sec"><div class="wrap"><fieldset><legend>Which role do you want to become?</legend><div class="roles">${ROLES.map(r => `<label class="role"><input type="radio" name="role" value="${e(r[0])}"><span>${e(r[0])}</span></label>`).join('')}</div></fieldset>
  <div id="rm" style="margin-top:34px"><p class="empty">Choose a role above to see what you can achieve and what to learn.</p></div></div></section>`;
  document.querySelectorAll('input[name=role]').forEach(i => i.onchange = () => {
    const r = ROLES.find(x => x[0] === i.value);
    $('#rm').innerHTML = `<div class="box"><h2>${e(r[0])}</h2><p>${e(r[3])}</p><h3>What you can achieve</h3><ul class="goals">${r[4].map(g => `<li>${e(g)}</li>`).join('')}</ul>
    <h3 style="margin-top:26px">Your roadmap</h3><ol class="road">${r[5].map((st, k) => `<li><h3>${STAGES[k]}</h3>${st.split('|').map(t => `<span class="pill">${e(t)}</span>`).join('')}</li>`).join('')}</ol>
    <a class="btn" href="#/opportunities?s=${encodeURIComponent(r[2])}">Find related opportunities</a></div>`;
    $('#rm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};
pages.ats = () => {
  const hint = '<div class="box empty">Your score will appear here.</div>';
  view.innerHTML = page('ATS Resume Checker', 'Upload your resume and see how an applicant tracking system may read it.') + `<section class="sec"><div class="wrap ats"><div class="box"><h2>Check your resume</h2><form id="af" novalidate>
  <label class="drop" id="drop"><input class="sr" id="rfile" name="resume" type="file" accept=".pdf,.docx,.txt"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 17v-6M9.5 13.5 12 11l2.5 2.5"/></svg><b id="fname">Drop your resume here or click to browse</b><small>PDF, DOCX or TXT, up to 5 MB</small></label>
  <label for="rrole">Target role (optional)</label><select id="rrole" name="role"><option value="">No target role</option>${ROLES.map(r => `<option>${e(r[0])}</option>`).join('')}</select>
  <label for="rtext">Or paste your resume text</label><textarea id="rtext" name="text" placeholder="Paste your resume text here…"></textarea>
  <p class="err" id="aerr" role="alert"></p><button class="btn lg block" id="acheck">Check my resume</button></form>
  <p class="note">Your resume is only read to build this report and is not saved. This is an estimate based on common ATS rules; real systems differ.</p></div><div id="ares" aria-live="polite">${hint}</div></div></section>`;
  const dz = $('#drop'), showName = () => { const f = $('#rfile').files[0]; $('#fname').textContent = f ? f.name : 'Drop your resume here or click to browse'; };
  ['dragenter', 'dragover'].forEach(n => dz.addEventListener(n, ev => { ev.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(n => dz.addEventListener(n, ev => { ev.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', ev => { const f = ev.dataTransfer && ev.dataTransfer.files; if (f && f.length) { $('#rfile').files = f; showName(); } });
  $('#rfile').onchange = showName;
  $('#af').onsubmit = async ev => {
    ev.preventDefault(); const er = $('#aerr'), btn = $('#acheck'), file = $('#rfile').files[0], pasted = $('#rtext').value.trim(), role = $('#rrole').value; er.textContent = '';
    if (!file && !pasted) { er.textContent = 'Upload your resume or paste its text.'; return; }
    if (file && !/\.(pdf|docx|txt)$/i.test(file.name)) { er.textContent = 'Please upload a PDF, DOCX or TXT file.'; return; }
    if (file && file.size > 5 * 1024 * 1024) { er.textContent = 'Resume must be 5 MB or smaller.'; return; }
    btn.disabled = true; btn.textContent = 'Checking…'; $('#ares').innerHTML = '<div class="skeleton"></div>';
    try { let text = pasted; if (file) { const fd = new FormData(); fd.append('resume', file); text = (await api('/ats-extract', { method: 'POST', body: fd })).text; }
      renderAts(analyzeResume(text, role), role); }
    catch (x) { er.textContent = x.message; $('#ares').innerHTML = hint; }
    btn.disabled = false; btn.textContent = 'Check my resume';
  };
  guideStart();
};
function renderAts(r, role) {
  const C = 2 * Math.PI * 54, off = C * (1 - r.score / 100), ic = { ok: '✓', warn: '!', bad: '✕' }, col = r.score >= 75 ? '#34D399' : r.score >= 50 ? '#FBBF24' : '#F87171';
  $('#ares').innerHTML = `<div class="box res"><div class="ringwrap"><svg viewBox="0 0 120 120" class="ring" role="img" aria-label="ATS score ${r.score} out of 100">
  <circle cx="60" cy="60" r="54" class="rt"/><circle cx="60" cy="60" r="54" class="rp" style="stroke:${col};stroke-dasharray:${C};stroke-dashoffset:${C}"/></svg><div class="rnum"><b>${r.score}</b><span>/100</span></div></div>
  <h3>${e(r.label)}</h3><p class="sub">${r.words} words read${role ? ' · target: ' + e(role) : ''}</p>
  ${r.checks.map((c, k) => `<div class="chk" style="--k:${k}"><span class="ic ${c.state}" aria-hidden="true">${ic[c.state]}</span><div><b>${e(c.title)}</b><small>${e(c.tip)}</small></div><span class="pts">${c.pts}/${c.max}</span></div>`).join('')}
  ${role ? `<div class="kwrow"><b>Keywords found</b><br>${r.found.map(k => `<span class="pill approved">${e(k)}</span>`).join('') || '<small>None</small>'}</div><div class="kwrow"><b>Missing keywords</b><br>${r.missing.map(k => `<span class="pill pending">${e(k)}</span>`).join('') || '<small>None, nice.</small>'}</div>` : ''}
  <div class="acts" style="margin-top:18px">${me.user ? '' : '<a class="btn" href="#/register">Register for updates</a>'}<a class="btn ghost" href="#/achieve">See career roadmaps</a></div></div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const p = document.querySelector('.rp'); if (p) p.style.strokeDashoffset = off; }));
}
function authForm(title, fields, submit, extra = '') {
  view.innerHTML = `<div class="stage ${location.hash.includes('admin') ? 'bg-admin' : 'bg-auth'}"><div class="wrap"><div class="box narrow"><h2>${title}</h2><form id="f" novalidate>${fields}<p class="err" id="err" role="alert"></p><button class="btn lg block">${submit}</button></form>${extra}</div></div></div>`;
}
const field = (n, l, t = 'text', ac = '') => t === 'password'
  ? `<label for="${n}">${l}</label><div class="pw"><input id="${n}" name="${n}" type="password" autocomplete="${ac}" required><button type="button" class="eye" aria-label="Show password" aria-pressed="false">${EYE_ON}</button></div>`
  : `<label for="${n}">${l}</label><input id="${n}" name="${n}" type="${t}" autocomplete="${ac}" required>`;
function bindForm(handler) { const f = $('#f'); f.onsubmit = async ev => { ev.preventDefault(); const btn = f.querySelector('button:not(.eye)'), er = $('#err'); er.textContent = ''; btn.disabled = true; const t = btn.textContent; btn.textContent = 'Please wait…';
  try { await handler(Object.fromEntries(new FormData(f))); } catch (x) { er.textContent = x.message; } btn.disabled = false; btn.textContent = t; }; }
pages.login = () => {
  authForm('User login', field('identifier', 'Username or email', 'text', 'username') + field('password', 'Password', 'password', 'current-password'), 'Login', '<p class="note">New here? <a href="#/register">Register</a></p>');
  bindForm(async d => { const r = await api('/login', { method: 'POST', body: d }); me.user = r.user; const back = sessionStorage.dvReturn; sessionStorage.removeItem('dvReturn'); location.hash = back || '#/opportunities'; route(); });
};
pages.register = () => {
  view.innerHTML = `<div class="stage bg-auth"><div class="reg"><div class="box"><h2>Create your account</h2><form id="f" novalidate>${field('full_name', 'Full name', 'text', 'name') + field('username', 'Username', 'text', 'username') + field('email', 'Email', 'email', 'email') + field('password', 'Password', 'password', 'new-password') + field('confirm_password', 'Confirm password', 'password', 'new-password')}
  <label for="payment_ref">UPI transaction / UTR reference (after paying ₹49)</label><input id="payment_ref" name="payment_ref" autocomplete="off" required><p class="err" id="err" role="alert"></p><button class="btn lg block">Submit registration</button></form>
  <p class="note">Already approved? <a href="#/login">Login</a></p></div>
  <aside class="card pay price" aria-label="Registration fee"><span class="badge">One-time registration fee</span><div class="fee">₹49</div><p><b>Registration Fee: ₹49</b><br>Scan the QR code and pay ₹49 to complete registration.</p>
  <div class="qr"><img src="/qr.png" alt="Dharmovix UPI payment QR code" data-fallback="Add qr.png to /public"></div>
  <ol class="how"><li>Pay ₹49 with the QR code.</li><li>Enter the UPI/UTR reference in the form.</li><li>We verify your payment, approve your account and email you.</li></ol></aside></div></div>`;
  bindForm(async d => { await api('/register', { method: 'POST', body: d });
    view.innerHTML = `<div class="wrap"><div class="box narrow" style="text-align:center"><h2>Registration submitted</h2><p>Registration submitted successfully. Please wait a few minutes while we review your registration. You will receive an email once your account has been approved.</p><a class="btn" href="#/">Back to home</a></div></div>`; });
};
pages.profile = async () => {
  if (!me.user) { sessionStorage.dvReturn = location.hash; return location.hash = '#/login'; }
  const apps = await api('/my-applications').catch(() => []), u = me.user;
  view.innerHTML = page('Your profile', 'Your account and applications.') + `<div class="wrap sec"><div class="box"><div class="tbl"><table><tr><th>Full name</th><td>${e(u.full_name)}</td></tr><tr><th>Username</th><td>${e(u.username)}</td></tr><tr><th>Email</th><td>${e(u.email)}</td></tr><tr><th>Account status</th><td>${pill(u.account_status)}</td></tr><tr><th>Registered</th><td>${fmtDate(u.created_at)}</td></tr></table></div></div>
  <h2 id="apps" style="margin-top:36px">My applications</h2><div class="box tbl">${apps.length ? `<table><tr><th>Opportunity</th><th>Category</th><th>Applied</th><th>Status</th></tr>${apps.map(a => `<tr><td><a href="#/opportunity/${a.opportunity_id}">${e(a.title)}</a></td><td>${e(a.category)}</td><td>${fmtDate(a.applied_at)}</td><td>${pill(a.status)}</td></tr>`).join('')}</table>` : '<p class="empty">You have not applied yet. <a href="#/opportunities">Find an opportunity</a></p>'}</div></div>`;
  if (location.hash === '#/applications') $('#apps').scrollIntoView();
};

/* ---------- Admin ---------- */
pages.adminLogin = () => {
  authForm('Admin login', field('email', 'Email', 'email', 'username') + field('password', 'Password', 'password', 'current-password'), 'Login', '<p class="note"><a href="#/">← Back to website</a></p>');
  bindForm(async d => { await api('/admin/login', { method: 'POST', body: d }); me.admin = { email: d.email }; location.hash = '#/admin/dashboard'; route(); });
};
const AN = [['dashboard', 'Dashboard'], ['users', 'Users'], ['opportunities', 'Opportunities'], ['add', 'Add Opportunity'], ['applications', 'Applications'], ['notifications', 'Email Notifications'], ['settings', 'Settings']];
const adminShell = (sec, inner) => { $('#nav').innerHTML = ''; $('#foot').hidden = true;
  view.innerHTML = `<div class="adm"><aside class="side" id="side"><a class="brand" href="#/admin/dashboard"><img src="/logo.png" alt="">Dharmovix</a>${AN.map(([k, l]) => `<a href="#/admin/${k}" class="${k === sec ? 'on' : ''}">${l}</a>`).join('')}<button id="aout" style="margin-top:auto">Logout</button></aside>
  <div class="admmain"><div class="admtop"><button id="ab" aria-label="Menu">☰</button><b>Admin</b></div>${inner}</div></div>`;
  $('#ab').onclick = () => $('#side').classList.toggle('open');
  $('#aout').onclick = async () => { await api('/admin/logout', { method: 'POST' }).catch(() => {}); me.admin = null; location.hash = '#/admin-login'; route(); }; };
const A = {};
A.dashboard = async () => { const s = await api('/admin/stats'), n = [['Total Users', s.users], ['Pending Users', s.pending], ['Approved Users', s.approved], ['Rejected Users', s.rejected], ['Total Opportunities', s.opportunities], ...CATS.map(c => [PLURAL[c], s.byCategory[c]]), ['Total Applications', s.applications]];
  const mx = Math.max(1, ...Object.values(s.byCategory)), mu = Math.max(1, s.users);
  adminShell('dashboard', `<h1>Dashboard</h1><div class="stats">${n.map(([l, v]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><div class="panel"><h3>Opportunities by category</h3>${CATS.map(c => `<div class="bar"><span>${PLURAL[c]}</span><i style="width:${s.byCategory[c] / mx * 100}%"></i><b>${s.byCategory[c]}</b></div>`).join('')}</div>
  <div class="panel"><h3>Users by status</h3>${[['Pending', s.pending], ['Approved', s.approved], ['Rejected', s.rejected]].map(([l, v]) => `<div class="bar"><span>${l}</span><i style="width:${v / mu * 100}%"></i><b>${v}</b></div>`).join('')}</div></div>`); };
A.users = async () => {
  adminShell('users', `<h1>Registered users</h1><div class="panel"><div class="toolbar"><input id="uq" type="search" placeholder="Search name, username or email"><select id="us"><option value="">All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div><div class="tbl" id="ut"></div></div>`);
  const load = async () => { const d = await api(`/admin/users?q=${encodeURIComponent($('#uq').value)}&status=${$('#us').value}`);
    $('#ut').innerHTML = d.length ? `<table><tr><th>Full name</th><th>Username</th><th>Email</th><th>Registered</th><th>Payment</th><th>Account</th><th>Actions</th></tr>${d.map(u => `<tr><td>${e(u.full_name)}</td><td>${e(u.username)}</td><td>${e(u.email)}</td><td>${fmtDate(u.created_at)}</td><td>${pill(u.payment_status)}</td><td>${pill(u.account_status)}</td>
    <td><div class="acts"><button class="btn sm ghost" data-a="view" data-i="${u.id}">View</button>${u.payment_status !== 'Verified' ? `<button class="btn sm navy" data-a="verify-payment" data-i="${u.id}">Verify payment</button>` : ''}${u.account_status !== 'Approved' ? `<button class="btn sm ok" data-a="approve" data-i="${u.id}">Approve</button>` : ''}${u.account_status !== 'Rejected' ? `<button class="btn sm bad" data-a="reject" data-i="${u.id}">Reject</button>` : ''}</div></td></tr>`).join('')}</table>` : '<p class="empty">No users match.</p>';
    $('#ut').onclick = async ev => { const b = ev.target.closest('button'); if (!b) return; const u = d.find(x => x.id == b.dataset.i);
      if (b.dataset.a === 'view') return modal(`<h3>${e(u.full_name)}</h3><div class="tbl"><table>${['username', 'email', 'payment_status', 'payment_ref', 'account_status', 'created_at', 'approved_at'].map(k => `<tr><th>${k.replace(/_/g, ' ')}</th><td>${e(u[k] || '-')}</td></tr>`).join('')}</table></div><button class="btn ghost" data-close style="margin-top:14px">Close</button>`);
      if (b.dataset.a === 'reject' && !await confirmBox('Reject this registration?', 'Reject')) return;
      try { await api(`/admin/users/${u.id}/${b.dataset.a}`, { method: 'POST' }); toast('Done.'); load(); } catch (x) { toast(x.message, true); } }; };
  let t; $('#uq').oninput = () => { clearTimeout(t); t = setTimeout(load, 250); }; $('#us').onchange = load; load(); };
function oppForm(o = {}) {
  const m = modal(`<h3>${o.id ? 'Edit' : 'Add new'} opportunity</h3><form id="of">${field('title', 'Title').replace('required', `required value="${e(o.title || '')}"`)}
  <label>Category</label><select name="category" required><option value="">Choose…</option>${CATS.map(c => `<option ${o.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
  <label>Description</label><textarea name="description" required>${e(o.description || '')}</textarea><label>Date</label><input type="date" name="date" value="${e(o.date || '')}">
  <label>Registration link</label><input type="url" name="registration_link" placeholder="https://" value="${e(o.registration_link || '')}"><label>Additional information</label><textarea name="additional_info">${e(o.additional_info || '')}</textarea>
  <label>Image (JPG, PNG or WebP, max 5 MB)</label><input type="file" name="image" accept="image/jpeg,image/png,image/webp"><img class="preview" id="pv" alt="Preview" ${o.image ? `src="/uploads/${e(o.image)}"` : 'hidden'}>
  <label>Status</label><select name="status"><option ${o.status === 'Unpublished' ? 'selected' : ''}>Unpublished</option><option ${o.status === 'Published' || !o.id ? 'selected' : ''}>Published</option></select>
  <p style="font-size:13px;color:var(--mute);margin:6px 0 0">Publishing automatically emails every approved user.</p><p class="err" id="oe" role="alert"></p><div class="acts"><button class="btn">${o.id ? 'Save changes' : 'Publish opportunity'}</button><button type="button" class="btn ghost" id="cx">Cancel</button></div></form>`);
  const f = m.querySelector('#of'); m.querySelector('#cx').onclick = () => { m.close(); if (!o.id && location.hash === '#/admin/add') location.hash = '#/admin/opportunities'; };
  const fi = f.elements.image; fi.onchange = () => { const x = fi.files[0]; if (!x) return; if (x.size > 5 * 1024 * 1024) { fi.value = ''; return m.querySelector('#oe').textContent = 'Image must be 5 MB or smaller.'; } const p = m.querySelector('#pv'); p.src = URL.createObjectURL(x); p.hidden = false; };
  f.onsubmit = async ev => { ev.preventDefault(); const b = f.querySelector('button'); b.disabled = true; b.textContent = 'Saving…';
    try { await api(o.id ? '/admin/opportunities/' + o.id : '/admin/opportunities', { method: o.id ? 'PUT' : 'POST', body: new FormData(f) }); m.close(); toast(o.id ? 'Saved.' : 'Published.'); location.hash = '#/admin/opportunities'; route(); }
    catch (x) { m.querySelector('#oe').textContent = x.message; b.disabled = false; b.textContent = o.id ? 'Save changes' : 'Publish opportunity'; } };
}
A.opportunities = async () => { const d = await api('/admin/opportunities');
  adminShell('opportunities', `<h1>Opportunities</h1><div class="panel"><div class="toolbar"><button class="btn" id="new">Add opportunity</button></div><div class="tbl">${d.length ? `<table><tr><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th>Emails</th><th>Actions</th></tr>${d.map(o => `<tr><td>${e(o.title)}</td><td>${e(o.category)}</td><td>${fmtDate(o.date)}</td><td>${pill(o.status)}</td><td>${o.sent} sent${o.failed ? `, <b style="color:var(--bad)">${o.failed} failed</b>` : ''}</td>
  <td><div class="acts"><button class="btn sm ghost" data-a="edit" data-i="${o.id}">Edit</button><button class="btn sm navy" data-a="toggle" data-i="${o.id}">${o.status === 'Published' ? 'Unpublish' : 'Publish'}</button>${o.status === 'Published' ? `<button class="btn sm" data-a="notify" data-i="${o.id}">Notify users</button>` : ''}<button class="btn sm bad" data-a="del" data-i="${o.id}">Delete</button></div></td></tr>`).join('')}</table>` : '<p class="empty">No opportunities yet.</p>'}</div></div>`);
  $('#new').onclick = () => oppForm();
  view.querySelector('.tbl').onclick = async ev => { const b = ev.target.closest('button'); if (!b) return; const o = d.find(x => x.id == b.dataset.i);
    try { if (b.dataset.a === 'edit') return oppForm(o);
      if (b.dataset.a === 'notify') { const r = await api(`/admin/opportunities/${o.id}/notify`, { method: 'POST' }); return toast(r.queued ? `Sending email to ${r.queued} approved user${r.queued > 1 ? 's' : ''}.` : 'All approved users have already been emailed.'); }
      if (b.dataset.a === 'del') { if (!await confirmBox('Are you sure you want to delete this opportunity?')) return; await api('/admin/opportunities/' + o.id, { method: 'DELETE' }); }
      if (b.dataset.a === 'toggle') await api(`/admin/opportunities/${o.id}/status`, { method: 'POST', body: { status: o.status === 'Published' ? 'Unpublished' : 'Published' } });
      toast('Done.'); route(); } catch (x) { toast(x.message, true); } }; };
A.add = async () => { await A.opportunities(); location.hash.endsWith('add') && oppForm(); };
A.applications = async () => { const d = await api('/admin/applications');
  adminShell('applications', `<h1>Applications</h1><div class="panel tbl">${d.length ? `<table><tr><th>Applicant</th><th>Email</th><th>Opportunity</th><th>Applied</th><th>Status</th></tr>${d.map(a => `<tr><td>${e(a.full_name)}</td><td>${e(a.email)}</td><td>${e(a.title)}</td><td>${fmtDate(a.applied_at)}</td>
  <td><select data-i="${a.id}" aria-label="Status">${['Applied', 'Under Review', 'Accepted', 'Rejected'].map(s => `<option ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</table>` : '<p class="empty">No applications yet.</p>'}</div>`);
  view.onchange = async ev => { if (ev.target.dataset.i) try { await api(`/admin/applications/${ev.target.dataset.i}/status`, { method: 'POST', body: { status: ev.target.value } }); toast('Status updated.'); } catch (x) { toast(x.message, true); } }; };
A.notifications = async () => { const [d, o] = await Promise.all([api('/admin/notifications'), api('/admin/opportunities')]), bad = o.filter(x => x.failed);
  adminShell('notifications', `<h1>Email notifications</h1>${bad.length ? `<div class="panel"><b>Failed deliveries</b>${bad.map(x => `<div class="switch"><span>${e(x.title)} – ${x.failed} failed</span><button class="btn sm" data-r="${x.id}">Retry</button></div>`).join('')}</div>` : ''}
  <div class="panel tbl">${d.length ? `<table><tr><th>Opportunity</th><th>Type</th><th>Recipient</th><th>Status</th><th>Sent</th><th>Error</th></tr>${d.map(n => `<tr><td>${e(n.title)}</td><td>${e(n.notification_type)}</td><td>${e(n.email)}</td><td>${pill(n.status)}</td><td>${n.sent_at ? fmtDate(n.sent_at) : '-'}</td><td>${e(n.error_message || '')}</td></tr>`).join('')}</table>` : '<p class="empty">Notifications appear here when you publish an opportunity.</p>'}</div>`);
  view.onclick = async ev => { const id = ev.target.dataset.r; if (!id) return; await api(`/admin/opportunities/${id}/retry-notifications`, { method: 'POST' }); toast('Retrying in the background. Refresh in a moment.'); }; };
A.settings = async () => { const s = await api('/admin/settings'), sw = [['notify_new_opportunity', 'New opportunity notifications'], ['notify_approval', 'Approval emails'], ['notify_registration', 'Registration confirmation emails']];
  adminShell('settings', `<h1>Settings</h1><div class="panel"><h3>Email notifications</h3>${s.smtp_configured ? '' : '<p class="err">SMTP is not configured on the server, so emails will be recorded as failed.</p>'}${sw.map(([k, l]) => `<label class="switch" style="margin:0"><span>${l}</span><input type="checkbox" data-k="${k}" ${s[k] ? 'checked' : ''}></label>`).join('')}</div>
  <div class="panel" style="max-width:480px"><h3>Change password</h3><form id="f">${field('current', 'Current password', 'password', 'current-password')}${field('next', 'New password', 'password', 'new-password')}<p class="err" id="err"></p><button class="btn">Change password</button></form></div>`);
  view.onchange = async ev => { if (ev.target.dataset.k) try { await api('/admin/settings', { method: 'PUT', body: { [ev.target.dataset.k]: ev.target.checked } }); toast('Saved.'); } catch (x) { toast(x.message, true); } };
  bindForm(async d => { await api('/admin/change-password', { method: 'POST', body: d }); toast('Password changed. Please log in again.'); me.admin = null; location.hash = '#/admin-login'; route(); }); };

/* ---------- Router ---------- */
async function route() {
  guideStop(); document.getElementById('foot').hidden = false; view.onchange = view.onclick = null;
  const [path, qs] = (location.hash || '#/').slice(1).split('?'), params = new URLSearchParams(qs || ''), seg = path.split('/').filter(Boolean);
  try { me = await api('/me'); } catch { me = { user: null, admin: null }; }
  window.scrollTo(0, 0);
  try {
    if (seg[0] === 'admin-login') { nav(); $('#nav').innerHTML = ''; return me.admin ? (location.hash = '#/admin/dashboard') : pages.adminLogin(); }
    if (seg[0] === 'admin') { if (!me.admin) return location.hash = '#/admin-login'; return A[seg[1] && A[seg[1]] ? seg[1] : 'dashboard'](); }
    nav();
    if (!seg.length) return pages.home();
    if (seg[0] === 'opportunity') return pages.opportunity(+seg[1]);
    if (seg[0] === 'applications') return pages.profile();
    if (pages[seg[0]]) return pages[seg[0]](params);
    view.innerHTML = '<div class="wrap narrow"><h2>Page not found</h2><a class="btn" href="#/">Go home</a></div>';
  } catch (x) { view.innerHTML = `<div class="wrap narrow"><h2>${e(x.message)}</h2></div>`; if (x.status === 401 && seg[0] === 'admin') { me.admin = null; location.hash = '#/admin-login'; } }
  view.focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);
window.addEventListener('pageshow', ev => { if (ev.persisted) route(); }); // re-check session after back/forward cache
footer(); intro(); route();
