import { useState, useEffect, useRef } from 'react';

/**
 * Autocomplete dropdown for note linking
 * Appears when user types [[ in the editor
 */
function NoteLinkAutocomplete({ isOpen, suggestions, onSelect, onClose, position }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedIndex(0);
        }
    }, [isOpen, suggestions]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
            } else if (e.key === 'Enter' && suggestions.length > 0) {
                e.preventDefault();
                onSelect(suggestions[selectedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, suggestions, onSelect, onClose]);

    if (!isOpen || suggestions.length === 0) return null;

    return (
        <div
            ref={dropdownRef}
            className="fixed bg-dark-card border border-dark-border rounded-lg shadow-xl overflow-hidden z-50 animate-slide-up"
            style={{
                top: position.top + 'px',
                left: position.left + 'px',
                minWidth: '250px',
                maxWidth: '400px',
                maxHeight: '300px',
                overflowY: 'auto'
            }}
        >
            <div className="px-3 py-2 text-xs font-mono text-dark-muted border-b border-dark-border">
                Link to note (↑↓ navigate, Enter select, Esc cancel)
            </div>
            {suggestions.map((title, index) => (
                <button
                    key={title}
                    onClick={() => onSelect(title)}
                    className={`
                        w-full text-left px-4 py-2 font-mono text-sm
                        transition-colors duration-150
                        ${index === selectedIndex
                            ? 'bg-accent-blue/20 text-white border-l-2 border-accent-blue'
                            : 'text-dark-muted hover:bg-dark-bg hover:text-white'
                        }
                    `}
                >
                    <span className="mr-2">📄</span>
                    {title}
                </button>
            ))}
            {suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-dark-muted font-mono">
                    No matching notes found
                </div>
            )}
        </div>
    );
}

export default NoteLinkAutocomplete;
