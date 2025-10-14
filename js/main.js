document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('sudoku-grid');
    const toggleNotesBtn = document.getElementById('toggle-notes-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const numberButtonsDiv = document.getElementById('number-buttons');
    let board = Array(9).fill().map(() => Array(9).fill(''));
    let selectedNumber = 1; // Default to 1
    let notesVisible = false;
    let deleteMode = false;

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
                if (deleteMode && notesVisible && board[row][col] === '') {
                    // Edit mode: toggle the selected number from notes
                    const notes = notesDiv.querySelectorAll('.note-item');
                    const noteIndex = selectedNumber - 1;
                    const targetNote = notes[noteIndex];

                    if (targetNote.textContent === selectedNumber.toString()) {
                        // Note exists, remove it
                        targetNote.textContent = '';
                    } else {
                        // Note doesn't exist, add it
                        targetNote.textContent = selectedNumber;
                    }
                    // Update highlights after note change
                    highlightSelectedNumber();
                } else if (selectedNumber && !deleteMode) {
                    if (board[row][col] === selectedNumber.toString()) {
                        // If clicking the same number, clear the cell
                        input.value = '';
                        board[row][col] = '';
                        notesDiv.classList.remove('hidden');
                        if (notesVisible) {
                            updateNotes();
                        }
                    } else {
                        // Fill or overwrite with selected number
                        input.value = selectedNumber;
                        board[row][col] = selectedNumber.toString();
                        notesDiv.classList.add('hidden');
                        if (notesVisible) {
                            updateNotes();
                        }
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

    // Function to get possible numbers for a cell
    function getPossibleNumbers(row, col) {
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

        return [1,2,3,4,5,6,7,8,9].filter(num => !used.has(num.toString()));
    }

    // Function to update notes for all cells
    function updateNotes() {
        const cells = grid.querySelectorAll('div[data-row]');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (board[row][col] === '') {
                const possibles = getPossibleNumbers(row, col);
                const notesDiv = cell.querySelector('.cell-notes');
                const notes = notesDiv.querySelectorAll('.note-item');
                notes.forEach(note => note.textContent = '');
                possibles.forEach(num => {
                    const index = num - 1;
                    notes[index].textContent = num;
                });
                notesDiv.classList.remove('hidden');
            }
        });
    }

    // Toggle delete mode
    deleteNoteBtn.addEventListener('click', () => {
        deleteMode = !deleteMode;
        if (deleteMode) {
            deleteNoteBtn.classList.add('active');
        } else {
            deleteNoteBtn.classList.remove('active');
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
                    const possibles = getPossibleNumbers(row, col);
                    const notesDiv = cell.querySelector('.cell-notes');
                    const notes = notesDiv.querySelectorAll('.note-item');
                    notes.forEach(note => note.textContent = '');
                    possibles.forEach(num => {
                        const index = num - 1;
                        notes[index].textContent = num;
                    });
                    notesDiv.classList.remove('hidden');
                }
            });
            toggleNotesBtn.textContent = 'Hide Notes';
            toggleNotesBtn.classList.add('hide-notes');
            deleteNoteBtn.disabled = false;
        } else {
            // Hide notes
            cells.forEach(cell => {
                const notesDiv = cell.querySelector('.cell-notes');
                notesDiv.classList.add('hidden');
            });
            toggleNotesBtn.textContent = 'Show Notes';
            toggleNotesBtn.classList.remove('hide-notes');
            deleteNoteBtn.disabled = true;
            deleteMode = false;
            deleteNoteBtn.classList.remove('active');
        }
        // Update highlights after toggling notes
        highlightSelectedNumber();
    });
});