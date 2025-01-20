import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BallDetail {
  runs: number
  extras: number
  type: 'normal' | 'wide' | 'noBall' | 'wicket'
}

interface OverDetail {
  overNumber: number
  balls: BallDetail[]
  totalRuns: number
  totalExtras: number
}

interface ScoreState {
  runs: number
  wickets: number
  currentOver: number
  balls: number
  widesInOver: number
  noBallsInOver: number
  extras: number
  currentBallInOver: number
  isFirstInnings: boolean
  target: number | null
  oversHistory: OverDetail[]
  currentOverBalls: BallDetail[]
  isWicketPending: boolean
  isInningsComplete: boolean
  isExtraPending: boolean
  extraType: 'wide' | 'noBall' | null
  setWicketPending: (isPending: boolean) => void
  updateScore: (runs: number) => void
  handleExtra: (type: 'wide' | 'noBall') => void
  resetMatch: () => void
  completeInnings: () => void
  maxOvers: number
  setMaxOvers: (maxOvers: number) => void
  getInitialInningsState: () => Partial<ScoreState>
  setExtraPending: (type: 'wide' | 'noBall' | null) => void
}

export const useScoreStore = create<ScoreState>()(
  persist(
    (set) => {
      const getInitialInningsState = () => ({
        runs: 0,
        wickets: 0,
        currentOver: 0,
        balls: 0,
        widesInOver: 0,
        noBallsInOver: 0,
        extras: 0,
        currentBallInOver: 0,
        currentOverBalls: [],
        oversHistory: [],
        isExtraPending: false,
        extraType: null,
      });

      return {
        runs: 0,
        wickets: 0,
        currentOver: 0,
        balls: 0,
        widesInOver: 0,
        noBallsInOver: 0,
        extras: 0,
        currentBallInOver: 0,
        isFirstInnings: true,
        target: null,
        oversHistory: [],
        currentOverBalls: [],
        isWicketPending: false,
        isInningsComplete: false,
        maxOvers: 0,
        isExtraPending: false,
        extraType: null,
        setMaxOvers: (maxOvers) => set({ maxOvers }),
        setWicketPending: (isPending) => set({ isWicketPending: isPending }),
        getInitialInningsState,
        setExtraPending: (type) => set({ 
          isExtraPending: type !== null,
          extraType: type 
        }),
        handleExtra: (type) => set((state) => ({
          ...state,
          isExtraPending: true,
          extraType: type
        })),
        updateScore: (runs) => set((state) => {
          const nextBall = (state.currentBallInOver + 1) % 6;
          const nextOver = Math.floor((state.balls + 1) / 6);
          const isInningsComplete = nextOver >= state.maxOvers || state.wickets >= 9;
          
          const newBallDetail: BallDetail = {
            runs,
            extras: state.isExtraPending ? 1 : 0,
            type: state.isWicketPending ? 'wicket' : 
                  state.extraType === 'wide' ? 'wide' :
                  state.extraType === 'noBall' ? 'noBall' : 'normal'
          };
          
          const updatedCurrentOverBalls = [...state.currentOverBalls, newBallDetail];
          let updatedOversHistory = [...state.oversHistory];
          
          const shouldIncrementBall = !state.isExtraPending || state.extraType === 'noBall';
          
          if (nextBall === 0 && shouldIncrementBall) {
            const overDetail: OverDetail = {
              overNumber: state.currentOver,
              balls: updatedCurrentOverBalls,
              totalRuns: updatedCurrentOverBalls.reduce((sum, ball) => sum + ball.runs + ball.extras, 0),
              totalExtras: updatedCurrentOverBalls.reduce((sum, ball) => sum + ball.extras, 0)
            };
            updatedOversHistory.push(overDetail);
          }

          // For both wides and no-balls, only count the runs scored (no automatic +1)
          const extraRuns = state.isExtraPending ? runs : 0;
          // For normal balls, count the runs normally
          const normalRuns = !state.isExtraPending ? runs : 0;
          
          const totalRunsForBall = normalRuns + extraRuns;

          if (isInningsComplete) {
            if (state.isFirstInnings) {
              return {
                ...state,
                ...getInitialInningsState(),
                isInningsComplete: true,
                isWicketPending: false,
                target: state.runs + runs + 1,
                isFirstInnings: false
              };
            } else {
              return {
                ...state,
                runs: state.runs + runs,
                wickets: state.isWicketPending ? state.wickets + 1 : state.wickets,
                balls: state.balls + 1,
                currentOver: nextOver,
                currentBallInOver: nextBall,
                isInningsComplete: true,
                widesInOver: nextBall === 0 ? 0 : state.widesInOver,
                noBallsInOver: nextBall === 0 ? 0 : state.noBallsInOver,
                currentOverBalls: nextBall === 0 ? [] : updatedCurrentOverBalls,
                oversHistory: updatedOversHistory,
                isWicketPending: false,
                isExtraPending: false,
                extraType: null
              };
            }
          }

          return {
            ...state,
            runs: state.runs + totalRunsForBall,
            wickets: state.isWicketPending ? state.wickets + 1 : state.wickets,
            balls: shouldIncrementBall ? state.balls + 1 : state.balls,
            currentOver: shouldIncrementBall ? nextOver : state.currentOver,
            currentBallInOver: shouldIncrementBall ? nextBall : state.currentBallInOver,
            extras: state.isExtraPending ? state.extras + 1 : state.extras,
            isInningsComplete,
            currentOverBalls: nextBall === 0 && shouldIncrementBall ? [] : updatedCurrentOverBalls,
            oversHistory: updatedOversHistory,
            isWicketPending: false,
            isExtraPending: false,
            extraType: null
          };
        }),
        resetMatch: () => set(() => ({
          ...getInitialInningsState(),
          isFirstInnings: true,
          target: null,
          isWicketPending: false,
          isExtraPending: false,
          extraType: null
        })),
        completeInnings: () => set((state) => ({
          ...getInitialInningsState(),
          isFirstInnings: false,
          isInningsComplete: false,
          target: state.runs + 1
        })),
      };
    },
    {
      name: 'cricket-score-storage',
    }
  )
) 
