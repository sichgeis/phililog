import './style.css';
import { advance, assistance, evaluate, hitText, opportunity, tap, type PacifierRound, type Tempo } from './pacifier.ts';
import type { SupabaseClient } from '@supabase/supabase-js';
import { answer, canBuy, canPlay, games, markerPosition, nextAction, reward, skills, startRound, type GameId, type Round, type SkillId, type Snapshot } from './rules.ts';
import { compatible, createApi, gameError, operation, pendingKey, readPending, type GameApi, type Operation } from './api.ts';

export interface GameController { show(): void; pause(): void; hide(): void; dispose(): void }
interface Options { container: HTMLElement; client: SupabaseClient; account: string; onExit(): void; api?: GameApi }
const escape = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
function baby(smiling = false, independent = false) {
  return `<svg class="game-baby" viewBox="0 0 260 210" role="img" aria-label="${smiling ? 'Euer Baby lächelt' : 'Euer neugieriges Spielbaby'}"><ellipse cx="130" cy="188" rx="89" ry="13" fill="#e1d9c8"/><path d="M76 147Q130 119 184 147L194 185Q130 205 66 185Z" fill="#9fbbb0"/><path d="M85 158L176 186M175 158L90 191" stroke="#eef0d9" stroke-width="3"/><circle cx="62" cy="104" r="14" fill="#ecc2a1"/><circle cx="198" cy="104" r="14" fill="#ecc2a1"/><ellipse cx="130" cy="94" rx="68" ry="64" fill="#f6d8b6"/><path d="M124 35Q151 6 146 36Q139 45 132 38" fill="none" stroke="#987657" stroke-width="5" stroke-linecap="round"/><path d="M91 91q9 ${smiling ? '-10' : '-5'} 17 0M152 91q9 ${smiling ? '-10' : '-5'} 17 0" fill="none" stroke="#4c4b46" stroke-width="5" stroke-linecap="round"/><ellipse cx="84" cy="113" rx="12" ry="7" fill="#eeb3a3"/><ellipse cx="176" cy="113" rx="12" ry="7" fill="#eeb3a3"/>${smiling ? '<path d="M115 115Q130 135 145 115" fill="#c7786b" stroke="#916557" stroke-width="2"/>' : '<ellipse cx="130" cy="122" rx="19" ry="12" fill="#c3a3ba"/><circle cx="130" cy="126" r="8" fill="none" stroke="#876580" stroke-width="4"/>'}<ellipse cx="${independent ? '152' : '69'}" cy="${independent ? '131' : '157'}" rx="14" ry="11" fill="#f6d8b6"/><ellipse cx="188" cy="158" rx="14" ry="11" fill="#f6d8b6"/><path d="M39 55l3-9 3 9 9 3-9 3-3 9-3-9-9-3zM211 40l2-6 2 6 6 2-6 2-2 6-2-6-6-2z" fill="#d6b871"/></svg>`;
}
export function mountGame({ container, client, account, onExit, api = createApi(client) }: Options): GameController {
  let state: Snapshot | null = null;
  let screen: 'home' | 'skills' | 'instruction' | 'round' | 'result' = 'home';
  let selected: GameId = 'pacifier';
  let round: Round | null = null;
  let pacifier: PacifierRound | null = null;
  let tempo: Tempo = 'steady', practice = false, countdown = 0;
  let resultView = '';
  let paused = false, hidden = false, disposed = false, busy = false, connected = false;
  let quiet = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let message = '', error = '', storageWarning = '', pending: Operation | null = null, pendingReadError = false;
  let frame = 0, lastFrame = 0, generation = 0;
  try { pending = readPending(localStorage, account); }
  catch (e) { error = gameError(e); pendingReadError = true; }
  if (pending) screen = 'result';
  const canWrite = () => state && compatible(state) && connected && !pending && !pendingReadError && !busy;
  const count = () => (state?.stats.reduce((sum, s) => sum + s.rounds, 0) ?? 0) + (state?.scores?.reduce((sum, s) => sum + s.rounds, 0) ?? 0);
  function stopAnimation() { cancelAnimationFrame(frame); frame = 0; lastFrame = 0; }
  function updateClock(now: number) {
    if (!pacifier || paused || hidden || screen !== 'round') return;
    const delta = lastFrame ? Math.max(0, now - lastFrame) : 0;
    lastFrame = now;
    if (countdown > 0) { const remaining = Math.max(0, delta - countdown); countdown = Math.max(0, countdown - delta); advance(pacifier, remaining); }
    else advance(pacifier, delta);
  }
  function animate(now: number) {
    if (disposed || hidden || paused || screen !== 'round') return;
    if (pacifier) {
      const before = `${opportunity(pacifier).index}:${pacifier.offsets.length}:${Math.ceil(countdown / 1000)}`;
      updateClock(now);
      const c = opportunity(pacifier);
      if (c.done) { finishPacifier(); return; }
      if (before !== `${c.index}:${pacifier.offsets.length}:${Math.ceil(countdown / 1000)}`) { render(); return; }
      const marker = container.querySelector<HTMLElement>('.game-marker');
      if (marker) marker.style.left = `${Math.max(0, Math.min(1, (c.local - 400) / c.travel)) * 100}%`;
      const button = container.querySelector<HTMLButtonElement>('[data-timing]');
      if (button) button.disabled = countdown > 0 || c.local < 400 || c.local >= 400 + c.travel || pacifier.offsets.length > c.index;
    } else {
      if (!round || round.awaitingNext || round.quiet || round.game !== 'pacifier') return;
      if (lastFrame) round.elapsed += now - lastFrame;
      lastFrame = now;
      const marker = container.querySelector<HTMLElement>('.game-marker');
      if (marker) marker.style.left = `${markerPosition(round.elapsed) * 100}%`;
    }
    frame = requestAnimationFrame(animate);
  }
  function pause() {
    if ((round || pacifier) && screen === 'round') { updateClock(performance.now()); paused = true; stopAnimation(); render(); }
  }
  function finishPacifier() {
    if (!pacifier || pending) return;
    const r = pacifier, result = evaluate(r.offsets, r.assists);
    const best = state?.scores?.find(s => s.rules_version === 2 && s.tempo === r.tempo && s.assists === r.assists)?.best_score ?? 0;
    const goal = result.score === 3900 ? 'Perfekter Durchgang! Das Baby empfiehlt eine kleine Siegespause.' : result.medal === 'Gold' ? 'Gold geschafft. Wie nah kommt ihr an 3.900 Punkte?' : result.medal === 'Silber' ? `Für Gold: noch ${Math.max(0, 11 - result.hits)} Treffer und ${Math.max(0, 8 - result.perfect)} präzise.` : result.medal === 'Bronze' ? `Für Silber: noch ${Math.max(0, 10 - result.hits)} Treffer und ${Math.max(0, 4 - result.perfect)} präzise.` : `Für Bronze: noch ${8 - result.hits} Treffer.`;
    resultView = `<div class="game-result-score"><strong>${result.score}</strong> Punkte <span>${result.medal ? result.medal + ' ✦' : 'Eine neue Runde Erfahrung'}</span></div><p>${result.hits}/12 Treffer · ${result.perfect} präzise<br>Längste Serie: ${result.bestCombo} · +${result.xp} XP</p><p>${best ? `Bisheriger Rekord: ${best}${result.score > best ? ' · Neuer Rekord!' : ''}` : 'Euer erster Rekord in dieser Variante.'}<br>${goal}</p>`;
    pending = { ...operation(account, 'round', { game: 'pacifier', tempo: r.tempo, assists: r.assists, offsets: [...r.offsets] }), rules_version: 2 };
    rememberPending(); screen = 'result'; stopAnimation(); pacifier = null; void submit();
  }
  async function load() {
    const own = ++generation;
    try {
      const latest = await api.load();
      if (disposed || own !== generation) return;
      if (!state || latest.revision >= state.revision) state = latest;
      connected = true;
      if (!compatible(latest)) error = 'Bitte die App aktualisieren. Dieser Spielstand gehört zu einer neueren Spielversion.';
      else if (!pendingReadError) error = '';
    } catch (e) { if (disposed || own !== generation) return; connected = false; error = gameError(e); }
    // Background snapshots must not reset an active game's input/animation.
    if (!disposed && screen !== 'round') render();
  }
  function rememberPending() {
    try { localStorage.setItem(pendingKey(account), JSON.stringify(pending)); storageWarning = ''; }
    catch { storageWarning = 'Auf diesem Gerät nicht vorgemerkt. Bitte jetzt speichern und diese Seite bis dahin nicht schließen.'; }
  }
  async function submit() {
    if (!pending || busy || disposed) return;
    const op = pending;
    busy = true; error = ''; rememberPending(); render();
    try {
      const result = await api.submit(op);
      if (disposed) return;
      // A stale local receipt is safe: retrying it cannot award twice.
      try { localStorage.removeItem(pendingKey(account)); storageWarning = ''; }
      catch { storageWarning = 'Gespeichert. Der lokale Nachweis konnte nicht entfernt werden; Wiederholen ist sicher.'; }
      pending = null; connected = true;
      const messages: Record<string, string> = { saved: `Gespeichert · +${result.xp} XP`, purchased: 'Neue Fähigkeit entdeckt. Kleine Schritte, große Freude!', already_owned: 'Diese Fähigkeit habt ihr inzwischen schon entdeckt.', insufficient_xp: 'Inzwischen wurde XP ausgegeben. Euer aktueller Stand wird geladen.', missing_prerequisite: 'Dafür fehlt noch die vorherige Fähigkeit.' };
      message = messages[result.status] ?? 'Gespeichert.';
      if (op.kind === 'buy') screen = 'skills';
      round = null;
      await load();
    } catch (e) { if (!disposed) { connected = false; error = gameError(e); } }
    finally { if (!disposed) { busy = false; render(); } }
  }
  function finish() {
    if (!round || round.completed !== 5 || pending) return;
    reward(round.completed, round.bonus);
    pending = operation(account, 'round', { game: round.game, completed: 5, bonus: round.bonus });
    rememberPending(); screen = 'result'; stopAnimation(); void submit();
  }
  async function buy(id: SkillId) {
    if (!canWrite() || !state || !canBuy(id, state)) return;
    pending = operation(account, 'buy', { skill: id }); rememberPending(); await submit();
  }
  async function begin() {
    if (busy || pending || pendingReadError) return;
    busy = true; render(); await load(); busy = false;
    if (disposed || hidden) return;
    if (!canWrite() || !state || !canPlay(selected, state.unlocks)) { render(); return; }
    resultView = '';
    if (selected === 'pacifier' && !practice) { pacifier = { tempo, assists: assistance(state.unlocks), elapsed: 0, offsets: [] }; round = null; countdown = 2000; }
    else { pacifier = null; round = startRound(selected, state.unlocks, selected === 'pacifier' ? true : quiet); }
    paused = false; screen = 'round'; message = ''; render(); window.scrollTo(0, 0);
  }
  function respond(value: string) {
    if (!round || paused || hidden || document.visibilityState === 'hidden') return;
    const result = answer(round, value); round = result.round; message = result.message;
    if (round.completed === 5) finish(); else render();
  }
  function homeView() {
    const complete = skills.every(s => state?.unlocks.includes(s.id));
    return `<div class="game-hero"><span class="game-eyebrow">EIN BABY. EUER GEMEINSAMES ABENTEUER.</span><h1>Kleine Schritte<span>Großes kleines Glück.</span></h1>${baby(complete, state?.unlocks.includes('self_pacifier'))}<p>${state?.unlocks.includes('self_pacifier') ? 'Schnuller? Schon selbst geholt. Jetzt ist Zeit für neue Entdeckungen.' : 'Ein bisschen spielen. Ein bisschen wachsen.<br>Alles in eurem Tempo.'}</p></div>
    <div class="game-wallet"><div><strong>${state?.xp_balance ?? '–'}</strong><span>XP zum Entdecken</span></div><div><strong>${skills.filter(s => state?.unlocks.includes(s.id)).length}<small> / 5</small></strong><span>Fähigkeiten</span></div><button data-action="skills" class="game-link">Fähigkeiten ansehen <span>↗</span></button></div>
    <div class="game-section-heading"><h2>Ein kleiner Spielmoment</h2><span>Kurze Runden · euer Tempo</span></div>
    <div class="game-cards">${(Object.keys(games) as GameId[]).map(id => {
      const unlocked = canPlay(id, state?.unlocks ?? []), stat = state?.stats.find(s => s.game_id === id);
      return `<button class="game-card ${!unlocked ? 'game-locked' : ''}" data-game="${id}" ${!unlocked || !canWrite() ? 'disabled' : ''}><span class="game-card-icon">${games[id].icon}</span><span><strong>${games[id].name}</strong><small>${!unlocked ? 'Nach „Schnuller selbst holen“' : id === 'pacifier' && state?.unlocks.includes('self_pacifier') ? 'Zum Spaß üben · immer willkommen' : games[id].subtitle}</small>${id === 'pacifier' && state?.scores?.length ? `<small>${state.scores.reduce((sum, s) => sum + s.rounds, 0)} Herausforderungsrunden</small>` : ''}${stat ? `<small>${stat.rounds} ${id === 'pacifier' ? 'frühere / ruhige Runden' : 'Runden'} · Bestwert ${stat.best_bonus}/5</small>` : ''}</span><span aria-hidden="true">${unlocked ? '↗' : '⌑'}</span></button>`;
    }).join('')}</div>${state?.scores?.length ? `<section class="game-records"><h2>Eure Schnuller-Rekorde</h2>${state.scores.filter(s => s.rules_version === 2).map(s => `<p><strong>${s.best_score} Punkte</strong> · ${s.tempo === 'steady' ? 'Gleichmäßig' : 'Tempowechsel'}<small>${s.assists & 1 ? 'Große Trefferzone' : 'Normale Trefferzone'}${s.assists & 2 ? ' · Rettung' : ''}</small></p>`).join('')}</section>` : ''}<p class="game-note">${complete ? 'Alle ersten Fähigkeiten entdeckt. Spielt weiter, euer XP bleibt für später.' : 'Jeder kleine Erfolg bringt euch weiter.'}<br>${state?.xp_total ?? 0} XP insgesamt · ${count()} gemeinsame Runden</p>`;
  }
  function skillsView() {
    return `<span class="game-eyebrow">EIN KLEINES STÜCK SELBSTSTÄNDIGKEIT</span><h1>Was kommt als Nächstes?</h1><p>${state?.xp_balance ?? 0} XP zum Entdecken · Ihr entscheidet gemeinsam.</p>${['Hände', 'Kontakt'].map(branch => `<section class="game-branch"><h2>${branch === 'Hände' ? '✦' : '☺'} ${branch}</h2>${skills.filter(s => s.branch === branch).map(s => {
      const owned = state?.unlocks.includes(s.id), prior = skills.find(p => p.id === s.prerequisite), ready = state && canBuy(s.id, state) && canWrite();
      return `<article class="game-skill ${owned ? 'game-owned' : ''}"><div><span class="game-step">${owned ? '✓' : '○'}</span><h3>${s.name}</h3></div><p>${s.effect}</p>${!owned && prior && !state?.unlocks.includes(prior.id) ? `<small>Zuerst: ${prior.name}</small>` : ''}<button data-buy="${s.id}" ${!ready ? 'disabled' : ''}>${owned ? 'Schon entdeckt' : `${s.cost} XP · Entdecken`}</button></article>`;
    }).join('')}</section>`).join('')}<button class="game-secondary" data-action="home">Zur Spielübersicht</button>`;
  }
  function pacifierView() {
    if (!pacifier) return '';
    if (paused) return `${baby()}<h1>Ein kleiner Moment Pause.</h1><p>Eure Runde wartet.</p><button data-action="resume" class="game-primary">Weiter spielen</button><button data-action="abort" class="game-secondary">Runde beenden · ohne XP</button>`;
    const r = pacifier, c = opportunity(r), score = evaluate(r.offsets, r.assists);
    const width = (r.assists & 1 ? 750 : 500) / c.travel * 100;
    const precise = 180 / c.travel * 100;
    const feedback = countdown > 0 ? `Bereit in ${Math.ceil(countdown / 1000)} …` : r.offsets.length > c.index ? hitText[score.outcomes[c.index]] : 'Ein Tipp, genau in die Mitte.';
    return `<div class="game-round-head"><span>Schnuller-Moment · ${Math.min(12, c.index + 1)}/12</span><button class="game-link" data-action="pause">Pause</button></div><div class="game-scorebar"><strong>${score.score} Punkte</strong><span>Serie ${score.combo} · ×${score.combo >= 6 ? 2 : score.combo >= 3 ? '1,5' : 1}</span></div><div class="game-progress game-twelve">${Array.from({ length: 12 }, (_, i) => `<span class="${i < r.offsets.length ? ['hit', 'perfect', 'rescued'].includes(score.outcomes[i]) ? 'done' : 'missed' : ''}"></span>`).join('')}</div>${baby(score.outcomes.at(-1) === 'perfect')}<p class="game-tempo">${r.tempo === 'steady' ? 'Gleichmäßiges Tempo' : c.travel === 2400 ? 'LANGSAM · danach schnell' : 'SCHNELL · danach langsam'}</p><p class="game-feedback" role="status">${feedback}</p><div class="game-track" aria-label="Trefferzone in der Mitte"><div class="game-zone" style="left:${50 - width / 2}%;width:${width}%"></div><div class="game-perfect-zone" style="left:${50 - precise / 2}%;width:${precise}%"></div><span class="game-marker" style="left:${Math.max(0, Math.min(1, (c.local - 400) / c.travel)) * 100}%"></span></div><button class="game-primary game-timing-button" data-timing ${countdown > 0 || c.local < 400 || r.offsets.length > c.index ? 'disabled' : ''}>Schnuller zurück</button><p class="game-note">Dunkle Mitte = präzise · Erster Tipp zählt<br>${r.assists & 1 ? 'Große Trefferzone' : 'Normale Trefferzone'}${r.assists & 2 ? ' · Eine Hand rettet euch' : ''}</p>`;
  }
  function timingInput() {
    if (!pacifier || paused || hidden || document.visibilityState === 'hidden') return;
    updateClock(performance.now());
    if (countdown <= 0 && tap(pacifier)) render();
  }
  function roundView() {
    if (pacifier) return pacifierView();
    if (!round) return '';
    if (paused) return `${baby()}<h1>Ein kleiner Moment Pause.</h1><p>Alles wartet auf euch. Ganz ohne Eile.</p><button data-action="resume" class="game-primary">Weiter spielen</button><button data-action="abort" class="game-secondary">Runde beenden · ohne XP</button>`;
    const r = round;
    let action = '';
    if (r.awaitingNext) action = `<button class="game-primary" data-action="next">Weiter</button>`;
    else if (r.game === 'pacifier') action = `${r.quiet ? '<div class="game-quiet">◉<span>Bereit zum Andocken.</span></div>' : `<div class="game-track" aria-label="Tippe im markierten Bereich"><div class="game-zone" style="left:${r.unlocks.includes('hands_discovered') ? 20 : 30}%;width:${r.unlocks.includes('hands_discovered') ? 60 : 40}%"><span>HIER</span></div><span class="game-marker" style="left:${markerPosition(r.elapsed) * 100}%"></span></div>`}<button data-answer="pacifier" class="game-primary">Schnuller zurück</button>`;
    else if (r.game === 'baby_talk') action = `<div class="game-speech">${r.target === 'smile' ? 'Das Baby lächelt ☺' : `„${r.target}!“`}</div><div class="game-answers">${(r.target === 'smile' ? ['smile'] : r.unlocks.includes('eye_contact') ? ['Ah', 'Oh', 'Da'] : ['Ah', 'Oh']).map(v => `<button class="game-primary ${!r.firstTry && v === r.target ? 'game-hint' : ''}" data-answer="${v}">${v === 'smile' ? 'Zurücklächeln' : v}</button>`).join('')}</div>`;
    else action = `<div class="game-grid">${[0, 1, 2, 3].map(n => `<button data-answer="${n}" aria-label="${String(n) === r.target ? 'Stern greifen' : 'Leeres Kissen'}" class="${String(n) === r.target ? 'game-star' : ''}">${String(n) === r.target ? '✦' : '·'}</button>`).join('')}</div>`;
    return `<div class="game-round-head"><span>${games[r.game].name}</span><button class="game-link" data-action="pause">Pause</button></div><div class="game-progress" aria-label="${r.completed} von 5 Aktionen">${[0, 1, 2, 3, 4].map(i => `<span class="${i < r.completed ? 'done' : ''}"></span>`).join('')}</div>${baby(r.awaitingNext || r.target === 'smile')}<p class="game-feedback" role="status">${escape(message || 'Nur ihr zwei und dieser kleine Moment.')}</p><div class="game-action-area">${action}</div>`;
  }
  function render() {
    if (disposed || hidden) return;
    stopAnimation();
    const focus = container.querySelector(':focus') as HTMLElement | null;
    const focusKey = focus?.dataset.action ? `[data-action="${focus.dataset.action}"]` : focus?.dataset.buy ? `[data-buy="${focus.dataset.buy}"]` : null;
    container.className = `baby-game${screen === 'round' && pacifier && !paused ? ' game-challenge' : ''}`;
    let body = '';
    if (screen === 'home') body = homeView();
    else if (screen === 'skills') body = skillsView();
    else if (screen === 'instruction' && selected === 'pacifier') body = `${baby()}<span class="game-eyebrow">ZWÖLF KLEINE PUNKTLANDUNGEN</span><h1>Schnuller-Moment</h1><p>Tippe einmal, wenn der Punkt die Mitte erreicht. Die dunkle Mitte bringt doppelte Punkte. Drei Treffer starten euren Serienbonus – sechs verdoppeln ihn.</p><div class="game-modes">${[['steady', 'Gleichmäßig'], ['alternating', 'Tempowechsel'], ['practice', 'Ohne Timing']].map(([id, label]) => `<button data-mode="${id}" aria-pressed="${practice ? id === 'practice' : id === tempo}">${label}</button>`).join('')}</div><p class="game-note">${practice ? '5 Aktionen · ohne Zeitdruck · 10 XP' : '12 Gelegenheiten · ca. 40 Sekunden · 10–15 XP<br>Bronze: 8 Treffer · Silber: 10 Treffer, 4 präzise<br>Gold: 11 Treffer, 8 präzise'}<br>Jederzeit pausierbar. Kein Ton nötig.</p><button class="game-primary" data-action="begin" ${!canWrite() ? 'disabled' : ''}>Los geht’s</button><button class="game-secondary" data-action="home">Zur Spielübersicht</button>`;
    else if (screen === 'instruction') body = `${baby()}<span class="game-eyebrow">EIN MOMENT FÜR EUCH</span><h1>${games[selected].name}</h1><p>${games[selected].instruction}</p><p class="game-note">5 Aktionen · 10 XP plus kleine Boni<br>Pausieren ist jederzeit möglich.</p><button class="game-primary" data-action="begin" ${!canWrite() ? 'disabled' : ''}>Los geht’s</button><button class="game-secondary" data-action="home">Zur Spielübersicht</button>`;
    else if (screen === 'round') body = roundView();
    else body = `${baby(!pending)}<h1>${pending ? 'Ein kleiner Erfolg wartet.' : 'Das war ein schöner Moment.'}</h1>${resultView}<p role="status">${pending ? busy ? 'Wird gespeichert …' : 'Noch nicht gespeichert' : escape(message)}</p>${pending ? `<button class="game-primary" data-action="retry" ${busy ? 'disabled' : ''}>${busy ? 'Einen Moment …' : 'Erneut speichern'}</button>` : '<button class="game-primary" data-action="begin">Noch eine Runde</button><button class="game-secondary" data-action="home">Weiter entdecken</button>'}`;
    container.innerHTML = `<div class="game-shell"><header class="game-header"><button class="game-link" data-action="exit">← Zum Logbuch</button><span>phililog <i>spielt.</i></span></header>${error ? `<div class="game-error" role="alert">${escape(error)} <button data-action="reload">Erneut laden</button></div>` : ''}${storageWarning ? `<p class="game-error" role="alert">${escape(storageWarning)}</p>` : ''}${pending && screen !== 'result' ? '<p class="game-error">Ein Spielvorgang wartet auf Speicherung. <button data-action="retry">Erneut speichern</button></p>' : ''}${message && screen === 'skills' ? `<p class="game-feedback" role="status">${escape(message)}</p>` : ''}${body}<footer class="game-footer">Kleine Schritte. Kein Müssen.</footer></div>`;
    container.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.addEventListener('click', () => { practice = b.dataset.mode === 'practice'; if (!practice) tempo = b.dataset.mode as Tempo; render(); }));
    const timingButton = container.querySelector<HTMLButtonElement>('[data-timing]');
    timingButton?.addEventListener('pointerdown', event => { if (event.isPrimary && event.button === 0) { event.preventDefault(); timingInput(); } });
    timingButton?.addEventListener('click', event => { if (event.detail === 0) timingInput(); });
    container.querySelectorAll<HTMLButtonElement>('[data-game]').forEach(b => b.addEventListener('click', () => { selected = b.dataset.game as GameId; screen = 'instruction'; message = ''; render(); window.scrollTo(0, 0); }));
    container.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b => b.addEventListener('click', () => void buy(b.dataset.buy as SkillId)));
    container.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b => b.addEventListener('click', () => respond(b.dataset.answer!)));
    container.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(b => b.addEventListener('click', () => {
      switch (b.dataset.action) {
        case 'exit': pause(); onExit(); break;
        case 'home': screen = pending ? 'result' : 'home'; round = null; pacifier = null; message = ''; render(); void load(); break;
        case 'skills': screen = 'skills'; message = ''; render(); break;
        case 'begin': void begin(); break;
        case 'reload':
          if (pendingReadError) { try { pending = readPending(localStorage, account); pendingReadError = false; } catch (e) { error = gameError(e); render(); return; } }
          void load(); break;
        case 'retry': void submit(); break;
        case 'pause': pause(); break;
        case 'resume': paused = false; if (pacifier) countdown = 2000; render(); break;
        case 'abort': pacifier = null; round = null; screen = 'home'; message = ''; render(); break;
        case 'quiet': if (round) { quiet = !round.quiet; round.quiet = quiet; render(); } break;
        case 'next': if (round) { round = nextAction(round); message = ''; render(); } break;
      }
    }));
    if (focusKey) container.querySelector<HTMLElement>(focusKey)?.focus({ preventScroll: true });
    if (screen === 'round' && !paused) { lastFrame = performance.now(); frame = requestAnimationFrame(animate); }
  }
  const visibility = () => { if (document.visibilityState === 'hidden') pause(); else if (!hidden) void load(); };
  const online = () => { if (!hidden) void load(); };
  const beforeUnload = (event: BeforeUnloadEvent) => { if (pending && storageWarning) { event.preventDefault(); event.returnValue = ''; } };
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('online', online);
  window.addEventListener('beforeunload', beforeUnload);
  const poll = setInterval(() => { if (!hidden && document.visibilityState !== 'hidden' && ['home', 'skills'].includes(screen) && !busy) void load(); }, 15000);
  render(); void load();
  return {
    show() { hidden = false; container.hidden = false; render(); void load(); },
    pause,
    hide() { pause(); hidden = true; container.hidden = true; stopAnimation(); },
    dispose() { disposed = true; generation++; stopAnimation(); clearInterval(poll); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('online', online); window.removeEventListener('beforeunload', beforeUnload); container.replaceChildren(); },
  };
}
