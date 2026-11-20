import { useState, useEffect } from 'react';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadNotes() {
    try {
      setError('');
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load notes');
      setNotes(data.notes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save note');

      setNotes((prev) => [data.note, ...prev]);
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const previous = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    } catch {
      setNotes(previous);
      setError('Could not delete note.');
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>React + Serverless Postgres</h1>
      <p style={styles.subtitle}>Vite React + Vercel Functions + Neon Free Tier</p>

      <form onSubmit={handleAddNote} style={styles.card}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a note to store in PostgreSQL..."
          style={styles.textarea}
        />
        <button type="submit" disabled={saving || !content.trim()} style={styles.button}>
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        {loading ? (
          <p style={styles.muted}>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p style={styles.muted}>No notes saved yet.</p>
        ) : (
          notes.map((note, idx) => (
            <div
              key={note.id}
              style={{
                ...styles.item,
                borderBottom: idx === notes.length - 1 ? 'none' : '1px solid #27272a'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.noteText}>{note.content}</div>
                <div style={styles.time}>
                  {new Date(note.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                style={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#09090b',
    color: '#fafafa',
    minHeight: '100vh',
    padding: '28px 16px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  title: { fontSize: '1.45rem', marginBottom: '4px' },
  subtitle: { color: '#a1a1aa', fontSize: '0.88rem', marginBottom: '20px' },
  card: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '16px'
  },
  textarea: {
    width: '100%',
    minHeight: '84px',
    backgroundColor: '#09090b',
    color: '#fafafa',
    border: '1px solid #27272a',
    borderRadius: '8px',
    padding: '10px',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    resize: 'vertical',
    marginBottom: '10px',
    boxSizing: 'border-box'
  },
  button: {
    backgroundColor: '#38bdf8',
    color: '#09090b',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#450a0a',
    border: '1px solid #991b1b',
    color: '#fca5a5',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '0.88rem'
  },
  muted: { color: '#a1a1aa', margin: 0 },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 0'
  },
  noteText: { whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 },
  time: { fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #f87171',
    color: '#f87171',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    flexShrink: 0
  }
};