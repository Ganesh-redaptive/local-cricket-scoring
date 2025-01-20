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
  setWicketPending: (isPending: boolean) => void
  updateScore: (runs: number) => void
  handleWide: (widesAfter: number) => void
  handleNoBall: () => void
  resetMatch: () => void
  completeInnings: () => void
  maxOvers: number
  setMaxOvers: (maxOvers: number) => void
  getInitialInningsState: () => Partial<ScoreState>
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
        oversHistory: []
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
        setMaxOvers: (maxOvers) => set({ maxOvers }),
        setWicketPending: (isPending) => set({ isWicketPending: isPending }),
        getInitialInningsState,

        updateScore: (runs) => set((state) => {
          const nextBall = (state.currentBallInOver + 1) % 6;
          const nextOver = Math.floor((state.balls + 1) / 6);
          const isInningsComplete = nextOver >= state.maxOvers || state.wickets >= 9;
          
          const newBallDetail: BallDetail = {
            runs,
            extras: 0,
            type: state.isWicketPending ? 'wicket' : 'normal'
          };
          
          const updatedCurrentOverBalls = [...state.currentOverBalls, newBallDetail];
          let updatedOversHistory = [...state.oversHistory];
          
          if (nextBall === 0) {
            const overDetail: OverDetail = {
              overNumber: state.currentOver,
              balls: updatedCurrentOverBalls,
              totalRuns: updatedCurrentOverBalls.reduce((sum, ball) => sum + ball.runs + ball.extras, 0),
              totalExtras: updatedCurrentOverBalls.reduce((sum, ball) => sum + ball.extras, 0)
            };
            updatedOversHistory.push(overDetail);
          }

          // Handle innings completion
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
              // Second innings is complete, end the match
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
                isWicketPending: false
              };
            }
          }

          // Normal ball update (innings not complete)
          return {
            ...state,
            runs: state.runs + runs,
            wickets: state.isWicketPending ? state.wickets + 1 : state.wickets,
            balls: state.balls + 1,
            currentOver: nextOver,
            currentBallInOver: nextBall,
            isInningsComplete,
            widesInOver: nextBall === 0 ? 0 : state.widesInOver,
            noBallsInOver: nextBall === 0 ? 0 : state.noBallsInOver,
            currentOverBalls: nextBall === 0 ? [] : updatedCurrentOverBalls,
            oversHistory: updatedOversHistory,
            isWicketPending: false
          };
        }),

        handleWide: (widesAfter) => set((state) => {
          const isNewOver = (state.balls + 1) % 6 === 0;
          const widesInOver = state.widesInOver + 1;
          const shouldAddRun = widesAfter === 0 || widesInOver > widesAfter;

          const newBall: BallDetail = {
            type: 'wide',
            runs: 0,
            extras: shouldAddRun ? 1 : 0
          };

          return {
            ...state,
            runs: state.runs + (shouldAddRun ? 1 : 0),
            extras: state.extras + 1,
            widesInOver: isNewOver ? 0 : widesInOver,
            currentOverBalls: [...state.currentOverBalls, newBall]
          };
        }),

        handleNoBall: () => set((state) => {
          const newBall: BallDetail = {
            type: 'noBall',
            runs: 0,
            extras: 1
          };

          return {
            ...state,
            extras: state.extras + 1,
            currentOverBalls: [...state.currentOverBalls, newBall]
          };
        }),

        resetMatch: () => set(() => ({
          ...getInitialInningsState(),
          isFirstInnings: true,
          target: null,
          isWicketPending: false
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
