/**
 * Mathematics Calculations Engine for Universal Academic Result Analyzer
 * Handles GPA, SGPA, CGPA, Percentages, predictions, analytics, and rank mapping.
 */
class AcademicCalculator {
    /**
     * Calculate SGPA for a semester
     * Formula: GPA = Σ(Credit * Grade Point) / Σ(Credits)
     * @param {Array} subjects 
     * @returns {Object} { gpa: number, totalCredits: number, earnedCredits: number, passedCount: number, failedCount: number }
     */
    static calculateSGPA(subjects) {
        if (!subjects || subjects.length === 0) {
            return { gpa: 0, totalCredits: 0, earnedCredits: 0, passedCount: 0, failedCount: 0, totalObtained: 0, maxObtained: 0 };
        }

        let totalCredits = 0;
        let earnedCredits = 0;
        let weightedPoints = 0;
        let passedCount = 0;
        let failedCount = 0;
        let totalObtained = 0;
        let maxObtained = 0;

        subjects.forEach(sub => {
            const credits = Number(sub.credits) || 0;
            const gp = Number(sub.gradePoint) || 0;
            const status = sub.status;
            
            if (status === 'PENDING') return; // Skip subjects without marks
            
            totalCredits += credits;
            
            const internal = sub.internal !== '' ? Number(sub.internal) : 0;
            const external = sub.external !== '' ? Number(sub.external) : 0;
            const maxInt = Number(sub.maxInternal) || 40;
            const maxExt = Number(sub.maxExternal) || 60;
            
            totalObtained += (internal + external);
            maxObtained += (maxInt + maxExt);

            if (status === 'PASS') {
                earnedCredits += credits;
                weightedPoints += (credits * gp);
                passedCount++;
            } else {
                failedCount++;
            }
        });

        const gpa = totalCredits > 0 ? (weightedPoints / totalCredits) : 0;

        return {
            gpa: Number(gpa.toFixed(2)),
            totalCredits: totalCredits,
            earnedCredits: earnedCredits,
            passedCount: passedCount,
            failedCount: failedCount,
            totalObtained: totalObtained,
            maxObtained: maxObtained
        };
    }

    /**
     * Calculate Overall CGPA across all semesters
     * Formula: Weighted average of all credits across all semesters
     * @param {Object} semestersData Map of semester to subject list
     * @returns {Object} { cgpa: number, totalCredits: number, earnedCredits: number, backlogs: number }
     */
    static calculateCGPA(semestersData) {
        let totalCredits = 0;
        let earnedCredits = 0;
        let weightedPoints = 0;
        let backlogs = 0;
        let semestersCount = 0;
        const semesterGPAs = {};

        Object.keys(semestersData).forEach(sem => {
            const subjects = semestersData[sem];
            if (!subjects || subjects.length === 0) return;

            const res = this.calculateSGPA(subjects);
            
            totalCredits += res.totalCredits;
            earnedCredits += res.earnedCredits;
            weightedPoints += (res.gpa * res.totalCredits); // Approximate or weighted by credits
            backlogs += res.failedCount;
            semestersCount++;

            semesterGPAs[sem] = res.gpa;
        });

        const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits) : 0;

