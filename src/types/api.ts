/**
 * TypeScript types matching Flask API response shapes
 * Based on app.py, polymarket.py, and polymarketevents.py
 */

// Market data from /fetch_markets endpoint
export interface Market {
  rank: number;
  title: string;
  market_slug: string;
  market_id: string;
  condition_id: string;
  volume_usd: number;
  volume_type: 'total' | '24h';
  volume_24h: number;
  volume_total: number;
  category: string;
  created_at: string | null;
  end_date: string | null;
  is_resolved: boolean;
  active: boolean;
  closed: boolean;
  description: string;
  outcomes: string[];
  liquidity: number;
  url: string;
}

// Event data from /fetch_events endpoint
export interface Event {
  rank: number;
  title: string;
  event_slug: string;
  event_id: string;
  volume_usd: number;
  volume_total: number;
  volume_24h: number;
  category: string;
  tags: EventTag[];
  created_at: string | null;
  end_date: string | null;
  is_active: boolean;
  is_closed: boolean;
  description: string;
  liquidity: number;
  url: string;
  market_count: number;
  featured: boolean;
  competitive?: boolean;
}

export interface EventTag {
  label: string;
  forceHide?: boolean;
}

// API Request types
export interface FetchDataRequest {
  start_date?: string;
  end_date?: string;
}

// API Response types
export interface MarketsResponse {
  success: boolean;
  message: string;
  markets: Market[];
  filename: string;
}

export interface EventsResponse {
  success: boolean;
  message: string;
  events: Event[];
  filename: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  python_version: string;
  template_dir: string;
  template_dir_exists: boolean;
  cwd: string;
  base_dir: string;
}

export interface ApiError {
  error: string;
  details?: string;
  type?: string;
}

// Unified item type for display (markets and events share similar fields)
export type DataItem = Market | Event;

// Type guards
export function isMarket(item: DataItem): item is Market {
  return 'market_id' in item;
}

export function isEvent(item: DataItem): item is Event {
  return 'event_id' in item;
}

// Category types based on the categorization in polymarket.py
export type Category =
  | 'Politics'
  | 'Economy'
  | 'Crypto'
  | 'Sports'
  | 'Entertainment'
  | 'World Affairs'
  | 'Technology'
  | 'News'
  | 'Uncategorized'
  | string;

// Terminal command types
export interface TerminalCommand {
  name: string;
  shortcut: string;
  description: string;
  action: () => void;
}

// Panel layout types for react-grid-layout
export interface PanelLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

// Watchlist item
export interface WatchlistItem {
  id: string;
  type: 'market' | 'event';
  title: string;
  addedAt: string;
}

// Portfolio position
export interface Position {
  id: string;
  type: 'market' | 'event';
  title: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}
