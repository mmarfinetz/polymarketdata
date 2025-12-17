/**
 * TanStack Query hooks for API data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import type { FetchDataRequest, Market, Event } from '../types/api';

// Query keys
export const queryKeys = {
  markets: (params?: FetchDataRequest) => ['markets', params] as const,
  events: (params?: FetchDataRequest) => ['events', params] as const,
  health: ['health'] as const,
};

// Markets hook
export function useMarkets(params?: FetchDataRequest) {
  return useQuery({
    queryKey: queryKeys.markets(params),
    queryFn: () => apiClient.fetchMarkets(params),
    staleTime: 30_000, // 30s cache
    gcTime: 5 * 60_000, // 5min garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Events hook
export function useEvents(params?: FetchDataRequest) {
  return useQuery({
    queryKey: queryKeys.events(params),
    queryFn: () => apiClient.fetchEvents(params),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Health check hook
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.checkHealth(),
    staleTime: 60_000,
    retry: 1,
  });
}

// Mutation for refreshing data
export function useRefreshData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (type: 'markets' | 'events') => {
      if (type === 'markets') {
        return apiClient.fetchMarkets();
      }
      return apiClient.fetchEvents();
    },
    onSuccess: (data, type) => {
      if (type === 'markets') {
        queryClient.setQueryData(queryKeys.markets(), data);
      } else {
        queryClient.setQueryData(queryKeys.events(), data);
      }
    },
  });
}

// Combined data hook for terminal displays
export function useTerminalData() {
  const marketsQuery = useMarkets();
  const eventsQuery = useEvents();

  const isLoading = marketsQuery.isLoading || eventsQuery.isLoading;
  const isError = marketsQuery.isError || eventsQuery.isError;
  const error = marketsQuery.error || eventsQuery.error;

  // Combine and sort by volume
  const allItems: (Market | Event)[] = [
    ...(marketsQuery.data?.markets || []),
    ...(eventsQuery.data?.events || []),
  ].sort((a, b) => (b.volume_usd || 0) - (a.volume_usd || 0));

  // Get unique categories
  const categories = [...new Set(allItems.map((item) => item.category))].sort();

  // Calculate totals
  const totalVolume = allItems.reduce((sum, item) => sum + (item.volume_usd || 0), 0);
  const totalLiquidity = allItems.reduce((sum, item) => sum + (item.liquidity || 0), 0);

  return {
    markets: marketsQuery.data?.markets || [],
    events: eventsQuery.data?.events || [],
    allItems,
    categories,
    totalVolume,
    totalLiquidity,
    isLoading,
    isError,
    error,
    refetchMarkets: marketsQuery.refetch,
    refetchEvents: eventsQuery.refetch,
    refetchAll: () => {
      marketsQuery.refetch();
      eventsQuery.refetch();
    },
  };
}

// Top movers calculation (by volume change)
export function useTopMovers(limit: number = 10) {
  const { events } = useTerminalData();

  // Sort by 24h volume activity
  const movers = [...events]
    .filter((e) => e.volume_24h > 0)
    .sort((a, b) => b.volume_24h - a.volume_24h)
    .slice(0, limit);

  return movers;
}

// Category breakdown
export function useCategoryBreakdown() {
  const { allItems } = useTerminalData();

  const breakdown = allItems.reduce(
    (acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, volume: 0, liquidity: 0 };
      }
      acc[category].count += 1;
      acc[category].volume += item.volume_usd || 0;
      acc[category].liquidity += item.liquidity || 0;
      return acc;
    },
    {} as Record<string, { count: number; volume: number; liquidity: number }>
  );

  return Object.entries(breakdown)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.volume - a.volume);
}
