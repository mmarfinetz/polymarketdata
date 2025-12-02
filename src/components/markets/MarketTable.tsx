import { useMemo } from 'react';
import type { Market, Event } from '../../types/api';
import { useTerminalStore } from '../../stores/terminal-store';
import { formatCompactNumber, formatDateShort, getCategoryClass } from '../../utils/format';

interface MarketTableProps {
  items: (Market | Event)[];
  type: 'markets' | 'events';
  isLoading: boolean;
}

export function MarketTable({ items, type, isLoading }: MarketTableProps) {
  const { setSelectedItemId, selectedItemId, addToWatchlist, isInWatchlist } = useTerminalStore();

  const columns = useMemo(() => {
    if (type === 'events') {
      return [
        { key: 'rank', label: '#', width: 'w-12' },
        { key: 'title', label: 'EVENT', width: 'flex-1' },
        { key: 'volume_total', label: 'TOTAL VOL', width: 'w-28' },
        { key: 'volume_24h', label: '24H VOL', width: 'w-24' },
        { key: 'liquidity', label: 'LIQUIDITY', width: 'w-24' },
        { key: 'market_count', label: 'MARKETS', width: 'w-20' },
        { key: 'category', label: 'CATEGORY', width: 'w-28' },
        { key: 'end_date', label: 'ENDS', width: 'w-24' },
        { key: 'actions', label: '', width: 'w-24' },
      ];
    }
    return [
      { key: 'rank', label: '#', width: 'w-12' },
      { key: 'title', label: 'MARKET', width: 'flex-1' },
      { key: 'volume_total', label: 'VOLUME', width: 'w-28' },
      { key: 'liquidity', label: 'LIQUIDITY', width: 'w-24' },
      { key: 'category', label: 'CATEGORY', width: 'w-28' },
      { key: 'end_date', label: 'ENDS', width: 'w-24' },
      { key: 'actions', label: '', width: 'w-24' },
    ];
  }, [type]);

  if (isLoading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-terminal-text-secondary">
        No {type} found matching your filters.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-terminal-bg-secondary border-b border-terminal-border">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`${col.width} text-xs font-medium text-terminal-text-secondary uppercase tracking-wider ${
              ['volume_total', 'volume_24h', 'liquidity'].includes(col.key) ? 'text-right' : ''
            }`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => {
          const id = 'event_id' in item ? item.event_id : item.market_id;
          const isSelected = selectedItemId === id;
          const watching = isInWatchlist(id);

          return (
            <div
              key={id}
              onClick={() => setSelectedItemId(isSelected ? null : id)}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors border-b border-terminal-border/30 ${
                isSelected
                  ? 'bg-terminal-accent-blue/20 border-l-2 border-l-terminal-accent-blue'
                  : 'hover:bg-terminal-bg-hover'
              }`}
            >
              {/* Rank */}
              <div className="w-12 text-sm text-terminal-text-muted font-mono">
                {item.rank}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-terminal-text-primary truncate" title={item.title}>
                  {item.title}
                </div>
              </div>

              {/* Volume Total */}
              <div className="w-28 text-right text-sm font-mono text-terminal-accent-green">
                {formatCompactNumber(item.volume_total || item.volume_usd || 0)}
              </div>

              {/* 24h Volume (events only) */}
              {type === 'events' && (
                <div className="w-24 text-right text-sm font-mono text-terminal-text-secondary">
                  {(item as Event).volume_24h > 0
                    ? formatCompactNumber((item as Event).volume_24h)
                    : '-'}
                </div>
              )}

              {/* Liquidity */}
              <div className="w-24 text-right text-sm font-mono text-terminal-text-secondary">
                {formatCompactNumber(item.liquidity || 0)}
              </div>

              {/* Market count (events only) */}
              {type === 'events' && (
                <div className="w-20 text-center text-sm text-terminal-text-secondary">
                  {(item as Event).market_count || '-'}
                </div>
              )}

              {/* Category */}
              <div className="w-28">
                <span className={`category-badge ${getCategoryClass(item.category)}`}>
                  {item.category}
                </span>
              </div>

              {/* End date */}
              <div className="w-24 text-sm text-terminal-text-muted">
                {formatDateShort(item.end_date)}
              </div>

              {/* Actions */}
              <div className="w-24 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!watching) {
                      addToWatchlist({
                        id,
                        type: type === 'events' ? 'event' : 'market',
                        title: item.title,
                        addedAt: new Date().toISOString(),
                      });
                    }
                  }}
                  className={`p-1 rounded transition-colors ${
                    watching
                      ? 'text-terminal-accent-orange'
                      : 'text-terminal-text-muted hover:text-terminal-accent-orange'
                  }`}
                  title={watching ? 'In watchlist' : 'Add to watchlist'}
                >
                  {watching ? '★' : '☆'}
                </button>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-terminal-text-muted hover:text-terminal-accent-blue transition-colors"
                    title="Open in Polymarket"
                  >
                    ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-terminal-bg-secondary border-t border-terminal-border text-xs text-terminal-text-secondary">
        Showing {items.length} {type}
      </div>
    </div>
  );
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-terminal-bg-secondary border-b border-terminal-border">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 skeleton flex-1" />
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-3 border-b border-terminal-border/30"
          >
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 skeleton flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
