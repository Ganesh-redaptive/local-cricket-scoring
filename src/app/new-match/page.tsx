'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewMatch() {
  const router = useRouter();
  const [matchDetails, setMatchDetails] = useState({
    team1: '',
    team2: '',
    overs: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchDetails.team1 && matchDetails.team2 && matchDetails.overs) {
      const queryParams = new URLSearchParams({
        team1: matchDetails.team1,
        team2: matchDetails.team2,
        overs: matchDetails.overs,
      }).toString();
      router.push(`/scoring?${queryParams}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'includeWides' || name === 'includeNoBalls') {
      setMatchDetails(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
      return;
    }
    setMatchDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">New Match Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Team 1 Name:</label>
          <input
            type="text"
            name="team1"
            value={matchDetails.team1}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Team 2 Name:</label>
          <input
            type="text"
            name="team2"
            value={matchDetails.team2}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Number of Overs:</label>
          <input
            type="number"
            name="overs"
            value={matchDetails.overs}
            onChange={handleChange}
            min="1"
            max="50"
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Start Match
        </button>
      </form>
    </div>
  );
} 
