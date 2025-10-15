document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('sudoku-grid');
    const toggleNotesBtn = document.getElementById('toggle-notes-btn');
    const editNoteBtn = document.getElementById('edit-note-btn');
    const numberButtonsDiv = document.getElementById('number-buttons');
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const menuBtn = document.getElementById('menu-btn');
    const menuModal = document.getElementById('menu-modal');
    const closeMenuModalBtn = document.getElementById('close-menu-modal');
    let board = Array(9).fill().map(() => Array(9).fill(''));
    let selectedNumber = 1; // Default to 1
    let notesVisible = false;
    let editMode = false;
    let manualExcludes = Array(9).fill().map(() => Array(9).fill(new Set()));
    let manualIncludes = Array(9).fill().map(() => Array(9).fill(new Set()));

    // Create number buttons
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'number-button';
        btn.dataset.number = i;
        btn.addEventListener('click', () => {
            selectedNumber = i;
            // Update button styles
            numberButtonsDiv.querySelectorAll('button').forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
            // Highlight cells with the selected number
            highlightSelectedNumber();
        });
        numberButtonsDiv.appendChild(btn);
    }

    // Set default selection to button 1
    const firstButton = numberButtonsDiv.querySelector('button');
    firstButton.classList.add('selected');

    // Initial highlight for default selected number
    highlightSelectedNumber();

    // Function to highlight cells with selected number
    function highlightSelectedNumber() {
        const cells = grid.querySelectorAll('div[data-row]');
        cells.forEach(cell => {
            const input = cell.querySelector('.cell-input');
            const notesDiv = cell.querySelector('.cell-notes');
            const notes = notesDiv.querySelectorAll('.note-item');

            // Remove previous highlights
            input.classList.remove('highlighted');
            notes.forEach(note => note.classList.remove('highlighted'));

            // Highlight if the cell contains the selected number
            if (input.value === selectedNumber.toString()) {
                input.classList.add('highlighted');
            }

            // Highlight notes if notes are visible and contain the selected number
            if (notesVisible) {
                notes.forEach(note => {
                    if (note.textContent === selectedNumber.toString()) {
                        note.classList.add('highlighted');
                    }
                });
            }
        });
    }

    // Create the 9x9 grid
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Add thicker borders for 3x3 blocks
            if (row % 3 === 0) cell.classList.add('thick-top');
            if (col % 3 === 0) cell.classList.add('thick-left');
            if (row === 8) cell.classList.add('thick-bottom');
            if (col === 8) cell.classList.add('thick-right');

            // Input for manual entry
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.className = 'cell-input';
            input.dataset.row = row;
            input.dataset.col = col;
            input.readOnly = true; // Disable keyboard input

            // Notes grid (3x3)
            const notesDiv = document.createElement('div');
            notesDiv.className = 'cell-notes hidden';
            const notes = [];
            for (let c = 0; c < 3; c++) {
                const colDiv = document.createElement('div');
                colDiv.className = 'notes-col';
                for (let r = 0; r < 3; r++) {
                    const note = document.createElement('div');
                    note.className = 'note-item';
                    colDiv.appendChild(note);
                    notes.push(note);
                }
                notesDiv.appendChild(colDiv);
            }

            input.addEventListener('click', () => {
                if (editMode && notesVisible && board[row][col] === '') {
                    // Edit mode: toggle the selected number from notes
                    const notes = notesDiv.querySelectorAll('.note-item');
                    const noteIndex = selectedNumber - 1;
                    const targetNote = notes[noteIndex];
                    const numStr = selectedNumber.toString();

                    if (targetNote.textContent === numStr) {
                        // Note exists, remove it
                        targetNote.textContent = '';
                        manualExcludes[row][col].add(numStr);
                        manualIncludes[row][col].delete(numStr);
                    } else {
                        // Note doesn't exist, add it
                        targetNote.textContent = numStr;
                        manualIncludes[row][col].add(numStr);
                        manualExcludes[row][col].delete(numStr);
                    }
                    updateCellNotes(row, col);
                    // Update highlights after note change
                    highlightSelectedNumber();
                } else if (selectedNumber && !editMode) {
                    if (board[row][col] === selectedNumber.toString()) {
                        // If clicking the same number, clear the cell
                        input.value = '';
                        board[row][col] = '';
                        manualExcludes[row][col].clear();
                        manualIncludes[row][col].clear();
                        notesDiv.classList.remove('hidden');
                    } else {
                        // Fill or overwrite with selected number
                        input.value = selectedNumber;
                        board[row][col] = selectedNumber.toString();
                        manualExcludes[row][col].clear();
                        manualIncludes[row][col].clear();
                        notesDiv.classList.add('hidden');
                    }

                    if (notesVisible) {
                        const affected = getAffectedCells(row, col);
                        affected.forEach(key => {
                            const [i, j] = key.split('-').map(Number);
                            updateCellNotes(i, j);
                        });
                    }
                    // Update highlights after cell change
                    highlightSelectedNumber();
                }
            });

            cell.appendChild(input);
            cell.appendChild(notesDiv);
            grid.appendChild(cell);
        }
    }

    // Function to get display notes for a cell
    function getDisplayNotes(row, col) {
        if (board[row][col] !== '') return [];

        const used = new Set();

        // Check row
        for (let c = 0; c < 9; c++) {
            if (board[row][c] !== '') used.add(board[row][c]);
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (board[r][col] !== '') used.add(board[r][col]);
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (board[r][c] !== '') used.add(board[r][c]);
            }
        }

        let possibles = [1,2,3,4,5,6,7,8,9].filter(num => !used.has(num.toString()));
        let displayNums = new Set(possibles);

        manualIncludes[row][col].forEach(strNum => {
            displayNums.add(parseInt(strNum));
        });

        manualExcludes[row][col].forEach(strNum => {
            displayNums.delete(parseInt(strNum));
        });

        return Array.from(displayNums).sort((a, b) => a - b);
    }

    function getAffectedCells(r, c) {
        const affected = new Set();
        // row
        for (let j = 0; j < 9; j++) {
            if (board[r][j] === '') {
                affected.add(`${r}-${j}`);
            }
        }
        // column
        for (let i = 0; i < 9; i++) {
            if (board[i][c] === '') {
                affected.add(`${i}-${c}`);
            }
        }
        // box
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let i = br; i < br + 3; i++) {
            for (let j = bc; j < bc + 3; j++) {
                if (board[i][j] === '') {
                    affected.add(`${i}-${j}`);
                }
            }
        }
        return affected;
    }

    function updateCellNotes(row, col) {
        const cell = grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;
        const notesDiv = cell.querySelector('.cell-notes');
        if (!notesDiv) return;
        const notes = notesDiv.querySelectorAll('.note-item');
        notes.forEach(note => note.textContent = '');
        if (board[row][col] === '') {
            const possibles = getDisplayNotes(row, col);
            possibles.forEach(num => {
                const index = num - 1;
                notes[index].textContent = num;
            });
            if (notesVisible) {
                notesDiv.classList.remove('hidden');
            } else {
                notesDiv.classList.add('hidden');
            }
        } else {
            notesDiv.classList.add('hidden');
        }
    }


    // Toggle edit mode
    editNoteBtn.addEventListener('click', () => {
        editMode = !editMode;
        if (editMode) {
            editNoteBtn.classList.add('active');
        } else {
            editNoteBtn.classList.remove('active');
        }
    });

    // Toggle notes
    toggleNotesBtn.addEventListener('click', () => {
        notesVisible = !notesVisible;
        const cells = grid.querySelectorAll('div[data-row]');

        if (notesVisible) {
            // Show notes
            cells.forEach(cell => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                if (board[row][col] === '') {
                    updateCellNotes(row, col);
                }
            });
            toggleNotesBtn.textContent = 'Ocultar Notas';
            toggleNotesBtn.classList.add('hide-notes');
            editNoteBtn.disabled = false;
        } else {
            // Hide notes
            cells.forEach(cell => {
                const notesDiv = cell.querySelector('.cell-notes');
                notesDiv.classList.add('hidden');
            });
            toggleNotesBtn.textContent = 'Ver Notas';
            toggleNotesBtn.classList.remove('hide-notes');
            editNoteBtn.disabled = true;
            editMode = false;
            editNoteBtn.classList.remove('active');
            // Reset manual notes when hiding notes
            manualExcludes = Array(9).fill().map(() => Array(9).fill(new Set()));
            manualIncludes = Array(9).fill().map(() => Array(9).fill(new Set()));
        }
        // Update highlights after toggling notes
        highlightSelectedNumber();
    });

    // Menu Modal functionality
    menuBtn.addEventListener('click', () => {
        menuModal.classList.remove('hidden');
    });

    closeMenuModalBtn.addEventListener('click', () => {
        menuModal.classList.add('hidden');
    });

    // Close menu modal when clicking outside
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) {
            menuModal.classList.add('hidden');
        }
    });

    // Info Modal functionality
    infoBtn.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });

    // Close info modal when clicking outside
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.classList.add('hidden');
        }
    });

    // Theme toggle functionality
    const themeLightBtn = document.getElementById('theme-light');
    const themeDarkBtn = document.getElementById('theme-dark');

    function setTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            // Active dark button
            themeDarkBtn.classList.add('active-theme');
            themeLightBtn.classList.remove('active-theme');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            // Active light button
            themeLightBtn.classList.add('active-theme');
            themeDarkBtn.classList.remove('active-theme');
        }
    }

    themeLightBtn.addEventListener('click', () => {
        setTheme(false);
        menuModal.classList.add('hidden');
    });
    themeDarkBtn.addEventListener('click', () => {
        setTheme(true);
        menuModal.classList.add('hidden');
    });

    // Load saved theme on startup
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme === 'dark');
});