'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function InteractivePuzzle({ puzzleId, attemptId, puzzleData, initialAnswers, initialTimeRemainingMs, timeLimit }: any) {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers || {});
    const [timeRemaining, setTimeRemaining] = useState(Math.floor(initialTimeRemainingMs / 1000));
    const [progress, setProgress] = useState(0);
    const [saveStatus, setSaveStatus] = useState('● Ready');
    const [saveColor, setSaveColor] = useState('#166534');

    const timerRef = useRef<any>(null);
    const saveTimeoutRef = useRef<any>(null);
    const isSubmittingRef = useRef(false);
    const answersRef = useRef(answers);

    const gridData = puzzleData.grid_data || [];
    const maxDimension = Math.max(gridData.length || 0, gridData[0]?.length || 0);
    let cellSize = 45;
    if (maxDimension <= 10) cellSize = 55;
    else if (maxDimension > 15) cellSize = 35;

    let totalCells = 0;
    gridData.forEach((r: any) => r.forEach((c: any) => { if (!c.isBlack) totalCells++; }));

    useEffect(() => { answersRef.current = answers; updateProgress(answers); }, [answers]);

    // Handle Tab Switch (Auto Submit)
    useEffect(() => {
        const handleVis = () => {
            if (document.hidden && !isSubmittingRef.current) {
                console.log('Tab switched - Auto submitting');
                autoSubmit('tab_switch');
            }
        };
        document.addEventListener('visibilitychange', handleVis);
        return () => document.removeEventListener('visibilitychange', handleVis);
    }, []);

    // Timer logic
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (!isSubmittingRef.current) autoSubmit('timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const updateProgress = (currAnswers: any) => {
        const filled = Object.values(currAnswers).filter(v => !!v).length;
        setProgress(totalCells > 0 ? Math.round((filled / totalCells) * 100) : 0);
    };

    const saveToDb = useCallback((currAnswers: any) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                setSaveStatus('↻ Saving...'); setSaveColor('#065f46');
                const res = await fetch('/api/attempt/save', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attempt_id: attemptId, answers: currAnswers })
                });
                if (res.ok) {
                    setSaveStatus('✓ Saved'); setSaveColor('#10b981');
                    setTimeout(() => { setSaveStatus('● Ready'); setSaveColor('#166534'); }, 2000);
                }
            } catch (err) {
                console.error('Save failed');
            }
        }, 500);
    }, [attemptId]);

    const handleChange = (r: number, c: number, val: string) => {
        const newVal = val.toUpperCase().replace(/[^A-Z]/g, '');
        const newAnswers = { ...answers, [`${r}-${c}`]: newVal };
        setAnswers(newAnswers);
        saveToDb(newAnswers);

        if (newVal) {
            findNextCell(r, c, 'right')?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
        if (e.key === 'Backspace' && !answers[`${r}-${c}`]) {
            const prev = findNextCell(r, c, 'left');
            if (prev) {
                const newAnswers = { ...answers, [`${prev.dataset.r}-${prev.dataset.c}`]: '' };
                setAnswers(newAnswers); saveToDb(newAnswers);
                prev.focus(); e.preventDefault();
            }
        } else if (e.key === 'ArrowRight') { e.preventDefault(); findNextCell(r, c, 'right')?.focus(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); findNextCell(r, c, 'left')?.focus(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); findNextCell(r, c, 'down')?.focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); findNextCell(r, c, 'up')?.focus(); }
    };

    const findNextCell = (r: number, c: number, dir: string): HTMLInputElement | null => {
        let nr = r, nc = c;
        if (dir === 'right') nc++; else if (dir === 'left') nc--; else if (dir === 'down') nr++; else if (dir === 'up') nr--;

        while (nr >= 0 && nr < gridData.length && nc >= 0 && nc < gridData[0].length) {
            if (!gridData[nr][nc].isBlack) {
                return document.querySelector(`input[data-r="${nr}"][data-c="${nc}"]`) as HTMLInputElement;
            }
            if (dir === 'right') nc++; else if (dir === 'left') nc--; else if (dir === 'down') nr++; else if (dir === 'up') nr--;
            else break;
        }
        return null;
    };

    const autoSubmit = async (reason: string) => {
        isSubmittingRef.current = true;
        const timeTaken = Math.max(0, (timeLimit * 60) - timeRemaining);
        await fetch('/api/attempt/auto-submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attempt_id: attemptId, puzzle_id: puzzleId, answers: answersRef.current, time_taken: timeTaken, reason })
            // sendBeacon fallback if tab closed could be added, but fetch often works fine in App Router
        });
        router.replace('/student/dashboard');
    };

    const manualSubmit = async () => {
        const filled = Object.values(answers).filter(v => !!v).length;
        if (filled < totalCells && !confirm(`Only ${filled} of ${totalCells} cells filled. Submit anyway?`)) return;

        isSubmittingRef.current = true;
        const timeTaken = Math.max(0, (timeLimit * 60) - timeRemaining);
        await fetch('/api/attempt/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attempt_id: attemptId, puzzle_id: puzzleId, answers, time_taken: timeTaken })
        });
        router.push('/student/dashboard');
    };

    return (
        <div className="container" style={{ padding: '20px' }}>
            <div className="warning-banner">
                ⚠️ <strong>IMPORTANT:</strong> Do NOT switch tabs or close browser! Your puzzle will be automatically evaluated!
            </div>

            <div className="puzzle-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ color: '#6366f1', margin: '0 0 5px 0' }}>{puzzleData.title}</h2>
                    <p style={{ color: '#6b7280', margin: '5px 0' }}>By: {(puzzleData as any).teachers?.name || 'Teacher'}</p>
                    <span className="auto-save" style={{ background: saveColor + '20', color: saveColor }}>{saveStatus}</span>
                </div>
                <div className={`timer-box ${timeRemaining <= 300 ? 'timer-warning' : ''}`}>
                    <div className="label">⏱️ TIME REMAINING</div>
                    <div className="time">{Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
                </div>
            </div>

            <div className="puzzle-container" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '25px', marginTop: '20px' }}>
                <div className="grid-section" style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
                    <div style={{ textAlign: 'center', overflowX: 'auto' }}>
                        <div className="grid-wrapper" style={{ display: 'inline-block', border: '2px solid #6366f1' }}>
                            {gridData.map((row: any, r: number) => (
                                <div key={r} className="grid-row" style={{ display: 'flex' }}>
                                    {row.map((cell: any, c: number) => (
                                        <div key={c} className={`grid-cell ${cell.isBlack ? 'black' : ''}`} style={{ width: cellSize, height: cellSize, position: 'relative', background: cell.isBlack ? '#1f2937' : '#fff', border: '1px solid #ddd' }}>
                                            {!cell.isBlack && (
                                                <>
                                                    {cell.number && <span style={{ position: 'absolute', top: 2, left: 3, fontSize: 10, color: '#6366f1', fontWeight: 'bold' }}>{cell.number}</span>}
                                                    <input
                                                        data-r={r} data-c={c}
                                                        maxLength={1}
                                                        value={answers[`${r}-${c}`] || ''}
                                                        onChange={(e) => handleChange(r, c, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, r, c)}
                                                        style={{
                                                            width: '100%', height: '100%', border: 'none', textAlign: 'center',
                                                            fontSize: cellSize * 0.5, fontWeight: 'bold', background: answers[`${r}-${c}`] ? '#f0fdf4' : 'transparent',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="progress-bar" style={{ background: '#eee', height: 10, borderRadius: 5, marginTop: 20 }}>
                        <div style={{ width: `${progress}%`, background: '#10b981', height: '100%', borderRadius: 5, transition: 'width 0.3s' }} />
                    </div>
                    <p style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>{progress}% Complete</p>

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <button onClick={manualSubmit} className="submit-btn" style={{ background: '#10b981', color: '#fff', padding: '15px 40px', fontSize: 18, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                            📝 Submit Puzzle
                        </button>
                    </div>
                </div>

                <div className="clues-section" style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
                    <h4 style={{ color: '#6366f1', borderBottom: '1px solid #eee', paddingBottom: 10 }}>→ ACROSS</h4>
                    <div style={{ marginBottom: 20 }}>
                        {puzzleData.clues_across?.split('\n').filter((c: string) => c.trim()).map((clue: string, i: number) => (
                            <div key={i} style={{ padding: 10, background: '#f9fafb', marginBottom: 5, borderLeft: '3px solid #6366f1', fontSize: 14 }}>{clue}</div>
                        ))}
                    </div>

                    <h4 style={{ color: '#6366f1', borderBottom: '1px solid #eee', paddingBottom: 10 }}>↓ DOWN</h4>
                    <div>
                        {puzzleData.clues_down?.split('\n').filter((c: string) => c.trim()).map((clue: string, i: number) => (
                            <div key={i} style={{ padding: 10, background: '#f9fafb', marginBottom: 5, borderLeft: '3px solid #6366f1', fontSize: 14 }}>{clue}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
