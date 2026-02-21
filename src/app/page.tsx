"use client";

import { useEffect, useState } from 'react';
import { getSeats } from '@/lib/seat-store';
import { SeatData } from '@/lib/types';
import { SeatCard } from '@/components/SeatCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LayoutGrid, ShieldCheck, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetAll } from '@/lib/seat-store';

export default function LibraryDashboard() {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSeats(getSeats());
    setMounted(true);
  }, []);

  const handleReset = () => {
    if (confirm('모든 기록을 초기화하시겠습니까?')) {
      resetAll();
      setSeats(getSeats());
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

          <div className="flex flex-wrap items-center gap-6 bg-white p-4 rounded-xl shadow-sm border border-border">
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
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
              >
                <RefreshCcw className="w-3 h-3 mr-2" />
                데이터 초기화
              </Button>
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
