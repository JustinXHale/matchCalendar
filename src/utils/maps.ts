export function openDirections(location: string): void {
  const encoded = encodeURIComponent(location.trim());
  window.open(`https://maps.google.com/maps?q=${encoded}`, '_blank', 'noopener');
}
