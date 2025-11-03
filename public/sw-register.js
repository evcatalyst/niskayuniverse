(() => {
  if (!('serviceWorker' in navigator)) return;
  const base = '/niskayuniverse/';
  const swUrl = new URL('sw.js', window.location.origin + base).toString();
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).catch(console.warn);
  });
})();