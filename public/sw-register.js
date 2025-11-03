(() => {
  if (!('serviceWorker' in navigator)) return;
  const base = document.querySelector('base')?.getAttribute('href') || '/niskayuniverse/';
  const swUrl = new URL('sw.js', base).toString();
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).catch(console.warn);
  });
})();