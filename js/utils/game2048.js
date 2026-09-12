/**
 * ToolLab.org - 2048 Puzzle Engine (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\game2048.js
 */
const Game2048 = {
  GRID_SIZE: 4,

  // 1. 단일 라인 압축 & 합체 (순수 함수)
  slideAndMerge(line) {
    let filtered = line.filter(val => val !== 0);
    let score = 0;

    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        score += filtered[i];
        filtered[i + 1] = 0;
        i++; // 1턴 1회 병합
      }
    }

    filtered = filtered.filter(val => val !== 0);
    while (filtered.length < this.GRID_SIZE) {
      filtered.push(0);
    }

    return { newLine: filtered, score };
  },

  // 2. 4방향 계산 함수
  move(board, direction) {
    const size = this.GRID_SIZE;
    let newBoard = Array.from({ length: size }, () => Array(size).fill(0));
    let totalScore = 0;

    if (direction === 'LEFT') {
      for (let r = 0; r < size; r++) {
        const { newLine, score } = this.slideAndMerge(board[r]);
        newBoard[r] = newLine;
        totalScore += score;
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < size; r++) {
        const reversed = [...board[r]].reverse();
        const { newLine, score } = this.slideAndMerge(reversed);
        newBoard[r] = newLine.reverse();
        totalScore += score;
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < size; c++) {
        const column = [board[0][c], board[1][c], board[2][c], board[3][c]];
        const { newLine, score } = this.slideAndMerge(column);
        for (let r = 0; r < size; r++) newBoard[r][c] = newLine[r];
        totalScore += score;
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < size; c++) {
        const column = [board[3][c], board[2][c], board[1][c], board[0][c]];
        const { newLine, score } = this.slideAndMerge(column);
        for (let r = 0; r < size; r++) newBoard[3 - r][c] = newLine[r];
        totalScore += score;
      }
    }

    // 보드 변화 감지
    let moved = false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] !== newBoard[r][c]) {
          moved = true;
          break;
        }
      }
    }

    return { newBoard, totalScore, moved };
  },

  // 3. 빈칸 랜덤 타일 생성
  addRandomTile(board) {
    const size = this.GRID_SIZE;
    const emptyCoords = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) emptyCoords.push({ r, c });
      }
    }
    if (emptyCoords.length === 0) return board;

    const { r, c } = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
    const nextBoard = board.map(row => [...row]);
    nextBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return nextBoard;
  },

  // 4. 게임 오버 체크
  isGameOver(board) {
    const size = this.GRID_SIZE;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) return false;
        if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
        if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
      }
    }
    return true;
  }
};

// Node.js 환경 호환
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game2048;
}

// 브라우저 전역 노출
if (typeof window !== 'undefined') {
  window.Game2048 = Game2048;
}