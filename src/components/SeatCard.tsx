"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SeatData } from '@/lib/types';
import { UserCheck, UserX } from 'lucide-react';

interface SeatCardProps {
  seat: SeatData;
  isAdmin: boolean;
}

export function SeatCard({ seat, isAdmin }: SeatCardProps) {
  const isOccupied = seat.status === 'IN';

  return (
    <Link href={`/seat/${seat.id}?admin=${isAdmin}`}>
      <Card className={cn(
        "relative flex flex-col items-center justify-center p-6 h-44 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer border-2",
        isOccupied 
          ? "bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]" 
          : "bg-slate-400 text-white border-slate-400"
      )}>
        <span className="text-4xl font-black mb-1">{seat.id}</span>
        
        <div className="text-sm font-bold mb-3 h-5 flex items-center justify-center opacity-90">
          {seat.userName || "-"}
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
          {isOccupied ? (
            <>
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-bold tracking-tight">입실</span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4" />
              <span className="text-sm font-bold tracking-tight">퇴실</span>
            </>
          )}
        </div>
        
        {isOccupied && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" />
        )}
      </Card>
    </Link>
  );
}
