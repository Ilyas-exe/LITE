import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = (callbacks = {}) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ignore if user is typing in an input/textarea
            if (
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable
            ) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            // Ctrl/Cmd + K: Global Search
            if (modifier && e.key === 'k') {
                e.preventDefault();
                callbacks.onSearch?.();
            }

            // Ctrl/Cmd + N: New Item (context-aware)
            if (modifier && e.key === 'n') {
                e.preventDefault();
                callbacks.onNew?.();
            }

            // Ctrl/Cmd + S: Save
            if (modifier && e.key === 's') {
                e.preventDefault();
                callbacks.onSave?.();
            }

            // Ctrl/Cmd + B: Backup
            if (modifier && e.key === 'b') {
                e.preventDefault();
                callbacks.onBackup?.();
            }

            // Ctrl/Cmd + E: Export
            if (modifier && e.key === 'e') {
                e.preventDefault();
                callbacks.onExport?.();
            }

            // Ctrl/Cmd + F: Focus Search Bar
            if (modifier && e.key === 'f') {
                e.preventDefault();
                callbacks.onFocusSearch?.();
            }

            // Navigation shortcuts (Ctrl/Cmd + 1/2/3/4)
            if (modifier && ['1', '2', '3', '4'].includes(e.key)) {
                e.preventDefault();
                const routes = ['/dashboard', '/job-tracker', '/task-manager', '/knowledge-base'];
                navigate(routes[parseInt(e.key) - 1]);
            }

            // Escape: Close modals/cancel
            if (e.key === 'Escape') {
                callbacks.onEscape?.();
            }

            // ? : Show keyboard shortcuts help
            if (e.key === '?' && !modifier) {
                e.preventDefault();
                callbacks.onShowHelp?.();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [callbacks, navigate]);
};

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
    {
        category: 'Navigation', shortcuts: [
            { keys: ['Ctrl/⌘', '1'], description: 'Dashboard' },
            { keys: ['Ctrl/⌘', '2'], description: 'Job Tracker' },
            { keys: ['Ctrl/⌘', '3'], description: 'Task Manager' },
            { keys: ['Ctrl/⌘', '4'], description: 'Knowledge Base' },
        ]
    },
    {
        category: 'Actions', shortcuts: [
            { keys: ['Ctrl/⌘', 'K'], description: 'Global Search' },
            { keys: ['Ctrl/⌘', 'N'], description: 'New Item' },
            { keys: ['Ctrl/⌘', 'S'], description: 'Save' },
            { keys: ['Ctrl/⌘', 'B'], description: 'Backup' },
            { keys: ['Ctrl/⌘', 'E'], description: 'Export' },
            { keys: ['Ctrl/⌘', 'F'], description: 'Focus Search' },
            { keys: ['Esc'], description: 'Close/Cancel' },
            { keys: ['?'], description: 'Show Shortcuts' },
        ]
    },
];
