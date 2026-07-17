/**
 * Validation Manager for Universal Academic Result Analyzer
 * Provides real-time field level checks, duplicates checking, and threshold warnings.
 */
class ValidationManager {
    /**
     * Validate an input element representing a mark or credit
     * @param {HTMLInputElement} inputEl 
     * @param {number} maxVal 
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateMarkInput(inputEl, maxVal) {
        const valStr = inputEl.value.trim();
        
        // Reset error style
        inputEl.classList.remove('input-error');
        
        if (valStr === '') {
            return { isValid: true, message: '' }; // Allow empty during entry, checked on calculate
        }

        const val = Number(valStr);

        if (isNaN(val)) {
            inputEl.classList.add('input-error');
            return { isValid: false, message: 'Must be a valid number.' };
        }

        if (val < 0) {
            inputEl.classList.add('input-error');
            return { isValid: false, message: 'Negative marks are not allowed.' };
        }

        if (maxVal !== undefined && val > maxVal) {
            inputEl.classList.add('input-error');
            return { isValid: false, message: `Marks (${val}) exceed maximum allowed (${maxVal}).` };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validates a complete subject row data
     * @param {Object} rowData { code, name, credits, internal, maxInternal, external, maxExternal }
     * @returns {Array} List of error messages for this row
     */
    static validateRow(rowData, index = 1) {
        const errors = [];
        
        // Credits are mandatory
        if (!rowData.credits || isNaN(Number(rowData.credits)) || Number(rowData.credits) <= 0) {
            errors.push(`Row ${index}: Credits are mandatory and must be greater than 0.`);
        }

        // Validate internal marks if entered
        if (rowData.internal !== '' && rowData.internal !== null) {
            const internalVal = Number(rowData.internal);
            const maxInt = Number(rowData.maxInternal);
            if (isNaN(internalVal) || internalVal < 0) {
                errors.push(`Row ${index}: Internal marks must be a positive number.`);
            } else if (internalVal > maxInt) {
                errors.push(`Row ${index}: Internal marks (${internalVal}) cannot exceed maximum internal (${maxInt}).`);
            }
        }

        // Validate external marks if entered
        if (rowData.external !== '' && rowData.external !== null) {
            const externalVal = Number(rowData.external);
            const maxExt = Number(rowData.maxExternal);
            if (isNaN(externalVal) || externalVal < 0) {
                errors.push(`Row ${index}: External marks must be a positive number.`);
            } else if (externalVal > maxExt) {
                errors.push(`Row ${index}: External marks (${externalVal}) cannot exceed maximum external (${maxExt}).`);
            }
        }

        // Validate attendance
        if (rowData.attendance !== '' && rowData.attendance !== null) {
            const attVal = Number(rowData.attendance);
            if (isNaN(attVal) || attVal < 0 || attVal > 100) {
                errors.push(`Row ${index}: Attendance must be between 0 and 100.`);
            }
        }

        return errors;
    }

    /**
     * Check if there are duplicate subject codes in a list of rows
     * @param {Array} rows List of row data
     * @returns {string|null} Duplicate code if found, else null
     */
    static checkDuplicateSubjects(rows) {
        const codes = new Set();
        for (let i = 0; i < rows.length; i++) {
            const code = rows[i].code.trim().toUpperCase();
            if (code === '') continue; // Ignore empty codes for verification
            if (codes.has(code)) {
                return code;
            }
            codes.add(code);
        }
        return null;
    }

    /**
     * Performs a comprehensive check on the current UI subject table
     * @param {HTMLTableElement} tableBodyEl 
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateTableUI(tableBodyEl) {
        const errors = [];
        const rowsData = [];
        const trs = tableBodyEl.querySelectorAll('tr');

        trs.forEach((tr, index) => {
            const codeEl = tr.querySelector('.cell-code');
            const nameEl = tr.querySelector('.cell-name');
            const creditsEl = tr.querySelector('.cell-credits');
            const internalEl = tr.querySelector('.cell-internal');
            const maxInternalEl = tr.querySelector('.cell-max-internal');
            const externalEl = tr.querySelector('.cell-external');
            const maxExternalEl = tr.querySelector('.cell-max-external');
            
            if (!codeEl) return;

            const rowData = {
                code: codeEl.value,
                name: nameEl.value,
                credits: creditsEl.value,
                internal: internalEl.value,
                maxInternal: maxInternalEl.value,
                external: externalEl.value,
                maxExternal: maxExternalEl.value,
                attendance: tr.querySelector('.cell-attendance')?.value || ''
            };

            rowsData.push(rowData);

            // Row-specific styling updates
            let rowHasError = false;

            // Highlight empty mandatory fields: Code & Credits
            if (rowData.code.trim() === '') {
                codeEl.classList.add('input-error');
                rowHasError = true;
            } else {
                codeEl.classList.remove('input-error');
            }

            if (rowData.credits.trim() === '' || isNaN(Number(rowData.credits)) || Number(rowData.credits) <= 0) {
                creditsEl.classList.add('input-error');
                rowHasError = true;
            } else {
                creditsEl.classList.remove('input-error');
            }

            // Numerical checks
            const rowErrors = this.validateRow(rowData, index + 1);
            if (rowErrors.length > 0) {
                errors.push(...rowErrors);
                rowHasError = true;
            }

            if (rowHasError) {
                tr.classList.add('row-error');
            } else {
                tr.classList.remove('row-error');
            }
        });

        // Duplicate code verification
        const duplicateCode = this.checkDuplicateSubjects(rowsData);
        if (duplicateCode) {
            errors.push(`Duplicate Subject Code detected: "${duplicateCode}". Each subject must have a unique code.`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}
window.ValidationManager = ValidationManager;
