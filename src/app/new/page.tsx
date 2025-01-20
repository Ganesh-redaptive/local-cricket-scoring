'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewMatch() {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [overs, setOvers] = useState('');

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/scoring?team1=${team1}&team2=${team2}&overs=${overs}`
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Match</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="team1">Team 1</Label>
          <Input
            id="team1"
            value={team1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeam1(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="team2">Team 2</Label>
          <Input
            id="team2"
            value={team2}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeam2(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="overs">Overs</Label>
          <Input
            id="overs"
            type="number"
            value={overs}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOvers(e.target.value)}
            required
            min="1"
          />
        </div>
        <Button type="submit">Start Match</Button>
      </form>
    </div>
  );
} 
