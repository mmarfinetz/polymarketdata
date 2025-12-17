import { useState, useEffect } from 'react';
import { useTerminalData } from '../../hooks/useApi';
import { useTerminalStore } from '../../stores/terminal-store';
import { formatCompactNumber } from '../../utils/format';

export function StatusBar() {
  const { totalVolume, totalLiquidity, markets, events, isLoading } = useTerminalData();
  const { currentView, watchlist } = useTerminalStore();

  const viewLabels: Record<string, string> = {
    events: 'EVENTS',
    markets: 'MARKETS',
    all: 'ALL',
    watchlist: 'WATCHLIST',
    analytics: 'ANALYTICS',
    portfolio: 'PORTFOLIO',
  };

  return (
    <div className="flex items-center justify-between h-8 px-4 bg-terminal-bg-secondary border-t border-terminal-border text-xs">
      {/* Left section - Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLoading
                ? 'bg-terminal-accent-orange animate-pulse'
                : 'bg-terminal-accent-green'
            }`}
          />
          <span className="text-terminal-text-secondary">
            {isLoading ? 'LOADING' : 'LIVE'}
          </span>
        </div>
        <div className="text-terminal-text-muted">|</div>
        <div className="text-terminal-text-secondary">
          VIEW: <span className="text-terminal-accent-blue">{viewLabels[currentView]}</span>
        </div>
      </div>

      {/* Center section - Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-terminal-text-muted">TOTAL VOL:</span>
          <span className="text-terminal-accent-green font-medium">
            {formatCompactNumber(totalVolume)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-terminal-text-muted">LIQ:</span>
          <span className="text-terminal-text-primary font-medium">
            {formatCompactNumber(totalLiquidity)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-terminal-text-muted">EVENTS:</span>
          <span className="text-terminal-text-primary">{events.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-terminal-text-muted">MARKETS:</span>
          <span className="text-terminal-text-primary">{markets.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-terminal-text-muted">WATCHING:</span>
          <span className="text-terminal-accent-orange">{watchlist.length}</span>
        </div>
      </div>

      {/* Right section - Time */}
      <div className="flex items-center gap-4">
        <div className="text-terminal-text-muted">
          <CurrentTime />
        </div>
        <div className="text-terminal-text-secondary">
          POLYTERMINAL <span className="text-terminal-accent-blue">v0.1.0</span>
        </div>
      </div>
    </div>
  );
}

function CurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span>
      {time.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}{' '}
      UTC
    </span>
  );
}
