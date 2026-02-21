
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SeatData } from '@/lib/types';
import { UserCheck, UserX, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface SeatCardProps {
  seat: SeatData;
  isAdmin: boolean;
}

export function SeatCard({ seat, isAdmin }: SeatCardProps) {
  const isOccupied = seat.status === 'IN';
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const qrUrl = `${baseUrl}/seat/${seat.id}`;

  return (
    <Link href={`/seat/${seat.id}?admin=${isAdmin}`}>
      <Card className={cn(
        "relative flex flex-col items-center justify-center p-6 h-40 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer border-2",
        isOccupied 
          ? "bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]" 
          : "bg-[hsl(var(--destructive))] text-white border-[hsl(var(--destructive))]"
      )}>
        {/* QR Code in Top Left */}
        <div className="absolute top-2 left-2 bg-white p-1 rounded-sm shadow-sm overflow-hidden">
          <QRCodeSVG value={qrUrl} size={32} />
        </div>

        <span className="text-4xl font-black mb-2">{seat.id}</span>
        
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
