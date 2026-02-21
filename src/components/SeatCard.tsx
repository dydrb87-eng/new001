"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SeatData } from '@/lib/types';
import { Users, UserMinus } from 'lucide-react';

interface SeatCardProps {
  seat: SeatData;
  isAdmin: boolean;
}

export function SeatCard({ seat, isAdmin }: SeatCardProps) {
  const isOccupied = seat.status === 'IN';

  return (
    <Link href={`/seat/${seat.id}?admin=${isAdmin}`}>
      <Card className={cn(
        "relative flex flex-col items-center justify-center p-6 h-32 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer border-2",
        isOccupied 
          ? "bg-primary text-white border-primary" 
          : "bg-white text-primary border-transparent"
      )}>
        <span className="text-3xl font-bold mb-2">{seat.id}</span>
        <div className="flex items-center gap-1.5">
          {isOccupied ? (
            <>
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Occupied</span>
            </>
          ) : (
            <>
              <UserMinus className="w-4 h-4 opacity-50" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-60">Available</span>
            </>
          )}
        </div>
        {isOccupied && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
        )}
      </Card>
    </Link>
  );
}
