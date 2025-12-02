import { useTerminalStore } from '../../stores/terminal-store';
import { useTerminalData } from '../../hooks/useApi';
import { formatCompactNumber, formatTimeAgo, getCategoryClass } from '../../utils/format';

export function Watchlist() {
  const { watchlist, removeFromWatchlist, setSelectedItemId, setCurrentView } =
    useTerminalStore();
  const { events, markets } = useTerminalData();

  // Get full item data for watchlist items
  const watchlistItems = watchlist.map((item) => {
    const fullData =
      item.type === 'event'
        ? events.find((e) => e.event_id === item.id)
        : markets.find((m) => m.market_id === item.id);

    return {
      ...item,
      fullData,
    };
  });

  if (watchlist.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="text-4xl mb-4">☆</div>
        <h3 className="text-lg font-medium text-terminal-text-primary mb-2">
          Your watchlist is empty
        </h3>
        <p className="text-sm text-terminal-text-secondary max-w-md">
          Add markets and events to your watchlist to track them here. Click the star icon
          on any item to add it.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-terminal-bg-secondary border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <span className="text-terminal-accent-orange">★</span>
          <span className="text-sm font-medium text-terminal-text-primary">
            WATCHLIST
          </span>
          <span className="text-xs text-terminal-text-muted">
            ({watchlist.length} items)
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {watchlistItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-terminal-border/30 hover:bg-terminal-bg-hover transition-colors"
          >
            {/* Remove button */}
            <button
              onClick={() => removeFromWatchlist(item.id)}
              className="text-terminal-accent-orange hover:text-terminal-accent-red transition-colors"
              title="Remove from watchlist"
            >
              ★
            </button>

            {/* Item info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                setSelectedItemId(item.id);
                setCurrentView(item.type === 'event' ? 'events' : 'markets');
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-terminal-text-primary truncate">
                  {item.title}
                </span>
                <span className="text-xs text-terminal-text-muted uppercase">
                  {item.type}
                </span>
              </div>
              {item.fullData && (
                <div className="flex items-center gap-3 text-xs">
                  <span className={`category-badge ${getCategoryClass(item.fullData.category)}`}>
                    {item.fullData.category}
                  </span>
                  <span className="text-terminal-accent-green font-mono">
                    {formatCompactNumber(item.fullData.volume_usd || 0)}
                  </span>
                </div>
              )}
            </div>

            {/* Added time */}
            <div className="text-xs text-terminal-text-muted">
              Added {formatTimeAgo(item.addedAt)}
            </div>

            {/* Link */}
            {item.fullData?.url && (
              <a
                href={item.fullData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-terminal-text-muted hover:text-terminal-accent-blue transition-colors"
                title="Open in Polymarket"
              >
                ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
