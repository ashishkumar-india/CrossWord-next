// TypeScript port of the PHP/JS crossword placement & scoring engine

export interface WordEntry { answer: string; clue: string }

export interface GridCell { letter: string; isBlack: boolean; number: number | null }

export interface PlacedWord {
    number: number;
    answer: string;
    clue: string;
    direction: 'across' | 'down';
    row: number;
    col: number;
}

export interface CrosswordResult {
    grid: GridCell[][];
    placedWords: PlacedWord[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
export function createEmptyGrid(size: number): GridCell[][] {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({ letter: '', isBlack: true, number: null }))
    );
}

function placeWordInGrid(
    grid: GridCell[][], word: string, row: number, col: number,
    dir: 'across' | 'down', num: number
) {
    for (let i = 0; i < word.length; i++) {
        const r = dir === 'across' ? row : row + i;
        const c = dir === 'across' ? col + i : col;
        grid[r][c] = { letter: word[i], isBlack: false, number: i === 0 ? num : (grid[r][c].number ?? null) };
    }
}

function canPlaceWord(grid: GridCell[][], word: string, row: number, col: number,
    dir: 'across' | 'down', size: number): boolean {
    if (dir === 'across') {
        if (col < 0 || col + word.length > size || row < 0 || row >= size) return false;
        for (let i = 0; i < word.length; i++) {
            const cell = grid[row][col + i];
            if (!cell.isBlack && cell.letter !== word[i]) return false;
        }
    } else {
        if (row < 0 || row + word.length > size || col < 0 || col >= size) return false;
        for (let i = 0; i < word.length; i++) {
            const cell = grid[row + i][col];
            if (!cell.isBlack && cell.letter !== word[i]) return false;
        }
    }
    return true;
}

function findAllPlacements(
    grid: GridCell[][], word: string, size: number, placed: PlacedWord[]
): Array<{ row: number; col: number; direction: 'across' | 'down' }> {
    const results: Array<{ row: number; col: number; direction: 'across' | 'down' }> = [];
    for (const pw of placed) {
        for (let i = 0; i < word.length; i++) {
            for (let j = 0; j < pw.answer.length; j++) {
                if (word[i] === pw.answer[j]) {
                    if (pw.direction === 'across') {
                        const row = pw.row - i; const col = pw.col + j;
                        if (canPlaceWord(grid, word, row, col, 'down', size)) results.push({ row, col, direction: 'down' });
                    } else {
                        const row = pw.row + j; const col = pw.col - i;
                        if (canPlaceWord(grid, word, row, col, 'across', size)) results.push({ row, col, direction: 'across' });
                    }
                }
            }
        }
    }
    return results;
}

// ── Seeded LCG RNG ───────────────────────────────────────────────────────────
function seededRng(seed: number) {
    let s = ((seed % 2147483647) + 2147483647) % 2147483647 || 1;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function shuffleArr<T>(arr: T[], rng: () => number): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ── Main builder ─────────────────────────────────────────────────────────────
export function buildCompactCrossword(words: WordEntry[], seed = 0): CrosswordResult | null {
    const gridSize = 25;
    const grid = createEmptyGrid(gridSize);
    const placed: PlacedWord[] = [];
    let num = 1;

    const rng = seed > 0 ? seededRng(seed) : null;
    const ordered = rng
        ? shuffleArr(words, rng)
        : [...words].sort((a, b) => b.answer.length - a.answer.length);

    if (ordered.length === 0) return null;

    // Place first word
    const first = ordered[0];
    const firstDir = seed > 0 && seed % 2 === 0 ? 'down' : 'across';
    const sr = firstDir === 'across' ? Math.floor(gridSize / 2) : Math.floor((gridSize - first.answer.length) / 2);
    const sc = firstDir === 'across' ? Math.floor((gridSize - first.answer.length) / 2) : Math.floor(gridSize / 2);
    placeWordInGrid(grid, first.answer, sr, sc, firstDir, num);
    placed.push({ number: num++, answer: first.answer, clue: first.clue, direction: firstDir, row: sr, col: sc });

    for (let i = 1; i < ordered.length; i++) {
        const w = ordered[i];
        const placements = findAllPlacements(grid, w.answer, gridSize, placed);
        if (placements.length > 0) {
            let placement = placements[0];
            if (rng && placements.length > 1) {
                const r2 = seededRng(seed + i * 31);
                placement = placements[Math.floor(r2() * placements.length)];
            }
            placeWordInGrid(grid, w.answer, placement.row, placement.col, placement.direction, num);
            placed.push({ number: num++, answer: w.answer, clue: w.clue, direction: placement.direction, row: placement.row, col: placement.col });
        }
    }

    // Compact grid
    let minR = gridSize, maxR = 0, minC = gridSize, maxC = 0;
    for (let i = 0; i < gridSize; i++)
        for (let j = 0; j < gridSize; j++)
            if (!grid[i][j].isBlack) {
                minR = Math.min(minR, i); maxR = Math.max(maxR, i);
                minC = Math.min(minC, j); maxC = Math.max(maxC, j);
            }
    if (placed.length === 0) return null;

    const compact: GridCell[][] = [];
    for (let i = minR; i <= maxR; i++) compact.push(grid[i].slice(minC, maxC + 1));
    const adjustedPlaced = placed.map(p => ({ ...p, row: p.row - minR, col: p.col - minC }));

    return { grid: compact, placedWords: adjustedPlaced };
}

// ── Score calculation ─────────────────────────────────────────────────────────
export function calculateScore(
    correctAnswers: Record<string, string>,
    studentAnswers: Record<string, string>
): { correct: number; wrong: number; total: number; score: number } {
    const total = Object.keys(correctAnswers).length;
    let correct = 0;
    for (const [key, val] of Object.entries(correctAnswers)) {
        if ((studentAnswers[key] ?? '').toUpperCase().trim() === val.toUpperCase().trim()) correct++;
    }
    const wrong = total - correct;
    const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;
    return { correct, wrong, total, score };
}

// ── Build correct answers map ─────────────────────────────────────────────────
export function buildCorrectAnswers(placed: PlacedWord[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const w of placed) {
        for (let i = 0; i < w.answer.length; i++) {
            const key = w.direction === 'across' ? `${w.row}-${w.col + i}` : `${w.row + i}-${w.col}`;
            map[key] = w.answer[i];
        }
    }
    return map;
}
