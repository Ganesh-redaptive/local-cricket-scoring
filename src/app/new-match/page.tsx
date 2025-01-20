'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewMatch() {
  const router = useRouter();
  const [matchDetails, setMatchDetails] = useState({
    team1: '',
    team2: '',
    overs: '',
    widesAfter: '0',
    includeWides: true,
    includeNoBalls: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchDetails.team1 && matchDetails.team2 && matchDetails.overs) {
      const queryParams = new URLSearchParams({
        team1: matchDetails.team1,
        team2: matchDetails.team2,
        overs: matchDetails.overs,
        widesAfter: matchDetails.widesAfter,
        includeWides: matchDetails.includeWides.toString(),
        includeNoBalls: matchDetails.includeNoBalls.toString(),
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
        <div className="space-y-2">
          <label className="block mb-2">Match Rules:</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="includeWides"
              checked={matchDetails.includeWides}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label>Include Wides</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="includeNoBalls"
              checked={matchDetails.includeNoBalls}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label>Include No Balls</label>
          </div>
        </div>
        <div>
          <label className="block mb-2">Add Run After How Many Wides in an Over?</label>
          <input
            type="number"
            name="widesAfter"
            value={matchDetails.widesAfter}
            onChange={handleChange}
            min="0"
            max="6"
            className="w-full p-2 border rounded text-black"
            required
            disabled={!matchDetails.includeWides && !matchDetails.includeNoBalls}
          />
          <p className="text-sm text-gray-500 mt-1">
            (Enter 0 to count every wide/no ball)
          </p>
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
