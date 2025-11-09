import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

function KeyboardShortcutsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-white font-mono">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="text-dark-muted hover:text-white transition-colors text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {KEYBOARD_SHORTCUTS.map((category, idx) => (
                        <div key={idx}>
                            <h3 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-3 font-mono">
                                {category.category}
                            </h3>
                            <div className="space-y-2">
                                {category.shortcuts.map((shortcut, sIdx) => (
                                    <div key={sIdx} className="flex items-center justify-between py-2 px-3 rounded hover:bg-white/5">
                                        <span className="text-sm text-white font-mono">
                                            {shortcut.description}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, kIdx) => (
                                                <span key={kIdx}>
                                                    <kbd className="px-2 py-1 bg-dark-card border border-dark-border rounded text-xs font-mono text-dark-muted">
                                                        {key}
                                                    </kbd>
                                                    {kIdx < shortcut.keys.length - 1 && (
                                                        <span className="mx-1 text-dark-muted">+</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-dark-border">
                    <p className="text-xs text-dark-muted font-mono text-center">
                        Press <kbd className="px-2 py-1 bg-dark-card border border-dark-border rounded text-xs">?</kbd> anytime to show this help
                    </p>
                </div>
            </div>
        </div>
    );
}

export default KeyboardShortcutsModal;
