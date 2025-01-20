'use client';

import { useScoreStore } from '@/store/scoreStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ScoringContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const team1 = searchParams.get('team1') || '';
  const team2 = searchParams.get('team2') || '';
  const overs = parseInt(searchParams.get('overs') || '0');

  const [showVictoryBanner, setShowVictoryBanner] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState('');

  const { 
    runs, 
    wickets, 
    currentOver, 
    balls,
    extras,
    isFirstInnings,
    target,
    oversHistory,
    currentOverBalls,
    isWicketPending,
    updateScore, 
    setWicketPending,
    handleExtra,
    isExtraPending,
    setExtraPending,
    extraType,
    resetMatch,
    completeInnings,
    setMaxOvers
  } = useScoreStore();

  useEffect(() => {
    setMaxOvers(overs);
  }, [overs, setMaxOvers]);

  const isInningsComplete = currentOver >= overs || wickets >= 10;
  const isMatchComplete = !isFirstInnings && (isInningsComplete || (target && runs >= target));

  useEffect(() => {
    if (isMatchComplete) {
      let message = '';
      if (target) {
        if (runs >= target) {
          message = `${team2} won by ${10 - wickets} wickets`;
        } else if (runs === target - 1) {
          message = 'Match Tied!';
        } else {
          message = `${team1} won by ${target - runs - 1} runs`;
        }
      }
      setVictoryMessage(message);
      setShowVictoryBanner(true);
    }
  }, [isMatchComplete, runs, wickets, target, team1, team2]);

  const startNewMatch = () => {
    resetMatch();
    router.push('/new-match');
  };

  return (
    <div className='max-w-md mx-auto px-4 py-6 relative'>
      {showVictoryBanner && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 text-black'>
            <h3 className='text-xl font-bold text-center mb-4'>
              Match Complete!
            </h3>
            <p className='text-center mb-6'>{victoryMessage}</p>
            <div className='flex gap-2'>
              <button
                onClick={startNewMatch}
                className='flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
              >
                New Match
              </button>
              <button
                onClick={() => setShowVictoryBanner(false)}
                className='flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>
          {team1} vs {team2}
        </h2>
        <button
          onClick={startNewMatch}
          className='bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded'
        >
          New Match
        </button>
      </div>

      <div className='bg-gray-100 p-4 rounded-lg mb-4 text-black'>
        <div className='flex justify-between items-center'>
          <p className='text-2xl font-bold'>
            {runs}/{wickets}
          </p>
          <p className='text-lg'>
            {currentOver}.{balls % 6}/{overs}
          </p>
        </div>
        { (
          <p className='text-sm mt-1'>Extras: {extras}</p>
        )}
        {!isFirstInnings && target && (
          <p className='mt-2 font-bold text-sm'>
            Need {target - runs} runs to win
          </p>
        )}
        {isWicketPending && (
          <p className='mt-2 text-red-500 font-bold'>
            Wicket pending - Select runs or extras
          </p>
        )}
      </div>

      {/* Current Over Display */}
      <div className='flex gap-2 mb-4 overflow-x-auto py-2 text-black'>
        {currentOverBalls.map((ball, index) => (
          <span
            key={index}
            className='inline-block px-3 py-1 bg-gray-100 rounded text-sm whitespace-nowrap'
          >
            {ball.type === 'wicket'
              ? `W+${ball.runs}`
              : ball.type === 'wide'
              ? `Wd+${ball.extras}`
              : ball.type === 'noBall'
              ? `Nb+${ball.extras}`
              : ball.runs}
          </span>
        ))}
      </div>

      {/* Main Scoring Buttons */}
      <div className='grid grid-cols-3 gap-2 mb-4'>
        {[0, 1, 2, 3, 4, 6].map((runs) => (
          <button
            key={runs}
            onClick={() => updateScore(runs)}
            className={`${
              isWicketPending
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } active:bg-blue-700 text-white font-bold py-4 rounded-lg text-xl`}
          >
            {runs}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className='grid grid-cols-2 gap-2 mb-4'>
        <button
          onClick={() => setWicketPending(!isWicketPending)}
          className={`${
            isWicketPending ? 'bg-red-700' : 'bg-red-500'
          } hover:bg-red-600 active:bg-red-700 text-white font-bold py-3 rounded-lg`}
        >
          {isWicketPending ? 'Cancel Wicket' : 'Wicket'}
        </button>
        <button
          onClick={() => setExtraPending(isExtraPending && extraType === 'wide' ? null : 'wide')}
          className={`${
            isExtraPending && extraType === 'wide'
              ? 'bg-yellow-700'
              : isWicketPending
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-yellow-500 hover:bg-yellow-600'
          } active:bg-yellow-700 text-white font-bold py-3 rounded-lg`}
        >
          {isExtraPending && extraType === 'wide' ? 'Cancel Wide' : 'Wide'}
        </button>
        <button
          onClick={() => setExtraPending(isExtraPending && extraType === 'noBall' ? null : 'noBall')}
          className={`${
            isExtraPending && extraType === 'noBall'
              ? 'bg-orange-700'
              : isWicketPending
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-orange-500 hover:bg-orange-600'
          } active:bg-orange-700 text-white font-bold py-3 rounded-lg`}
        >
          {isExtraPending && extraType === 'noBall' ? 'Cancel No Ball' : 'No Ball'}
        </button>
      </div>

      {/* Add status message for extras */}
      {isExtraPending && (
        <p className='mt-2 text-yellow-500 font-bold'>
          {extraType === 'wide' ? 'Wide' : 'No Ball'} pending - Select runs
        </p>
      )}

      {/* Control Buttons */}
      <div className='flex gap-2 mb-4'>
        <button
          onClick={resetMatch}
          className='flex-1 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold py-2 rounded-lg text-sm'
        >
          Reset
        </button>
        {isInningsComplete && isFirstInnings && (
          <button
            onClick={completeInnings}
            className='flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 rounded-lg text-sm'
          >
            Complete Innings
          </button>
        )}
      </div>

      {/* Over History */}
      {oversHistory.length > 0 && (
        <div className='overflow-x-auto text-black'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='px-2 py-1 text-left'>Over</th>
                <th className='px-2 py-1'>Balls</th>
                <th className='px-2 py-1 text-right'>Runs</th>
              </tr>
            </thead>
            <tbody>
              {oversHistory.map((over, index) => (
                <tr key={index} className='border-b'>
                  <td className='px-2 py-2 my-1 inline-block px-2 py-0.5 bg-gray-100 rounded-sm text-sm'>
                    {over.overNumber + 1}
                  </td>
                  <td className='px-2 py-1'>
                    <div className='flex gap-1 flex-wrap'>
                      {over.balls.map((ball, ballIndex) => (
                        <span
                          key={ballIndex}
                          className='inline-block px-2 py-0.5 bg-gray-100 rounded-sm text-sm'
                        >
                          {ball.type === 'wicket'
                            ? 'W'
                            : ball.type === 'wide'
                            ? `Wd+${ball.extras}`
                            : ball.type === 'noBall'
                            ? `Nb+${ball.extras}`
                            : ball.runs}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='px-2 py-1 text-right inline-block px-2 py-0.5 bg-gray-100 rounded-sm text-sm'>
                    {over.totalRuns}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ScoringPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScoringContent />
    </Suspense>
  );
} 
