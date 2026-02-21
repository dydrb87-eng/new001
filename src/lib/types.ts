export type SeatStatus = 'IN' | 'OUT';

export interface SeatLog {
  id: string;
  seatId: number;
  action: SeatStatus;
  timestamp: string;
}

export interface SeatData {
  id: number;
  status: SeatStatus;
  userName?: string;
}
