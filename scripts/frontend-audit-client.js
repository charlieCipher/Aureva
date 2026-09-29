import axe from 'axe-core';

async function audit() {
  // Wait for React's lazy screen and local fonts, not only document load.
  const deadline = Date.now() + 15000;
  while (!document.querySelector('h1') && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await document.fonts.ready;
  const results = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
  const summarize = items => items.map(({ id, impact, nodes }) => ({
    id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
  }));
  window.parent.postMessage({ type: 'leqvor-a11y', path: location.pathname,
    violations: summarize(results.violations), incomplete: summarize(results.incomplete),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }, location.origin);
}
audit().catch(() => window.parent.postMessage({ type: 'leqvor-a11y', error: 'Audit failed' }, location.origin));
