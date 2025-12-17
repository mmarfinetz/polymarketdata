/**
 * Portfolio state management with Zustand
 * Stores user's simulated positions for tracking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position } from '../types/api';

interface PortfolioState {
  positions: Position[];
  addPosition: (position: Omit<Position, 'unrealizedPnL' | 'unrealizedPnLPercent'>) => void;
  removePosition: (id: string) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  clearPortfolio: () => void;

  // Calculated values
  getTotalValue: () => number;
  getTotalPnL: () => number;
  getPositionById: (id: string) => Position | undefined;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      positions: [],

      addPosition: (positionData) => {
        const pnl =
          (positionData.currentPrice - positionData.avgPrice) * positionData.shares;
        const pnlPercent =
          positionData.avgPrice > 0
            ? ((positionData.currentPrice - positionData.avgPrice) /
                positionData.avgPrice) *
              100
            : 0;

        const position: Position = {
          ...positionData,
          unrealizedPnL: pnl,
          unrealizedPnLPercent: pnlPercent,
        };

        set((state) => ({
          positions: [...state.positions, position],
        }));
      },

      removePosition: (id) =>
        set((state) => ({
          positions: state.positions.filter((p) => p.id !== id),
        })),

      updatePosition: (id, updates) =>
        set((state) => ({
          positions: state.positions.map((p) => {
            if (p.id !== id) return p;

            const updated = { ...p, ...updates };
            updated.unrealizedPnL =
              (updated.currentPrice - updated.avgPrice) * updated.shares;
            updated.unrealizedPnLPercent =
              updated.avgPrice > 0
                ? ((updated.currentPrice - updated.avgPrice) / updated.avgPrice) *
                  100
                : 0;

            return updated;
          }),
        })),

      clearPortfolio: () => set({ positions: [] }),

      getTotalValue: () => {
        const positions = get().positions;
        return positions.reduce(
          (sum, p) => sum + p.currentPrice * p.shares,
          0
        );
      },

      getTotalPnL: () => {
        const positions = get().positions;
        return positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
      },

      getPositionById: (id) => {
        return get().positions.find((p) => p.id === id);
      },
    }),
    {
      name: 'polyterminal-portfolio',
    }
  )
);
