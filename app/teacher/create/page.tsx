'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { buildCompactCrossword, type CrosswordResult } from '@/lib/crossword';

export default function CreatePuzzle() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [timeLimit, setTimeLimit] = useState(30);
    const [words, setWords] = useState([{ answer: '', clue: '' }]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const addWord = () => setWords([...words, { answer: '', clue: '' }]);
    const removeWord = (idx: number) => setWords(words.filter((_, i) => i !== idx));

    const handleChange = (idx: number, field: 'answer' | 'clue', value: string) => {
        const newWords = [...words];
        newWords[idx][field] = field === 'answer' ? value.toUpperCase().replace(/[^A-Z]/g, '') : value;
        setWords(newWords);
    };

    // Live preview: rebuild the crossword whenever words change
    const preview: CrosswordResult | null = useMemo(() => {
        const validWords = words.filter(w => w.answer.length >= 2 && w.clue.trim());
        if (validWords.length < 2) return null;
        return buildCompactCrossword(validWords);
    }, [words]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validWords = words.filter(w => w.answer.length >= 2 && w.clue.trim());
        if (validWords.length < 2) {
            setError('Please provide at least 2 valid words with clues.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/puzzle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, time_limit: timeLimit, words: validWords })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create puzzle');

            router.push('/teacher/puzzles');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Calculate cell size based on grid dimensions
    const getCellSize = (grid: CrosswordResult['grid']) => {
        const maxDim = Math.max(grid.length, grid[0]?.length || 0);
        if (maxDim <= 8) return 38;
        if (maxDim <= 12) return 32;
        if (maxDim <= 16) return 26;
        return 22;
    };

    return (
        <div className="container dashboard">
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>✏️ Create New Puzzle</h2>
                    <a href="/teacher/dashboard" className="btn btn-secondary">← Back</a>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>
                    {/* Left: Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Puzzle Title/Topic</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Biology Chapter 1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Time Limit (minutes)</label>
                            <input
                                type="number"
                                required
                                min="5"
                                max="120"
                                value={timeLimit}
                                onChange={e => setTimeLimit(Number(e.target.value))}
                            />
                            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                Minimum 5 minutes, Maximum 120 minutes.
                            </small>
                        </div>

                        <div style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <h3>Words and Clues</h3>
                            <button type="button" onClick={addWord} className="btn btn-secondary">
                                ➕ Add Word
                            </button>
                        </div>

                        <div id="wordsContainer">
                            {words.map((word, idx) => (
                                <div key={idx} className="word-entry" style={{ display: 'flex', gap: '10px', position: 'relative', background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#6b7280', minWidth: '30px' }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: '3' }}>
                                        <label style={{ fontSize: '12px' }}>Word</label>
                                        <input
                                            type="text"
                                            required
                                            value={word.answer}
                                            onChange={(e) => handleChange(idx, 'answer', e.target.value)}
                                            placeholder="e.g., MITOCHONDRIA"
                                        />
                                    </div>
                                    <div style={{ flex: '4' }}>
                                        <label style={{ fontSize: '12px' }}>Clue</label>
                                        <input
                                            type="text"
                                            required
                                            value={word.clue}
                                            onChange={(e) => handleChange(idx, 'clue', e.target.value)}
                                            placeholder="Powerhouse of the cell"
                                        />
                                    </div>
                                    {words.length > 1 && (
                                        <button type="button" onClick={() => removeWord(idx)} className="btn btn-danger" style={{ height: 'fit-content', alignSelf: 'flex-end', marginBottom: '2px', padding: '6px 10px' }}>
                                            ✖
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '18px', padding: '15px' }} disabled={loading}>
                                {loading ? '🧠 Generating Crossword Grid...' : '🚀 Generate Puzzle'}
                            </button>
                        </div>
                    </form>

                    {/* Right: Live Preview */}
                    {preview && (
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '2px solid #e5e7eb',
                            position: 'sticky',
                            top: '100px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, color: '#6366f1', fontSize: '1.1rem' }}>🧩 Live Preview</h3>
                                <span style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}>
                                    {preview.placedWords.length} / {words.filter(w => w.answer.length >= 2).length} placed
                                </span>
                            </div>

                            {/* Grid */}
                            <div style={{ textAlign: 'center', overflowX: 'auto', marginBottom: '15px' }}>
                                <div style={{ display: 'inline-block', border: '2px solid #6366f1', borderRadius: '4px' }}>
                                    {preview.grid.map((row, r) => (
                                        <div key={r} style={{ display: 'flex' }}>
                                            {row.map((cell, c) => {
                                                const cellSize = getCellSize(preview.grid);
                                                return (
                                                    <div key={c} style={{
                                                        width: cellSize,
                                                        height: cellSize,
                                                        background: cell.isBlack ? '#1f2937' : '#ffffff',
                                                        border: '1px solid #d1d5db',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative',
                                                        fontSize: cellSize * 0.4,
                                                        fontWeight: 'bold',
                                                        color: '#374151',
                                                    }}>
                                                        {!cell.isBlack && (
                                                            <>
                                                                {cell.number && (
                                                                    <span style={{
                                                                        position: 'absolute',
                                                                        top: 1,
                                                                        left: 2,
                                                                        fontSize: Math.max(8, cellSize * 0.25),
                                                                        color: '#6366f1',
                                                                        fontWeight: 'bold',
                                                                    }}>
                                                                        {cell.number}
                                                                    </span>
                                                                )}
                                                                {cell.letter}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Clues Preview */}
                            <div style={{ fontSize: '12px', color: '#4b5563' }}>
                                {preview.placedWords.filter(w => w.direction === 'across').length > 0 && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#6366f1' }}>→ Across</strong>
                                        {preview.placedWords.filter(w => w.direction === 'across').map(w => (
                                            <div key={w.number + 'a'} style={{ padding: '3px 0', paddingLeft: '8px', borderLeft: '2px solid #6366f1', marginTop: '4px' }}>
                                                {w.number}. {w.clue}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {preview.placedWords.filter(w => w.direction === 'down').length > 0 && (
                                    <div>
                                        <strong style={{ color: '#6366f1' }}>↓ Down</strong>
                                        {preview.placedWords.filter(w => w.direction === 'down').map(w => (
                                            <div key={w.number + 'd'} style={{ padding: '3px 0', paddingLeft: '8px', borderLeft: '2px solid #6366f1', marginTop: '4px' }}>
                                                {w.number}. {w.clue}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Words not placed warning */}
                            {preview.placedWords.length < words.filter(w => w.answer.length >= 2).length && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#92400e',
                                }}>
                                    ⚠️ Some words couldn&apos;t be placed — they need shared letters with existing words to intersect.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
