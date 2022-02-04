export function getCurrentLocalHref() {
  return window.location.href.replace(window.location.origin, '');
}
