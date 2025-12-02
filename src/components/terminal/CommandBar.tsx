import { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../stores/terminal-store';

interface Command {
  name: string;
  shortcut: string;
  description: string;
}

const commands: Command[] = [
  { name: 'TOP', shortcut: 'top', description: 'Show top markets/events by volume' },
  { name: 'EVENTS', shortcut: 'events', description: 'Switch to events view' },
  { name: 'MARKETS', shortcut: 'markets', description: 'Switch to markets view' },
  { name: 'MOVE', shortcut: 'move', description: 'Show biggest movers' },
  { name: 'WL', shortcut: 'wl', description: 'Open watchlist' },
  { name: 'PORT', shortcut: 'port', description: 'Open portfolio' },
  { name: 'ANALYTICS', shortcut: 'analytics', description: 'Show analytics dashboard' },
  { name: 'REFRESH', shortcut: 'refresh', description: 'Refresh all data' },
  { name: 'CLEAR', shortcut: 'clear', description: 'Clear search filters' },
  { name: 'HELP', shortcut: 'help', description: 'Show available commands' },
];

export function CommandBar() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isCommandBarFocused,
    setCommandBarFocused,
    setCurrentView,
    setSearchQuery,
    addToHistory,
  } = useTerminalStore();

  // Filter suggestions based on input
  useEffect(() => {
    if (input.length > 0) {
      const filtered = commands.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(input.toLowerCase()) ||
          cmd.shortcut.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  // Focus input when command bar is focused
  useEffect(() => {
    if (isCommandBarFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCommandBarFocused]);

  const executeCommand = useCallback(
    (command: string) => {
      const cmd = command.trim().toLowerCase();
      addToHistory(command);

      switch (cmd) {
        case 'top':
        case 'events':
          setCurrentView('events');
          break;
        case 'markets':
          setCurrentView('markets');
          break;
        case 'wl':
        case 'watchlist':
          setCurrentView('watchlist');
          break;
        case 'port':
        case 'portfolio':
          setCurrentView('portfolio');
          break;
        case 'analytics':
        case 'move':
          setCurrentView('analytics');
          break;
        case 'clear':
          setSearchQuery('');
          break;
        case 'help':
          setShowHelp(true);
          break;
        case 'refresh':
          window.location.reload();
          break;
        default:
          // Treat as search query
          if (cmd.length > 0) {
            setSearchQuery(cmd);
            setCurrentView('events');
          }
      }

      setInput('');
      setCommandBarFocused(false);
    },
    [addToHistory, setCurrentView, setSearchQuery, setCommandBarFocused]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0 && selectedIndex >= 0) {
        executeCommand(suggestions[selectedIndex].shortcut);
      } else {
        executeCommand(input);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setCommandBarFocused(false);
      setInput('');
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[selectedIndex].shortcut);
    }
  };

  return (
    <div className="relative">
      {/* Main command bar */}
      <div className="flex items-center h-12 px-4 bg-terminal-bg-secondary border-b border-terminal-border">
        {/* Logo/Title */}
        <div className="flex items-center gap-3 mr-6">
          <div className="w-8 h-8 bg-terminal-accent-blue rounded flex items-center justify-center text-white font-bold text-sm">
            PT
          </div>
          <span className="text-terminal-text-primary font-semibold tracking-wide">
            POLYTERMINAL
          </span>
        </div>

        {/* Command input */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-terminal-bg-primary rounded border border-terminal-border focus-within:border-terminal-accent-blue">
          <span className="text-terminal-accent-orange font-bold">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setCommandBarFocused(true)}
            placeholder="Type a command or search... (Ctrl+K)"
            className="command-input font-mono text-sm"
          />
          <span className="text-terminal-text-muted text-xs">
            {isCommandBarFocused ? 'ESC to close' : 'Ctrl+K'}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setShowHelp(true)}
            className="px-2 py-1 text-xs text-terminal-text-secondary hover:text-terminal-text-primary"
          >
            ? Help
          </button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isCommandBarFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 mx-4 bg-terminal-bg-panel border border-terminal-border rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((cmd, index) => (
            <button
              key={cmd.shortcut}
              onClick={() => executeCommand(cmd.shortcut)}
              className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-terminal-bg-hover text-terminal-text-primary'
                  : 'text-terminal-text-secondary hover:bg-terminal-bg-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-terminal-accent-blue">{cmd.name}</span>
                <span className="text-xs">{cmd.description}</span>
              </div>
              <span className="text-xs text-terminal-text-muted">/{cmd.shortcut}</span>
            </button>
          ))}
        </div>
      )}

      {/* Help modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-terminal-bg-panel border border-terminal-border rounded-lg shadow-2xl max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border">
              <h2 className="font-semibold text-terminal-text-primary">
                Keyboard Shortcuts & Commands
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-terminal-text-secondary hover:text-terminal-text-primary"
              >
                ESC
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h3 className="text-xs font-semibold text-terminal-text-secondary uppercase tracking-wider mb-2">
                  Commands
                </h3>
                <div className="space-y-1">
                  {commands.map((cmd) => (
                    <div
                      key={cmd.shortcut}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-terminal-accent-blue font-mono">
                        {cmd.name}
                      </span>
                      <span className="text-sm text-terminal-text-secondary">
                        {cmd.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-terminal-text-secondary uppercase tracking-wider mb-2">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-terminal-text-secondary">Focus command bar</span>
                    <kbd className="px-2 py-0.5 bg-terminal-bg-secondary rounded text-terminal-text-muted">
                      Ctrl+K
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-text-secondary">Events view</span>
                    <kbd className="px-2 py-0.5 bg-terminal-bg-secondary rounded text-terminal-text-muted">
                      Alt+1
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-text-secondary">Markets view</span>
                    <kbd className="px-2 py-0.5 bg-terminal-bg-secondary rounded text-terminal-text-muted">
                      Alt+2
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-text-secondary">Analytics</span>
                    <kbd className="px-2 py-0.5 bg-terminal-bg-secondary rounded text-terminal-text-muted">
                      Alt+3
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-text-secondary">Watchlist</span>
                    <kbd className="px-2 py-0.5 bg-terminal-bg-secondary rounded text-terminal-text-muted">
                      Alt+4
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
