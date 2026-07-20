/**
 * Smart Academic Suite - Core Business Logic
 * Includes IAT Tracker, GPA Simulator, Diagnostics Engine, and Transcript Builder
 */
class SmartAcademicSuite {
    constructor(appController) {
        this.app = appController;
        this.activeSuiteTab = 'quick-tools';
        this.sandboxState = []; // Holds temp slider marks
        
        this.initDOMElements();
        this.registerEvents();
    }

    initDOMElements() {
        // Tab selectors
        this.suiteTabBtns = document.querySelectorAll('.suite-tab-btn');
        this.suiteTabPanels = document.querySelectorAll('.suite-tab-panel');

        // IAT DOM elements
        this.iatSyncBtn = document.getElementById('btn-iat-sync');
        this.iatRecalcBtn = document.getElementById('btn-iat-recalc');
        this.iatTbody = document.getElementById('iat-tracker-tbody');

        // Sandbox DOM elements
        this.sandboxSgpa = document.getElementById('sandbox-sgpa');
        this.sandboxCgpa = document.getElementById('sandbox-cgpa');
        this.sandboxTargetSlider = document.getElementById('sandbox-target-sgpa-slider');
        this.sandboxTargetVal = document.getElementById('sandbox-target-sgpa-val');
        this.sandboxSlidersList = document.getElementById('sandbox-sliders-list');
        this.sandboxResetBtn = document.getElementById('btn-reset-sandbox');

        // Diagnostics DOM elements
        this.diagTrendText = document.getElementById('diag-trend-text');
        this.diagTrendDesc = document.getElementById('diag-trend-desc');
        this.diagBacklogCount = document.getElementById('diag-backlog-count');
        this.diagBacklogDesc = document.getElementById('diag-backlog-desc');
        this.diagDomainsList = document.getElementById('diag-domains-list');
        this.diagRecommendationsList = document.getElementById('diag-recommendations-list');

        // Transcript DOM elements
        this.transcriptThemeSelector = document.getElementById('transcript-design-theme');
        this.transcriptToggleChart = document.getElementById('transcript-toggle-chart');
        this.transcriptToggleBadges = document.getElementById('transcript-toggle-badges');
        this.transcriptToggleSubjects = document.getElementById('transcript-toggle-subjects');
        this.btnPrintTranscript = document.getElementById('btn-print-transcript');
        this.transcriptCardContainer = document.getElementById('transcript-card-container');
        this.transChartSection = document.getElementById('trans-chart-section');
        this.transTableSection = document.getElementById('trans-table-section');
        this.transBadgesContainer = document.getElementById('trans-badges-container');
    }

