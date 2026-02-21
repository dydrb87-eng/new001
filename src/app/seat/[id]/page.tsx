"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toggleSeat, getSeatLogs } from '@/lib/seat-store';
import { SeatLog, SeatStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Clock, History, UserCheck, UserX, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SeatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const seatId = Number(params.id);

  const [lastAction, setLastAction] = useState<{ action: SeatStatus; timestamp: string } | null>(null);
  const [logs, setLogs] = useState<SeatLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const result = toggleSeat(seatId);
    setLastAction(result);
    setLogs(getSeatLogs(seatId));
  }, [seatId]);

  if (!mounted) return null;

  const totalUsageMinutes = logs.reduce((acc, log, idx, arr) => {
    if (log.action === 'OUT' && idx < arr.length - 1) {
      const nextLog = arr[idx + 1];
      if (nextLog.action === 'IN') {
        const diff = new Date(log.timestamp).getTime() - new Date(nextLog.timestamp).getTime();
        return acc + (diff / 1000 / 60);
      }
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="group hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          자리 현황으로 돌아가기
        </Button>

        <Card className="shadow-lg border-2 border-white animate-check-in">
          <CardHeader className="text-center bg-primary text-white rounded-t-lg">
            <CardTitle className="text-5xl font-black mb-2">{seatId}번 자리</CardTitle>
            <div className="flex items-center justify-center gap-2">
              {lastAction?.action === 'IN' ? (
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
                  "p-6 rounded-full",
                  lastAction?.action === 'IN' ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                )}>
                  {lastAction?.action === 'IN' ? <UserCheck className="w-16 h-16" /> : <UserX className="w-16 h-16" />}
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-primary">
                  {lastAction?.action === 'IN' ? '입실하였습니다' : '퇴실하였습니다'}
                </h2>
                <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                  <Clock className="w-4 h-4" />
                  <span>처리 시간: {lastAction && format(new Date(lastAction.timestamp), 'HH:mm:ss')}</span>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-14 text-lg shadow-md transition-all active:scale-95"
              onClick={() => {
                const result = toggleSeat(seatId);
                setLastAction(result);
                setLogs(getSeatLogs(seatId));
              }}
            >
              <ArrowLeftRight className="w-5 h-5 mr-2" />
              상태 변경하기
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-white overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-primary">
              <History className="w-5 h-5 text-accent" />
              이용 기록
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              누적 이용 시간: <span className="font-bold text-primary">{Math.floor(totalUsageMinutes)}분</span>
            </p>
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
