(() => {
'use strict';
  const FREQ = 528;
  // Measured: amplitude 0.07 = -23.7 LUFS. 0.135 (+5.7 dB) matches the
  // instrument loops' shared -18 LUFS level.
  const DRONE_LEVEL = 0.135;
  let audioCtx = null;
  let osc = null;
  let gain = null;
  let lfo = null;
  let lfoGain = null;
  let toneOn = false;

  function buildTone() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    audioCtx = audioCtx || new Ctx();
    if (osc) return true;
    osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = FREQ;
    gain = audioCtx.createGain();
    gain.gain.value = 0;
    lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    lfo.start();
    return true;
  }

  // Instrument loops (528 Hz, 2:00, seamless), listed in sound-config.js.
  // Web Audio buffer looping avoids the gap an <audio loop> element leaves.
  // Instrument files are normalised to about -18 LUFS and share one gain.
  const SHARED_GAIN = Number(window.Elev8SoundConfig?.sharedGain) || 1;
  const instruments = ((window.Elev8SoundConfig && window.Elev8SoundConfig.instruments) || [])
    .filter(item => item && /^[a-z0-9-]+$/.test(item.id))
    .map(item => ({id: item.id, label: item.label || item.id, gain: item.gain, buffer: null, loading: null, available: null}));
  const menuButton = document.getElementById('soundMenuButton');
  const menu = document.getElementById('soundMenu');
  const menuLabel = document.getElementById('soundMenuLabel');
  let mode = 'tone', loopSource = null, loopGain = null, loopId = null;
  const find = id => instruments.find(item => item.id === id);
  function sources(id) {
    const probe = document.createElement('audio');
    const ogg = probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"');
    const base = `elev8mi-528hz-${id}`;
    return ogg ? [`${base}.ogg`, `${base}.mp3`] : [`${base}.mp3`];
  }
  async function exists(item) {
    if (item.available !== null) return item.available;
    try {
      const response = await fetch(`elev8mi-528hz-${item.id}.mp3`, {method: 'HEAD', cache: 'no-cache'});
      item.available = response.ok;
    } catch (_) {
      item.available = location.protocol === 'file:'; // offline preview: try at play time
    }
    return item.available;
  }
  const levelFor = item => typeof item.gain === 'number' ? item.gain : SHARED_GAIN;
  function decode(data) {
    return new Promise((resolve, reject) => {
      const result = audioCtx.decodeAudioData(data, resolve, reject);
      if (result && result.then) result.then(resolve, reject);
    });
  }
  async function load(item) {
    if (item.buffer) return item.buffer;
    if (item.loading) return item.loading;
    item.loading = (async () => {
      for (const url of sources(item.id)) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          item.buffer = await decode(await response.arrayBuffer());
          item.level = levelFor(item);
          return item.buffer;
        } catch (_) { /* try the next format */ }
      }
      item.loading = null;
      return null;
    })();
    return item.loading;
  }
  function stopLoop(fade) {
    if (!loopSource || !audioCtx) return;
    const source = loopSource, g = loopGain, now = audioCtx.currentTime;
    g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0, now + fade);
    try { source.stop(now + fade + .05); } catch (_) {}
    loopSource = null; loopGain = null; loopId = null;
  }
  async function startLoop(item) {
    const buffer = await load(item);
    if (!buffer) {
      // Files missing or undecodable: hide the option and fall back to Tone.
      item.available = false; renderMenu();
      if (mode === item.id) { mode = 'tone'; syncLabels(); if (toneOn) setDrone(true); }
      return;
    }
    if (!toneOn || mode !== item.id || loopId === item.id) return;
    stopLoop(.9);
    loopSource = audioCtx.createBufferSource(); loopSource.buffer = buffer; loopSource.loop = true;
    loopGain = audioCtx.createGain(); loopGain.gain.value = 0;
    loopSource.connect(loopGain); loopGain.connect(audioCtx.destination);
    loopSource.start(); loopId = item.id;
    const now = audioCtx.currentTime;
    loopGain.gain.setValueAtTime(0, now); loopGain.gain.linearRampToValueAtTime(item.level, now + 1.2);
  }
  function setDrone(on) {
    const now = audioCtx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(on ? DRONE_LEVEL : 0, now + 0.9);
    lfoGain.gain.cancelScheduledValues(now);
    lfoGain.gain.setValueAtTime(lfoGain.gain.value, now);
    lfoGain.gain.linearRampToValueAtTime(on ? DRONE_LEVEL * .17 : 0, now + 0.7);
  }
  const labelOf = id => id === 'tone' ? 'Tone' : (find(id)?.label || id);
  const spoken = id => id === 'tone' ? '528 Hz tone' : `528 Hz ${labelOf(id).toLowerCase()}`;
  function syncLabels() {
    const btn = document.getElementById('toneBtn');
    btn.setAttribute('aria-label', toneOn ? `Stop ${spoken(mode)}` : `Play ${spoken(mode)}`);
    if (menuLabel) menuLabel.textContent = labelOf(mode);
    if (menuButton) menuButton.setAttribute('aria-label', `Sound: ${labelOf(mode)}. Choose a 528 Hz sound`);
    menu?.querySelectorAll('[role="menuitemradio"]').forEach(item => item.setAttribute('aria-checked', String(item.dataset.sound === mode)));
  }
  function options() { return [...instruments.filter(item => item.available !== false).map(item => item.id), 'tone']; }
  function renderMenu() {
    if (!menu || !menuButton) return;
    const list = options();
    menu.replaceChildren(...list.map(id => {
      const item = document.createElement('li');
      item.setAttribute('role', 'menuitemradio'); item.tabIndex = -1; item.dataset.sound = id;
      item.textContent = labelOf(id);
      item.addEventListener('click', () => { choose(id); closeMenu(true); });
      return item;
    }));
    // With only Tone available there is nothing to choose; keep the label.
    menuButton.disabled = list.length < 2;
    syncLabels();
  }
  function items() { return [...menu.querySelectorAll('[role="menuitemradio"]')]; }
  function openMenu(focusLast) {
    if (!menu || menuButton.disabled) return;
    menu.hidden = false; menuButton.setAttribute('aria-expanded', 'true');
    const all = items(), current = all.find(item => item.dataset.sound === mode);
    (focusLast ? all.at(-1) : current || all[0])?.focus();
  }
  function closeMenu(restore) {
    if (!menu || menu.hidden) return;
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false');
    if (restore) menuButton.focus();
  }
  function choose(id) {
    if (id === mode) return;
    mode = id;
    if (toneOn) setTone(true); else syncLabels();
  }
  menuButton?.addEventListener('click', () => menu.hidden ? openMenu(false) : closeMenu(false));
  menuButton?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openMenu(event.key === 'ArrowUp'); }
  });
  menu?.addEventListener('keydown', event => {
    const all = items(), index = all.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); all[(index + 1) % all.length].focus(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); all[(index - 1 + all.length) % all.length].focus(); }
    else if (event.key === 'Home') { event.preventDefault(); all[0].focus(); }
    else if (event.key === 'End') { event.preventDefault(); all.at(-1).focus(); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (index >= 0) { choose(all[index].dataset.sound); closeMenu(true); } }
    else if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
    else if (event.key === 'Tab') closeMenu(false);
  });
  document.addEventListener('pointerdown', event => { if (menu && !menu.hidden && !event.target.closest('#soundPicker')) closeMenu(false); });

  function setTone(on) {
    try { if (!buildTone()) return; } catch (_) { return; }
    audioCtx.resume().catch(()=>{});
    toneOn = on;
    setDrone(on && mode === 'tone');
    const item = find(mode);
    if (on && item) startLoop(item); else stopLoop(0.9);
    document.getElementById('tuner').classList.toggle('on', on);
    document.getElementById('toneBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
    syncLabels();
  }
  renderMenu();
  Promise.all(instruments.map(exists)).then(renderMenu);
  document.getElementById('toneBtn').addEventListener('click', () => setTone(!toneOn));
  const heroTone=document.getElementById('heroTone');
  if(heroTone) heroTone.addEventListener('click', () => setTone(!toneOn));

})();
