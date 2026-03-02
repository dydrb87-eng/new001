"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSeats } from '@/lib/seat-store';
import { SeatData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function SeatQRPage() {
  const router = useRouter();
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchSeats = async () => {
      const data = await getSeats();
      setSeats(data);
    };
    fetchSeats();
    setBaseUrl(window.location.origin);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 print:p-0 print:bg-white" suppressHydrationWarning>
      <div className="max-w-5xl mx-auto space-y-8 print:space-y-0">
        <div className="flex items-center justify-between print:hidden">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="group hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            자리 현황으로 돌아가기
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            페이지 인쇄하기
          </Button>
        </div>

        <div className="text-center space-y-2 mb-8 print:mb-4">
          <h1 className="text-3xl font-black text-primary flex items-center justify-center gap-3">
            <QrCode className="w-8 h-8 text-accent" />
            자리별 QR 코드
          </h1>
          <p className="text-muted-foreground font-medium">
            이 페이지를 인쇄하여 각 자리에 부착해 주세요.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4">
          {seats.map((seat) => (
            <Card key={seat.id} className="border-2 border-dashed border-muted-foreground/30 shadow-none overflow-hidden print:border-solid print:border-gray-300">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                <div className="text-4xl font-black text-primary border-b-4 border-accent pb-1 w-full text-center">
                  자리 {seat.id}
                </div>
                <div className="bg-white p-2 rounded-lg shadow-sm border border-muted">
                  <QRCodeSVG value={`${baseUrl}/seat/${seat.id}`} size={160} />
                </div>
                <div className="text-[10px] text-muted-foreground text-center font-medium leading-tight">
                  이 QR 코드를 스캔하면<br />
                  즉시 입실/퇴실 처리가 가능합니다.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          header, footer, button, .print\\:hidden {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}