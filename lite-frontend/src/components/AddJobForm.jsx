import { useState } from 'react';
import './AddJobForm.css';

function AddJobForm({ onJobAdded }) {
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        status: 'Applied',
        dateApplied: new Date().toISOString().split('T')[0] // Today's date
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
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

            // Reset form
            setFormData({
                company: '',
                role: '',
                status: 'Applied',
                dateApplied: new Date().toISOString().split('T')[0]
            });

            // Notify parent to refresh the list
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
        <div className="add-job-form-container">
            <h3>➕ Add New Job Application</h3>

            {error && (
                <div className="form-error">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="add-job-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="company">Company *</label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="e.g., Google"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role *</label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="e.g., Software Engineer"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="dateApplied">Date Applied</label>
                        <input
                            type="date"
                            id="dateApplied"
                            name="dateApplied"
                            value={formData.dateApplied}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? '⏳ Adding...' : '✓ Add Job Application'}
                </button>
            </form>
        </div>
    );
}

export default AddJobForm;
