
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toggleSeat, subscribeSeats, subscribeLogs } from '@/lib/seat-store';
import { SeatLog, SeatData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, History, UserCheck, UserX, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SeatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const seatId = Number(params.id);

  const [seat, setSeat] = useState<SeatData | null>(null);
  const [logs, setLogs] = useState<SeatLog[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const unsubSeats = subscribeSeats((seats) => {
      const current = seats.find(s => s.id === seatId);
      setSeat(current || null);
      setLoading(false);
    });
    const unsubLogs = subscribeLogs((allLogs) => {
      setLogs(allLogs.filter(l => l.seatId === seatId));
    });

    return () => {
      unsubSeats();
      unsubLogs();
    };
  }, [seatId]);

  if (!mounted || loading) return null;

  const handleToggle = async () => {
    await toggleSeat(seatId);
  };

  const isOccupied = seat?.status === 'IN';

  return (
    <div className="min-h-screen bg-background p-6 md:p-12" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 숨겨진 뒤로가기 버튼: 여백 영역처럼 보이지만 클릭 시 메인으로 이동 */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="w-10 h-10 p-0 text-transparent bg-transparent hover:bg-transparent border-none shadow-none focus-visible:ring-0 cursor-default select-none mb-[-2rem] ml-[-2rem]"
        >
          .
        </Button>

        <Card className="shadow-lg border-2 border-white animate-check-in">
          <CardHeader className="text-center bg-primary text-white rounded-t-lg">
            <CardTitle className="text-5xl font-black mb-2">{seatId}번 자리</CardTitle>
            <div className="flex items-center justify-center gap-2">
              {isOccupied ? (
                <Badge variant="secondary" className="bg-accent text-white border-none px-4 py-1 text-base animate-pulse">
                  현재 이용 중
                </Badge>
              ) : (
                <Badge variant="outline" className="text-white border-white/50 px-4 py-1 text-base">
                  이용 가능
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={cn(
                  "p-6 rounded-full transition-colors duration-500",
                  isOccupied ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                )}>
                  {isOccupied ? <UserCheck className="w-16 h-16" /> : <UserX className="w-16 h-16" />}
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-primary">
                  {isOccupied ? '현재 사용 중인 자리입니다' : '현재 비어 있는 자리입니다'}
                </h2>
                {logs.length > 0 && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                    <Clock className="w-4 h-4" />
                    <span>최근 기록: {format(new Date(logs[0].timestamp), 'HH:mm:ss')} ({logs[0].action === 'IN' ? '입실' : '퇴실'})</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              size="lg" 
              className={cn(
                "w-full font-bold h-14 text-lg shadow-md transition-all active:scale-95 gap-2",
                isOccupied ? "bg-slate-500 hover:bg-slate-600" : "bg-accent hover:bg-accent/90"
              )}
              onClick={handleToggle}
            >
              <ArrowLeftRight className="w-5 h-5" />
              {isOccupied ? '퇴실 처리하기' : '입실 처리하기'}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-white overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-primary font-bold">
              <History className="w-5 h-5 text-accent" />
              이용 기록
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-primary">작업</th>
                    <th className="px-6 py-3 text-left font-semibold text-primary">시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <Badge 
                          className={cn(
                            "border-none",
                            log.action === 'IN' ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {log.action === 'IN' ? '입실' : '퇴실'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground tabular-nums">
                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground italic">
                        이용 기록이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
