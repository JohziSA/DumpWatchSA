import { SA_PROVINCES, type SaProvince } from './types';

export { SA_PROVINCES };

const CENTROIDS: Record<SaProvince, { lat: number; lng: number }> = {
  'Eastern Cape': { lat: -32.3, lng: 26.5 },
  'Free State': { lat: -28.5, lng: 26.8 },
  Gauteng: { lat: -26.27, lng: 28.12 },
  'KwaZulu-Natal': { lat: -29.0, lng: 30.5 },
  Limpopo: { lat: -23.9, lng: 29.45 },
  Mpumalanga: { lat: -25.57, lng: 30.53 },
  'Northern Cape': { lat: -28.73, lng: 24.77 },
  'North West': { lat: -26.66, lng: 25.28 },
  'Western Cape': { lat: -33.92, lng: 18.85 },
};

export function inferProvinceFromCoords(lat: number, lng: number): SaProvince | null {
  if (lat > -22 || lat < -35.2 || lng < 16.3 || lng > 33.1) {
    return null;
  }
  let best: SaProvince = 'Gauteng';
  let bestDist = Number.POSITIVE_INFINITY;
  for (const province of SA_PROVINCES) {
    const c = CENTROIDS[province];
    const d = (lat - c.lat) ** 2 + (lng - c.lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = province;
    }
  }
  return best;
}

export function formatOccurred(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: 'Unknown', time: '--:--' };
  }
  const date = d.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return { date, time };
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'pending_approval':
      return 'Pending approval';
    case 'open':
      return 'Open';
    case 'under_review':
      return 'Under review';
    case 'ai_flagged':
      return 'AI flagged';
    case 'proven':
      return 'Proven';
    case 'prosecuted':
      return 'Prosecuted';
    case 'deletion_requested':
      return 'Deletion requested';
    case 'removed':
      return 'Removed';
    default:
      return status;
  }
}

export function prosecutionLabel(status: string): string {
  switch (status) {
    case 'under_review':
      return 'Prosecution: Under review';
    case 'proven':
      return 'Prosecution: Proven';
    case 'prosecuted':
      return 'Prosecution: Prosecuted';
    default:
      return 'Prosecution: Not started';
  }
}
