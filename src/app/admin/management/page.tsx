
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSeats, getSeatLogs, resetAll } from '@/lib/seat-store';
import { SeatData, SeatLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, TableProperties, Clock, UserCheck, UserX, FileSpreadsheet, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

export default function GlobalManagementPage() {
  const router = useRouter();
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [seatLogsMap, setSeatLogsMap] = useState<Record<number, SeatLog[]>>({});
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const allSeats = getSeats();
    setSeats(allSeats);
    
    const logsMap: Record<number, SeatLog[]> = {};
    allSeats.forEach(seat => {
      logsMap[seat.id] = getSeatLogs(seat.id).reverse();
    });
    setSeatLogsMap(logsMap);
  };

  useEffect(() => {
    loadData();
    setMounted(true);
  }, []);

  const handleReset = () => {
    if (confirm('모든 이용 기록과 좌석 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetAll();
      loadData();
      toast({
        title: "초기화 완료",
        description: "모든 데이터가 성공적으로 삭제되었습니다.",
      });
    }
  };

  const exportToCsv = () => {
    // CSV 헤더
    let csvContent = "\ufeff"; // BOM for Korean characters in Excel
    csvContent += "자리 번호,사용자,상태,시간\n";

    seats.forEach(seat => {
      const logs = seatLogsMap[seat.id] || [];
      logs.forEach(log => {
        const timeStr = format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss');
        csvContent += `${seat.id},${seat.userName || "-"},${log.action === 'IN' ? '입실' : '퇴실'},${timeStr}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `library_seat_records_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "내보내기 완료",
      description: "이용 기록이 CSV 파일로 다운로드되었습니다. 구글 시트에서 열 수 있습니다.",
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="group hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            대시보드로 돌아가기
          </Button>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={exportToCsv}
              className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold"
            >
              <FileSpreadsheet className="w-4 h-4" />
              구글시트로 정리 (CSV)
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="gap-2 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5 font-bold"
            >
              <RefreshCcw className="w-4 h-4" />
              데이터 초기화
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-none bg-white overflow-hidden">
          <CardHeader className="bg-primary text-white p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                  <TableProperties className="w-8 h-8 text-accent" />
                  전체 자리 관리
                </CardTitle>
                <p className="text-primary-foreground/70 font-medium">
                  모든 좌석의 입/퇴실 기록을 타임라인 형식으로 확인하세요.
                </p>
              </div>
              <div className="flex gap-4 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]" />
                  <span>입실 (IN)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <span>퇴실 (OUT)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-32 text-center font-bold text-primary border-r">자리 / 사용자</TableHead>
                    <TableHead className="px-6 font-bold text-primary">이용 기록 (타임라인)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seats.map((seat) => (
                    <TableRow key={seat.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-center border-r bg-muted/5 p-4">
                        <div className="font-black text-2xl text-primary">{seat.id}</div>
                        <div className="text-xs font-bold text-muted-foreground mt-1 truncate max-w-[100px] mx-auto">
                          {seat.userName || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <ScrollArea className="w-full whitespace-nowrap pb-4">
                          <div className="flex items-center gap-3">
                            {seatLogsMap[seat.id]?.length > 0 ? (
                              seatLogsMap[seat.id].map((log) => (
                                <div key={log.id} className="flex flex-col items-center gap-1 group">
                                  <Badge 
                                    className={cn(
                                      "px-3 py-1.5 border-none shadow-sm transition-transform group-hover:scale-110",
                                      log.action === 'IN' 
                                        ? "bg-[hsl(var(--success))] text-white" 
                                        : "bg-slate-400 text-white"
                                    )}
                                  >
                                    {log.action === 'IN' ? (
                                      <UserCheck className="w-3 h-3 mr-1.5" />
                                    ) : (
                                      <UserX className="w-3 h-3 mr-1.5" />
                                    )}
                                    {log.action}
                                  </Badge>
                                  <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                                    {format(new Date(log.timestamp), 'HH:mm')}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground italic py-2">기록 없음</span>
                            )}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