    registerEvents() {
        // Sub-tabs navigation routing
        this.suiteTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-suite-tab');
                this.switchSuiteTab(targetTab);
            });
        });

        // IAT Buttons
        if (this.iatSyncBtn) {
            this.iatSyncBtn.addEventListener('click', () => this.syncIatToMarksTable());
        }
        if (this.iatRecalcBtn) {
            this.iatRecalcBtn.addEventListener('click', () => this.calculateIatRequirements());
        }

        // Sandbox Simulator
        if (this.sandboxTargetSlider) {
            this.sandboxTargetSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.sandboxTargetVal.innerText = val.toFixed(2);
                this.simulateFromTargetSgpa(val);
            });
        }
        if (this.sandboxResetBtn) {
            this.sandboxResetBtn.addEventListener('click', () => {
                this.loadSandboxSimulator();
            });
        }

        // Transcript controls
        if (this.transcriptThemeSelector) {
            this.transcriptThemeSelector.addEventListener('change', (e) => {
                const themeClass = e.target.value;
                // Remove existing theme classes from transcript container
                this.transcriptCardContainer.className = 'transcript-card ' + themeClass;
            });
        }
        if (this.transcriptToggleChart) {
            this.transcriptToggleChart.addEventListener('change', (e) => {
                this.transChartSection.style.display = e.target.checked ? 'block' : 'none';
            });
        }
        if (this.transcriptToggleBadges) {
            this.transcriptToggleBadges.addEventListener('change', (e) => {
                this.transBadgesContainer.style.display = e.target.checked ? 'flex' : 'none';
            });
        }
        if (this.transcriptToggleSubjects) {
            this.transcriptToggleSubjects.addEventListener('change', (e) => {
                this.transTableSection.style.display = e.target.checked ? 'block' : 'none';
            });
        }
        if (this.btnPrintTranscript) {
            this.btnPrintTranscript.addEventListener('click', () => {
                window.print();
            });
        }
    }

    switchSuiteTab(tabId) {
        this.activeSuiteTab = tabId;
        this.suiteTabBtns.forEach(btn => {
            if (btn.getAttribute('data-suite-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.suiteTabPanels.forEach(panel => {
            if (panel.id === `suite-panel-${tabId}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Trigger updates when visiting tab
        if (tabId === 'iat-tracker') {
            this.loadIatTracker();
        } else if (tabId === 'sandbox') {
            this.loadSandboxSimulator();
        } else if (tabId === 'diagnostics') {
            this.runAcademicDiagnostics();
        } else if (tabId === 'transcript') {
            this.buildTranscriptProfile();
        }
    }

    // Called externally by AppController when subjects or details change
    onSemesterDataUpdated() {
        if (this.activeSuiteTab === 'iat-tracker') {
            this.loadIatTracker();
        } else if (this.activeSuiteTab === 'sandbox') {
            this.loadSandboxSimulator();
        } else if (this.activeSuiteTab === 'diagnostics') {
            this.runAcademicDiagnostics();
        } else if (this.activeSuiteTab === 'transcript') {
            this.buildTranscriptProfile();
        }
    }

    /* ==========================================================================
       IAT TRACKER MODULE
       ========================================================================== */
    loadIatTracker() {
        const currentSem = this.app.studentDetails.semester;
        const subjects = StorageManager.getSemesterSubjects(currentSem);
        const activeRules = GradingEngine.getActiveRules(
            this.app.universityConfig.university,
            this.app.universityConfig.regulation,
            this.app.studentDetails.course
        );

        this.iatTbody.innerHTML = '';

        if (subjects.length === 0 || subjects.every(s => !s.code && !s.name)) {
            this.iatTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--color-muted);">No subjects found in Marks Entry table. Please add subjects first.</td></tr>`;
            return;
        }

        subjects.forEach((sub, index) => {
            if (!sub.code && !sub.name) return; // Skip blank lines

            const displayName = sub.code ? `[${sub.code}] ${sub.name || 'Unnamed'}` : sub.name;
            const maxInt = Number(sub.maxInternal) || activeRules.weightage.internal;
            
            // Retrieve previously entered/mock values or set default
            const iat1 = sub.iat1 !== undefined ? sub.iat1 : 35;
            const iat2 = sub.iat2 !== undefined ? sub.iat2 : 35;
            const assignment = sub.assignment !== undefined ? sub.assignment : 8;

            // Calculate current internal scaling
            const calcInternal = this.calcIatWeightedInternals(iat1, iat2, assignment, maxInt);

            // Populate Grade Selector
            let options = '';
            activeRules.grades.forEach(g => {
                if (g.point > 0) { // Only select passing grades for desired goal
                    const selected = (sub.desiredGrade || activeRules.grades[0].grade) === g.grade ? 'selected' : '';
                    options += `<option value="${g.grade}" ${selected}>${g.grade} (GP: ${g.point})</option>`;
                }
            });

            const tr = document.createElement('tr');
            tr.dataset.index = index;
            tr.innerHTML = `
                <td><strong>${displayName}</strong></td>
                <td><input type="number" class="cell-input iat-input-cell iat1" min="0" max="50" value="${iat1}" onchange="window.onIatValueChange(this)"></td>
                <td><input type="number" class="cell-input iat-input-cell iat2" min="0" max="50" value="${iat2}" onchange="window.onIatValueChange(this)"></td>
                <td><input type="number" class="cell-input iat-input-cell assignment" min="0" max="10" value="${assignment}" onchange="window.onIatValueChange(this)"></td>
                <td class="iat-calc-internal" style="font-weight: bold;">${calcInternal.toFixed(1)} / ${maxInt}</td>
                <td>
                    <select class="form-control iat-desired-grade" style="width: 100px; padding: 4px;" onchange="window.onIatValueChange(this)">
                        ${options}
                    </select>
                </td>
                <td class="iat-required-ese" style="font-weight: bold;">Calculating...</td>
                <td><span class="badge-feasibility feasibility-passed" class="iat-status-badge">PENDING</span></td>
            `;

            this.iatTbody.appendChild(tr);
        });

        // Trigger initial calculations
        this.calculateIatRequirements();
    }

    calcIatWeightedInternals(iat1, iat2, assignment, maxInt) {
        // Scaling formula: IAT average scales to 80% of internal weight. Assignment scales to 20%.
        const iatAvg = (Number(iat1) + Number(iat2)) / 2; // out of 50
        const iatContribution = (iatAvg / 50) * (maxInt * 0.8);
        const assignmentContribution = (Number(assignment) / 10) * (maxInt * 0.2);
        const sum = iatContribution + assignmentContribution;
        return Math.min(maxInt, Math.max(0, sum));
    }

    calculateIatRequirements() {
        const currentSem = this.app.studentDetails.semester;
        const subjects = StorageManager.getSemesterSubjects(currentSem);
        const activeRules = GradingEngine.getActiveRules(
            this.app.universityConfig.university,
            this.app.universityConfig.regulation,
            this.app.studentDetails.course
        );

        const rows = this.iatTbody.querySelectorAll('tr');
        rows.forEach(tr => {
            const index = tr.dataset.index;
            if (index === undefined) return;

            const iat1Val = parseFloat(tr.querySelector('.iat1').value) || 0;
            const iat2Val = parseFloat(tr.querySelector('.iat2').value) || 0;
            const assVal = parseFloat(tr.querySelector('.assignment').value) || 0;
            const desiredGrade = tr.querySelector('.iat-desired-grade').value;

            const sub = subjects[index];
            const maxInt = Number(sub.maxInternal) || activeRules.weightage.internal;
            const maxExt = Number(sub.maxExternal) || activeRules.weightage.external;
            const minExtPass = activeRules.passingMarks.minExternal;
            const minTotalPass = activeRules.passingMarks.minTotal;

            // Calculated internal marks
            const internal = this.calcIatWeightedInternals(iat1Val, iat2Val, assVal, maxInt);
            tr.querySelector('.iat-calc-internal').innerText = `${internal.toFixed(1)} / ${maxInt}`;

            // Find grade rules details
            const gradeObj = activeRules.grades.find(g => g.grade === desiredGrade);
            if (!gradeObj) return;

            // Compute needed total score (using the minimum boundary of grade percentage)
            // Grade threshold is a percentage of total marks
            const neededPercentageTotal = gradeObj.min;
            const maxTotalMarks = maxInt + maxExt;
            const neededTotalPoints = (neededPercentageTotal / 100) * maxTotalMarks;

            // Req ESE score calculation
            const neededExternalPoints = neededTotalPoints - internal;
            // Scale needed external points to actual exam marks (since ESE represents external weightage)
            // Weightage of external is maxExt. Exam is graded out of maxExt or 100 (which then scales to maxExt)
            // In the Marks entry: Total = Internal + External. Max Total = MaxInt + MaxExt.
            // External marks input is directly out of maxExt.
            let neededEseScore = neededExternalPoints; // Needed directly out of maxExt
            
            // Limit minimum external exam threshold rules
            if (neededEseScore < minExtPass) {
                neededEseScore = minExtPass; // Must at least satisfy minimal external threshold
            }

            const eseCell = tr.querySelector('.iat-required-ese');
            const badgeCell = tr.querySelector('.badge-feasibility');

            if (neededEseScore > maxExt) {
                // Mathematically impossible
                eseCell.innerText = `N/A`;
                eseCell.style.color = 'var(--color-danger, #ff4d4d)';
                badgeCell.className = 'badge-feasibility feasibility-impossible';
                badgeCell.innerText = 'Impossible ❌';
            } else {
                eseCell.innerText = `${Math.ceil(neededEseScore)} / ${maxExt}`;
                eseCell.style.color = '';

                // Feasibility grading
                const pct = neededEseScore / maxExt;
                if (pct <= 0.7) {
                    badgeCell.className = 'badge-feasibility feasibility-achievable';
                    badgeCell.innerText = 'Achievable ✅';
                } else {
                    badgeCell.className = 'badge-feasibility feasibility-challenging';
                    badgeCell.innerText = 'Challenging ⚠️';
                }
            }
        });
    }

    syncIatToMarksTable() {
        const currentSem = this.app.studentDetails.semester;
        const subjects = StorageManager.getSemesterSubjects(currentSem);
        const activeRules = GradingEngine.getActiveRules(
            this.app.universityConfig.university,
            this.app.universityConfig.regulation,
            this.app.studentDetails.course
        );

        const rows = this.iatTbody.querySelectorAll('tr');
        if (rows.length === 0 || rows[0].querySelector('td').colSpan > 1) {
            this.app.showToast('No subjects to sync.', 'error');
            return;
        }

        // Save inputs state to subjects list
        rows.forEach(tr => {
            const index = tr.dataset.index;
            if (index === undefined) return;

            const iat1Val = parseFloat(tr.querySelector('.iat1').value) || 0;
            const iat2Val = parseFloat(tr.querySelector('.iat2').value) || 0;
            const assVal = parseFloat(tr.querySelector('.assignment').value) || 0;
            const desired = tr.querySelector('.iat-desired-grade').value;

            const sub = subjects[index];
            const maxInt = Number(sub.maxInternal) || activeRules.weightage.internal;
            
            sub.iat1 = iat1Val;
            sub.iat2 = iat2Val;
            sub.assignment = assVal;
            sub.desiredGrade = desired;
            
            // Sync calculated internal to the main internal marks field!
            const internalMarks = parseFloat(this.calcIatWeightedInternals(iat1Val, iat2Val, assVal, maxInt).toFixed(1));
            sub.internal = internalMarks;
        });

        // Save updated subjects back to Storage
        StorageManager.saveSemesterSubjects(currentSem, subjects);

        // Reload the main marks table
        this.app.loadSemesterTable();
        this.app.showToast('Calculated internals synced back to Marks Entry!', 'success');
    }

    /* ==========================================================================
       GPA SIMULATOR & SANDBOX MODULE
       ========================================================================== */
    loadSandboxSimulator() {
        const currentSem = this.app.studentDetails.semester;
        const subjects = StorageManager.getSemesterSubjects(currentSem);
        const allSemesters = StorageManager.getAllSemesterData();
        const activeRules = GradingEngine.getActiveRules(
            this.app.universityConfig.university,
            this.app.universityConfig.regulation,
            this.app.studentDetails.course
        );

        this.sandboxSlidersList.innerHTML = '';
        this.sandboxState = [];

        const validSubjects = subjects.filter(s => s.code || s.name);
        if (validSubjects.length === 0) {
            this.sandboxSlidersList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--color-muted);">Please add subjects with credits in Marks Entry to simulate grades.</div>`;
            this.sandboxSgpa.innerText = '0.00';
            this.sandboxCgpa.innerText = '0.00';
            this.sandboxTargetSlider.disabled = true;
            return;
        }

        this.sandboxTargetSlider.disabled = false;

        validSubjects.forEach((sub, index) => {
            const credits = Number(sub.credits) || 3;
            // Read current marks, default to 75 if empty
            const internal = sub.internal !== '' ? Number(sub.internal) : 0;
            const external = sub.external !== '' ? Number(sub.external) : 0;
            const maxInt = Number(sub.maxInternal) || activeRules.weightage.internal;
            const maxExt = Number(sub.maxExternal) || activeRules.weightage.external;
            const currentTotal = internal + external;
            const maxTotal = maxInt + maxExt;
            const percentage = maxTotal > 0 ? (currentTotal / maxTotal) * 100 : 0;

            const initialMarkPct = sub.status === 'PASS' ? Math.round(percentage) : 75; // Default to 75% for mock simulator if failed/empty

            // Find current grade corresponding to this percentage
            const initialGrade = this.findGradeForPercentage(initialMarkPct, activeRules);

            this.sandboxState.push({
                index: index,
                code: sub.code,
                name: sub.name,
                credits: credits,
                value: initialMarkPct, // active simulated percentage (0-100)
                locked: false,
                maxTotal: maxTotal,
                maxInternal: maxInt,
                maxExternal: maxExt
            });

            const displayName = sub.code ? `[${sub.code}] ${sub.name || ''}` : sub.name;

            const rowDiv = document.createElement('div');
            rowDiv.className = 'sandbox-subject-row';
            rowDiv.dataset.index = index;
            rowDiv.innerHTML = `
                <div class="sandbox-sub-info">
                    <span class="sandbox-sub-code">${sub.code || 'SUB'} (Cr: ${credits})</span>
                    <div class="sandbox-sub-name" title="${displayName}">${sub.name || 'Unnamed Subject'}</div>
                </div>
                <div class="sandbox-sub-controls">
                    <div class="sandbox-slider-wrapper">
                        <input type="range" class="sandbox-marks-slider" min="0" max="100" value="${initialMarkPct}" oninput="window.onSandboxSliderInput(this)">
                        <span class="sandbox-marks-val">${initialMarkPct}%</span>
                    </div>
                    <span class="sandbox-grade-badge">${initialGrade.grade}</span>
                    <div class="sandbox-lock-wrapper">
                        <input type="checkbox" class="sandbox-lock-checkbox" onchange="window.onSandboxLockChange(this)">
                        <label style="margin-bottom: 0; font-size: 11px;">🔒 Lock</label>
                    </div>
                </div>
            `;

            this.sandboxSlidersList.appendChild(rowDiv);
        });

        this.updateSandboxCalculations();
    }

    findGradeForPercentage(pct, activeRules) {
        const matchingGrade = activeRules.grades.find(g => pct >= g.min && pct <= g.max);
        return matchingGrade || { grade: 'F', point: 0 };
    }

    updateSandboxCalculations() {
        const activeRules = GradingEngine.getActiveRules(
            this.app.universityConfig.university,
            this.app.universityConfig.regulation,
            this.app.studentDetails.course
        );

        let weightedPoints = 0;
        let totalCredits = 0;

        // Iterate sandbox items and calculate GPA
        const rows = this.sandboxSlidersList.querySelectorAll('.sandbox-subject-row');
        this.sandboxState.forEach(stateItem => {
            const pct = stateItem.value;
            const gradeObj = this.findGradeForPercentage(pct, activeRules);
            
            // Check if passed based on grade threshold
            const gp = gradeObj.point;
            
            totalCredits += stateItem.credits;
            weightedPoints += (stateItem.credits * gp);

            // Update UI widgets for this row
            const row = rows[stateItem.index];
            if (row) {
                row.querySelector('.sandbox-marks-val').innerText = `${Math.round(pct)}%`;
                const badge = row.querySelector('.sandbox-grade-badge');
                badge.innerText = gradeObj.grade;
                
                // Color badges based on pass status
                if (gp > 0) {
                    badge.style.background = 'rgba(46, 204, 113, 0.2)';
                    badge.style.color = '#2ecc71';
                } else {
                    badge.style.background = 'rgba(231, 76, 60, 0.2)';
                    badge.style.color = '#e74c3c';
                }
            }
        });

        const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits) : 0;
        this.sandboxSgpa.innerText = sgpa.toFixed(2);

        // Recalculate CGPA simulator values
        const currentSem = this.app.studentDetails.semester;
        const allSemesters = StorageManager.getAllSemesterData();
        
        let cgpaTotalCredits = 0;
        let cgpaWeightedPoints = 0;

        Object.keys(allSemesters).forEach(sem => {
            if (String(sem) === String(currentSem)) {
                // Use the simulated SGPA for current semester
                cgpaTotalCredits += totalCredits;
                cgpaWeightedPoints += (sgpa * totalCredits);
            } else {
                // Use real stored values
                const res = AcademicCalculator.calculateSGPA(allSemesters[sem]);
                if (res.totalCredits > 0) {
                    cgpaTotalCredits += res.totalCredits;
                    cgpaWeightedPoints += (res.gpa * res.totalCredits);
                }
            }
        });

        const cgpa = cgpaTotalCredits > 0 ? (cgpaWeightedPoints / cgpaTotalCredits) : 0;
        this.sandboxCgpa.innerText = cgpa.toFixed(2);
    }

    simulateFromTargetSgpa(targetSgpa) {
        const activeRules = GradingEngine.getActiveRules(
            this.app.universityConfig.university,
            this.app.universityConfig.regulation,
            this.app.studentDetails.course
        );

        // Separate locked and unlocked subjects
        const lockedList = this.sandboxState.filter(s => s.locked);
        const unlockedList = this.sandboxState.filter(s => !s.locked);

        if (unlockedList.length === 0) {
            this.app.showToast('All subjects are locked. Unlock at least one to simulate target GPA.', 'warning');
            return;
        }

        const totalCredits = this.sandboxState.reduce((sum, s) => sum + s.credits, 0);
        const targetWeightedPoints = targetSgpa * totalCredits;

        // Sum points contributed by locked subjects
        let lockedWeightedPoints = 0;
        lockedList.forEach(s => {
            const gradeObj = this.findGradeForPercentage(s.value, activeRules);
            lockedWeightedPoints += (s.credits * gradeObj.point);
        });

        // Points needed from unlocked subjects
        const neededWeightedPoints = targetWeightedPoints - lockedWeightedPoints;
        const unlockedCredits = unlockedList.reduce((sum, s) => sum + s.credits, 0);

        if (unlockedCredits === 0) return;

        // Average Grade Point needed for unlocked subjects
        const neededAverageGP = Math.min(10, Math.max(0, neededWeightedPoints / unlockedCredits));

        // Find the percentage threshold needed for this GP
        // Find a grade that has point closest to neededAverageGP
        let matchedGrade = activeRules.grades[0];
        let minDiff = 100;
        activeRules.grades.forEach(g => {
            const diff = Math.abs(g.point - neededAverageGP);
            if (diff < minDiff) {
                minDiff = diff;
                matchedGrade = g;
            }
        });

        // Set all unlocked subjects to the min percentage of matched grade
        // and update sliders
        const targetPercent = matchedGrade.min;

        const rows = this.sandboxSlidersList.querySelectorAll('.sandbox-subject-row');
        unlockedList.forEach(s => {
            s.value = targetPercent;
            const row = rows[s.index];
            if (row) {
                row.querySelector('.sandbox-marks-slider').value = targetPercent;
            }
        });

        // Re-update calculations
        this.updateSandboxCalculations();
    }

    /* ==========================================================================
       ACADEMIC DIAGNOSTICS MODULE
       ========================================================================== */
    runAcademicDiagnostics() {
        const allSemesters = StorageManager.getAllSemesterData();
        const activeRules = GradingEngine.getActiveRules(
            this.app.universityConfig.university,
            this.app.universityConfig.regulation,
            this.app.studentDetails.course
        );

        // 1. Calculate Semester trends
        const sgemList = [];
        Object.keys(allSemesters).forEach(sem => {
            const res = AcademicCalculator.calculateSGPA(allSemesters[sem]);
            if (res.totalCredits > 0) {
                sgemList.push({ sem: parseInt(sem), gpa: res.gpa, failed: res.failedCount });
            }
        });

        // Sort by semester number ascending
        sgemList.sort((a, b) => a.sem - b.sem);

        let trendText = 'Stable 📊';
        let trendDesc = 'You have calculated results for a single semester. Add more semesters to view trend logs.';
        let backlogCount = 0;

        if (sgemList.length > 1) {
            const firstGPA = sgemList[0].gpa;
            const lastGPA = sgemList[sgemList.length - 1].gpa;
            const delta = lastGPA - firstGPA;

            if (delta > 0.5) {
                trendText = 'Outstanding Growth 🚀';
                trendDesc = `Your GPA rose by <strong>+${delta.toFixed(2)}</strong> points from Semester ${sgemList[0].sem} to Semester ${sgemList[sgemList.length-1].sem}. Outstanding academic growth!`;
            } else if (delta > 0.15) {
                trendText = 'Moderate Growth 📈';
                trendDesc = `Your GPA rose by <strong>+${delta.toFixed(2)}</strong> points. Keep up the solid improvement!`;
            } else if (delta < -0.5) {
                trendText = 'Critical Decline ⚠️';
                trendDesc = `Your GPA dropped by <strong>${delta.toFixed(2)}</strong> points. Schedule a counseling review to trace and check performance blockers.`;
            } else if (delta < -0.15) {
                trendText = 'Slight Decline 📉';
                trendDesc = `Your GPA dropped by <strong>${delta.toFixed(2)}</strong> points. Focus on high-credit subjects in your current semester.`;
            } else {
                trendText = 'Steady & Consistent 📊';
                trendDesc = `Your performance is stable, maintaining a narrow delta variation of <strong>${delta.toFixed(2)}</strong> GPA points.`;
            }
        }

        // Backlog count
        sgemList.forEach(s => backlogCount += s.failed);
        
        this.diagTrendText.innerHTML = trendText;
        this.diagTrendText.style.color = trendText.includes('Growth') ? '#2ecc71' : (trendText.includes('Decline') ? '#e74c3c' : '');
        this.diagTrendDesc.innerHTML = trendDesc;
        this.diagBacklogCount.innerText = backlogCount;
        this.diagBacklogCount.style.color = backlogCount > 0 ? '#e74c3c' : '#2ecc71';
        this.diagBacklogDesc.innerText = backlogCount > 0 
            ? `You have ${backlogCount} pending course(s) that require attention. Register for remediation exams immediately.`
            : `All cleared! You have zero backlogs across all semesters.`;

        // 2. Domain classification
        const domains = {
            math: { name: 'Mathematics & Stats 🧠', count: 0, points: 0, credits: 0 },
            cs: { name: 'Computer Science & Coding 💻', count: 0, points: 0, credits: 0 },
            electrical: { name: 'Electrical & Hardware ⚡', count: 0, points: 0, credits: 0 },
            labs: { name: 'Practical Laboratories 🧪', count: 0, points: 0, credits: 0 },
            general: { name: 'Humanities & Management 📚', count: 0, points: 0, credits: 0 }
        };

        Object.keys(allSemesters).forEach(sem => {
            allSemesters[sem].forEach(sub => {
                if (sub.status === 'PENDING') return;

                const code = (sub.code || '').toUpperCase();
                const name = (sub.name || '').toLowerCase();
                const gp = Number(sub.gradePoint) || 0;
                const credits = Number(sub.credits) || 0;

                let cat = 'general';
                
                // Rules classifications
                if (code.startsWith('MA') || code.startsWith('MX') || name.includes('mathematics') || name.includes('algebra') || name.includes('probability') || name.includes('statistics') || name.includes('calculus')) {
                    cat = 'math';
                } else if (code.startsWith('CS') || code.startsWith('IT') || code.startsWith('CP') || name.includes('programming') || name.includes('data structure') || name.includes('algorithm') || name.includes('software') || name.includes('database') || name.includes('computer')) {
                    cat = 'cs';
                } else if (code.startsWith('EE') || code.startsWith('EC') || code.startsWith('EI') || name.includes('circuit') || name.includes('electronics') || name.includes('electrical') || name.includes('microprocessor') || name.includes('signals')) {
                    cat = 'electrical';
                } else if (name.includes('laboratory') || name.includes(' lab') || name.includes('practical') || name.includes('workshop')) {
                    cat = 'labs';
                }

                domains[cat].count++;
                domains[cat].points += (gp * credits);
                domains[cat].credits += credits;
            });
        });

        // Render Domains list
        this.diagDomainsList.innerHTML = '';
        let hasDomains = false;

        Object.keys(domains).forEach(key => {
            const d = domains[key];
            if (d.credits > 0) {
                hasDomains = true;
                const gpa = d.points / d.credits;
                
                const row = document.createElement('div');
                row.className = 'domain-score-row';
                row.innerHTML = `
                    <div class="domain-info">
                        <span class="domain-name">${d.name}</span>
                    </div>
                    <span class="domain-val">${gpa.toFixed(2)} GPA</span>
                `;
                this.diagDomainsList.appendChild(row);
            }
        });

        if (!hasDomains) {
            this.diagDomainsList.innerHTML = `<div style="text-align: center; color: var(--color-muted); padding: 10px;">Input grades in Marks Entry to view domain category analyses.</div>`;
        }

        // 3. Generate Smart Recommendations
        this.diagRecommendationsList.innerHTML = '';
        
        const cgpaRes = AcademicCalculator.calculateCGPA(allSemesters);
        const goalCgpa = parseFloat(this.app.predTargetCGPA.value) || 8.5;

        // Recommendations List Cards
        const recs = [];

        // Backlog card
        if (backlogCount > 0) {
            recs.push({
                type: 'danger',
                icon: '⚠️',
                title: 'Clear Academic Backlogs',
                desc: 'Failed subjects severely impact your CGPA and block graduation eligibility. Prioritize completing re-appear exams immediately.'
            });
        }

        // Target CGPA gap analysis
        if (cgpaRes.cgpa > 0) {
            const gap = goalCgpa - cgpaRes.cgpa;
            if (gap > 0) {
                const remainingSem = 8 - cgpaRes.semestersCount; // Assumes 4 year course
                if (remainingSem > 0) {
                    const neededCgpaTotalPoints = goalCgpa * (cgpaRes.totalCredits + (remainingSem * 22)); // estimate 22 credits per sem
                    const currentPoints = cgpaRes.cgpa * cgpaRes.totalCredits;
                    const neededPointsRemaining = neededCgpaTotalPoints - currentPoints;
                    const neededAverageSGPA = neededPointsRemaining / (remainingSem * 22);

                    if (neededAverageSGPA <= 10) {
                        recs.push({
                            type: 'warning',
                            icon: '🎯',
                            title: 'CGPA Recovery Path',
                            desc: `To hit your target CGPA of <strong>${goalCgpa}</strong>, you need to average an SGPA of <strong>${neededAverageSGPA.toFixed(2)}</strong> over the remaining ${remainingSem} semesters. Maintain discipline!`
                        });
                    } else {
                        recs.push({
                            type: 'danger',
                            icon: '⛔',
                            title: 'CGPA Goal Out of Bounds',
                            desc: `To hit your target CGPA of <strong>${goalCgpa}</strong>, you need an average SGPA of <strong>${neededAverageSGPA.toFixed(2)}</strong> which exceeds the 10.0 scale. Consider adjusting your goal or applying for grade improvements.`
                        });
                    }
                }
            } else {
                recs.push({
                    type: 'success',
                    icon: '🏆',
                    title: 'Target Secured',
                    desc: 'Your current CGPA is higher than your goal! Maintain your active study habits to secure graduating honors.'
                });
            }
        }

        // Domain-specific weaknesses
        Object.keys(domains).forEach(key => {
            const d = domains[key];
            if (d.credits > 0) {
                const gpa = d.points / d.credits;
                if (gpa < 7.0) {
                    if (key === 'math') {
                        recs.push({
                            type: 'warning',
                            icon: '🧠',
                            title: 'Boost Mathematics Foundations',
                            desc: `Your Mathematics GPA is low (<strong>${gpa.toFixed(2)}</strong>). Practice derivations regularly, solve past papers, and review core linear algebra and calculus.`
                        });
                    } else if (key === 'cs') {
                        recs.push({
                            type: 'warning',
                            icon: '💻',
                            title: 'Enhance Coding & CS Fundamentals',
                            desc: `Your Computer Science average is <strong>${gpa.toFixed(2)}</strong>. Dedicate 3 hours weekly to hands-on coding practice. Code compilation builds structural skills!`
                        });
                    } else if (key === 'electrical') {
                        recs.push({
                            type: 'warning',
                            icon: '⚡',
                            title: 'Refining Electrical Principles',
                            desc: `Electrical/Electronics classes (GPA: <strong>${gpa.toFixed(2)}</strong>) require a strong grasp of circuit theory. Focus on node-analysis and practice schematic drawings.`
                        });
                    }
                }
            }
        });

        // Credit weightage advice
        const currentSem = this.app.studentDetails.semester;
        const currentSemSubjects = allSemesters[currentSem] || [];
        const highCreditSubject = currentSemSubjects.reduce((max, s) => (Number(s.credits) || 0) > (Number(max.credits) || 0) ? s : max, { credits: 0 });
        if (highCreditSubject.credits > 3) {
            recs.push({
                type: 'info',
                icon: '🚀',
                title: 'High-Impact Course Focus',
                desc: `Subject <strong>${highCreditSubject.code || highCreditSubject.name || 'Core course'}</strong> has a high credit weight of <strong>${highCreditSubject.credits}</strong>. Excelling in this subject will strongly boost your SGPA this semester.`
            });
        }

        // Render recommendation cards
        if (recs.length === 0) {
            this.diagRecommendationsList.innerHTML = `<div style="text-align: center; color: var(--color-muted); padding: 10px;">Awesome! No warnings or critical recommendations triggered. Keep studying hard!</div>`;
        } else {
            recs.forEach(r => {
                const card = document.createElement('div');
                card.className = `rec-card rec-${r.type}`;
                card.innerHTML = `
                    <span class="rec-icon">${r.icon}</span>
                    <div class="rec-body">
                        <h4>${r.title}</h4>
                        <p>${r.desc}</p>
                    </div>
                `;
                this.diagRecommendationsList.appendChild(card);
            });
        }
    }

    /* ==========================================================================
       ACADEMIC TRANSCRIPT PROFILE MODULE
       ========================================================================== */
    buildTranscriptProfile() {
        const details = this.app.studentDetails;
        const allSemesters = StorageManager.getAllSemesterData();
        const cgpaRes = AcademicCalculator.calculateCGPA(allSemesters);

        // Update basic text nodes
        document.getElementById('trans-student-name').innerText = details.name || 'Student Name';
        document.getElementById('trans-student-college').innerText = details.college || 'University Institution Name';
        document.getElementById('trans-cgpa-value').innerText = cgpaRes.cgpa.toFixed(2);
        
        document.getElementById('trans-reg-no').innerText = details.regNumber || '-';
        document.getElementById('trans-dept').innerText = details.department || '-';
        document.getElementById('trans-course').innerText = `${details.course} (${details.academicYear})`;

        // Avatar initials
        const nameParts = (details.name || 'J D').split(' ');
        const initials = nameParts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('transcript-avatar-img').innerText = initials;

        // Academic Status
        const statusBadge = document.getElementById('trans-status');
        if (cgpaRes.backlogs > 0) {
            statusBadge.className = 'badge badge-failed';
            statusBadge.innerText = 'RE-APPEAR';
        } else {
            statusBadge.className = 'badge badge-passed';
            statusBadge.innerText = 'PASS';
        }

        // Achievements Badges calculation
        const badgesContainer = document.getElementById('trans-badges-container');
        badgesContainer.innerHTML = '';

        const badges = [];
        if (cgpaRes.cgpa >= 9.0) {
            badges.push({ icon: '🥇', label: "Dean's List Honoree" });
        } else if (cgpaRes.cgpa >= 8.0) {
            badges.push({ icon: '🎓', label: "First Class Distinction" });
        }

        if (cgpaRes.cgpa > 0 && cgpaRes.backlogs === 0) {
            badges.push({ icon: '🛡️', label: "Zero Backlogs" });
        }

        // Detect code commando
        let csCredits = 0;
        let csPoints = 0;
        let mathCredits = 0;
        let mathPoints = 0;

        Object.keys(allSemesters).forEach(sem => {
            allSemesters[sem].forEach(sub => {
                const code = (sub.code || '').toUpperCase();
                const gp = Number(sub.gradePoint) || 0;
                const credits = Number(sub.credits) || 0;
                if (code.startsWith('CS') || code.startsWith('IT')) {
                    csCredits += credits;
                    csPoints += (gp * credits);
                }
                if (code.startsWith('MA')) {
                    mathCredits += credits;
                    mathPoints += (gp * credits);
                }
            });
        });

        if (csCredits > 0 && (csPoints / csCredits) >= 9.0) {
            badges.push({ icon: '💻', label: "Code Commando" });
        }
        if (mathCredits > 0 && (mathPoints / mathCredits) >= 9.0) {
            badges.push({ icon: '🧠', label: "Math Wizard" });
        }

        // Comeback kid detection
        let maxIncrease = 0;
        let gpas = [];
        Object.keys(allSemesters).forEach(sem => {
            const res = AcademicCalculator.calculateSGPA(allSemesters[sem]);
            if (res.totalCredits > 0) {
                gpas.push({ sem: parseInt(sem), gpa: res.gpa });
            }
        });
        gpas.sort((a,b) => a.sem - b.sem);
        for (let i = 1; i < gpas.length; i++) {
            const diff = gpas[i].gpa - gpas[i-1].gpa;
            if (diff > maxIncrease) maxIncrease = diff;
        }
        if (maxIncrease >= 1.0) {
            badges.push({ icon: '🚀', label: "Comeback Kid" });
        }

        if (badges.length === 0) {
            badges.push({ icon: '🌟', label: "Academic Scholar" });
        }

        badges.forEach(b => {
            const span = document.createElement('span');
            span.className = 'transcript-badge';
            span.innerHTML = `${b.icon} ${b.label}`;
            badgesContainer.appendChild(span);
        });

        // Populating the Transcript Subject Table
        const tableBody = document.querySelector('#transcript-subjects-table tbody');
        tableBody.innerHTML = '';

        let hasSubjects = false;
        Object.keys(allSemesters).sort((a,b) => parseInt(a) - parseInt(b)).forEach(sem => {
            allSemesters[sem].forEach(sub => {
                if (sub.status === 'PENDING' || (!sub.code && !sub.name)) return;
                hasSubjects = true;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Sem ${sem}</td>
                    <td><strong>${sub.code || '-'}</strong></td>
                    <td>${sub.name || 'Unnamed Subject'}</td>
                    <td>${sub.credits}</td>
                    <td><strong>${sub.grade || '-'}</strong></td>
                    <td>${sub.gradePoint}</td>
                    <td><span class="badge badge-${sub.status.toLowerCase()}">${sub.status}</span></td>
                `;
                tableBody.appendChild(tr);
            });
        });

        if (!hasSubjects) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-muted);">No cleared subjects found. Set details and run calculations.</td></tr>`;
        }

        // Draw Mini Progress chart inside the transcript card
        this.renderTranscriptProgressChart(gpas);
    }

    renderTranscriptProgressChart(gpas) {
        const ctx = document.getElementById('chart-transcript-trend')?.getContext('2d');
        if (!ctx) return;

        // Clear canvas and destroy previous Chart instance if it exists
        if (window.transcriptTrendChartInst) {
            window.transcriptTrendChartInst.destroy();
        }

        if (gpas.length === 0) {
            ctx.clearRect(0, 0, 300, 150);
            return;
        }

        const labels = gpas.map(g => `Sem ${g.sem}`);
        const data = gpas.map(g => g.gpa);

        // Detect transcript theme color
        const theme = this.transcriptThemeSelector.value;
        let lineColor = '#6c63ff';
        let fillColor = 'rgba(108, 99, 255, 0.1)';
        let fontColor = '#a0aec0';

        if (theme === 'trans-theme-cream') {
            lineColor = '#8c7e52';
            fillColor = 'rgba(140, 126, 82, 0.08)';
            fontColor = '#718096';
        } else if (theme === 'trans-theme-cyber') {
            lineColor = '#9b59b6';
            fillColor = 'rgba(155, 89, 182, 0.1)';
            fontColor = '#eae1f9';
        } else if (theme === 'trans-theme-slate') {
            lineColor = '#60a5fa';
            fillColor = 'rgba(96, 165, 250, 0.05)';
            fontColor = '#9ca3af';
        }

        // Render minimal HTML5 canvas chart or Chart.js if imported
        // The original app imports Chart.js globally (as seen in charts.js)
        if (window.Chart) {
            window.transcriptTrendChartInst = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'SGPA',
                        data: data,
                        borderColor: lineColor,
                        backgroundColor: fillColor,
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointBackgroundColor: lineColor
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { color: fontColor, font: { size: 9 } },
                            grid: { color: 'rgba(255,255,255,0.03)' }
                        },
                        y: {
                            min: 0,
                            max: 10,
                            ticks: { color: fontColor, font: { size: 9 }, stepSize: 2 },
                            grid: { color: 'rgba(255,255,255,0.03)' }
                        }
                    }
                }
            });
        }
    }
}

// Global functions for events triggered directly from HTML attributes
window.onIatValueChange = function(input) {
    if (window.academicSuiteInstance) {
        window.academicSuiteInstance.calculateIatRequirements();
    }
};

window.onSandboxSliderInput = function(slider) {
    const row = slider.closest('.sandbox-subject-row');
    const index = parseInt(row.dataset.index);
    const val = parseInt(slider.value);

    if (window.academicSuiteInstance) {
        const stateItem = window.academicSuiteInstance.sandboxState.find(s => s.index === index);
        if (stateItem) {
            stateItem.value = val;
            window.academicSuiteInstance.updateSandboxCalculations();
        }
    }
};

window.onSandboxLockChange = function(checkbox) {
    const row = checkbox.closest('.sandbox-subject-row');
    const index = parseInt(row.dataset.index);
    const checked = checkbox.checked;

    if (window.academicSuiteInstance) {
        const stateItem = window.academicSuiteInstance.sandboxState.find(s => s.index === index);
        if (stateItem) {
            stateItem.locked = checked;
        }
    }
};
