'use client';

import { useState, useEffect } from 'react';

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '', tags: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  const saveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) return;

    if (currentNote.id) {
      setNotes(notes.map(n => n.id === currentNote.id ? currentNote : n));
    } else {
      setNotes([...notes, { ...currentNote, id: Date.now(), createdAt: new Date().toISOString() }]);
    }

    setCurrentNote({ id: null, title: '', content: '', tags: [] });
    setTagInput('');
    setIsEditing(false);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const editNote = (note) => {
    setCurrentNote(note);
    setTagInput(note.tags.join(', '));
    setIsEditing(true);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t);
    setCurrentNote({ ...currentNote, tags: [...new Set(tags)] });
  };

  const removeTag = (tag) => {
    setCurrentNote({ ...currentNote, tags: currentNote.tags.filter(t => t !== tag) });
    setTagInput(currentNote.tags.filter(t => t !== tag).join(', '));
  };

  const allTags = [...new Set(notes.flatMap(n => n.tags))];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !filterTag || note.tags.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📝 Notes</h1>
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        {allTags.length > 0 && (
          <div style={styles.tagFilter}>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              style={styles.select}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isEditing && (
        <div style={styles.editor}>
          <input
            type="text"
            placeholder="Note title..."
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            style={styles.titleInput}
          />
          <textarea
            placeholder="Write your note..."
            value={currentNote.content}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            style={styles.textarea}
          />
          <div style={styles.tagInputContainer}>
            <input
              type="text"
              placeholder="Tags (comma-separated)..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={addTag}
              style={styles.tagInputField}
            />
          </div>
          {currentNote.tags.length > 0 && (
            <div style={styles.tagList}>
              {currentNote.tags.map(tag => (
                <span key={tag} style={styles.tag}>
                  {tag}
                  <button onClick={() => removeTag(tag)} style={styles.removeTag}>×</button>
                </span>
              ))}
            </div>
          )}
          <div style={styles.editorButtons}>
            <button onClick={saveNote} style={{ ...styles.button, ...styles.saveButton }}>
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentNote({ id: null, title: '', content: '', tags: [] });
                setTagInput('');
              }}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          style={styles.newNoteButton}
        >
          + New Note
        </button>
      )}

      <div style={styles.notesList}>
        {filteredNotes.length === 0 && (
          <p style={styles.emptyState}>
            {notes.length === 0 ? 'No notes yet. Create your first note!' : 'No notes match your search.'}
          </p>
        )}
        {filteredNotes.map(note => (
          <div key={note.id} style={styles.noteCard}>
            <div style={styles.noteHeader}>
              <h3 style={styles.noteTitle}>{note.title || 'Untitled'}</h3>
              <div style={styles.noteActions}>
                <button onClick={() => editNote(note)} style={styles.actionButton}>✏️</button>
                <button onClick={() => deleteNote(note.id)} style={styles.actionButton}>🗑️</button>
              </div>
            </div>
            <p style={styles.noteContent}>{note.content}</p>
            {note.tags.length > 0 && (
              <div style={styles.noteTags}>
                {note.tags.map(tag => (
                  <span key={tag} style={styles.noteTag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 15px 0',
    fontSize: '24px',
    fontWeight: '600',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
  tagFilter: {
    marginTop: '10px',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  editor: {
    backgroundColor: 'white',
    margin: '20px',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  titleInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    minHeight: '150px',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  tagInputContainer: {
    marginBottom: '12px',
  },
  tagInputField: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  tag: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  removeTag: {
    background: 'none',
    border: 'none',
    color: '#4338ca',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  },
  editorButtons: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
  newNoteButton: {
    width: 'calc(100% - 40px)',
    margin: '20px',
    padding: '16px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  notesList: {
    padding: '0 20px 20px 20px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    padding: '40px 20px',
    fontSize: '16px',
  },
  noteCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '8px',
  },
  noteTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  noteActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
  },
  noteContent: {
    margin: '8px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  noteTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '12px',
  },
  noteTag: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
  },
};
