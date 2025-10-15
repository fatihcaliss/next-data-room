'use client';

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, metaKey, shiftKey, action }) => {
        const ctrlMatch = ctrlKey === undefined ? true : event.ctrlKey === ctrlKey;
        const metaMatch = metaKey === undefined ? true : event.metaKey === metaKey;
        const shiftMatch = shiftKey === undefined ? true : event.shiftKey === shiftKey;
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();

        if (ctrlMatch && metaMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
