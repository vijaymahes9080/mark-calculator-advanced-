/**
 * Storage Manager for Universal Academic Result Analyzer
 * Handles all offline state persistence using Local Storage API with safe error handling.
 */
class StorageManager {
    static KEYS = {
        STUDENT_DETAILS: 'result_analyzer_student',
        SEMESTER_DATA: 'result_analyzer_semesters',
        UNIVERSITY_CONFIG: 'result_analyzer_university_config',
        CUSTOM_RULES: 'result_analyzer_custom_rules',
        THEME: 'result_analyzer_theme',
        USER_PREFERENCES: 'result_analyzer_preferences'
    };

    /**
     * Save student details to storage
     * @param {Object} details 
     */
    static saveStudentDetails(details) {
        localStorage.setItem(this.KEYS.STUDENT_DETAILS, JSON.stringify(details));
    }

    /**
     * Get student details from storage
     * @returns {Object}
     */
    static getStudentDetails() {
        const defaultDetails = {
            name: '',
            regNumber: '',
            rollNumber: '',
            department: 'Computer Science',
            course: 'B.Tech',
            semester: '1',
            academicYear: '2025-2026',
            college: '',
            university: 'Anna University',
            date: new Date().toISOString().split('T')[0]
        };
        const data = localStorage.getItem(this.KEYS.STUDENT_DETAILS);
        if (!data) return defaultDetails;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing student details:", e);
            return defaultDetails;
        }
    }

    /**
     * Save subjects for a specific semester
     * @param {string|number} semester 
     * @param {Array} subjects 
     */
    static saveSemesterSubjects(semester, subjects) {
        const allSemesters = this.getAllSemesterData();
        allSemesters[semester] = subjects;
        localStorage.setItem(this.KEYS.SEMESTER_DATA, JSON.stringify(allSemesters));
    }

    /**
     * Get subjects for a specific semester
     * @param {string|number} semester 
     * @returns {Array}
     */
    static getSemesterSubjects(semester) {
        const allSemesters = this.getAllSemesterData();
        return allSemesters[semester] || [];
    }

    /**
     * Get subjects for all semesters
     * @returns {Object} Semesters map
     */
    static getAllSemesterData() {
        const data = localStorage.getItem(this.KEYS.SEMESTER_DATA);
        if (!data) return {};
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing semester data:", e);
            return {};
        }
    }

    /**
     * Save complete semester mapping (e.g. from JSON import)
     * @param {Object} semesters 
     */
    static saveAllSemesterData(semesters) {
        localStorage.setItem(this.KEYS.SEMESTER_DATA, JSON.stringify(semesters));
    }

    /**
     * Save current active university & regulation config
     * @param {Object} config { university, regulation }
     */
    static saveUniversityConfig(config) {
        localStorage.setItem(this.KEYS.UNIVERSITY_CONFIG, JSON.stringify(config));
    }

    /**
     * Get current active university & regulation config
     * @returns {Object}
     */
    static getUniversityConfig() {
        const defaultConfig = {
            university: 'Anna University',
            regulation: 'R2021',
            course: 'Engineering',
            department: 'Computer Science'
        };
        const data = localStorage.getItem(this.KEYS.UNIVERSITY_CONFIG);
        if (!data) return defaultConfig;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing university config:", e);
            return defaultConfig;
        }
    }

    /**
     * Save custom modified rules and grading scales
     * @param {Object} rules 
     */
    static saveCustomRules(rules) {
        localStorage.setItem(this.KEYS.CUSTOM_RULES, JSON.stringify(rules));
    }

    /**
     * Get custom modified rules and grading scales
     * @returns {Object}
     */
    static getCustomRules() {
        const data = localStorage.getItem(this.KEYS.CUSTOM_RULES);
        if (!data) return {};
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing custom rules:", e);
            return {};
        }
    }

    /**
     * Save theme setting
     * @param {string} theme 
     */
    static saveTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    }

    /**
     * Get theme setting
     * @returns {string}
     */
    static getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'theme-glass';
    }

    /**
     * Save general preferences (e.g., active tab, formula choice)
     * @param {Object} preferences 
     */
    static savePreferences(preferences) {
        const current = this.getPreferences();
        localStorage.setItem(this.KEYS.USER_PREFERENCES, JSON.stringify({ ...current, ...preferences }));
    }

    /**
     * Get general preferences
     * @returns {Object}
     */
    static getPreferences() {
        const defaultPreferences = {
            percentageFormulaOption: '1', // '1' = CGPA * 9.5, '2' = Max/Obtained, '3' = Custom
            customFormulaStr: '(CGPA - 0.5) * 10',
            activeTab: 'home'
        };
        const data = localStorage.getItem(this.KEYS.USER_PREFERENCES);
        if (!data) return defaultPreferences;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing preferences:", e);
            return defaultPreferences;
        }
    }

    /**
     * Clear all local storage data associated with the app
     */
    static clearAllData() {
        localStorage.removeItem(this.KEYS.STUDENT_DETAILS);
        localStorage.removeItem(this.KEYS.SEMESTER_DATA);
        localStorage.removeItem(this.KEYS.UNIVERSITY_CONFIG);
        localStorage.removeItem(this.KEYS.CUSTOM_RULES);
        localStorage.removeItem(this.KEYS.THEME);
        localStorage.removeItem(this.KEYS.USER_PREFERENCES);
    }

    /**
     * Import full application state from a JSON object
     * @param {Object} state 
     * @returns {boolean} Success status
     */
    static importFullState(state) {
        try {
            if (!state) return false;
            
            if (state.student) this.saveStudentDetails(state.student);
            if (state.semesters) this.saveAllSemesterData(state.semesters);
            if (state.universityConfig) this.saveUniversityConfig(state.universityConfig);
            if (state.customRules) this.saveCustomRules(state.customRules);
            if (state.theme) this.saveTheme(state.theme);
            if (state.preferences) this.savePreferences(state.preferences);
            
            return true;
        } catch (e) {
            console.error("Error importing state:", e);
            return false;
        }
    }

    /**
     * Export full application state as a JSON object
     * @returns {Object}
     */
    static exportFullState() {
        return {
            student: this.getStudentDetails(),
            semesters: this.getAllSemesterData(),
            universityConfig: this.getUniversityConfig(),
            customRules: this.getCustomRules(),
            theme: this.getTheme(),
            preferences: this.getPreferences(),
            exportedAt: new Date().toISOString()
        };
    }
}
window.StorageManager = StorageManager;
