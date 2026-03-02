"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeSeats, subscribeLogs, resetAll, exportLogsToCSV } from '@/lib/seat-store';
import { SeatData, SeatLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, TableProperties, FileSpreadsheet, RefreshCcw, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export default function UsageHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [logs, setLogs] = useState<SeatLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubSeats = subscribeSeats((updatedSeats) => {
      setSeats(updatedSeats);
    });
    const unsubLogs = subscribeLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return () => {
      unsubSeats();
      unsubLogs();
    };
  }, []);

  const handleReset = async () => {
    if (confirm('모든 이용 기록과 설정을 초기화하시겠습니까? 기록이 영구적으로 삭제됩니다.')) {
      await resetAll();
      toast({ title: "초기화 완료", description: "모든 데이터가 삭제되었습니다." });
    }
  };

  const handleExport = () => {
    if (exportLogsToCSV(logs)) {
      toast({ 
        title: "내보내기 완료", 
        description: "모든 과거 이용 기록이 포함된 CSV 파일이 생성되었습니다." 
      });
    } else {
      toast({ variant: "destructive", title: "데이터 없음", description: "내보낼 기록이 없습니다." });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/')} className="font-bold">
            <ChevronLeft className="w-4 h-4 mr-2" /> 대시보드
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="font-bold gap-2">
              <FileSpreadsheet className="w-4 h-4" /> 데이터 추출
            </Button>
            <Button variant="outline" onClick={handleReset} className="text-destructive font-bold gap-2">
              <RefreshCcw className="w-4 h-4" /> 데이터 초기화
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-none overflow-hidden bg-white">
          <CardHeader className="bg-primary text-white p-8">
            <CardTitle className="text-3xl font-black flex items-center gap-3">
              <TableProperties className="w-8 h-8 text-accent" /> 이용 기록
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-32 text-center font-bold text-primary">자리 / 사용자</TableHead>
                  <TableHead className="px-6 font-bold text-primary">전체 이용 기록 (최신순)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seats.map((seat) => {
                  const seatLogs = logs.filter(l => l.seatId === seat.id);
                  return (
                    <TableRow key={seat.id}>
                      <TableCell className="text-center border-r bg-muted/5">
                        <div className="text-2xl font-black text-primary">{seat.id}</div>
                        <div className="text-xs font-bold text-muted-foreground truncate max-w-[80px] mx-auto">{seat.userName || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <ScrollArea className="w-full whitespace-nowrap pb-2">
                          <div className="flex gap-3">
                            {seatLogs.length > 0 ? seatLogs.map(log => (
                              <div key={log.id} className="flex flex-col items-center gap-1">
                                <Badge className={log.action === 'IN' ? "bg-[hsl(var(--success))] text-white" : "bg-slate-400 text-white"}>
                                  {log.action === 'IN' ? <UserCheck className="w-3 h-3 mr-1"/> : <UserX className="w-3 h-3 mr-1"/>}
                                  {log.action === 'IN' ? '입실' : '퇴실'}
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  {format(new Date(log.timestamp), 'MM/dd HH:mm')}
                                </span>
                              </div>
                            )) : <span className="text-muted-foreground italic text-sm">기록 없음</span>}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
