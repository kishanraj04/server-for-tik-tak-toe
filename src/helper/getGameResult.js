export function getTicTacToeResult(board) {
  const n = 3;

  // Check rows and columns
  for (let i = 0; i < n; i++) {
    // Check row
    if (board[i][0] !== "" && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      return `${board[i][0]}`;
    }
    // Check column
    if (board[0][i] !== "" && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
      return `${board[0][i]}`;
    }
  }

  // Check diagonals
  if (board[0][0] !== "" && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return `${board[0][0]}`;
  }

  if (board[0][2] !== "" && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return `${board[0][2]}`;
  }

  // Check for empty cells
  for (let row of board) {
    if (row.includes("")) {
      return "Pending";
    }
  }

  // If no winner and no empty cells, it's a draw
  return "Draw";
}
