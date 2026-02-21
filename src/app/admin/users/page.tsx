
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSeats, updateSeatUser } from '@/lib/seat-store';
import { SeatData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Users, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

export default function UserManagementPage() {
  const router = useRouter();
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSeats(getSeats());
    setMounted(true);
  }, []);

  const handleNameChange = (id: number, name: string) => {
    setSeats(prev => prev.map(s => s.id === id ? { ...s, userName: name } : s));
  };

  const handleSave = () => {
    seats.forEach(seat => {
      updateSeatUser(seat.id, seat.userName || '');
    });
    toast({
      title: "저장 완료",
      description: "사용자 이름이 성공적으로 업데이트되었습니다.",
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="group hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          대시보드로 돌아가기
        </Button>

        <Card className="shadow-lg border-none bg-white overflow-hidden">
          <CardHeader className="bg-primary text-white p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                  <Users className="w-8 h-8 text-accent" />
                  사용자 이름 관리
                </CardTitle>
                <p className="text-primary-foreground/70 font-medium">
                  각 자리별 사용자의 이름을 설정하세요.
                </p>
              </div>
              <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-white gap-2 px-6">
                <Save className="w-4 h-4" />
                일괄 저장
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-32 text-center font-bold text-primary">자리 번호</TableHead>
                  <TableHead className="font-bold text-primary">사용자 이름</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seats.map((seat) => (
                  <TableRow key={seat.id}>
                    <TableCell className="text-center font-black text-xl text-primary border-r bg-muted/5">
                      {seat.id}
                    </TableCell>
                    <TableCell className="p-4">
                      <Input 
                        value={seat.userName || ''} 
                        onChange={(e) => handleNameChange(seat.id, e.target.value)}
                        placeholder={`${seat.id}번 자리 사용자 이름 입력`}
                        className="max-w-xs font-medium"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
