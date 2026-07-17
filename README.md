# ResultAnalyzer - Universal Indian University Result Analyzer & CGPA Calculator

A comprehensive, offline-ready web application for Indian university students to calculate GPA, CGPA, percentages, and analyze academic performance across multiple semesters.

## Features

- **Multi-University Support** - Anna University (R2013/R2017/R2021/R2025), Delhi University (CBCS), Madras University, and 40+ Indian universities
- **Semester-wise Marks Entry** - Enter internal marks, ESE marks, credits, and attendance for each subject
- **Real-time Grade Calculation** - Instant GPA/CGPA computation as you type
- **Performance Analytics** - Grade distribution charts, GPA trends, subject comparisons
- **CGPA Predictor** - Plan target CGPA for remaining semesters
- **Attendance Tracker** - Monitor attendance eligibility and shortage recovery
- **Grade Improvement Planner** - Estimate CGPA impact of grade improvements
- **University Comparison** - Side-by-side grading system comparison
- **Data Backup & Restore** - Export/import JSON backups
- **Multiple Themes** - Glassmorphism, Dark, Light, Ocean, Forest, Cyber Royal
- **Keyboard Shortcuts** - Ctrl+S (Save), Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+P (Print)
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Canvas API for charts
- LocalStorage for data persistence
- No external dependencies

## Usage

1. Open `index.html` in any modern browser
2. Fill in your student profile on the Home tab
3. Select your university and regulation
4. Enter semester marks and click "Calculate Semester Results"
5. View analytics, export data, or print reports

## Project Structure

```
mark-calculator/
├── index.html          # Main application
├── css/
│   ├── style.css       # Core styles
│   ├── themes.css      # Theme definitions
│   └── responsive.css  # Mobile responsiveness
└── js/
    ├── storage.js      # LocalStorage manager
    ├── validation.js   # Input validation
    ├── grade.js        # Grading engine & presets
    ├── calculator.js   # GPA/CGPA calculations
    ├── charts.js       # Canvas chart rendering
    ├── export.js       # CSV/Excel/PDF export
    └── app.js          # Main application controller
```

## License

MIT License - see [LICENSE](LICENSE) for details.
