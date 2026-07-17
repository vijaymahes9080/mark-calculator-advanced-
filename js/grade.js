/**
 * Grading System & Presets Engine for Universal Academic Result Analyzer
 * Contains presets for Indian Central and State Universities, regulations,
 * courses, and rules manager functions.
 */
class GradingEngineClass {
    constructor() {
        this.initializePresets();
        this.loadCustomConfigs();
    }

    initializePresets() {
        // Universal university list categorized
        this.universities = {
            // Central Universities presets
            central: [
                { id: 'cutn', name: 'Central University of Tamil Nadu' },
                { id: 'du', name: 'University of Delhi' },
                { id: 'jnu', name: 'Jawaharlal Nehru University' },
                { id: 'bhu', name: 'Banaras Hindu University' },
                { id: 'amu', name: 'Aligarh Muslim University' },
                { id: 'uoh', name: 'University of Hyderabad' },
                { id: 'pondi', name: 'Pondicherry University' },
                { id: 'ignou', name: 'Indira Gandhi National Open University' },
                { id: 'cuker', name: 'Central University of Kerala' },
                { id: 'cukar', name: 'Central University of Karnataka' },
                { id: 'curaj', name: 'Central University of Rajasthan' },
                { id: 'cupun', name: 'Central University of Punjab' },
                { id: 'cuhar', name: 'Central University of Haryana' },
                { id: 'cuodi', name: 'Central University of Odisha' },
                { id: 'cujam', name: 'Central University of Jammu' },
                { id: 'vb', name: 'Visva-Bharati' }
            ],
            // State Universities presets
            state: [
                { id: 'anna_univ', name: 'Anna University' },
                { id: 'madras_univ', name: 'Madras University' },
                { id: 'bharathiar', name: 'Bharathiar University' },
                { id: 'bharathidasan', name: 'Bharathidasan University' },
                { id: 'alagappa', name: 'Alagappa University' },
                { id: 'periyar', name: 'Periyar University' },
                { id: 'mother_teresa', name: "Mother Teresa Women's University" },
                { id: 'msu', name: 'Manonmaniam Sundaranar University' },
                { id: 'tnou', name: 'Tamil Nadu Open University' },
                { id: 'mku', name: 'Madurai Kamaraj University' },
                { id: 'annamalai', name: 'Annamalai University' },
                { id: 'calcutta_univ', name: 'Calcutta University' },
                { id: 'mumbai_univ', name: 'Mumbai University' },
                { id: 'osmania', name: 'Osmania University' },
                { id: 'andhra', name: 'Andhra University' },
                { id: 'kerala_univ', name: 'Kerala University' },
                { id: 'kannur', name: 'Kannur University' },
                { id: 'lucknow_univ', name: 'Lucknow University' },
                { id: 'pune_univ', name: 'Pune University' },
                { id: 'bangalore_univ', name: 'Bangalore University' },
                { id: 'mysore_univ', name: 'Mysore University' }
            ],
            // Deemed & Autonomous
            deemed: [
                { id: 'vit', name: 'VIT University' },
                { id: 'srm', name: 'SRM Institute of Science and Technology' },
                { id: 'sathyabama', name: 'Sathyabama Institute of Science and Technology' },
                { id: 'amrita', name: 'Amrita Vishwa Vidyapeetham' },
                { id: 'bits', name: 'BITS Pilani' },
                { id: 'sastra', name: 'SASTRA Deemed University' }
            ]
        };

        // Default configurations & grading templates per Category/Regulation
        this.defaultRules = {
            // Anna University specialized regulations
            'anna_univ': {
                'R2021': {
                    passingMarks: { minInternal: 0, minExternal: 45, minTotal: 50 },
                    weightage: { internal: 40, external: 60 },
                    formulaOption: '1', // CGPA * 9.5
                    grades: [
                        { grade: 'O', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A+', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'A', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'B+', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'B', min: 50, max: 59, point: 6, desc: 'Average' },
                        { grade: 'C', min: 45, max: 49, point: 5, desc: 'Satisfactory' },
                        { grade: 'F', min: 0, max: 44, point: 0, desc: 'Fail/Re-appear' }
                    ]
                },
                'R2017': {
                    passingMarks: { minInternal: 0, minExternal: 45, minTotal: 50 },
                    weightage: { internal: 20, external: 80 },
                    formulaOption: '1',
                    grades: [
                        { grade: 'O', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A+', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'A', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'B+', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'B', min: 50, max: 59, point: 6, desc: 'Average' },
                        { grade: 'RA', min: 0, max: 49, point: 0, desc: 'Re-appear' }
                    ]
                },
                'R2013': {
                    passingMarks: { minInternal: 0, minExternal: 45, minTotal: 50 },
                    weightage: { internal: 20, external: 80 },
                    formulaOption: '1',
                    grades: [
                        { grade: 'S', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'B', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'C', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'D', min: 55, max: 59, point: 6, desc: 'Average' },
                        { grade: 'E', min: 50, max: 54, point: 5, desc: 'Satisfactory' },
                        { grade: 'U', min: 0, max: 49, point: 0, desc: 'Re-appear' }
                    ]
                },
                'R2025': {
                    passingMarks: { minInternal: 20, minExternal: 40, minTotal: 50 }, // New rule proposal
                    weightage: { internal: 50, external: 50 },
                    formulaOption: '1',
                    grades: [
                        { grade: 'O', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A+', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'A', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'B+', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'B', min: 50, max: 59, point: 6, desc: 'Average' },
                        { grade: 'C', min: 45, max: 49, point: 5, desc: 'Pass' },
                        { grade: 'F', min: 0, max: 44, point: 0, desc: 'Fail' }
                    ]
                }
            },
            // Central Universities standard CBCS (Delhi University, CUTN, JNU, etc.)
            'central': {
                'CBCS': {
                    passingMarks: { minInternal: 0, minExternal: 35, minTotal: 40 },
                    weightage: { internal: 25, external: 75 },
                    formulaOption: '1', // CGPA * 9.5
                    grades: [
                        { grade: 'O', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A+', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'A', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'B+', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'B', min: 50, max: 59, point: 6, desc: 'Above Average' },
                        { grade: 'C', min: 45, max: 49, point: 5, desc: 'Average' },
                        { grade: 'P', min: 40, max: 44, point: 4, desc: 'Pass' },
                        { grade: 'F', min: 0, max: 39, point: 0, desc: 'Fail' },
                        { grade: 'Ab', min: 0, max: 0, point: 0, desc: 'Absent' }
                    ]
                }
            },
            // State Universities general templates (Madras Univ, Pune, Osmania, Calcutta, etc.)
            'state': {
                'Standard': {
                    passingMarks: { minInternal: 0, minExternal: 40, minTotal: 40 },
                    weightage: { internal: 25, external: 75 },
                    formulaOption: '1', // CGPA * 9.5
                    grades: [
                        { grade: 'O', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A+', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'A', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'B+', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'B', min: 55, max: 59, point: 6, desc: 'Above Average' },
                        { grade: 'C', min: 50, max: 54, point: 5, desc: 'Average' },
                        { grade: 'P', min: 40, max: 49, point: 4, desc: 'Pass' },
                        { grade: 'F', min: 0, max: 39, point: 0, desc: 'Fail' }
                    ]
                }
            },
            // Engineering Course defaults
            'engineering': {
                'Standard': {
                    passingMarks: { minInternal: 0, minExternal: 45, minTotal: 50 },
                    weightage: { internal: 40, external: 60 },
                    formulaOption: '1',
                    grades: [
                        { grade: 'O', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A+', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'A', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'B+', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'B', min: 50, max: 59, point: 6, desc: 'Average' },
                        { grade: 'C', min: 45, max: 49, point: 5, desc: 'Pass' },
                        { grade: 'F', min: 0, max: 44, point: 0, desc: 'Fail' }
                    ]
                }
            },
            // Arts & Science Course defaults
            'arts_science': {
                'Standard': {
                    passingMarks: { minInternal: 0, minExternal: 30, minTotal: 40 },
                    weightage: { internal: 25, external: 75 },
                    formulaOption: '2', // Total Marks %
                    grades: [
                        { grade: 'O', min: 90, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A+', min: 80, max: 89, point: 9, desc: 'Excellent' },
                        { grade: 'A', min: 70, max: 79, point: 8, desc: 'Very Good' },
                        { grade: 'B+', min: 60, max: 69, point: 7, desc: 'Good' },
                        { grade: 'B', min: 55, max: 59, point: 6, desc: 'Above Average' },
                        { grade: 'C', min: 50, max: 54, point: 5, desc: 'Average' },
                        { grade: 'P', min: 40, max: 49, point: 4, desc: 'Pass' },
                        { grade: 'F', min: 0, max: 39, point: 0, desc: 'Fail' }
                    ]
                }
            },
            // Medical (MBBS/BDS)
            'medical': {
                'Standard': {
                    passingMarks: { minInternal: 50, minExternal: 50, minTotal: 50 },
                    weightage: { internal: 50, external: 50 },
                    formulaOption: '2', // Total obtained %
                    grades: [
                        { grade: 'Distinction', min: 75, max: 100, point: 10, desc: 'First Class with Distinction' },
                        { grade: 'First Class', min: 65, max: 74, point: 8, desc: 'First Class' },
                        { grade: 'Second Class', min: 50, max: 64, point: 6, desc: 'Second Class' },
                        { grade: 'Fail', min: 0, max: 49, point: 0, desc: 'Fail' }
                    ]
                }
            },
            // Law (LLB/LLM)
            'law': {
                'Standard': {
                    passingMarks: { minInternal: 0, minExternal: 40, minTotal: 45 },
                    weightage: { internal: 30, external: 70 },
                    formulaOption: '2',
                    grades: [
                        { grade: 'O', min: 85, max: 100, point: 10, desc: 'Outstanding' },
                        { grade: 'A', min: 75, max: 84, point: 9, desc: 'Excellent' },
                        { grade: 'B+', min: 65, max: 74, point: 8, desc: 'Very Good' },
                        { grade: 'B', min: 55, max: 64, point: 7, desc: 'Good' },
                        { grade: 'C+', min: 50, max: 54, point: 6, desc: 'Average' },
                        { grade: 'C', min: 45, max: 49, point: 5, desc: 'Pass' },
                        { grade: 'F', min: 0, max: 44, point: 0, desc: 'Fail' }
                    ]
                }
            },
            // Diploma / Polytechnic
            'diploma': {
                'Standard': {
                    passingMarks: { minInternal: 0, minExternal: 35, minTotal: 40 },
                    weightage: { internal: 25, external: 75 },
                    formulaOption: '2',
                    grades: [
                        { grade: 'S', min: 90, max: 100, point: 10, desc: 'First Class with Distinction' },
                        { grade: 'A', min: 80, max: 89, point: 9, desc: 'First Class' },
                        { grade: 'B', min: 70, max: 79, point: 8, desc: 'First Class' },
                        { grade: 'C', min: 60, max: 69, point: 7, desc: 'Second Class' },
                        { grade: 'D', min: 50, max: 59, point: 6, desc: 'Second Class' },
                        { grade: 'E', min: 40, max: 49, point: 5, desc: 'Pass' },
                        { grade: 'F', min: 0, max: 39, point: 0, desc: 'Fail' }
                    ]
                }
            }
        };
    }

    /**
     * Load custom regulations and changes saved by the user
     */
    loadCustomConfigs() {
        this.customRules = StorageManager.getCustomRules();
    }

    /**
     * Resolve the grading rule config based on chosen parameters
     * @param {string} university 
     * @param {string} regulation 
     * @param {string} course 
     * @returns {Object}
     */
    getActiveRules(university, regulation, course) {
        // Check if there is a custom rule override
        const key = `${university}_${regulation}_${course}`;
        if (this.customRules[key]) {
            return this.customRules[key];
        }

        // Dedicated Anna University check
        if (university === 'Anna University') {
            const reg = regulation || 'R2021';
            return this.defaultRules['anna_univ'][reg] || this.defaultRules['anna_univ']['R2021'];
        }

        // Check course specific fallback first
        const courseLower = course.toLowerCase().replace(/\s+&\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        // Find university category
        let category = 'state';
        const isCentral = this.universities.central.some(u => u.name === university);
        if (isCentral) {
            category = 'central';
        }

        if (this.defaultRules[courseLower]) {
            return this.defaultRules[courseLower]['Standard'];
        }

        // Standard Central or State backup rules
        return this.defaultRules[category]['CBCS'] || this.defaultRules[category]['Standard'] || this.defaultRules['state']['Standard'];
    }

    /**
     * Update active rules and save to storage
     */
    saveActiveRules(university, regulation, course, ruleConfig) {
        const key = `${university}_${regulation}_${course}`;
        this.customRules[key] = ruleConfig;
        StorageManager.saveCustomRules(this.customRules);
    }

    /**
     * Determine Grade and Grade point for a subject
     * @param {number} percentage 
     * @param {number} internalMark 
     * @param {number} externalMark 
     * @param {Object} rules 
     * @returns {Object} { grade: string, point: number, status: string, remarks: string }
     */
    calculateSubjectGrade(percentage, internalMark, externalMark, rules) {
        const passMarks = rules.passingMarks;
        
        let isPass = true;
        let remarks = 'Pass';

        // Check individual thresholds if defined
        if (internalMark !== null && passMarks.minInternal && internalMark < passMarks.minInternal) {
            isPass = false;
            remarks = 'Failed Internal';
        }

        if (externalMark !== null && passMarks.minExternal && externalMark < passMarks.minExternal) {
            isPass = false;
            remarks = 'Failed ESE (External)';
        }

        if (percentage < passMarks.minTotal) {
            isPass = false;
            remarks = 'Failed Total';
        }

        if (!isPass) {
            // Find fail grade
            const failGradeObj = rules.grades.find(g => g.point === 0) || { grade: 'F', point: 0 };
            return {
                grade: failGradeObj.grade,
                point: 0,
                status: 'FAIL',
                remarks: remarks
            };
        }

        // Match grade based on percentage range
        for (const gradeObj of rules.grades) {
            if (gradeObj.point > 0 && percentage >= gradeObj.min && percentage <= gradeObj.max) {
                return {
                    grade: gradeObj.grade,
                    point: gradeObj.point,
                    status: 'PASS',
                    remarks: percentage >= 90 ? 'Outstanding Performance' : 'Passed'
                };
            }
        }

        // Fallback pass grade
        const passGrades = rules.grades.filter(g => g.point > 0).sort((a,b) => a.point - b.point);
        if (passGrades.length > 0) {
            return {
                grade: passGrades[0].grade,
                point: passGrades[0].point,
                status: 'PASS',
                remarks: 'Passed'
            };
        }

        return {
            grade: 'P',
            point: 4,
            status: 'PASS',
            remarks: 'Passed'
        };
    }
}
const GradingEngine = new GradingEngineClass();
window.GradingEngine = GradingEngine;
