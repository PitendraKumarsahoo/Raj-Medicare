/**
 * Time and Date utilities with Asia/Kolkata (IST) timezone awareness
 */

// Timezone offset for Asia/Kolkata is UTC+5:30 (330 minutes)
const IST_OFFSET_MINUTES = 330;

/**
 * Get the current Date in IST
 */
export function getNowInIST(): Date {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + IST_OFFSET_MINUTES * 60000);
}

/**
 * Returns YYYY-MM-DD for today in IST
 */
export function getTodayISTDateString(): string {
  const ist = getNowInIST();
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, '0');
  const d = String(ist.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns current HH:mm in IST
 */
export function getCurrentISTTimeString(): string {
  const ist = getNowInIST();
  const h = String(ist.getHours()).padStart(2, '0');
  const m = String(ist.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Format a 24-hour time "17:00" to "5:00 PM"
 */
export function formatTime12Hour(time24: string): string {
  if (!time24) return '';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format date string "YYYY-MM-DD" into readable format e.g. "Today", "Tomorrow", or "Mon, 12 Oct"
 */
export function formatScheduleDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayISTDateString();
  
  // Create Date object for comparison
  const [y1, m1, d1] = todayStr.split('-').map(Number);
  const [y2, m2, d2] = dateStr.split('-').map(Number);

  const today = new Date(y1, m1 - 1, d1);
  const target = new Date(y2, m2 - 1, d2);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return target.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format a date nicely: e.g. "12 October 2026"
 */
export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Check if a schedule has expired based on IST current time.
 * A schedule is expired if:
 * 1. Schedule date is before today
 * 2. Schedule date is today and current IST time is past schedule end time
 */
export function isScheduleExpired(dateStr: string, endTimeStr: string): boolean {
  const todayStr = getTodayISTDateString();
  if (dateStr < todayStr) {
    return true;
  }
  if (dateStr === todayStr) {
    const currentISTTime = getCurrentISTTimeString();
    return currentISTTime >= endTimeStr;
  }
  return false;
}

/**
 * Compute the dynamic status of a doctor schedule
 */
export function computeEffectiveScheduleStatus(
  status: string,
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
  bookedCount: number,
  maxPatients: number
): {
  status: 'upcoming' | 'available' | 'almost_full' | 'fully_booked' | 'in_progress' | 'completed' | 'cancelled';
  label: string;
  badgeClass: string;
} {
  if (status === 'cancelled') {
    return {
      status: 'cancelled',
      label: 'Cancelled',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  }

  if (isScheduleExpired(dateStr, endTimeStr)) {
    return {
      status: 'completed',
      label: 'Completed',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  }

  const todayStr = getTodayISTDateString();
  const currentISTTime = getCurrentISTTimeString();

  const isToday = dateStr === todayStr;
  const isStarted = isToday && currentISTTime >= startTimeStr && currentISTTime < endTimeStr;

  if (bookedCount >= maxPatients && maxPatients > 0) {
    return {
      status: 'fully_booked',
      label: 'Fully Booked',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (isStarted) {
    return {
      status: 'in_progress',
      label: 'In Progress (Live)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
    };
  }

  if (maxPatients > 0 && maxPatients - bookedCount <= 2 && maxPatients - bookedCount > 0) {
    return {
      status: 'almost_full',
      label: 'Almost Full',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  if (dateStr > todayStr) {
    return {
      status: 'upcoming',
      label: 'Upcoming',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  return {
    status: 'available',
    label: 'Available Today',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  };
}

/**
 * Generate time slots between start and end time
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number = 15,
  maxSlots?: number
): { startTime: string; endTime: string }[] {
  const slots: { startTime: string; endTime: string }[] = [];

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  while (currentTotalMinutes + durationMinutes <= endTotalMinutes) {
    const slotStartH = Math.floor(currentTotalMinutes / 60);
    const slotStartM = currentTotalMinutes % 60;

    const nextMinutes = currentTotalMinutes + durationMinutes;
    const slotEndH = Math.floor(nextMinutes / 60);
    const slotEndM = nextMinutes % 60;

    const slotStartStr = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
    const slotEndStr = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

    slots.push({
      startTime: slotStartStr,
      endTime: slotEndStr,
    });

    if (maxSlots && slots.length >= maxSlots) {
      break;
    }

    currentTotalMinutes = nextMinutes;
  }

  return slots;
}