        return {
            cgpa: Number(cgpa.toFixed(2)),
            totalCredits: totalCredits,
            earnedCredits: earnedCredits,
            backlogs: backlogs,
            semestersCount: semestersCount,
            semesterGPAs: semesterGPAs
        };
    }

    /**
     * Calculate percentage based on selected university formula
     * @param {number} cgpa 
     * @param {number} obtainedTotal 
     * @param {number} maxTotal 
     * @param {string} option '1' (CGPA * 9.5), '2' (Obtained/Max * 100), '3' (Custom)
     * @param {string} customFormulaStr User defined formula
     * @returns {number}
     */
    static calculatePercentage(cgpa, obtainedTotal, maxTotal, option = '1', customFormulaStr = '(CGPA - 0.5) * 10') {
        if (option === '2') {
            if (!maxTotal || maxTotal <= 0) return 0;
            return Number(((obtainedTotal / maxTotal) * 100).toFixed(2));
        }

        if (option === '3') {
            try {
                // Safely sanitize and replace CGPA in custom formula
                const safeFormula = customFormulaStr
                    .replace(/cgpa/gi, String(cgpa))
                    .replace(/[^0-9+\-*/().\s]/g, ''); // Block code injection
                
                // Evaluate mathematical string
                const result = Function(`"use strict"; return (${safeFormula})`)();
                return isNaN(result) ? 0 : Number(Number(result).toFixed(2));
            } catch (err) {
                console.error("Custom formula error evaluation:", err);
                return Number((cgpa * 9.5).toFixed(2)); // Default fallback
            }
        }

        // Option 1 default: CGPA * 9.5
        return Number((cgpa * 9.5).toFixed(2));
    }

    /**
     * Predict division/class classification based on CGPA and rules
     * @param {number} cgpa 
     * @param {number} backlogs 
     * @returns {string} Distinction, First Class, Second Class, Fail
     */
    static getAcademicClass(cgpa, backlogs) {
        if (backlogs > 0) return 'Fail (With Backlogs)';
        if (cgpa >= 8.5) return 'First Class with Distinction';
        if (cgpa >= 6.5) return 'First Class';
        if (cgpa >= 5.0) return 'Second Class';
        return 'Pass Class';
    }

    /**
     * Calculate Attendance Metrics
     * @param {number} conducted 
     * @param {number} attended 
     * @param {number} targetPercent Default 75
     * @returns {Object}
     */
    static calculateAttendance(conducted, attended, targetPercent = 75) {
        if (conducted <= 0) {
            return { percentage: 0, status: 'Not Applicable', shortage: 0, requiredClasses: 0 };
        }

        const percentage = Number(((attended / conducted) * 100).toFixed(2));
        let status = 'Eligible';
        let shortage = 0;
        let requiredClasses = 0;

        if (percentage < targetPercent) {
            status = 'Shortage / Detained';
            const targetRatio = targetPercent / 100;
            const denominator = 1 - targetRatio;
            if (denominator > 0) {
                requiredClasses = Math.ceil(((conducted * targetRatio) - attended) / denominator);
            } else {
                // Target is 100%: must attend all future classes
                requiredClasses = Infinity;
            }
            shortage = Number((targetPercent - percentage).toFixed(2));
        }

        return {
            percentage: percentage,
            status: status,
            shortage: shortage,
            requiredClasses: Math.max(0, requiredClasses)
        };
    }

    /**
     * Predicts required CGPA for a goal
     * @param {number} currentCGPA 
     * @param {number} currentCredits 
     * @param {number} targetCGPA 
     * @param {number} remainingCredits 
     * @returns {number|string} Required GPA for remaining semesters or error message
     */
    static predictFutureGPA(currentCGPA, currentCredits, targetCGPA, remainingCredits) {
        if (remainingCredits <= 0) return 'No remaining credits.';
        
        // Formula: TargetCGPA * (currentCredits + remainingCredits) = (currentCGPA * currentCredits) + (requiredGPA * remainingCredits)
        const totalCredits = currentCredits + remainingCredits;
        const requiredWeighted = (targetCGPA * totalCredits) - (currentCGPA * currentCredits);
        const requiredGPA = requiredWeighted / remainingCredits;

        if (requiredGPA > 10.0) {
            return 'Not possible (Requires > 10.0 GPA).';
        }
        if (requiredGPA < 0) {
            return 'Already achieved! (Requires < 0 GPA).';
        }

        return Number(requiredGPA.toFixed(2));
    }

    /**
     * Predict performance ranking category based on GPA
     * @param {number} gpa 
     * @returns {string} Topper, Excellent, Good, Average, Needs Improvement
     */
    static getRankPrediction(gpa) {
        if (gpa >= 9.5) return 'Topper';
        if (gpa >= 8.5) return 'Excellent';
        if (gpa >= 7.0) return 'Good';
        if (gpa >= 5.0) return 'Average';
        return 'Needs Improvement';
    }

    /**
     * Compute statistics for result summary
     * @param {Array} subjects 
     * @returns {Object}
     */
    static getStatistics(subjects) {
        if (!subjects || subjects.length === 0) return {};

        const marks = subjects.map(s => (Number(s.internal) || 0) + (Number(s.external) || 0));
        const sortedMarks = [...marks].sort((a, b) => a - b);
        
        const highest = Math.max(...marks);
        const lowest = Math.min(...marks);
        
        // Average
        const average = marks.reduce((sum, m) => sum + m, 0) / marks.length;

        // Median
        const mid = Math.floor(sortedMarks.length / 2);
        const median = sortedMarks.length % 2 !== 0 ? sortedMarks[mid] : (sortedMarks[mid - 1] + sortedMarks[mid]) / 2;

        // Mode
        const occurrences = {};
        let maxOcc = 0;
        let mode = [];
        marks.forEach(m => {
            occurrences[m] = (occurrences[m] || 0) + 1;
            if (occurrences[m] > maxOcc) {
                maxOcc = occurrences[m];
            }
        });
        Object.keys(occurrences).forEach(m => {
            if (occurrences[m] === maxOcc) {
                mode.push(Number(m));
            }
        });

        return {
            highest: highest,
            lowest: lowest,
            average: Number(average.toFixed(2)),
            median: Number(median.toFixed(2)),
            mode: mode.join(', ')
        };
    }

    /**
     * Generate descriptive analysis text
     */
    static generateAnalyticalFeedback(subjects, cgpa, resClass) {
        if (!subjects || subjects.length === 0) return 'Enter your subjects details to generate report.';

        let text = '';
        
        // Find best and worst subjects
        let bestSub = subjects[0];
        let worstSub = subjects[0];
        let totalMarkMax = 0;
        
        subjects.forEach(sub => {
            const tot = (Number(sub.internal) || 0) + (Number(sub.external) || 0);
            const bestTot = (Number(bestSub.internal) || 0) + (Number(bestSub.external) || 0);
            const worstTot = (Number(worstSub.internal) || 0) + (Number(worstSub.external) || 0);
            
            if (tot > bestTot) bestSub = sub;
            if (tot < worstTot) worstSub = sub;
        });

        const bestScore = (Number(bestSub.internal) || 0) + (Number(bestSub.external) || 0);
        const worstScore = (Number(worstSub.internal) || 0) + (Number(worstSub.external) || 0);

        if (cgpa >= 8.5) {
            text += '🚀 Excellent Academic Performance! ';
        } else if (cgpa >= 7.0) {
            text += '✨ Good Academic Standing. ';
        } else {
            text += '📈 Average Standing. Focus on improving performance in future semesters. ';
        }

        text += `Your strongest subject is "${bestSub.name || bestSub.code}" with a total mark of ${bestScore}. `;
        
        if (worstScore < 50) {
            text += `⚠️ Needs focus on "${worstSub.name || worstSub.code}" which has a low score of ${worstScore} marks. `;
        } else {
            text += `Your lowest score is in "${worstSub.name || worstSub.code}" with ${worstScore} marks, which is still a stable pass. `;
        }

        text += `Classification: Eligible for ${resClass}. Maintain consistency.`;

        return text;
    }
}
window.AcademicCalculator = AcademicCalculator;
