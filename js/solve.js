// Sudoku solver using backtracking
function isValid(board, row, col, num) {
    const numStr = num.toString();

    // Check row
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === numStr) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === numStr) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (board[r][c] === numStr) return false;
        }
    }

    return true;
}

function findEmpty(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === '') {
                return [row, col];
            }
        }
    }
    return null;
}

function solve(board, solutionCount) {
    const empty = findEmpty(board);
    if (!empty) {
        solutionCount.count++;
        if (solutionCount.count === 1) {
            solutionCount.board = board.map(row => [...row]);
        }
        return solutionCount.count < 2; // Continue if less than 2 solutions
    }

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num.toString();
            if (!solve(board, solutionCount)) {
                return false; // Stop if multiple solutions found
            }
            board[row][col] = ''; // Backtrack
        }
    }
    return true;
}

function solveSudoku(initialBoard) {
    // Create a deep copy of the board
    const board = initialBoard.map(row => [...row]);
    const solutionCount = { count: 0, board: null };

    solve(board, solutionCount);

    if (solutionCount.count === 0) {
        console.log('No solution found for the Sudoku puzzle.');
        return { status: 'no_solution', board: null };
    } else if (solutionCount.count === 1) {
        printBoardWithBoxes(solutionCount.board);
        return { status: 'unique_solution', board: solutionCount.board };
    } else {
        console.log('Multiple solutions found for the Sudoku puzzle.');
        return { status: 'multiple_solutions', board: null };
    }
}

function printBoardWithBoxes(board) {
    console.log('┌─────────┬─────────┬─────────┐');
    for (let row = 0; row < 9; row++) {
        let rowStr = '│';
        for (let col = 0; col < 9; col++) {
            const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
            const isAlternateBox = (boxIndex % 2 === 1);
            const num = board[row][col] || ' ';
            if (isAlternateBox) {
                rowStr += `\x1b[47m\x1b[30m ${num} \x1b[0m`; // White background, black text
            } else {
                rowStr += ` ${num} `;
            }
            if ((col + 1) % 3 === 0 && col < 8) {
                rowStr += '│';
            }
        }
        rowStr += '│';
        console.log(rowStr);
        if ((row + 1) % 3 === 0 && row < 8) {
            console.log('├─────────┼─────────┼─────────┤');
        }
    }
    console.log('└─────────┴─────────┴─────────┘');
}

// Export the function for use in main.js
window.solveSudoku = solveSudoku;