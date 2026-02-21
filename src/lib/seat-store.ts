import { SeatData, SeatLog, SeatStatus } from './types';

const SEAT_STORAGE_KEY = 'library_seats_data';
const LOGS_STORAGE_KEY = 'library_usage_logs';
const SYNC_EVENT = 'library_store_sync';

// 공통: 변경 사항 알림
export const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  }
};

export function getSeats(): SeatData[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SEAT_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
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

export function saveSeats(seats: SeatData[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(seats));
  notifyUpdate();
}

export function getLogs(): SeatLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOGS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveLogs(logs: SeatLog[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
}

export function updateSeatUser(seatId: number, userName: string) {
  const seats = getSeats();
  const index = seats.findIndex(s => s.id === seatId);
  if (index !== -1) {
    seats[index].userName = userName;
    saveSeats(seats);
  }
}

export function batchUpdateStatus(status: SeatStatus) {
  const seats = getSeats();
  const logs = getLogs();
  const now = new Date().toISOString();
  
  let changed = false;
  const updatedSeats = seats.map(seat => {
    if (seat.status !== status) {
      changed = true;
      logs.push({
        id: Math.random().toString(36).substring(2, 9) + Date.now(),
        seatId: seat.id,
        action: status,
        timestamp: now,
        userName: seat.userName || "",
      });
      return { ...seat, status };
    }
    return seat;
  });

  if (changed) {
    saveSeats(updatedSeats);
    saveLogs(logs);
    return true;
  }
  return false;
}

export function toggleSeat(seatId: number): { action: SeatStatus; timestamp: string } {
  const seats = getSeats();
  const logs = getLogs();
  const index = seats.findIndex(s => s.id === seatId);
  
  if (index === -1) throw new Error('Seat not found');

  const now = new Date().toISOString();
  const newStatus: SeatStatus = seats[index].status === 'IN' ? 'OUT' : 'IN';
  
  seats[index].status = newStatus;
  logs.push({
    id: Math.random().toString(36).substring(2, 9) + Date.now(),
    seatId,
    action: newStatus,
    timestamp: now,
    userName: seats[index].userName || "",
  });

  saveSeats(seats);
  saveLogs(logs);
  
  return { action: newStatus, timestamp: now };
}

export function resetAll() {
  const initialSeats: SeatData[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    status: 'OUT',
    userName: '',
  }));
  if (typeof window !== 'undefined') {
    localStorage.setItem(SEAT_STORAGE_KEY, JSON.stringify(initialSeats));
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([]));
    notifyUpdate();
  }
}

export function exportLogsToCSV() {
  const logs = getLogs();
  if (logs.length === 0) return false;

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let csv = "\ufeff날짜,시간,자리 번호,사용자,상태\n";
  sortedLogs.forEach(log => {
    const d = new Date(log.timestamp);
    const dateStr = d.toLocaleDateString('ko-KR');
    const timeStr = d.toLocaleTimeString('ko-KR');
    const actionStr = log.action === 'IN' ? '입실' : '퇴실';
    csv += `${dateStr},${timeStr},${log.seatId},"${log.userName || ""}",${actionStr}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `도서관_이용기록_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
