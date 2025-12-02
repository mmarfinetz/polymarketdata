import { useCategoryBreakdown } from '../../hooks/useApi';
import { formatCompactNumber, getCategoryClass } from '../../utils/format';
import { useTerminalStore } from '../../stores/terminal-store';

export function CategoryBreakdown() {
  const breakdown = useCategoryBreakdown();
  const { setCategoryFilter, setCurrentView } = useTerminalStore();

  const totalVolume = breakdown.reduce((sum, cat) => sum + cat.volume, 0);

  return (
    <div className="terminal-panel h-full flex flex-col">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Category Breakdown</span>
        <span className="text-xs text-terminal-text-muted">
          {breakdown.length} categories
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {breakdown.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-terminal-text-secondary text-sm">
            No data available
          </div>
        ) : (
          <div className="divide-y divide-terminal-border/30">
            {breakdown.map((cat) => {
              const percentage = totalVolume > 0 ? (cat.volume / totalVolume) * 100 : 0;

              return (
                <div
                  key={cat.category}
                  onClick={() => {
                    setCategoryFilter(cat.category);
                    setCurrentView('events');
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-terminal-bg-hover transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`category-badge ${getCategoryClass(cat.category)}`}>
                      {cat.category}
                    </span>
                    <span className="text-xs text-terminal-text-muted">
                      {cat.count} items
                    </span>
                  </div>

                  {/* Volume bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-terminal-text-secondary">Volume</span>
                      <span className="text-terminal-accent-green font-mono">
                        {formatCompactNumber(cat.volume)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-terminal-bg-primary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terminal-accent-blue transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-terminal-text-muted">
                      <span>{percentage.toFixed(1)}% of total</span>
                      <span>Liq: {formatCompactNumber(cat.liquidity)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="px-4 py-2 border-t border-terminal-border bg-terminal-bg-secondary">
        <div className="flex justify-between text-xs">
          <span className="text-terminal-text-secondary">Total Volume</span>
          <span className="text-terminal-accent-green font-mono font-medium">
            {formatCompactNumber(totalVolume)}
          </span>
        </div>
      </div>
    </div>
  );
}
