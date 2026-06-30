import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Notebook, Plus, Pin, Archive, Trash2, Search, Calendar, Grid, X } from 'lucide-react';
import './Pages.css';

export const NotebookPage = () => {
  const { notes, addNote, deleteNote, toggleArchiveNote, togglePinNote } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('İşletme');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    addNote({
      title,
      content,
      category,
      tags
    });
    setTitle('');
    setContent('');
    setTagsInput('');
    setShowAddForm(false);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'Archived') {
      return n.isArchived && matchesSearch;
    }
    
    if (n.isArchived) return false;
    
    if (activeCategory === 'All') return matchesSearch;
    return n.category === activeCategory && matchesSearch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdDate + 'T' + b.createdTime) - new Date(a.createdDate + 'T' + a.createdTime);
  });

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">İş Qeyd Dəftəri</h1>
            <p className="page-subheading">Hadisələr, qərarlar və digər gündəlik qeydlərin reyestri</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Yeni Qeyd
          </button>
        </div>

        <div className="notebook-control-bar glass-panel">
          <div className="search-box-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Qeydlərdə axtar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-tabs-group">
            {['All', 'İşletme', 'Mali', 'İnsan Kaynakları', 'Archived'].map((cat) => (
              <button 
                key={cat}
                className={`cat-pill-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? 'Hamısı' : cat === 'Archived' ? 'Arxiv' : cat}
              </button>
            ))}
          </div>

          <div className="view-mode-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <Grid size={16} />
            </button>
            <button className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>
              <Calendar size={16} />
            </button>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="notebook-grid-layout">
            <AnimatePresence>
              {sortedNotes.map((note) => (
                <motion.div 
                  key={note.id} 
                  className={`note-card-panel glass-panel ${note.isPinned ? 'pinned' : ''}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layoutId={`note-${note.id}`}
                >
                  <div className="note-card-top">
                    <span className="note-date-badge">{note.createdDate} • {note.createdTime}</span>
                    <div className="note-card-controls">
                      <button className={`control-icon-btn ${note.isPinned ? 'active' : ''}`} onClick={() => togglePinNote(note.id)}>
                        <Pin size={14} />
                      </button>
                      <button className="control-icon-btn" onClick={() => toggleArchiveNote(note.id)}>
                        <Archive size={14} />
                      </button>
                      <button className="control-icon-btn text-red" onClick={() => deleteNote(note.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="note-card-body">
                    <h4>{note.title}</h4>
                    <p>{note.content}</p>
                  </div>
                  <div className="note-card-footer">
                    <span className="note-cat-label">{note.category}</span>
                    <div className="note-tags-list">
                      {note.tags && note.tags.map((t, idx) => (
                        <span key={idx} className="note-tag-badge">#{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {sortedNotes.length === 0 && (
              <div className="notebook-empty-box glass-panel">
                <Notebook size={36} className="text-muted" />
                <p>Heç bir qeyd tapılmadı</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="calendar-view-container glass-panel">
            <div className="calendar-grid-header">
              {['B.E', 'Ç.A', 'Ç', 'C.A', 'C', 'Ş', 'B'].map((d) => (
                <div key={d} className="calendar-day-name">{d}</div>
              ))}
            </div>
            <div className="calendar-days-grid">
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-05-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                const dayNotes = notes.filter(n => n.createdDate === dateStr);
                return (
                  <div key={dayNum} className="calendar-day-cell">
                    <span className="day-number">{dayNum}</span>
                    <div className="day-notes-indicators">
                      {dayNotes.map(n => (
                        <div 
                          key={n.id} 
                          className="day-note-dot" 
                          title={`${n.category}: ${n.title}`} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>Yeni Qeyd Yaz</h3>
              <button className="close-modal-btn" onClick={() => setShowAddForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Qeyd Başlığı</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mövzu başlığı" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kateqoriya</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="İşletme">İşletme</option>
                    <option value="Mali">Mali</option>
                    <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Teqlər (vergüllə ayırın)</label>
                  <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="maliyyə, iclas" />
                </div>
              </div>
              <div className="form-group">
                <label>Qeyd məzmunu</label>
                <textarea rows="4" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Qeyd etmək istədiyiniz məlumat..." required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Saxla</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};
export default NotebookPage;
