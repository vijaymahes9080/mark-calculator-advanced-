/**
 * Export & Backup Manager for Universal Academic Result Analyzer
 * Handles PDF Print previews, CSV, Excel sheets, JSON configuration backups, and PNG captures.
 */
class ExportManager {
    static showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) { alert(message); return; }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => container.removeChild(toast), 300); }, 3000);
    }

    static escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    /**
     * Trigger browser printing for clean PDF reports.
     * Uses print stylesheet overrides.
     */
    static printReport() {
        window.print();
    }

    /**
     * Export semester subjects to CSV file
     * @param {string} semesterTitle 
     * @param {Array} subjects 
     */
    static exportToCSV(semesterTitle, subjects) {
        if (!subjects || subjects.length === 0) {
            this.showToast('No subject data to export.', 'error');
            return;
        }

        const headers = ['Subject Code', 'Subject Name', 'Credits', 'Internal Marks', 'ESE Marks', 'Total Marks', 'Grade', 'Grade Point', 'Status', 'Remarks'];
        const rows = subjects.map(sub => [
            `"${sub.code}"`,
            `"${sub.name}"`,
            sub.credits,
            sub.internal,
            sub.external,
            (Number(sub.internal) || 0) + (Number(sub.external) || 0),
            `"${sub.grade}"`,
            sub.gradePoint,
            `"${sub.status}"`,
            `"${sub.remarks || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${semesterTitle.replace(/\s+/g, '_')}_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Export data as an Excel-readable styled HTML Table
     */
    static exportToExcel(semesterTitle, subjects, studentDetails) {
        if (!subjects || subjects.length === 0) {
            this.showToast('No data to export.', 'error');
            return;
        }

        // Generate styled HTML representation for Excel to interpret
        let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #3b82f6; color: white; font-weight: bold; border: 1px solid #ddd; padding: 8px; }
                td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .title { font-size: 16pt; font-weight: bold; color: #1e3a8a; margin-bottom: 10px; }
                .meta-table td { border: none; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="title">${this.escapeHtml(studentDetails.university)} - Report Card</div>
            <table class="meta-table">
                <tr><td>Student Name:</td><td>${this.escapeHtml(studentDetails.name)}</td><td>Roll Number:</td><td>${this.escapeHtml(studentDetails.rollNumber)}</td></tr>
                <tr><td>Department:</td><td>${this.escapeHtml(studentDetails.department)}</td><td>Semester:</td><td>${this.escapeHtml(semesterTitle)}</td></tr>
                <tr><td>College:</td><td>${this.escapeHtml(studentDetails.college)}</td><td>Date:</td><td>${this.escapeHtml(studentDetails.date)}</td></tr>
            </table>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Credits</th>
                        <th>Internal Marks</th>
                        <th>ESE Marks</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Grade Point</th>
                        <th>Status</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
        `;

        subjects.forEach(sub => {
            html += `
                <tr>
                    <td>${this.escapeHtml(sub.code)}</td>
                    <td>${this.escapeHtml(sub.name)}</td>
                    <td>${this.escapeHtml(sub.credits)}</td>
                    <td>${this.escapeHtml(sub.internal)}</td>
                    <td>${this.escapeHtml(sub.external)}</td>
                    <td>${(Number(sub.internal) || 0) + (Number(sub.external) || 0)}</td>
                    <td>${this.escapeHtml(sub.grade)}</td>
                    <td>${this.escapeHtml(sub.gradePoint)}</td>
                    <td>${this.escapeHtml(sub.status)}</td>
                    <td>${this.escapeHtml(sub.remarks || '')}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${semesterTitle.replace(/\s+/g, '_')}_Report.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Download full application state JSON file
     */
    static exportToJSON() {
        const state = StorageManager.exportFullState();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `academic_report_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Trigger file selector upload and parse imported configuration
     * @param {HTMLInputElement} fileInputEl 
     * @param {Function} callback Callback executed after successful load
     */
    static importFromJSON(fileInputEl, callback) {
        if (!fileInputEl.files || fileInputEl.files.length === 0) {
            this.showToast('Please select a JSON file.', 'error');
            return;
        }

        const file = fileInputEl.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (StorageManager.importFullState(parsed)) {
                    this.showToast('Academic data restored from backup!', 'success');
                    if (callback) callback();
                } else {
                    this.showToast('Invalid file structure.', 'error');
                }
            } catch (err) {
                this.showToast('Failed to parse JSON file.', 'error');
            }
        };

        reader.readAsText(file);
    }

    /**
     * Captures a canvas graphic and triggers direct download as a PNG image
     * @param {string} canvasId 
     * @param {string} filename 
     */
    static exportCanvasAsPNG(canvasId, filename = 'chart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.setAttribute("href", dataUrl);
        link.setAttribute("download", `${filename}.png`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
window.ExportManager = ExportManager;
