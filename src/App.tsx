import { useEffect, useCallback } from 'react';
import { TerminalLayout } from './components/terminal/TerminalLayout';
import { CommandBar } from './components/terminal/CommandBar';
import { StatusBar } from './components/terminal/StatusBar';
import { useTerminalStore } from './stores/terminal-store';

function App() {
  const { setCommandBarFocused, setCurrentView } = useTerminalStore();

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Command bar focus: Ctrl/Cmd + K or /
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarFocused(true);
      }

      // View shortcuts with Alt key
      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setCurrentView('events');
            break;
          case '2':
            e.preventDefault();
            setCurrentView('markets');
            break;
          case '3':
            e.preventDefault();
            setCurrentView('analytics');
            break;
          case '4':
            e.preventDefault();
            setCurrentView('watchlist');
            break;
          case '5':
            e.preventDefault();
            setCurrentView('portfolio');
            break;
        }
      }

      // Escape to close command bar
      if (e.key === 'Escape') {
        setCommandBarFocused(false);
      }
    },
    [setCommandBarFocused, setCurrentView]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col bg-terminal-bg-primary">
      {/* Command Bar */}
      <CommandBar />

      {/* Main Terminal Layout */}
      <main className="flex-1 overflow-hidden">
        <TerminalLayout />
      </main>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export default App;
