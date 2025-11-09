import { useState } from 'react';

function AddJobForm({ onJobAdded, onCancel }) {
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        status: 'Applied',
        dateApplied: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.company.trim() || !formData.role.trim()) {
            setError('Company and Role are required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create job application');
            }

            setFormData({
                company: '',
                role: '',
                status: 'Applied',
                dateApplied: new Date().toISOString().split('T')[0]
            });

            onJobAdded();
        } catch (err) {
            setError(err.message);
            console.error('Error creating job:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white font-mono">ADD_APPLICATION</h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-dark-muted hover:text-white transition-colors text-xl"
                    >
                        ×
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/5 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm font-mono mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="company" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Company *
                        </label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Google"
                            required
                            disabled={loading}
                            className="input-field"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="role" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Role *
                        </label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="Software Engineer"
                            required
                            disabled={loading}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="status" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={loading}
                            className="input-field"
                        >
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="dateApplied" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Date Applied
                        </label>
                        <input
                            type="date"
                            id="dateApplied"
                            name="dateApplied"
                            value={formData.dateApplied}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 rounded border border-dark-border text-dark-muted hover:text-white hover:border-white transition-colors font-mono text-sm"
                            disabled={loading}
                        >
                            CANCEL
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 rounded bg-accent-blue hover:bg-accent-blue/80 text-black font-mono text-sm font-medium transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'ADDING...' : 'ADD APPLICATION'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddJobForm;
