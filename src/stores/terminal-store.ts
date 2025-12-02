/**
 * Terminal state management with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PanelLayout, WatchlistItem } from '../types/api';

export type ViewMode = 'markets' | 'events' | 'all' | 'watchlist' | 'analytics' | 'portfolio';

interface TerminalState {
  // View state
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Command bar
  commandHistory: string[];
  addToHistory: (command: string) => void;
  clearHistory: () => void;

  // Panel layouts
  layouts: PanelLayout[];
  setLayouts: (layouts: PanelLayout[]) => void;
  resetLayouts: () => void;

  // Selected item
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;

  // Search/filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;

  // UI state
  isCommandBarFocused: boolean;
  setCommandBarFocused: (focused: boolean) => void;
  focusedPanelId: string | null;
  setFocusedPanelId: (id: string | null) => void;
}

const defaultLayouts: PanelLayout[] = [
  { i: 'markets', x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 4 },
  { i: 'chart', x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
  { i: 'analytics', x: 8, y: 6, w: 4, h: 6, minW: 3, minH: 4 },
];

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      // View state
      currentView: 'events',
      setCurrentView: (view) => set({ currentView: view }),

      // Command bar
      commandHistory: [],
      addToHistory: (command) =>
        set((state) => ({
          commandHistory: [...state.commandHistory.slice(-49), command],
        })),
      clearHistory: () => set({ commandHistory: [] }),

      // Panel layouts
      layouts: defaultLayouts,
      setLayouts: (layouts) => set({ layouts }),
      resetLayouts: () => set({ layouts: defaultLayouts }),

      // Selected item
      selectedItemId: null,
      setSelectedItemId: (id) => set({ selectedItemId: id }),

      // Search/filter
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      categoryFilter: 'all',
      setCategoryFilter: (category) => set({ categoryFilter: category }),

      // Watchlist
      watchlist: [],
      addToWatchlist: (item) =>
        set((state) => {
          if (state.watchlist.some((w) => w.id === item.id)) {
            return state;
          }
          return { watchlist: [...state.watchlist, item] };
        }),
      removeFromWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.id !== id),
        })),
      isInWatchlist: (id) => get().watchlist.some((w) => w.id === id),

      // UI state
      isCommandBarFocused: false,
      setCommandBarFocused: (focused) => set({ isCommandBarFocused: focused }),
      focusedPanelId: null,
      setFocusedPanelId: (id) => set({ focusedPanelId: id }),
    }),
    {
      name: 'polyterminal-storage',
      partialize: (state) => ({
        layouts: state.layouts,
        watchlist: state.watchlist,
        commandHistory: state.commandHistory,
        currentView: state.currentView,
      }),
    }
  )
);
