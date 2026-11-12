/**
 * Utility for synchronizing date and time with Server (GMT+7 / Asia/Jakarta / WIB)
 */

let serverTimeOffsetMs = 0;
let isSynced = false;

// Sync offset with server HTTP Date header if available
export const syncWithServerTime = async () => {
  try {
    const start = Date.now();
    const response = await fetch(window.location.href, {
      method: 'HEAD',
      cache: 'no-store',
    });
    const serverDateHeader = response.headers.get('date');
    if (serverDateHeader) {
      const serverTime = new Date(serverDateHeader).getTime();
      const end = Date.now();
      const roundTrip = (end - start) / 2;
      serverTimeOffsetMs = (serverTime + roundTrip) - end;
      isSynced = true;
    }
  } catch {
    // If head request is not available or blocked, fallback to standard client UTC time with Asia/Jakarta timezone
  }
};

// Initial sync call
if (typeof window !== 'undefined') {
  syncWithServerTime();
}

/**
 * Returns a Date object adjusted for server offset
 */
export const getServerNow = (): Date => {
  return new Date(Date.now() + serverTimeOffsetMs);
};

/**
 * Returns date in YYYY-MM-DD format according to Asia/Jakarta (GMT+7)
 */
export const getJakartaDateString = (): string => {
  const now = getServerNow();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
};

/**
 * Returns time string in HH:mm or HH:mm:ss (24-hour format) according to Asia/Jakarta (GMT+7)
 */
export const getJakartaTimeString = (includeSeconds = false): string => {
  const now = getServerNow();
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: false,
  });
  // id-ID uses '.' as time separator in some browsers; normalize to ':'
  return formatter.format(now).replace(/\./g, ':');
};

/**
 * Returns human-readable date e.g. "Minggu, 8 November 2026" according to Asia/Jakarta (GMT+7)
 */
export const getJakartaFormattedDate = (): string => {
  const now = getServerNow();
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
};

/**
 * Check if time string A overlaps with time string B
 * times in "HH:mm" format.
 * Overlap exists if max(startA, startB) < min(endA, endB)
 */
export const isTimeOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  const toMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);

  // An interval with end <= start is invalid, but if valid:
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
};

/**
 * Jadwal Resmi Kemenag Kab. Lebak:
 * - Senin s.d. Kamis: Masuk 07:30 WIB, Pulang 16:00 WIB
 * - Hari Jumat: Masuk 07:30 WIB, Pulang 16:30 WIB
 */
export const getKemenagWorkSchedule = (): {
  dayName: string;
  isFriday: boolean;
  scheduledIn: string;
  scheduledOut: string;
  description: string;
} => {
  const now = getServerNow();
  const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  });
  const dayName = dayFormatter.format(now);
  const isFriday = dayName.toLowerCase().includes('jumat');
  const scheduledIn = '07:30';
  const scheduledOut = isFriday ? '16:30' : '16:00';
  const description = isFriday
    ? 'Hari Jumat: Masuk 07:30 WIB | Pulang 16:30 WIB'
    : 'Senin - Kamis: Masuk 07:30 WIB | Pulang 16:00 WIB';

  return { dayName, isFriday, scheduledIn, scheduledOut, description };
};
