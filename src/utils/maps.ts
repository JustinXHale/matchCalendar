export function directionsUrl(location: string): string {
  const encoded = encodeURIComponent(location.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

export function openDirections(location: string): void {
  window.open(directionsUrl(location), '_blank', 'noopener');
}
