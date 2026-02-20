'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { buildCompactCrossword, type CrosswordResult } from '@/lib/crossword';

export default function CreatePuzzle() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [timeLimit, setTimeLimit] = useState(30);
    const [words, setWords] = useState([
        { answer: '', clue: '' },
        { answer: '', clue: '' },
        { answer: '', clue: '' },
        { answer: '', clue: '' },
        { answer: '', clue: '' },
    ]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [seed, setSeed] = useState(0);

    const addWord = () => setWords([...words, { answer: '', clue: '' }]);
    const removeWord = (idx: number) => setWords(words.filter((_, i) => i !== idx));

    const handleChange = (idx: number, field: 'answer' | 'clue', value: string) => {
        const newWords = [...words];
        newWords[idx][field] = field === 'answer' ? value.toUpperCase().replace(/[^A-Z]/g, '') : value;
        setWords(newWords);
    };

    const validWords = words.filter(w => w.answer.length >= 2 && w.clue.trim());

    // Live preview
    const preview: CrosswordResult | null = useMemo(() => {
        if (validWords.length < 1) return null;
        return buildCompactCrossword(validWords, seed);
    }, [words, seed]);

    const acrossCount = preview ? preview.placedWords.filter(w => w.direction === 'across').length : 0;
    const downCount = preview ? preview.placedWords.filter(w => w.direction === 'down').length : 0;
    const totalCount = preview ? preview.placedWords.length : 0;

    const handleShuffle = () => setSeed(prev => prev + 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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

    const getCellSize = (grid: CrosswordResult['grid']) => {
        const maxDim = Math.max(grid.length, grid[0]?.length || 0);
        if (maxDim <= 6) return 42;
        if (maxDim <= 10) return 34;
        if (maxDim <= 14) return 28;
        return 22;
    };

    return (
        <div style={{ flex: 1, padding: '30px 20px 60px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(249,250,251,0.95))',
                    borderRadius: '16px',
                    padding: '28px 32px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    borderLeft: '5px solid #f59e0b',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.7rem', color: '#1f2937', fontWeight: 800 }}>
                        Elite Puzzle Studio
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>● Live Editor</span>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            Words intersect automatically for a compact layout
                        </span>
                    </div>
                </div>

                {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

                {/* Title & Duration Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '14px',
                        padding: '22px 28px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6366f1', marginBottom: '10px', display: 'block' }}>
                            Puzzle Identity
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter a compelling title..."
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '15px',
                                border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={e => e.target.style.borderColor = '#6366f1'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            required
                        />
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '14px',
                        padding: '22px 28px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#f59e0b', marginBottom: '10px', display: 'block' }}>
                            Duration
                        </label>
                        <select
                            value={timeLimit}
                            onChange={e => setTimeLimit(Number(e.target.value))}
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '15px',
                                border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none',
                                background: '#fff', cursor: 'pointer',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value={5}>5 Minutes</option>
                            <option value={10}>10 Minutes</option>
                            <option value={15}>15 Minutes</option>
                            <option value={20}>20 Minutes</option>
                            <option value={30}>30 Minutes</option>
                            <option value={45}>45 Minutes</option>
                            <option value={60}>60 Minutes</option>
                            <option value={90}>90 Minutes</option>
                            <option value={120}>120 Minutes</option>
                        </select>
                    </div>
                </div>

                {/* Main: Words & Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                    {/* Left: Words & Clues */}
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '14px',
                        padding: '24px 28px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>📝</span>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1f2937' }}>Words & Clues</h3>
                            </div>
                            <span style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                padding: '5px 14px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                            }}>
                                {words.length} CHALLENGES
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                            {words.map((word, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', gap: '10px', alignItems: 'center',
                                    position: 'relative',
                                }}>
                                    <input
                                        type="text"
                                        value={word.answer}
                                        onChange={(e) => handleChange(idx, 'answer', e.target.value)}
                                        placeholder="ANSWER"
                                        style={{
                                            flex: 1, padding: '11px 14px', fontSize: '14px',
                                            border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none',
                                            fontWeight: 600, letterSpacing: '0.5px',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                    <input
                                        type="text"
                                        value={word.clue}
                                        onChange={(e) => handleChange(idx, 'clue', e.target.value)}
                                        placeholder="Challenge Description..."
                                        style={{
                                            flex: 1.3, padding: '11px 14px', fontSize: '14px',
                                            border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                    {words.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWord(idx)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: '#ef4444', fontSize: '18px', fontWeight: 'bold',
                                                padding: '4px 8px', borderRadius: '6px',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseOver={e => (e.currentTarget.style.background = '#fef2f2')}
                                            onMouseOut={e => (e.currentTarget.style.background = 'none')}
                                        >✕</button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Challenge Button */}
                        <button
                            type="button"
                            onClick={addWord}
                            style={{
                                width: '100%', padding: '14px',
                                background: 'none',
                                border: '2px dashed #d1d5db',
                                borderRadius: '12px',
                                color: '#6b7280',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '20px',
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#6b7280'; }}
                        >
                            + Add New Challenge
                        </button>

                        {/* Generate Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px',
                                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '17px',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? '🧠 Generating...' : '🚀 Generate Puzzle'}
                        </button>
                    </div>

                    {/* Right: Studio Preview */}
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '14px',
                        padding: '24px 28px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        position: 'sticky',
                        top: '90px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: preview ? '#ef4444' : '#9ca3af', display: 'inline-block' }}></span>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1f2937' }}>Studio Preview</h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleShuffle}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 18px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                🔀 Shuffle
                            </button>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ textAlign: 'center', padding: '14px 8px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: '#6366f1' }}>{totalCount}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginTop: '4px' }}>Total</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '14px 8px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{acrossCount}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginTop: '4px' }}>Across</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '14px 8px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{downCount}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginTop: '4px' }}>Down</div>
                            </div>
                        </div>

                        {/* Grid Preview */}
                        <div style={{
                            border: '2px dashed #c7d2fe',
                            borderRadius: '12px',
                            minHeight: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                            padding: '16px',
                            background: preview ? '#fff' : '#fafbff',
                            transition: 'all 0.3s',
                        }}>
                            {preview ? (
                                <div style={{ textAlign: 'center', overflow: 'auto', maxWidth: '100%' }}>
                                    <div style={{ display: 'inline-block', border: '2px solid #6366f1', borderRadius: '4px' }}>
                                        {preview.grid.map((row, r) => (
                                            <div key={r} style={{ display: 'flex' }}>
                                                {row.map((cell, c) => {
                                                    const sz = getCellSize(preview.grid);
                                                    return (
                                                        <div key={c} style={{
                                                            width: sz, height: sz,
                                                            background: cell.isBlack ? '#1e293b' : '#fff',
                                                            border: '1px solid #cbd5e1',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative',
                                                            fontSize: sz * 0.4,
                                                            fontWeight: 700,
                                                            color: '#334155',
                                                        }}>
                                                            {!cell.isBlack && (
                                                                <>
                                                                    {cell.number && (
                                                                        <span style={{
                                                                            position: 'absolute', top: 1, left: 2,
                                                                            fontSize: Math.max(8, sz * 0.25),
                                                                            color: '#6366f1', fontWeight: 700,
                                                                        }}>{cell.number}</span>
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
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                                    Start typing to see your crossword...
                                </p>
                            )}
                        </div>

                        {/* Across & Down Clues */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 8px', color: '#f59e0b', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Across
                                </h4>
                                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.7 }}>
                                    {preview && preview.placedWords.filter(w => w.direction === 'across').length > 0
                                        ? preview.placedWords.filter(w => w.direction === 'across').map(w => (
                                            <div key={w.number + 'a'} style={{ padding: '2px 0' }}>
                                                <strong>{w.number}.</strong> {w.clue}
                                            </div>
                                        ))
                                        : <span style={{ color: '#c4c4c4' }}>No clues yet</span>
                                    }
                                </div>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 8px', color: '#10b981', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Down
                                </h4>
                                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.7 }}>
                                    {preview && preview.placedWords.filter(w => w.direction === 'down').length > 0
                                        ? preview.placedWords.filter(w => w.direction === 'down').map(w => (
                                            <div key={w.number + 'd'} style={{ padding: '2px 0' }}>
                                                <strong>{w.number}.</strong> {w.clue}
                                            </div>
                                        ))
                                        : <span style={{ color: '#c4c4c4' }}>No clues yet</span>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Warning for unplaced words */}
                        {preview && totalCount < validWords.length && (
                            <div style={{
                                marginTop: '14px', padding: '10px 14px',
                                background: '#fffbeb', border: '1px solid #fde68a',
                                borderRadius: '10px', fontSize: '12px', color: '#92400e',
                            }}>
                                ⚠️ {validWords.length - totalCount} word(s) couldn&apos;t be placed — try Shuffle or change words to create more letter intersections.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
