import type { Market, Event, DataItem } from '../../types/api';
import { useTerminalStore } from '../../stores/terminal-store';
import { formatCompactNumber, formatDate, getCategoryClass } from '../../utils/format';

interface MarketCardProps {
  item: DataItem;
}

export function MarketCard({ item }: MarketCardProps) {
  const { setSelectedItemId, addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useTerminalStore();

  const isEvent = 'event_id' in item;
  const id = isEvent ? (item as Event).event_id : (item as Market).market_id;
  const watching = isInWatchlist(id);

  const handleWatchlistToggle = () => {
    if (watching) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist({
        id,
        type: isEvent ? 'event' : 'market',
        title: item.title,
        addedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <span className={`category-badge ${getCategoryClass(item.category)}`}>
            {item.category}
          </span>
          <span className="text-xs text-terminal-text-muted">
            {isEvent ? 'EVENT' : 'MARKET'}
          </span>
        </div>
        <button
          onClick={() => setSelectedItemId(null)}
          className="text-terminal-text-secondary hover:text-terminal-text-primary"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-lg font-medium text-terminal-text-primary leading-tight">
            {item.title}
          </h2>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox
            label="Total Volume"
            value={formatCompactNumber(item.volume_total || item.volume_usd || 0)}
            highlight
          />
          {isEvent && (
            <MetricBox
              label="24h Volume"
              value={formatCompactNumber((item as Event).volume_24h || 0)}
            />
          )}
          <MetricBox
            label="Liquidity"
            value={formatCompactNumber(item.liquidity || 0)}
          />
          {isEvent && (
            <MetricBox
              label="Markets"
              value={(item as Event).market_count?.toString() || '0'}
            />
          )}
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-terminal-text-secondary">Created</span>
            <span className="text-terminal-text-primary">{formatDate(item.created_at)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-terminal-text-secondary">End Date</span>
            <span className="text-terminal-text-primary">{formatDate(item.end_date)}</span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="space-y-1">
            <div className="text-xs text-terminal-text-secondary uppercase tracking-wider">
              Description
            </div>
            <p className="text-sm text-terminal-text-secondary leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Tags (events only) */}
        {isEvent && (item as Event).tags && (item as Event).tags.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-terminal-text-secondary uppercase tracking-wider">
              Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {(item as Event).tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs bg-terminal-bg-primary border border-terminal-border rounded"
                >
                  {typeof tag === 'string' ? tag : tag.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-terminal-border space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleWatchlistToggle}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              watching
                ? 'bg-terminal-accent-orange/20 text-terminal-accent-orange border border-terminal-accent-orange'
                : 'bg-terminal-bg-primary text-terminal-text-primary border border-terminal-border hover:border-terminal-accent-orange'
            }`}
          >
            {watching ? '★ In Watchlist' : '☆ Add to Watchlist'}
          </button>
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium bg-terminal-accent-blue text-white rounded hover:bg-terminal-accent-blue/80 transition-colors"
          >
            Open in Polymarket ↗
          </a>
        )}
      </div>
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function MetricBox({ label, value, highlight }: MetricBoxProps) {
  return (
    <div className="p-3 bg-terminal-bg-primary rounded border border-terminal-border">
      <div className="text-xs text-terminal-text-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div
        className={`text-lg font-mono font-medium ${
          highlight ? 'text-terminal-accent-green' : 'text-terminal-text-primary'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
