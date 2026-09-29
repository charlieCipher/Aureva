const frame = document.querySelector('#page');
const button = document.querySelector('#run');
const status = document.querySelector('#status');
const output = document.querySelector('#results');
const routes = ['/auth', '/app', '/app/vault', '/app/vault/new', '/app/vault/residence', '/app/people', '/app/continuity', '/app/security'];
button.addEventListener('click', async () => {
  button.disabled = true;
  const results = [];
  try {
    for (const width of [320, 768, 1440]) for (const path of routes) {
      status.textContent = `Checking ${path} at ${width}px`;
      frame.width = width;
      const result = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { window.removeEventListener('message', receive); reject(new Error('Audit timed out')); }, 30000);
        function receive(event) {
          if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'leqvor-a11y') return;
          clearTimeout(timer); window.removeEventListener('message', receive); resolve(event.data);
        }
        window.addEventListener('message', receive);
        frame.src = `${path}?${path === '/auth' ? '' : 'preview=1&'}a11y=1`;
      });
      results.push({ width, ...result });
      output.textContent = JSON.stringify(results, null, 2);
      if (result.error) throw new Error(result.error);
    }
    status.textContent = `Complete: ${results.length} checks; ${results.reduce((n, r) => n + r.violations.length, 0)} rule violations. Review incomplete results manually.`;
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
