import { noteTemplates } from '../utils/noteTemplates';

function TemplateSelector({ isOpen, onSelectTemplate, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-dark-bg border border-dark-border rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="border-b border-dark-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-white font-mono">SELECT_TEMPLATE</h2>
                            <p className="text-xs text-dark-muted font-mono mt-1">Choose a template to start with</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-dark-muted hover:text-white font-mono text-sm transition-colors"
                        >
                            ESC
                        </button>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {noteTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    onSelectTemplate(template);
                                    onClose();
                                }}
                                className="card text-left hover:border-accent-blue transition-all group"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-2xl">{template.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-white font-mono group-hover:text-accent-blue transition-colors">
                                            {template.name}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-dark-muted font-mono leading-relaxed">
                                    {template.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TemplateSelector;
