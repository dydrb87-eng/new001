import { SeatData, SeatLog, SeatStatus } from './types';

const SEAT_STORAGE_KEY = 'library_seats_data';
const LOGS_STORAGE_KEY = 'library_usage_logs';
const SYNC_EVENT = 'library_store_sync';

const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    window.dispatchEvent(new Event('storage'));
  }
};

export function getSeats(): SeatData[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SEAT_STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {
      console.error("Failed to parse seats", e);
    }
  }
  
  const initialSeats: SeatData[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    status: 'OUT',
    userName: '',
  }));
  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(initialSeats));
  return initialSeats;
}

export function updateSeatUser(seatId: number, userName: string) {
  const seats = getSeats();
  const seatIndex = seats.findIndex(s => s.id === seatId);
  if (seatIndex !== -1) {
    seats[seatIndex].userName = userName;
    localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(seats));
    notifyUpdate();
  }
}

export function getAllLogs(): SeatLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOGS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const logs = JSON.parse(stored);
    return Array.isArray(logs) ? logs : [];
  } catch (e) {
    return [];
  }
}

export function batchUpdateStatus(status: SeatStatus) {
  const seats = getSeats();
  const allLogs = getAllLogs();
  const now = new Date().toISOString();
  
  let changed = false;
  const updatedSeats = seats.map(seat => {
    if (seat.status !== status) {
      changed = true;
      const log: SeatLog = {
        id: Math.random().toString(36).substring(2, 11) + Date.now(),
        seatId: seat.id,
        action: status,
        timestamp: now,
        userName: seat.userName || "",
      };
      allLogs.push(log);
      return { ...seat, status };
    }
    return seat;
  });

  if (changed) {
    localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(updatedSeats));
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(allLogs));
    notifyUpdate();
  }
}

export function getSeatLogs(seatId: number): SeatLog[] {
  const allLogs = getAllLogs();
  return allLogs
    .filter(log => log.seatId === seatId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function toggleSeat(seatId: number): { action: SeatStatus; timestamp: string } {
  const seats = getSeats();
  const seatIndex = seats.findIndex(s => s.id === seatId);
  if (seatIndex === -1) throw new Error('Seat not found');

  const now = new Date().toISOString();
  const currentSeat = seats[seatIndex];
  const newStatus: SeatStatus = currentSeat.status === 'IN' ? 'OUT' : 'IN';
  
  seats[seatIndex].status = newStatus;
  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(seats));

  const allLogs = getAllLogs();
  const log: SeatLog = {
    id: Math.random().toString(36).substring(2, 11) + Date.now(),
    seatId,
    action: newStatus,
    timestamp: now,
    userName: currentSeat.userName || "",
  };
  allLogs.push(log);
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(allLogs));
  
  notifyUpdate();
  return { action: newStatus, timestamp: now };
}

export function resetAll() {
  localStorage.removeItem(SEAT_STORAGE_KEY);
  localStorage.removeItem(LOGS_STORAGE_KEY);
  const initialSeats: SeatData[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    status: 'OUT',
    userName: '',
  }));
  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(initialSeats));
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([]));
  notifyUpdate();
}
