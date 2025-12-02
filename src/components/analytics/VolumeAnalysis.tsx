import { useTopMovers } from '../../hooks/useApi';
import { formatCompactNumber } from '../../utils/format';
import { useTerminalStore } from '../../stores/terminal-store';

export function VolumeAnalysis() {
  const movers = useTopMovers(20);
  const { setSelectedItemId, setCurrentView } = useTerminalStore();

  return (
    <div className="terminal-panel h-full flex flex-col">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Top Movers (24h Volume)</span>
        <span className="text-xs text-terminal-text-muted">{movers.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {movers.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-terminal-text-secondary text-sm">
            No volume data available
          </div>
        ) : (
          <div className="divide-y divide-terminal-border/30">
            {movers.map((item, index) => (
              <div
                key={item.event_id}
                onClick={() => {
                  setSelectedItemId(item.event_id);
                  setCurrentView('events');
                }}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-terminal-bg-hover transition-colors"
              >
                <div className="w-6 text-xs text-terminal-text-muted font-mono">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-terminal-text-primary truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-terminal-text-muted">{item.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-terminal-accent-green">
                    {formatCompactNumber(item.volume_24h)}
                  </div>
                  <div className="text-xs text-terminal-text-muted">24h</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
