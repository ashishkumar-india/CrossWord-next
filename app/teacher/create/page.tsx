'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

    return (
        <div className="container dashboard">
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>✏️ Create New Puzzle</h2>
                    <a href="/teacher/dashboard" className="btn btn-secondary">← Back</a>
                </div>

                {error && <div className="error-message">{error}</div>}

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
                            Minimum 5 minutes, Maximum 120 minutes. Students will be locked out when time expires.
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
                            <div key={idx} className="word-entry" style={{ display: 'flex', gap: '15px', position: 'relative', background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e5e7eb' }}>
                                <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#6b7280', maxWidth: '40px' }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: '3' }}>
                                    <label>Word (Answer)</label>
                                    <input
                                        type="text"
                                        required
                                        value={word.answer}
                                        onChange={(e) => handleChange(idx, 'answer', e.target.value)}
                                        placeholder="e.g., MITOCHONDRIA"
                                    />
                                </div>
                                <div style={{ flex: '5' }}>
                                    <label>Clue</label>
                                    <input
                                        type="text"
                                        required
                                        value={word.clue}
                                        onChange={(e) => handleChange(idx, 'clue', e.target.value)}
                                        placeholder="Powerhouse of the cell"
                                    />
                                </div>
                                {words.length > 1 && (
                                    <button type="button" onClick={() => removeWord(idx)} className="btn btn-danger" style={{ height: 'fit-content', alignSelf: 'flex-end', marginBottom: '2px' }}>
                                        ✖
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '18px', padding: '15px' }} disabled={loading}>
                            {loading ? '🧠 Generating Crossword Grid...' : '🚀 Generate Puzzle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
