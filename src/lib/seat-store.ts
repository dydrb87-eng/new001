
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
  getDoc,
  limit
} from 'firebase/firestore';
import { SeatData, SeatLog, SeatStatus } from './types';

const SEATS_COLLECTION = 'seats';
const LOGS_COLLECTION = 'logs';

// 초기 자리 생성 함수 (최적화: 존재 여부 선 확인 후 일괄 생성)
export async function initializeDefaultSeats() {
  const snapshot = await getDocs(query(collection(db, SEATS_COLLECTION), limit(1)));
  if (!snapshot.empty) return; // 이미 데이터가 있으면 중단

  const batch = writeBatch(db);
  for (let i = 1; i <= 20; i++) {
    const ref = doc(db, SEATS_COLLECTION, i.toString());
    batch.set(ref, { status: 'OUT', userName: '' });
  }
  await batch.commit();
}

// 전체 자리 목록 가져오기
export async function getSeats(): Promise<SeatData[]> {
  const snapshot = await getDocs(collection(db, SEATS_COLLECTION));
  if (snapshot.empty) {
    await initializeDefaultSeats();
    const newSnapshot = await getDocs(collection(db, SEATS_COLLECTION));
    return newSnapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as SeatData)).sort((a, b) => a.id - b.id);
  }
  const seats = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as SeatData));
  return seats.sort((a, b) => a.id - b.id);
}

// 실시간 자리 구독 (성능 최적화: 즉시 콜백 호출 시도)
export function subscribeSeats(callback: (seats: SeatData[]) => void) {
  return onSnapshot(collection(db, SEATS_COLLECTION), (snapshot) => {
    if (snapshot.empty) {
      // 데이터가 아예 없는 경우 초기화 시도 (비동기 처리)
      initializeDefaultSeats().then(() => {
        // 초기화 후 onSnapshot이 다시 트리거될 것임
      });
      callback([]); // 일단 빈 배열 전달하여 로딩 상태 유도
    } else {
      const seats = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as SeatData));
      callback(seats.sort((a, b) => a.id - b.id));
    }
  });
}

// 이용 기록 구독
export function subscribeLogs(callback: (logs: SeatLog[]) => void) {
  const q = query(collection(db, LOGS_COLLECTION), orderBy('timestamp', 'desc'), limit(50)); // 최근 50개로 제한하여 속도 향상
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

  await updateDoc(seatRef, { status: newStatus });
  
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
  const batch = writeBatch(db);
  
  const seatsSnap = await getDocs(collection(db, SEATS_COLLECTION));
  seatsSnap.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'OUT', userName: '' });
  });

  const logsSnap = await getDocs(collection(db, LOGS_COLLECTION));
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
