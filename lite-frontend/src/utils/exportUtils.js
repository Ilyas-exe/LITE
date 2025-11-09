// Export utility functions for Jobs and Tasks

export const exportToCSV = (data, filename, columns) => {
    // Create CSV header
    const header = columns.map(col => col.label).join(',');

    // Create CSV rows
    const rows = data.map(item => {
        return columns.map(col => {
            const value = col.accessor(item);
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportJobsToCSV = (jobs) => {
    const columns = [
        { label: 'Company', accessor: (job) => job.company },
        { label: 'Role', accessor: (job) => job.role },
        { label: 'Status', accessor: (job) => job.status },
        { label: 'Date Applied', accessor: (job) => new Date(job.dateApplied).toLocaleDateString() },
        { label: 'CV Uploaded', accessor: (job) => job.cvUrl ? 'Yes' : 'No' }
    ];

    exportToCSV(jobs, 'job_applications', columns);
};

export const exportTasksToCSV = (tasks) => {
    const columns = [
        { label: 'Title', accessor: (task) => task.title },
        { label: 'Description', accessor: (task) => task.description || '' },
        { label: 'Status', accessor: (task) => task.status },
        { label: 'Priority', accessor: (task) => task.priority || 'Normal' },
        { label: 'Due Date', accessor: (task) => task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A' }
    ];

    exportToCSV(tasks, 'tasks', columns);
};

export const exportJobsToPDF = async (jobs) => {
    // Simple PDF generation using HTML
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Job Applications Report</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'JetBrains Mono', monospace;
                    padding: 40px;
                    background: #0a0a0a;
                    color: #e5e5e5;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 10px;
                    color: #3b82f6;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .subtitle {
                    font-size: 12px;
                    color: #737373;
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th {
                    background: #141414;
                    border: 1px solid #1f1f1f;
                    padding: 12px;
                    text-align: left;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #737373;
                }
                td {
                    border: 1px solid #1f1f1f;
                    padding: 12px;
                    font-size: 12px;
                }
                tr:hover { background: #141414; }
                .status {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 500;
                }
                .status-applied { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .status-interview { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                .status-offer { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .status-rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
            </style>
        </head>
        <body>
            <h1>Job Applications Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()} • Total: ${jobs.length} applications</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Date Applied</th>
                        <th>CV</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobs.map(job => `
                        <tr>
                            <td><strong>${job.company}</strong></td>
                            <td>${job.role}</td>
                            <td><span class="status status-${job.status.toLowerCase()}">${job.status}</span></td>
                            <td>${new Date(job.dateApplied).toLocaleDateString()}</td>
                            <td>${job.cvUrl ? '✓ Yes' : '✗ No'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();

    // Wait for load then print
    setTimeout(() => {
        printWindow.print();
    }, 500);
};

export const exportTasksToPDF = async (tasks) => {
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Tasks Report</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'JetBrains Mono', monospace;
                    padding: 40px;
                    background: #0a0a0a;
                    color: #e5e5e5;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 10px;
                    color: #3b82f6;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .subtitle {
                    font-size: 12px;
                    color: #737373;
                    margin-bottom: 30px;
                }
                .section {
                    margin-bottom: 30px;
                }
                .section-title {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #737373;
                    margin-bottom: 15px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #1f1f1f;
                }
                .task {
                    background: #141414;
                    border: 1px solid #1f1f1f;
                    padding: 15px;
                    margin-bottom: 10px;
                    border-radius: 6px;
                }
                .task-title {
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 5px;
                }
                .task-desc {
                    font-size: 11px;
                    color: #737373;
                }
            </style>
        </head>
        <body>
            <h1>Tasks Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()} • Total: ${tasks.length} tasks</p>
            
            <div class="section">
                <div class="section-title">To Do (${tasks.filter(t => t.status === 'TODO').length})</div>
                ${tasks.filter(t => t.status === 'TODO').map(task => `
                    <div class="task">
                        <div class="task-title">${task.title}</div>
                        <div class="task-desc">${task.description || 'No description'}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <div class="section-title">In Progress (${tasks.filter(t => t.status === 'IN_PROGRESS').length})</div>
                ${tasks.filter(t => t.status === 'IN_PROGRESS').map(task => `
                    <div class="task">
                        <div class="task-title">${task.title}</div>
                        <div class="task-desc">${task.description || 'No description'}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <div class="section-title">Done (${tasks.filter(t => t.status === 'DONE').length})</div>
                ${tasks.filter(t => t.status === 'DONE').map(task => `
                    <div class="task">
                        <div class="task-title">${task.title}</div>
                        <div class="task-desc">${task.description || 'No description'}</div>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
    }, 500);
};

// ============================================
// BACKUP & RESTORE FUNCTIONS
// ============================================

export const exportFullBackup = async () => {
    const token = localStorage.getItem('token');

    try {
        // Fetch all data
        const [jobsRes, tasksRes, kbRes] = await Promise.all([
            fetch('http://localhost:8080/api/jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:8080/api/tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:8080/api/kb/tree', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const jobs = jobsRes.ok ? await jobsRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];
        const kb = kbRes.ok ? await kbRes.json() : {};

        // Create backup object
        const backup = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: {
                jobs,
                tasks,
                knowledgeBase: kb
            }
        };

        // Download as JSON
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `LITE_backup_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true, message: 'Backup created successfully!' };
    } catch (error) {
        console.error('Backup error:', error);
        return { success: false, message: 'Failed to create backup' };
    }
};

export const importBackup = (file, onSuccess, onError) => {
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);

            // Validate backup structure
            if (!backup.data || !backup.version) {
                throw new Error('Invalid backup file format');
            }

            onSuccess(backup);
        } catch (error) {
            console.error('Import error:', error);
            onError(error.message);
        }
    };

    reader.onerror = () => {
        onError('Failed to read file');
    };

    reader.readAsText(file);
};

// ============================================
// NOTE EXPORT FUNCTIONS
// ============================================

export const exportNoteToMarkdown = (note) => {
    const content = `# ${note.title}\n\n${note.content || ''}`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportNoteToPDF = (note) => {
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${note.title}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'JetBrains Mono', monospace;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    background: #0a0a0a;
                    color: #e5e5e5;
                    line-height: 1.6;
                }
                h1 {
                    font-size: 32px;
                    margin-bottom: 20px;
                    color: #3b82f6;
                    border-bottom: 2px solid #1f1f1f;
                    padding-bottom: 10px;
                }
                .content {
                    font-size: 14px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #1f1f1f;
                    font-size: 10px;
                    color: #737373;
                }
            </style>
        </head>
        <body>
            <h1>${note.title}</h1>
            <div class="content">${note.content || 'No content'}</div>
            <div class="footer">
                Exported from LITE Knowledge Base • ${new Date().toLocaleDateString()}
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
    }, 500);
};

export const exportAllNotesToZip = async (notes) => {
    // For now, export as individual markdown files
    // In production, you'd use JSZip library
    notes.forEach((note, index) => {
        setTimeout(() => {
            exportNoteToMarkdown(note);
        }, index * 200); // Stagger downloads
    });
};
