import { SeatData, SeatLog, SeatStatus } from './types';

const SEAT_STORAGE_KEY = 'library_seats_data';
const LOGS_STORAGE_KEY = 'library_usage_logs';
const SYNC_EVENT = 'library_store_sync';

// Helper to notify all components in the same tab
const notifyUpdate = () => {
  window.dispatchEvent(new Event(SYNC_EVENT));
  window.dispatchEvent(new Event('storage')); // For multi-tab support
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
  
  // Initialize seats 1 to 20
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
  
  const updatedSeats = seats.map(seat => {
    // Only log if status is actually changing
    if (seat.status !== status) {
      const log: SeatLog = {
        id: Math.random().toString(36).substring(2, 11) + Date.now(),
        seatId: seat.id,
        action: status,
        timestamp: now,
      };
      allLogs.push(log);
    }
    return { ...seat, status };
  });

  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(updatedSeats));
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(allLogs));
  notifyUpdate();
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
  const newStatus: SeatStatus = seats[seatIndex].status === 'IN' ? 'OUT' : 'IN';
  
  seats[seatIndex].status = newStatus;
  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(seats));

  const allLogs = getAllLogs();
  const log: SeatLog = {
    id: Math.random().toString(36).substring(2, 11) + Date.now(),
    seatId,
    action: newStatus,
    timestamp: now,
  };
  allLogs.push(log);
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(allLogs));
  
  notifyUpdate();
  return { action: newStatus, timestamp: now };
}

export function resetAll() {
  localStorage.removeItem(SEAT_STORAGE_KEY);
  localStorage.removeItem(LOGS_STORAGE_KEY);
  // Re-initialize to ensure fresh state
  getSeats(); 
  notifyUpdate();
}
