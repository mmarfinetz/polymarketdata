/**
 * Terminal command execution hook
 */

import { useCallback } from 'react';
import { useTerminalStore } from '../stores/terminal-store';

export interface Command {
  name: string;
  shortcut: string;
  description: string;
  execute: () => void;
}

export function useTerminalCommands() {
  const {
    setCurrentView,
    setSearchQuery,
    setCategoryFilter,
    addToHistory,
  } = useTerminalStore();

  const commands: Command[] = [
    {
      name: 'TOP',
      shortcut: 'top',
      description: 'Show top events by volume',
      execute: () => setCurrentView('events'),
    },
    {
      name: 'EVENTS',
      shortcut: 'events',
      description: 'Switch to events view',
      execute: () => setCurrentView('events'),
    },
    {
      name: 'MARKETS',
      shortcut: 'markets',
      description: 'Switch to markets view',
      execute: () => setCurrentView('markets'),
    },
    {
      name: 'ANALYTICS',
      shortcut: 'analytics',
      description: 'Show analytics dashboard',
      execute: () => setCurrentView('analytics'),
    },
    {
      name: 'WL',
      shortcut: 'wl',
      description: 'Open watchlist',
      execute: () => setCurrentView('watchlist'),
    },
    {
      name: 'PORT',
      shortcut: 'port',
      description: 'Open portfolio',
      execute: () => setCurrentView('portfolio'),
    },
    {
      name: 'CLEAR',
      shortcut: 'clear',
      description: 'Clear search filters',
      execute: () => {
        setSearchQuery('');
        setCategoryFilter('all');
      },
    },
    {
      name: 'REFRESH',
      shortcut: 'refresh',
      description: 'Refresh data',
      execute: () => window.location.reload(),
    },
  ];

  const executeCommand = useCallback(
    (input: string) => {
      const cmd = input.trim().toLowerCase();
      addToHistory(input);

      // Check for exact command match
      const command = commands.find(
        (c) => c.shortcut === cmd || c.name.toLowerCase() === cmd
      );

      if (command) {
        command.execute();
        return true;
      }

      // Check for category filter commands
      const categoryPrefixes = ['cat:', 'category:'];
      for (const prefix of categoryPrefixes) {
        if (cmd.startsWith(prefix)) {
          const category = cmd.slice(prefix.length).trim();
          setCategoryFilter(category || 'all');
          setCurrentView('events');
          return true;
        }
      }

      // Treat as search query if not a command
      if (cmd.length > 0) {
        setSearchQuery(cmd);
        setCurrentView('events');
        return true;
      }

      return false;
    },
    [commands, addToHistory, setSearchQuery, setCategoryFilter, setCurrentView]
  );

  const getCommandSuggestions = useCallback(
    (input: string): Command[] => {
      if (!input) return [];
      const query = input.toLowerCase();
      return commands.filter(
        (c) =>
          c.shortcut.includes(query) ||
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    },
    [commands]
  );

  return {
    commands,
    executeCommand,
    getCommandSuggestions,
  };
}
