/**
 * Main Application Controller for Universal Academic Result Analyzer
 * Coordinates routing, DOM events, calculations, charting updates, undo/redo, and settings.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Instantiate controllers
    new AppController();
});

function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

class AppController {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 30;

        this.initDOMElements();
        this.loadInitialState();
        this.registerEvents();
        this.routeTab(this.preferences.activeTab || 'home');
    }

    initDOMElements() {
        // Navigation
        this.navItems = document.querySelectorAll('#sidebar-nav .nav-item');
        this.breadcrumb = document.getElementById('active-breadcrumb');
        
        // Theme & Globals
        this.themeSelector = document.getElementById('theme-selector');
        this.btnFullscreen = document.getElementById('btn-fullscreen');
        this.btnPrint = document.getElementById('btn-print-global');
        this.btnExportBackup = document.getElementById('btn-export-backup');
        
        // Profile Info
        this.profileName = document.getElementById('profile-name');
        this.profileReg = document.getElementById('profile-reg');
        this.profileRoll = document.getElementById('profile-roll');
        this.profileDept = document.getElementById('profile-dept');
        this.profileCourse = document.getElementById('profile-course');
        this.profileSem = document.getElementById('profile-sem');
        this.profileYear = document.getElementById('profile-year');
        this.profileCollege = document.getElementById('profile-college');
        this.btnSaveProfile = document.getElementById('btn-save-profile');
        
        // University Rules configuration
        this.uniSearch = document.getElementById('uni-search');
        this.uniSelect = document.getElementById('uni-select-dropdown');
        this.uniRegulation = document.getElementById('uni-regulation');
        this.uniFormulaOption = document.getElementById('uni-formula-option');
        this.customFormulaGroup = document.getElementById('custom-formula-group');
        this.customFormulaInput = document.getElementById('custom-formula-input');
        
        this.ruleWeightInt = document.getElementById('rule-weight-int');
        this.ruleWeightExt = document.getElementById('rule-weight-ext');
        this.rulePassInt = document.getElementById('rule-pass-int');
        this.rulePassExt = document.getElementById('rule-pass-ext');
        this.rulePassTotal = document.getElementById('rule-pass-total');
        this.gradesDefinitionTableBody = document.querySelector('#grades-definition-table tbody');
        this.btnSaveRules = document.getElementById('btn-save-custom-rules');
        
        // Subject Table
        this.currentSemTitle = document.getElementById('current-sem-title');
        this.subjectSearchBox = document.getElementById('subject-search-box');
        this.subjectFilterDropdown = document.getElementById('subject-filter-dropdown');
        this.subjectTableBody = document.getElementById('subject-table-body');
        
        this.btnAddSubject = document.getElementById('btn-add-subject');
        this.btnResetTable = document.getElementById('btn-reset-table');
        this.btnUndoEntry = document.getElementById('btn-undo-entry');
        this.btnRedoEntry = document.getElementById('btn-redo-entry');
        this.btnAutoFill = document.getElementById('btn-autofill');
        
        this.btnExportCSV = document.getElementById('btn-export-csv');
        this.btnExportExcel = document.getElementById('btn-export-excel');
        this.btnCalculateResults = document.getElementById('btn-calculate-results');

        // Predictors inputs
        this.predTargetCGPA = document.getElementById('pred-target-cgpa');
        this.predCompletedCredits = document.getElementById('pred-completed-credits');
        this.predRemainingCredits = document.getElementById('pred-remaining-credits');
        this.btnPredictGPA = document.getElementById('btn-predict-gpa');
        this.predCgpaResult = document.getElementById('pred-cgpa-result');
        
        this.attConducted = document.getElementById('att-conducted');
        this.attAttended = document.getElementById('att-attended');
        this.attTarget = document.getElementById('att-target');
        this.btnCalculateAttendance = document.getElementById('btn-calculate-attendance');
        this.attCalcResult = document.getElementById('att-calc-result');
        
        this.imprCredits = document.getElementById('impr-credits');
        this.imprCurrentGP = document.getElementById('impr-current-gp');
        this.imprExpectedGP = document.getElementById('impr-expected-gp');
        this.btnCalculateImprovement = document.getElementById('btn-calculate-improvement');
        this.imprCalcResult = document.getElementById('impr-calc-result');
        
        // Comparison Tab
        this.compUni1 = document.getElementById('comp-uni-1');
        this.compUni2 = document.getElementById('comp-uni-2');
        this.btnCompareSystems = document.getElementById('btn-compare-systems');
        this.comparisonTbody = document.getElementById('comparison-tbody');
        this.comparisonHeaderA = document.getElementById('comparison-header-a');
        this.comparisonHeaderB = document.getElementById('comparison-header-b');

        // Settings backups
        this.btnPurgeStorage = document.getElementById('btn-purge-storage');
        this.importJsonFile = document.getElementById('import-json-file');
        this.btnImportFile = document.getElementById('btn-import-file');
    }

    loadInitialState() {
        // Theme
        const activeTheme = StorageManager.getTheme();
        document.documentElement.className = activeTheme;
        this.themeSelector.value = activeTheme;

        // Preferences & Profile
        this.preferences = StorageManager.getPreferences();
        this.studentDetails = StorageManager.getStudentDetails();
        this.universityConfig = StorageManager.getUniversityConfig();

        // Populate Profile Fields
        this.profileName.value = this.studentDetails.name;
        this.profileReg.value = this.studentDetails.regNumber;
        this.profileRoll.value = this.studentDetails.rollNumber;
        this.profileDept.value = this.studentDetails.department;
        this.profileCourse.value = this.studentDetails.course;
        this.profileSem.value = this.studentDetails.semester;
        this.profileYear.value = this.studentDetails.academicYear;
        this.profileCollege.value = this.studentDetails.college;

        // Formulas values
        this.uniFormulaOption.value = this.preferences.percentageFormulaOption;
        this.customFormulaInput.value = this.preferences.customFormulaStr;
        this.toggleCustomFormulaInput();

        // Setup University Lists
        this.populateUniversitySelector();
        this.selectActiveUniversity();
        this.loadRegulationSelector();
        this.loadRegulationRules();

        // Load Semester details in Entry Table
        this.loadSemesterTable();
        
        // Auto comparison fill
        this.populateComparisonDropdowns();
    }

    registerEvents() {
        // Navigation Sidebar Router
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                this.routeTab(tab);
            });
        });

        // Theme Shift
        this.themeSelector.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            document.documentElement.className = newTheme;
            StorageManager.saveTheme(newTheme);
            this.showToast('Theme updated to ' + newTheme.replace('theme-', ''), 'success');
            // Redraw charts using new theme colors
            this.updateAllCharts();
        });

        // Fullscreen
        this.btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    this.showToast('Error enabling fullscreen mode', 'error');
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Global Action Buttons
        this.btnPrint.addEventListener('click', () => ExportManager.printReport());
        this.btnExportBackup.addEventListener('click', () => ExportManager.exportToJSON());
        
        // Profile Save
        this.btnSaveProfile.addEventListener('click', () => {
            this.studentDetails = {
                name: this.profileName.value,
                regNumber: this.profileReg.value,
                rollNumber: this.profileRoll.value,
                department: this.profileDept.value,
                course: this.profileCourse.value,
                semester: this.profileSem.value,
                academicYear: this.profileYear.value,
                college: this.profileCollege.value,
                university: this.uniSelect.options[this.uniSelect.selectedIndex]?.text || 'Anna University',
                date: new Date().toISOString().split('T')[0]
            };
            StorageManager.saveStudentDetails(this.studentDetails);
            
            // Sync breadcrumb & university selectors
            this.universityConfig.university = this.studentDetails.university;
            StorageManager.saveUniversityConfig(this.universityConfig);
            this.selectActiveUniversity();
            
            this.currentSemTitle.innerText = `Semester ${this.studentDetails.semester}`;
            this.loadSemesterTable();

            this.showToast('Profile and active semester saved!', 'success');
        });

        // University Search
        this.uniSearch.addEventListener('input', () => {
            this.populateUniversitySelector(this.uniSearch.value);
        });

        this.uniSelect.addEventListener('change', () => {
            this.universityConfig.university = this.uniSelect.options[this.uniSelect.selectedIndex].text;
            StorageManager.saveUniversityConfig(this.universityConfig);
            this.loadRegulationSelector();
            this.loadRegulationRules();
        });

        this.uniRegulation.addEventListener('change', () => {
            this.universityConfig.regulation = this.uniRegulation.value;
            StorageManager.saveUniversityConfig(this.universityConfig);
            this.loadRegulationRules();
        });

        this.uniFormulaOption.addEventListener('change', () => {
            this.preferences.percentageFormulaOption = this.uniFormulaOption.value;
            StorageManager.savePreferences(this.preferences);
            this.toggleCustomFormulaInput();
        });

        this.customFormulaInput.addEventListener('input', () => {
            this.preferences.customFormulaStr = this.customFormulaInput.value;
            StorageManager.savePreferences(this.preferences);
        });

        // Custom Rule Saves
        this.btnSaveRules.addEventListener('click', () => {
            const activeRules = GradingEngine.getActiveRules(
                this.universityConfig.university,
                this.universityConfig.regulation,
                this.studentDetails.course
            );

            // Read grades table modified percentages
            const gradesData = [];
            const trs = this.gradesDefinitionTableBody.querySelectorAll('tr');
            trs.forEach(tr => {
                const symbol = tr.cells[0].innerText;
                const minVal = Number(tr.cells[1].querySelector('input').value);
                const maxVal = Number(tr.cells[2].querySelector('input').value);
                const gpVal = Number(tr.cells[3].querySelector('input').value);
                const descVal = tr.cells[4].innerText;
                
                gradesData.push({ grade: symbol, min: minVal, max: maxVal, point: gpVal, desc: descVal });
            });

            const newRules = {
                passingMarks: {
                    minInternal: Number(this.rulePassInt.value),
                    minExternal: Number(this.rulePassExt.value),
                    minTotal: Number(this.rulePassTotal.value)
                },
                weightage: {
                    internal: Number(this.ruleWeightInt.value),
                    external: Number(this.ruleWeightExt.value)
                },
                formulaOption: this.uniFormulaOption.value,
                grades: gradesData
            };

            GradingEngine.saveActiveRules(
                this.universityConfig.university,
                this.universityConfig.regulation,
                this.studentDetails.course,
                newRules
            );
            this.showToast('Regulation Rules updated successfully!', 'success');
        });

        // Subject actions
        this.btnAddSubject.addEventListener('click', () => this.addSubjectRow());
        this.btnResetTable.addEventListener('click', () => this.resetSubjectTable());
        
        // Search & Filter within Table
        this.subjectSearchBox.addEventListener('input', () => this.filterSubjectRows());
        this.subjectFilterDropdown.addEventListener('change', () => this.filterSubjectRows());

        // Autofill templates
        this.btnAutoFill.addEventListener('click', () => this.triggerAutoFillPresets());

        // Undo & Redo Actions
        this.btnUndoEntry.addEventListener('click', () => this.triggerUndo());
        this.btnRedoEntry.addEventListener('click', () => this.triggerRedo());

        // Calculations & Exports Trigger
        this.btnCalculateResults.addEventListener('click', () => this.executeSemesterCalculations());
        this.btnExportCSV.addEventListener('click', () => {
            const subjects = this.readSubjectsFromTable();
            ExportManager.exportToCSV(`Semester_${this.studentDetails.semester}`, subjects);
        });
        this.btnExportExcel.addEventListener('click', () => {
            const subjects = this.readSubjectsFromTable();
            ExportManager.exportToExcel(`Semester_${this.studentDetails.semester}`, subjects, this.studentDetails);
        });

        // Predictors Tools
        this.btnPredictGPA.addEventListener('click', () => this.calculateRequiredGPAPrediction());
        this.btnCalculateAttendance.addEventListener('click', () => this.executeAttendanceCalculation());
        this.btnCalculateImprovement.addEventListener('click', () => this.executeImprovementCalculations());

        // Comparison Page
        this.btnCompareSystems.addEventListener('click', () => this.executeSideComparison());

        // JSON Actions settings
        this.btnImportFile.addEventListener('click', () => {
            ExportManager.importFromJSON(this.importJsonFile, () => {
                this.loadInitialState();
            });
        });
        
        this.btnPurgeStorage.addEventListener('click', () => {
            if (confirm('Are you absolutely sure you want to delete all student results and settings? This cannot be recovered!')) {
                StorageManager.clearAllData();
                this.loadInitialState();
                this.showToast('All storage records deleted.', 'error');
            }
        });

        // Keyboard Shortcuts Handler
        document.addEventListener('keydown', (e) => {
            // Ctrl + S: Save student profile
            if (e.ctrlKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                this.btnSaveProfile.click();
            }
            // Ctrl + Z: Undo Row modification
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                this.triggerUndo();
            }
            // Ctrl + Y: Redo Row modification
            if (e.ctrlKey && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                this.triggerRedo();
            }
            // Ctrl + P: Show print panel
            if (e.ctrlKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                ExportManager.printReport();
            }
        });
    }

    routeTab(tabId) {
        // Toggle Sidebar Active styling
        this.navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide all sections and show selected one
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(sec => {
            if (sec.id === tabId) {
                sec.classList.add('active');
            } else {
                sec.classList.remove('active');
            }
        });

        // Update Breadcrumb title
        const map = {
            'home': '🏠 Student Profile Dashboard',
            'uni-selection': '🎓 University Rules Manager',
            'marks-entry': '📋 Academic Marks Entry',
            'analytics': '📊 Performance Charts & Analytics',
            'predictors': '🔮 Predictions & Calculators',
            'comparison': '⚖ University Comparison',
            'settings': '⚙ System Settings'
        };
        this.breadcrumb.innerText = map[tabId] || 'Dashboard';

        // Update Preferences
        this.preferences.activeTab = tabId;
        StorageManager.savePreferences(this.preferences);

        // When visiting charts, update them
        if (tabId === 'analytics') {
            this.updateAllCharts();
        }
    }

    populateUniversitySelector(searchQuery = '') {
        this.uniSelect.innerHTML = '';
        const all = [
            ...GradingEngine.universities.central.map(u => ({ ...u, cat: 'Central Universities' })),
            ...GradingEngine.universities.state.map(u => ({ ...u, cat: 'State Universities' })),
            ...GradingEngine.universities.deemed.map(u => ({ ...u, cat: 'Deemed & Autonomous' }))
        ];

        const filtered = all.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

        // Group options in select dropdown
        const groups = {};
        filtered.forEach(u => {
            if (!groups[u.cat]) {
                groups[u.cat] = [];
            }
            groups[u.cat].push(u);
        });

        Object.keys(groups).forEach(cat => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = cat;
            groups[cat].forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.text = u.name;
                optgroup.appendChild(opt);
            });
            this.uniSelect.appendChild(optgroup);
        });
    }

    selectActiveUniversity() {
        for (let i = 0; i < this.uniSelect.options.length; i++) {
            if (this.uniSelect.options[i].text === this.universityConfig.university) {
                this.uniSelect.selectedIndex = i;
                break;
            }
        }
    }

    loadRegulationSelector() {
        this.uniRegulation.innerHTML = '';
        const uniName = this.universityConfig.university;
        
        if (uniName === 'Anna University') {
            ['R2021', 'R2017', 'R2013', 'R2025'].forEach(reg => {
                const opt = document.createElement('option');
                opt.value = reg;
                opt.text = reg;
                this.uniRegulation.appendChild(opt);
            });
        } else {
            const isCentral = GradingEngine.universities.central.some(u => u.name === uniName);
            const opt = document.createElement('option');
            opt.value = isCentral ? 'CBCS' : 'Standard';
            opt.text = isCentral ? 'UGC CBCS' : 'Standard Semester';
            this.uniRegulation.appendChild(opt);
        }
        
        // Select matching config
        this.uniRegulation.value = this.universityConfig.regulation;
    }

    loadRegulationRules() {
        const activeRules = GradingEngine.getActiveRules(
            this.universityConfig.university,
            this.universityConfig.regulation,
            this.studentDetails.course
        );

        // Populate rules inputs
        this.ruleWeightInt.value = activeRules.weightage.internal;
        this.ruleWeightExt.value = activeRules.weightage.external;
        this.rulePassInt.value = activeRules.passingMarks.minInternal;
        this.rulePassExt.value = activeRules.passingMarks.minExternal;
        this.rulePassTotal.value = activeRules.passingMarks.minTotal;

        // Load grades list rules mapping
        this.gradesDefinitionTableBody.innerHTML = '';
        activeRules.grades.forEach(gradeObj => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${gradeObj.grade}</strong></td>
                <td><input type="number" class="cell-input" style="width: 80px;" value="${gradeObj.min}"></td>
                <td><input type="number" class="cell-input" style="width: 80px;" value="${gradeObj.max}"></td>
                <td><input type="number" class="cell-input" style="width: 80px;" value="${gradeObj.point}" step="0.5"></td>
                <td contenteditable="true">${gradeObj.desc}</td>
            `;
            this.gradesDefinitionTableBody.appendChild(tr);
        });
    }

    toggleCustomFormulaInput() {
        if (this.uniFormulaOption.value === '3') {
            this.customFormulaGroup.style.display = 'block';
        } else {
            this.customFormulaGroup.style.display = 'none';
        }
    }

    populateComparisonDropdowns() {
        this.compUni1.innerHTML = '';
        this.compUni2.innerHTML = '';

        const items = [
            { name: 'Anna University (R2021)', val: 'Anna University_R2021' },
            { name: 'Delhi University (CBCS)', val: 'University of Delhi_CBCS' },
            { name: 'Madras University (Standard)', val: 'Madras University_Standard' },
            { name: 'Anna University (R2013)', val: 'Anna University_R2013' }
        ];

        items.forEach(item => {
            const opt1 = document.createElement('option');
            opt1.value = item.val;
            opt1.text = item.name;
            this.compUni1.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = item.val;
            opt2.text = item.name;
            this.compUni2.appendChild(opt2);
        });
    }

    loadSemesterTable() {
        this.subjectTableBody.innerHTML = '';
        const currentSem = this.studentDetails.semester;
        this.currentSemTitle.innerText = `Semester ${currentSem}`;

        const subjects = StorageManager.getSemesterSubjects(currentSem);

        if (subjects.length === 0) {
            // Seed 4 empty default rows so table isn't blank
            for (let i = 0; i < 4; i++) {
                this.addSubjectRow(null, false);
            }
        } else {
            subjects.forEach(sub => this.addSubjectRow(sub, false));
        }
        
        // Reset undo redo stack for new semester context
        this.undoStack = [];
        this.redoStack = [];
    }

    addSubjectRow(data = null, logChange = true) {
        if (logChange) this.pushToUndo();

        const tr = document.createElement('tr');
        
        // Dynamic placeholders depending on rules
        const activeRules = GradingEngine.getActiveRules(
            this.universityConfig.university,
            this.universityConfig.regulation,
            this.studentDetails.course
        );

        const code = data?.code || '';
        const name = data?.name || '';
        const credits = data?.credits || '4';
        const internal = data?.internal !== undefined ? data.internal : '';
        const external = data?.external !== undefined ? data.external : '';
        const maxInt = data?.maxInternal || activeRules.weightage.internal;
        const maxExt = data?.maxExternal || activeRules.weightage.external;
        const att = data?.attendance !== undefined ? data.attendance : '100';

        const totalMark = data ? (Number(internal) || 0) + (Number(external) || 0) : '';
        const grade = data?.grade || '';
        const gp = data?.gradePoint !== undefined ? data.gradePoint : '';
        const earned = data?.status === 'PASS' ? credits : '0';
        const statusBadge = data?.status 
            ? `<span class="badge badge-${data.status.toLowerCase()}">${data.status}</span>`
            : '-';

        tr.innerHTML = `
            <td data-label="Subject Code"><input type="text" class="cell-input cell-code" value="${escapeAttr(code)}" placeholder="CS3301"></td>
            <td data-label="Subject Name"><input type="text" class="cell-input cell-name" value="${escapeAttr(name)}" placeholder="Data Structures"></td>
            <td data-label="Credits *"><input type="number" class="cell-input cell-credits" value="${escapeAttr(credits)}" min="1" max="10"></td>
            <td data-label="Int Marks"><input type="number" class="cell-input cell-internal" value="${escapeAttr(internal)}"></td>
            <td data-label="Max Int"><input type="number" class="cell-input cell-max-internal" value="${escapeAttr(maxInt)}"></td>
            <td data-label="ESE Marks"><input type="number" class="cell-input cell-external" value="${escapeAttr(external)}"></td>
            <td data-label="Max ESE"><input type="number" class="cell-input cell-max-external" value="${escapeAttr(maxExt)}"></td>
            <td data-label="Max Total" class="cell-max-total">${Number(maxInt) + Number(maxExt)}</td>
            <td data-label="Attendance %"><input type="number" class="cell-input cell-attendance" value="${escapeAttr(att)}" min="0" max="100"></td>
            <td data-label="Grade" class="cell-grade-display" style="font-weight: bold;">${escapeAttr(grade)}</td>
            <td data-label="GP" class="cell-gp-display">${escapeAttr(gp)}</td>
            <td data-label="Earned" class="cell-earned-display">${escapeAttr(earned)}</td>
            <td data-label="Status" class="cell-status-display">${statusBadge}</td>
            <td data-label="Actions">
                <div style="display: flex; gap: 4px;">
                    <button class="btn-row-action" title="Duplicate Row" onclick="window.duplicateSubjectRow(this)">📋</button>
                    <button class="btn-row-action delete" title="Delete Row" onclick="window.deleteSubjectRow(this)">🗑</button>
                </div>
            </td>
        `;

        this.subjectTableBody.appendChild(tr);

        // Bind real-time change triggers
        this.bindRowInputListeners(tr);
    }

    bindRowInputListeners(tr) {
        const inputs = tr.querySelectorAll('.cell-input');
        
        inputs.forEach(input => {
            if (!input.classList.contains('cell-max-internal') && !input.classList.contains('cell-max-external')) {
                input.addEventListener('input', () => {
                    this.calculateSingleRowRealtime(tr);
                });
            }
        });

        // Max internal / max external sum logic
        const maxIntInput = tr.querySelector('.cell-max-internal');
        const maxExtInput = tr.querySelector('.cell-max-external');
        const maxTotalCell = tr.querySelector('.cell-max-total');

        const updateSum = () => {
            const s = (Number(maxIntInput.value) || 0) + (Number(maxExtInput.value) || 0);
            maxTotalCell.innerText = s;
            this.calculateSingleRowRealtime(tr);
        };

        maxIntInput.addEventListener('input', updateSum);
        maxExtInput.addEventListener('input', updateSum);
    }

    calculateSingleRowRealtime(tr) {
        const internalEl = tr.querySelector('.cell-internal');
        const maxIntEl = tr.querySelector('.cell-max-internal');
        const externalEl = tr.querySelector('.cell-external');
        const maxExtEl = tr.querySelector('.cell-max-external');
        const creditsEl = tr.querySelector('.cell-credits');

        const activeRules = GradingEngine.getActiveRules(
            this.universityConfig.university,
            this.universityConfig.regulation,
            this.studentDetails.course
        );

        // Real-time validations
        const intVal = internalEl.value.trim();
        const maxInt = Number(maxIntEl.value) || 40;
        const extVal = externalEl.value.trim();
        const maxExt = Number(maxExtEl.value) || 60;

        // Perform validations and highlight
        ValidationManager.validateMarkInput(internalEl, maxInt);
        ValidationManager.validateMarkInput(externalEl, maxExt);

        if (intVal === '' || extVal === '') {
            // Keep empty values grayed
            tr.querySelector('.cell-grade-display').innerText = '';
            tr.querySelector('.cell-gp-display').innerText = '';
            tr.querySelector('.cell-earned-display').innerText = '';
            tr.querySelector('.cell-status-display').innerText = '-';
            return;
        }

        const internalNum = Number(intVal) || 0;
        const externalNum = Number(extVal) || 0;
        const totalObtained = internalNum + externalNum;
        const totalMax = maxInt + maxExt;

        // Calculate percentage normalized to 100
        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

        // Resolve Grade
        const gradeResult = GradingEngine.calculateSubjectGrade(
            percentage,
            internalNum,
            externalNum,
            activeRules
        );

        // Update displays
        tr.querySelector('.cell-grade-display').innerText = gradeResult.grade;
        tr.querySelector('.cell-gp-display').innerText = gradeResult.point;
        
        const isPass = gradeResult.status === 'PASS';
        const cred = Number(creditsEl.value) || 0;
        tr.querySelector('.cell-earned-display').innerText = isPass ? cred : '0';
        
        const badgeClass = isPass ? 'badge-pass' : 'badge-fail';
        tr.querySelector('.cell-status-display').innerHTML = `
            <span class="badge ${badgeClass}">${gradeResult.status}</span>
        `;
    }

    readSubjectsFromTable() {
        const subjects = [];
        const trs = this.subjectTableBody.querySelectorAll('tr');

        trs.forEach(tr => {
            const code = tr.querySelector('.cell-code').value;
            const name = tr.querySelector('.cell-name').value;
            const credits = tr.querySelector('.cell-credits').value;
            const internal = tr.querySelector('.cell-internal').value;
            const maxInt = tr.querySelector('.cell-max-internal').value;
            const external = tr.querySelector('.cell-external').value;
            const maxExt = tr.querySelector('.cell-max-external').value;
            const att = tr.querySelector('.cell-attendance').value;
            const grade = tr.querySelector('.cell-grade-display').innerText;
            const gp = tr.querySelector('.cell-gp-display').innerText;
            const earned = tr.querySelector('.cell-earned-display').innerText;
            const statusText = tr.querySelector('.cell-status-display').innerText.trim();

            let statusVal, remarksVal;
            if (statusText === 'PASS') {
                statusVal = 'PASS';
                remarksVal = 'Passed';
            } else if (statusText === 'FAIL') {
                statusVal = 'FAIL';
                remarksVal = 'Failed';
            } else {
                statusVal = 'PENDING';
                remarksVal = 'Pending calculation';
            }

            subjects.push({
                code: code,
                name: name,
                credits: credits,
                internal: internal,
                maxInternal: maxInt,
                external: external,
                maxExternal: maxExt,
                attendance: att,
                grade: grade,
                gradePoint: gp,
                earnedCredits: earned,
                status: statusVal,
                remarks: remarksVal
            });
        });

        return subjects;
    }

    resetSubjectTable() {
        this.pushToUndo();
        this.subjectTableBody.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            this.addSubjectRow(null, false);
        }
        this.showToast('Marks table reset.', 'success');
    }

    triggerAutoFillPresets() {
        this.pushToUndo();
        this.subjectTableBody.innerHTML = '';
        
        const presets = [
            { code: 'MA3151', name: 'Matrices and Calculus', credits: '4', internal: '32', external: '48', status: 'PASS' },
            { code: 'PH3151', name: 'Engineering Physics', credits: '3', internal: '34', external: '46', status: 'PASS' },
            { code: 'CY3151', name: 'Engineering Chemistry', credits: '3', internal: '30', external: '50', status: 'PASS' },
            { code: 'GE3151', name: 'Problem Solving & Python', credits: '4', internal: '35', external: '52', status: 'PASS' }
        ];

        presets.forEach(sub => {
            this.addSubjectRow(sub, false);
        });

        // Trigger updates across rows
        const trs = this.subjectTableBody.querySelectorAll('tr');
        trs.forEach(tr => this.calculateSingleRowRealtime(tr));
        
        this.showToast('Sample dataset injected.', 'success');
    }

    filterSubjectRows() {
        const query = this.subjectSearchBox.value.toLowerCase();
        const filterVal = this.subjectFilterDropdown.value;
        const trs = this.subjectTableBody.querySelectorAll('tr');

        // Compile details to identify highest and lowest if needed
        let maxMark = -1;
        let minMark = 999;
        
        trs.forEach(tr => {
            const intVal = Number(tr.querySelector('.cell-internal').value) || 0;
            const extVal = Number(tr.querySelector('.cell-external').value) || 0;
            const tot = intVal + extVal;
            if (tot > maxMark) maxMark = tot;
            if (tot < minMark) minMark = tot;
        });

        trs.forEach(tr => {
            const code = tr.querySelector('.cell-code').value.toLowerCase();
            const name = tr.querySelector('.cell-name').value.toLowerCase();
            const matchesQuery = code.includes(query) || name.includes(query);

            const status = tr.querySelector('.cell-status-display').innerText.trim();
            const intVal = Number(tr.querySelector('.cell-internal').value) || 0;
            const extVal = Number(tr.querySelector('.cell-external').value) || 0;
            const tot = intVal + extVal;

            let matchesFilter = true;
            if (filterVal === 'passed') {
                matchesFilter = status === 'PASS';
            } else if (filterVal === 'failed') {
                matchesFilter = status === 'FAIL';
            } else if (filterVal === 'highest') {
                matchesFilter = tot === maxMark && tot > 0;
            } else if (filterVal === 'lowest') {
                matchesFilter = tot === minMark && tot > 0;
            }

            if (matchesQuery && matchesFilter) {
                tr.style.display = '';
            } else {
                tr.style.display = 'none';
            }
        });
    }

    // Undo / Redo Stacks Actions
    pushToUndo() {
        const currentTableState = this.readSubjectsFromTable();
        this.undoStack.push(JSON.stringify(currentTableState));
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        // Redo stack is wiped on new action
        this.redoStack = [];
    }

    triggerUndo() {
        if (this.undoStack.length === 0) {
            this.showToast('Nothing to undo', 'error');
            return;
        }

        const currentState = JSON.stringify(this.readSubjectsFromTable());
        this.redoStack.push(currentState);

        const prevState = JSON.parse(this.undoStack.pop());
        this.subjectTableBody.innerHTML = '';
        prevState.forEach(sub => this.addSubjectRow(sub, false));
        
        // Recalculate UI displays
        const trs = this.subjectTableBody.querySelectorAll('tr');
        trs.forEach(tr => this.calculateSingleRowRealtime(tr));

        this.showToast('Action Undone', 'success');
    }

    triggerRedo() {
        if (this.redoStack.length === 0) {
            this.showToast('Nothing to redo', 'error');
            return;
        }

        const currentState = JSON.stringify(this.readSubjectsFromTable());
        this.undoStack.push(currentState);

        const nextState = JSON.parse(this.redoStack.pop());
        this.subjectTableBody.innerHTML = '';
        nextState.forEach(sub => this.addSubjectRow(sub, false));
        
        const trs = this.subjectTableBody.querySelectorAll('tr');
        trs.forEach(tr => this.calculateSingleRowRealtime(tr));

        this.showToast('Action Redone', 'success');
    }

    // Mathematical calculations
    executeSemesterCalculations() {
        // Table verification
        const check = ValidationManager.validateTableUI(this.subjectTableBody);
        if (!check.isValid) {
            check.errors.forEach(err => this.showToast(err, 'error'));
            return;
        }

        const subjects = this.readSubjectsFromTable();
        const currentSem = this.studentDetails.semester;
        
        // Save current subjects to storage
        StorageManager.saveSemesterSubjects(currentSem, subjects);

        // Perform Semester Math calculations
        const semStats = AcademicCalculator.calculateSGPA(subjects);
        
        // Save overall CGPA trend variables
        const allSems = StorageManager.getAllSemesterData();
        const cgpaRes = AcademicCalculator.calculateCGPA(allSems);

        // Save percentage based on configuration preference
        const obtainedTotal = semStats.totalObtained;
        const maxTotal = semStats.maxObtained;
        const percentage = AcademicCalculator.calculatePercentage(
            cgpaRes.cgpa,
            obtainedTotal,
            maxTotal,
            this.preferences.percentageFormulaOption,
            this.preferences.customFormulaStr
        );

        // Set Dashboard displays
        document.getElementById('stats-cgpa').innerText = cgpaRes.cgpa.toFixed(2);
        document.getElementById('stats-percentage').innerText = `${percentage.toFixed(2)}%`;
        document.getElementById('stats-credits').innerText = `${cgpaRes.earnedCredits} / ${cgpaRes.totalCredits}`;
        
        const passStatusEl = document.getElementById('stats-pass-status');
        if (cgpaRes.backlogs > 0) {
            passStatusEl.innerText = `RA (${cgpaRes.backlogs})`;
            passStatusEl.parentElement.parentElement.classList.add('row-error');
        } else {
            passStatusEl.innerText = 'PASS';
            passStatusEl.parentElement.parentElement.classList.remove('row-error');
        }

        // Set analytical diagnostics details
        const resClass = AcademicCalculator.getAcademicClass(cgpaRes.cgpa, cgpaRes.backlogs);
        const feedback = AcademicCalculator.generateAnalyticalFeedback(subjects, cgpaRes.cgpa, resClass);
        document.getElementById('performance-feedback-paragraph').innerText = feedback;

        // Set stats cards values
        const overallStats = AcademicCalculator.getStatistics(subjects);
        document.getElementById('stats-high').innerText = overallStats.highest || 0;
        document.getElementById('stats-low').innerText = overallStats.lowest || 0;
        document.getElementById('stats-avg').innerText = overallStats.average || '0.0';
        document.getElementById('stats-median').innerText = overallStats.median || '0.0';

        this.showToast('Calculations completed! Charts generated.', 'success');
        this.routeTab('analytics');
    }

    updateAllCharts() {
        const subjects = this.readSubjectsFromTable();
        const allSems = StorageManager.getAllSemesterData();
        
        // 1. Grade Distribution Pie
        const gradeCounts = {};
        subjects.forEach(sub => {
            if (sub.grade) {
                gradeCounts[sub.grade] = (gradeCounts[sub.grade] || 0) + 1;
            }
        });
        const labelsPie = Object.keys(gradeCounts);
        const dataPie = Object.values(gradeCounts);
        AnalyticsCharts.renderDoughnutChart('chart-grade-dist', labelsPie, dataPie);

        // 2. GPA Trend Line
        const sems = Object.keys(allSems).sort((a,b) => Number(a) - Number(b));
        const semsLabels = sems.map(s => `Sem ${s}`);
        const semsGPAs = sems.map(s => {
            const res = AcademicCalculator.calculateSGPA(allSems[s]);
            return res.gpa;
        });
        AnalyticsCharts.renderLineChart('chart-gpa-trend', semsLabels, semsGPAs);

        // 3. Subject Comparison Bar Chart
        const subCodes = subjects.map(s => s.code || 'Sub');
        const internals = subjects.map(s => Number(s.internal) || 0);
        const externals = subjects.map(s => Number(s.external) || 0);
        AnalyticsCharts.renderBarChart('chart-marks-comparison', subCodes, [
            { label: 'Internal Marks', data: internals },
            { label: 'ESE Marks', data: externals }
        ]);

        // 4. Credit Distribution Doughnut
        const cgpaRes = AcademicCalculator.calculateCGPA(allSems);
        const earned = cgpaRes.earnedCredits;
        const lost = cgpaRes.totalCredits - earned;
        AnalyticsCharts.renderDoughnutChart('chart-credits', ['Earned Credits', 'Lost/Pending'], [earned, lost]);
    }

    // Predictor planners
    calculateRequiredGPAPrediction() {
        const goalCGPA = Number(this.predTargetCGPA.value);
        const completedCred = Number(this.predCompletedCredits.value);
        const remainingCred = Number(this.predRemainingCredits.value);
        
        const allSems = StorageManager.getAllSemesterData();
        const cgpaRes = AcademicCalculator.calculateCGPA(allSems);

        const reqGPA = AcademicCalculator.predictFutureGPA(
            cgpaRes.cgpa || 7.0,
            completedCred,
            goalCGPA,
            remainingCred
        );

        if (typeof reqGPA === 'string') {
            this.predCgpaResult.innerText = `Result: ${reqGPA}`;
            this.predCgpaResult.style.color = 'var(--color-danger)';
        } else {
            this.predCgpaResult.innerText = `Result: You need a GPA of ${reqGPA} in the remaining ${remainingCred} credits.`;
            this.predCgpaResult.style.color = 'var(--color-success)';
        }
    }

    executeAttendanceCalculation() {
        const cond = Number(this.attConducted.value);
        const att = Number(this.attAttended.value);
        const target = Number(this.attTarget.value);

        if (att > cond) {
            this.attCalcResult.innerText = 'Error: Attended classes cannot exceed conducted.';
            this.attCalcResult.style.color = 'var(--color-danger)';
            return;
        }

        const res = AcademicCalculator.calculateAttendance(cond, att, target);

        let reportStr = `Attendance Percentage: ${res.percentage}%<br/>`;
        reportStr += `Eligibility Status: <strong>${res.status}</strong><br/>`;

        if (res.requiredClasses === Infinity) {
            reportStr += `⚠️ Target is 100%. You must attend ALL future classes to reach the target.`;
            this.attCalcResult.style.color = 'var(--color-danger)';
        } else if (res.requiredClasses > 0) {
            reportStr += `⚠️ You need to attend the next <strong>${res.requiredClasses}</strong> classes consecutively to restore attendance.`;
            this.attCalcResult.style.color = 'var(--color-warning)';
        } else {
            reportStr += `✅ You are in a safe zone. Keep it up!`;
            this.attCalcResult.style.color = 'var(--color-success)';
        }

        this.attCalcResult.innerHTML = reportStr;
    }

    executeImprovementCalculations() {
        const cred = Number(this.imprCredits.value);
        const currentGP = Number(this.imprCurrentGP.value);
        const expectedGP = Number(this.imprExpectedGP.value);

        const allSems = StorageManager.getAllSemesterData();
        const cgpaRes = AcademicCalculator.calculateCGPA(allSems);

        if (expectedGP <= currentGP) {
            this.imprCalcResult.innerText = 'Expected GPA must be higher than current GPA.';
            this.imprCalcResult.style.color = 'var(--color-danger)';
            return;
        }

        // Calculate expected shift in CGPA
        // Current weighted points = CGPA * TotalCredits
        // New weighted points = (CGPA * TotalCredits) - (currentGP * cred) + (expectedGP * cred)
        // New CGPA = New weighted points / TotalCredits
        const totalCred = cgpaRes.totalCredits || 30;
        const oldWeighted = cgpaRes.cgpa * totalCred;
        const newWeighted = oldWeighted - (currentGP * cred) + (expectedGP * cred);
        const newCGPA = newWeighted / totalCred;

        const diff = newCGPA - cgpaRes.cgpa;

        this.imprCalcResult.innerText = `CGPA increases by +${diff.toFixed(3)} to ${newCGPA.toFixed(2)}. This boosts overall percentage by approx +${(diff * 9.5).toFixed(2)}%.`;
        this.imprCalcResult.style.color = 'var(--color-success)';
    }

    executeSideComparison() {
        const uniA = this.compUni1.value;
        const uniB = this.compUni2.value;

        const [nameA, regA] = uniA.split('_');
        const [nameB, regB] = uniB.split('_');

        const rulesA = GradingEngine.getActiveRules(nameA, regA, 'Engineering');
        const rulesB = GradingEngine.getActiveRules(nameB, regB, 'Engineering');

        this.comparisonHeaderA.innerText = `${nameA} (${regA})`;
        this.comparisonHeaderB.innerText = `${nameB} (${regB})`;

        this.comparisonTbody.innerHTML = '';

        const metrics = [
            {
                label: 'Internal Assessment Weightage',
                valA: `${rulesA.weightage.internal}%`,
                valB: `${rulesB.weightage.internal}%`
            },
            {
                label: 'ESE External Exam Weightage',
                valA: `${rulesA.weightage.external}%`,
                valB: `${rulesB.weightage.external}%`
            },
            {
                label: 'Passing Marks Required',
                valA: `Int: ${rulesA.passingMarks.minInternal}, Ext: ${rulesA.passingMarks.minExternal}, Total: ${rulesA.passingMarks.minTotal}%`,
                valB: `Int: ${rulesB.passingMarks.minInternal}, Ext: ${rulesB.passingMarks.minExternal}, Total: ${rulesB.passingMarks.minTotal}%`
            },
            {
                label: 'Grades Definitions count',
                valA: `${rulesA.grades.length} Grades`,
                valB: `${rulesB.grades.length} Grades`
            },
            {
                label: 'Pass Grades Thresholds',
                valA: rulesA.grades.filter(g => g.point > 0).map(g => `${g.grade}(${g.min}-${g.max}%)`).join(', '),
                valB: rulesB.grades.filter(g => g.point > 0).map(g => `${g.grade}(${g.min}-${g.max}%)`).join(', ')
            }
        ];

        metrics.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${m.label}</strong></td>
                <td>${m.valA}</td>
                <td>${m.valB}</td>
            `;
            this.comparisonTbody.appendChild(tr);
        });
    }

    showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
}

// Global actions triggers used in inline attributes
window.duplicateSubjectRow = (btn) => {
    const tr = btn.closest('tr');
    const controller = document.querySelector('.app-container').__controller || window.appInstance;
    
    if (controller) {
        controller.pushToUndo();
        const dup = tr.cloneNode(true);
        tr.after(dup);
        
        // Re-bind listeners on cloned element
        controller.bindRowInputListeners(dup);
        controller.showToast('Row duplicated.', 'success');
    }
};

window.deleteSubjectRow = (btn) => {
    const tr = btn.closest('tr');
    const controller = document.querySelector('.app-container').__controller || window.appInstance;
    
    if (controller) {
        controller.pushToUndo();
        tr.parentNode.removeChild(tr);
        controller.showToast('Subject deleted.', 'error');
    }
};

// Store instances globally to bind correctly
const origInit = AppController.prototype.registerEvents;
AppController.prototype.registerEvents = function() {
    window.appInstance = this;
    origInit.call(this);
};
