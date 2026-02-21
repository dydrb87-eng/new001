"use client";

import { useEffect, useState, useCallback } from 'react';
import { getSeats, batchUpdateStatus } from '@/lib/seat-store';
import { SeatData } from '@/lib/types';
import { SeatCard } from '@/components/SeatCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LayoutGrid, ShieldCheck, UserCheck, UserX, TableProperties, QrCode, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function LibraryDashboard() {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  const refreshSeats = useCallback(() => {
    setSeats(getSeats());
  }, []);

  useEffect(() => {
    refreshSeats();
    setMounted(true);

    const handleSync = () => refreshSeats();
    
    window.addEventListener('library_store_sync', handleSync);
    window.addEventListener('storage', handleSync);
    
    return () => {
      window.removeEventListener('library_store_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshSeats]);

  const handleBatchAction = (status: 'IN' | 'OUT') => {
    const confirmMsg = status === 'IN' ? '모든 자리를 입실 처리하시겠습니까?' : '모든 자리를 퇴실 처리하시겠습니까?';
    if (confirm(confirmMsg)) {
      batchUpdateStatus(status);
      toast({
        title: "일괄 처리 완료",
        description: `모든 좌석이 ${status === 'IN' ? '입실' : '퇴실'} 상태로 변경되었습니다.`,
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-primary flex items-center gap-3 font-headline">
              <LayoutGrid className="w-10 h-10 text-accent" />
              도서관 좌석 매니저
            </h1>
            <p className="text-muted-foreground font-medium">
              도서관 좌석의 실시간 현황을 확인하고 입/퇴실을 관리하세요.
            </p>
          </div>

          <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="admin-mode" 
                  checked={isAdmin} 
                  onCheckedChange={setIsAdmin} 
                />
                <Label htmlFor="admin-mode" className="flex items-center gap-1.5 cursor-pointer font-semibold text-primary">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  관리자 모드
                </Label>
              </div>
            </div>
            
            {isAdmin && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBatchAction('IN')}
                    className="gap-2 bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success))]/90 hover:text-white border-none font-bold"
                  >
                    <UserCheck className="w-4 h-4" />
                    전체 입실
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBatchAction('OUT')}
                    className="gap-2 bg-slate-500 text-white hover:bg-slate-600 hover:text-white border-none font-bold"
                  >
                    <UserX className="w-4 h-4" />
                    전체 퇴실
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold">
                      <Users className="w-4 h-4" />
                      사용자 관리
                    </Button>
                  </Link>
                  <Link href="/admin/management">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold">
                      <TableProperties className="w-4 h-4" />
                      이용 기록
                    </Button>
                  </Link>
                  <Link href="/admin/qr">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold">
                      <QrCode className="w-4 h-4" />
                      QR 코드 관리
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <main>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {seats.map((seat) => (
              <SeatCard key={seat.id} seat={seat} isAdmin={isAdmin} />
            ))}
          </div>
        </main>

        <footer className="pt-12 text-center text-sm text-muted-foreground border-t border-border/50">
          <p>© 2024 Library Seat Manager. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
