import { SeatData, SeatLog, SeatStatus } from './types';

const SEAT_STORAGE_KEY = 'library_seats_data';
const LOGS_STORAGE_KEY = 'library_usage_logs';

export function getSeats(): SeatData[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SEAT_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize seats 1 to 20
  const initialSeats: SeatData[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    status: 'OUT',
  }));
  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(initialSeats));
  return initialSeats;
}

export function getSeatLogs(seatId: number): SeatLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOGS_STORAGE_KEY);
  if (stored) {
    const allLogs: SeatLog[] = JSON.parse(stored);
    return allLogs.filter(log => log.seatId === seatId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  return [];
}

export function toggleSeat(seatId: number): { action: SeatStatus; timestamp: string } {
  const seats = getSeats();
  const seatIndex = seats.findIndex(s => s.id === seatId);
  const now = new Date().toISOString();
  
  if (seatIndex === -1) {
    throw new Error('Seat not found');
  }

  const newStatus: SeatStatus = seats[seatIndex].status === 'IN' ? 'OUT' : 'IN';
  seats[seatIndex].status = newStatus;
  
  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(seats));

  const log: SeatLog = {
    id: crypto.randomUUID(),
    seatId,
    action: newStatus,
    timestamp: now,
  };

  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  const allLogs: SeatLog[] = storedLogs ? JSON.parse(storedLogs) : [];
  allLogs.push(log);
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(allLogs));

  return { action: newStatus, timestamp: now };
}

export function resetAll() {
  localStorage.removeItem(SEAT_STORAGE_KEY);
  localStorage.removeItem(LOGS_STORAGE_KEY);
}
