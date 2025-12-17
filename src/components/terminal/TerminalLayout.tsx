import { useTerminalStore } from '../../stores/terminal-store';
import { MarketTable } from '../markets/MarketTable';
import { MarketCard } from '../markets/MarketCard';
import { VolumeAnalysis } from '../analytics/VolumeAnalysis';
import { CategoryBreakdown } from '../analytics/CategoryBreakdown';
import { Watchlist } from '../portfolio/Watchlist';
import { useTerminalData } from '../../hooks/useApi';

export function TerminalLayout() {
  const { currentView, searchQuery, categoryFilter, selectedItemId } = useTerminalStore();
  const { events, markets, isLoading, isError, error, refetchAll } = useTerminalData();

  // Filter data based on search and category
  const filterData = <T extends { title: string; category: string }>(items: T[]) => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredEvents = filterData(events);
  const filteredMarkets = filterData(markets);

  // Get selected item details
  const selectedItem =
    [...events, ...markets].find(
      (item) =>
        ('event_id' in item && item.event_id === selectedItemId) ||
        ('market_id' in item && item.market_id === selectedItemId)
    ) || null;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-terminal-accent-red text-lg">Error Loading Data</div>
          <div className="text-terminal-text-secondary text-sm">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </div>
          <button
            onClick={refetchAll}
            className="px-4 py-2 bg-terminal-accent-blue text-white rounded hover:bg-terminal-accent-blue/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* View tabs */}
        <ViewTabs />

        {/* Content based on view */}
        <div className="flex-1 overflow-hidden p-4">
          {currentView === 'events' && (
            <MarketTable
              items={filteredEvents}
              type="events"
              isLoading={isLoading}
            />
          )}

          {currentView === 'markets' && (
            <MarketTable
              items={filteredMarkets}
              type="markets"
              isLoading={isLoading}
            />
          )}

          {currentView === 'analytics' && (
            <div className="grid grid-cols-2 gap-4 h-full overflow-auto">
              <VolumeAnalysis />
              <CategoryBreakdown />
            </div>
          )}

          {currentView === 'watchlist' && <Watchlist />}

          {currentView === 'portfolio' && (
            <div className="flex items-center justify-center h-full text-terminal-text-secondary">
              Portfolio tracking coming soon. Add positions to track P&L.
            </div>
          )}
        </div>
      </div>

      {/* Side panel for selected item */}
      {selectedItem && (
        <div className="w-96 border-l border-terminal-border bg-terminal-bg-secondary overflow-y-auto">
          <MarketCard item={selectedItem} />
        </div>
      )}
    </div>
  );
}

function ViewTabs() {
  const { currentView, setCurrentView, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter } =
    useTerminalStore();
  const { categories } = useTerminalData();

  const tabs = [
    { id: 'events', label: 'TOP EVENTS', shortcut: 'Alt+1' },
    { id: 'markets', label: 'MARKETS', shortcut: 'Alt+2' },
    { id: 'analytics', label: 'ANALYTICS', shortcut: 'Alt+3' },
    { id: 'watchlist', label: 'WATCHLIST', shortcut: 'Alt+4' },
  ] as const;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-bg-panel">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
              currentView === tab.id
                ? 'bg-terminal-accent-blue text-white'
                : 'text-terminal-text-secondary hover:text-terminal-text-primary hover:bg-terminal-bg-hover'
            }`}
            title={tab.shortcut}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <span className="text-terminal-text-muted text-xs">SEARCH:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter..."
            className="w-40 px-2 py-1 text-xs bg-terminal-bg-primary border border-terminal-border rounded focus:border-terminal-accent-blue focus:outline-none text-terminal-text-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-terminal-text-muted hover:text-terminal-text-primary"
            >
              x
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <span className="text-terminal-text-muted text-xs">CATEGORY:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-terminal-bg-primary border border-terminal-border rounded focus:border-terminal-accent-blue focus:outline-none text-terminal-text-primary"
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
