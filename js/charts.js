/**
 * Custom Canvas Charting Engine for Universal Academic Result Analyzer
 * Implements lightweight, responsive charts using HTML5 Canvas API without external packages.
 */
class AnalyticsCharts {
    /**
     * Get colors based on CSS theme variables
     * @returns {Object} Color palette
     */
    static getThemeColors() {
        const rootStyle = getComputedStyle(document.documentElement);
        return {
            primary: rootStyle.getPropertyValue('--color-primary').trim() || '#3b82f6',
            secondary: rootStyle.getPropertyValue('--color-secondary').trim() || '#10b981',
            accent: rootStyle.getPropertyValue('--color-accent').trim() || '#8b5cf6',
            text: rootStyle.getPropertyValue('--color-text').trim() || '#333333',
            muted: rootStyle.getPropertyValue('--color-muted').trim() || '#888888',
            grid: rootStyle.getPropertyValue('--color-border').trim() || 'rgba(0,0,0,0.1)',
            bg: rootStyle.getPropertyValue('--color-card-bg').trim() || '#ffffff',
            colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1']
        };
    }

    /**
     * Clear and resize canvas for High-DPI displays
     */
    static setupCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Return scaling dimensions
        return {
            width: rect.width,
            height: rect.height,
            ctx: ctx
        };
    }

    /**
     * Renders a Line Chart (e.g., Semester GPA Trend)
     */
    static renderLineChart(canvasId, labels, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const { width, height, ctx } = this.setupCanvas(canvas);
        const colors = this.getThemeColors();

        ctx.clearRect(0, 0, width, height);

        const padding = { top: 30, right: 30, bottom: 40, left: 45 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Draw Axes & Grids
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = colors.muted;

        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            const val = (10 - (10 / gridLines) * i).toFixed(1);
            
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            ctx.fillText(val, padding.left - 30, y + 4);
        }

        // Plot Line
        if (!data || data.length === 0) {
            ctx.fillStyle = colors.text;
            ctx.textAlign = 'center';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }

        const points = [];
        const stepX = labels.length > 1 ? chartWidth / (labels.length - 1) : chartWidth;

        data.forEach((val, i) => {
            const x = padding.left + stepX * i;
            // GPA is 0 to 10
            const y = padding.top + chartHeight - (val / 10) * chartHeight;
            points.push({ x, y, val });
            
            // X label
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x, padding.top + chartHeight + 20);
        });

        // Draw Area under curve
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + chartHeight);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
            ctx.closePath();
            
            const areaGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
            areaGrad.addColorStop(0, colors.primary + '40');
            areaGrad.addColorStop(1, colors.primary + '00');
            ctx.fillStyle = areaGrad;
            ctx.fill();
        }

        // Draw Line
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = colors.bg;
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();

            // Point labels
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.val.toFixed(2), p.x, p.y - 10);
        });
    }

    /**
     * Renders a Bar Chart (e.g., Subject-wise Marks)
     */
    static renderBarChart(canvasId, labels, dataSets) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const { width, height, ctx } = this.setupCanvas(canvas);
        const colors = this.getThemeColors();

        ctx.clearRect(0, 0, width, height);

        const padding = { top: 30, right: 30, bottom: 50, left: 45 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Draw grid
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.fillStyle = colors.muted;
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';

        const gridCount = 5;
        for (let i = 0; i <= gridCount; i++) {
            const y = padding.top + (chartHeight / gridCount) * i;
            const val = 100 - (100 / gridCount) * i;
            
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            ctx.fillText(val, padding.left - 10, y + 4);
        }

        if (!labels || labels.length === 0) {
            ctx.textAlign = 'center';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }

        const barGroupWidth = chartWidth / labels.length;
        const spacing = 12;
        const datasetCount = dataSets.length;
        const singleBarWidth = (barGroupWidth - spacing * 2) / datasetCount;

        labels.forEach((label, i) => {
            const groupX = padding.left + barGroupWidth * i + spacing;
            
            // X labels
            ctx.save();
            ctx.translate(groupX + (barGroupWidth - spacing * 2) / 2, padding.top + chartHeight + 15);
            ctx.rotate(-Math.PI / 12);
            ctx.textAlign = 'center';
            ctx.fillStyle = colors.text;
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText(label.length > 12 ? label.substring(0, 10) + '..' : label, 0, 0);
            ctx.restore();

            dataSets.forEach((ds, dIndex) => {
                const val = ds.data[i] || 0;
                const barHeight = (val / 100) * chartHeight;
                const barX = groupX + singleBarWidth * dIndex;
                const barY = padding.top + chartHeight - barHeight;

                // Draw bar with gradient
                const grad = ctx.createLinearGradient(0, barY, 0, padding.top + chartHeight);
                const dsColor = colors.colors[dIndex % colors.colors.length];
                grad.addColorStop(0, dsColor);
                grad.addColorStop(1, dsColor + 'aa');

                ctx.fillStyle = grad;
                
                // Rounded corner rectangles
                ctx.beginPath();
                ctx.roundRect(barX, barY, singleBarWidth - 2, barHeight, [4, 4, 0, 0]);
                ctx.fill();

                // Draw values on top of bars
                ctx.fillStyle = colors.text;
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(Math.round(val), barX + (singleBarWidth - 2) / 2, barY - 4);
            });
        });

        // Draw Legend
        ctx.textAlign = 'left';
        ctx.font = '11px Inter, sans-serif';
        dataSets.forEach((ds, dIndex) => {
            const x = padding.left + dIndex * 120;
            const y = padding.top - 15;
            ctx.fillStyle = colors.colors[dIndex % colors.colors.length];
            ctx.beginPath();
            ctx.roundRect(x, y - 9, 12, 12, 3);
            ctx.fill();

            ctx.fillStyle = colors.text;
            ctx.fillText(ds.label, x + 18, y);
        });
    }

    /**
     * Renders a Pie / Doughnut Chart (e.g., Grade Distribution)
     */
    static renderDoughnutChart(canvasId, labels, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const { width, height, ctx } = this.setupCanvas(canvas);
        const colors = this.getThemeColors();

        ctx.clearRect(0, 0, width, height);

        const total = data.reduce((sum, val) => sum + val, 0);
        const centerX = width * 0.35;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.75;

        if (total === 0) {
            ctx.fillStyle = colors.text;
            ctx.textAlign = 'center';
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }

        let startAngle = -Math.PI / 2;
        ctx.lineWidth = 2;
        ctx.strokeStyle = colors.bg;

        labels.forEach((label, i) => {
            const val = data[i];
            if (val === 0) return;

            const sliceAngle = (val / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors.colors[i % colors.colors.length];
            ctx.fill();
            ctx.stroke();

            startAngle = endAngle;
        });

        // Draw Inner Circle (Doughnut cutout)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = colors.bg;
        ctx.fill();

        // Draw center text
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Total', centerX, centerY - 8);
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(total, centerX, centerY + 10);

        // Draw Legend
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.font = '11px Inter, sans-serif';
        
        labels.forEach((label, i) => {
            const val = data[i];
            const legendX = width * 0.70;
            const legendY = (height / 2) - (labels.length * 10) + (i * 20);

            ctx.fillStyle = colors.colors[i % colors.colors.length];
            ctx.beginPath();
            ctx.roundRect(legendX, legendY - 9, 12, 12, 3);
            ctx.fill();

            ctx.fillStyle = colors.text;
            const pct = ((val / total) * 100).toFixed(0);
            ctx.fillText(`${label}: ${val} (${pct}%)`, legendX + 18, legendY);
        });
    }
}
window.AnalyticsCharts = AnalyticsCharts;
