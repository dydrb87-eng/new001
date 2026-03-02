
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { SeatData, SeatLog, SeatStatus } from './types';

const SEATS_COLLECTION = 'seats';
const LOGS_COLLECTION = 'logs';

// 관리자 QR 페이지 등에서 사용할 전체 자리 목록 가져오기
export async function getSeats(): Promise<SeatData[]> {
  const snapshot = await getDocs(collection(db, SEATS_COLLECTION));
  const seats = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as SeatData));
  return seats.sort((a, b) => a.id - b.id);
}

export function subscribeSeats(callback: (seats: SeatData[]) => void) {
  // 실시간 리스너 설정
  return onSnapshot(collection(db, SEATS_COLLECTION), (snapshot) => {
    if (snapshot.empty) {
      // 데이터가 아예 없는 경우 초기 20개 자리 생성
      const initialSeats: SeatData[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        status: 'OUT',
        userName: '',
      }));
      
      const batch = writeBatch(db);
      initialSeats.forEach((seat) => {
        const ref = doc(db, SEATS_COLLECTION, seat.id.toString());
        batch.set(ref, { status: seat.status, userName: seat.userName });
      });
      batch.commit().catch(console.error);
      
      // 생성 직후 UI가 멈추지 않게 초기값 즉시 전달
      callback(initialSeats);
    } else {
      const seats = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as SeatData));
      callback(seats.sort((a, b) => a.id - b.id));
    }
  });
}

export function subscribeLogs(callback: (logs: SeatLog[]) => void) {
  const q = query(collection(db, LOGS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeatLog));
    callback(logs);
  });
}

export async function updateSeatUser(seatId: number, userName: string) {
  const seatRef = doc(db, SEATS_COLLECTION, seatId.toString());
  await updateDoc(seatRef, { userName });
}

export async function toggleSeat(seatId: number) {
  const seatRef = doc(db, SEATS_COLLECTION, seatId.toString());
  const seatSnap = await getDoc(seatRef);
  
  if (!seatSnap.exists()) return;
  
  const currentData = seatSnap.data();
  const newStatus: SeatStatus = currentData.status === 'IN' ? 'OUT' : 'IN';
  const now = new Date().toISOString();

  // 상태 업데이트 (이 작업이 완료되면 onSnapshot이 트리거되어 모든 기기에 반영됨)
  await updateDoc(seatRef, { status: newStatus });
  
  // 로그 추가
  await addDoc(collection(db, LOGS_COLLECTION), {
    seatId,
    action: newStatus,
    timestamp: now,
    userName: currentData.userName || ""
  });

  return { action: newStatus, timestamp: now };
}

export async function batchUpdateStatus(status: SeatStatus) {
  const snapshot = await getDocs(collection(db, SEATS_COLLECTION));
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  let changed = false;

  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status !== status) {
      changed = true;
      batch.update(docSnap.ref, { status });
      const logRef = doc(collection(db, LOGS_COLLECTION));
      batch.set(logRef, {
        seatId: Number(docSnap.id),
        action: status,
        timestamp: now,
        userName: data.userName || ""
      });
    }
  });

  if (changed) {
    await batch.commit();
    return true;
  }
  return false;
}

export async function resetAll() {
  const seatsSnap = await getDocs(collection(db, SEATS_COLLECTION));
  const logsSnap = await getDocs(collection(db, LOGS_COLLECTION));
  const batch = writeBatch(db);

  seatsSnap.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'OUT', userName: '' });
  });

  logsSnap.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

export function exportLogsToCSV(logs: SeatLog[]) {
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
