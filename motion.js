(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('motionToggle');
  const subscribers = new Map();
  function renderAll(dt) {
    subscribers.forEach((entry, render) => {
      entry.elapsed = dt === 0 ? 0 : entry.elapsed + dt;
      if (dt === 0 || entry.elapsed >= entry.interval) {
        try { render(time, entry.elapsed); }
        catch (error) { subscribers.delete(render); console.error('An optional animation stopped:', error); }
        entry.elapsed = 0;
      }
    });
  }
  let paused = preference.matches;
  let time = 0, previous = 0, frame = 0;

  function tick(now) {
    frame = 0;
    if (paused || document.hidden) return;
    if (!previous) previous = now;
    const elapsed = now - previous;
    if (elapsed > 0) {
      const dt = Math.min(.1, elapsed / 1000);
      previous = now;
      time += dt;
      renderAll(dt);
    }
    frame = requestAnimationFrame(tick);
  }
  function synchronize() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = 0;
    const stopped = paused || document.hidden;
    document.documentElement.dataset.motion = stopped ? 'paused' : 'playing';
    if (button) {
      button.textContent = paused ? 'Play motion' : 'Pause motion';
      button.setAttribute('aria-pressed', String(paused));
    }
    window.dispatchEvent(new CustomEvent('elev8mi:motion', {detail:{paused:stopped}}));
    renderAll(0);
    if (!stopped) frame = requestAnimationFrame(tick);
  }
  window.Elev8Motion = {
    add(render, {fps = 0} = {}) { subscribers.set(render, {interval: fps > 0 ? 1/fps : 0, elapsed:0}); render(time, 0); return () => subscribers.delete(render); },
    get paused() { return paused || document.hidden; },
    get time() { return time; }
  };
  button?.addEventListener('click', () => {
    paused = !paused;
    synchronize();
  });
  preference.addEventListener('change', event => { paused = event.matches; synchronize(); });
  document.addEventListener('visibilitychange', synchronize);
  synchronize();
})();
