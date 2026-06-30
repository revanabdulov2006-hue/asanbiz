import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Camera, 
  UploadCloud, 
  User, 
  Calendar, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
import './Pages.css';

export const DailyTasks = () => {
  const { 
    dailyTasks, 
    toggleDailyTask, 
    addDailyTask, 
    toggleTaskImageRequirement, 
    user 
  } = useStore();

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newRequiresImage, setNewRequiresImage] = useState(false);
  
  // Custom states for completing task with photo requirement
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [completionImage, setCompletionImage] = useState('');
  const [viewImage, setViewImage] = useState(null); // to show picture preview modal

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    addDailyTask(newTitle, newTime, newRequiresImage);
    setNewTitle('');
    setNewTime('09:00');
    setNewRequiresImage(false);
  };

  const handleTaskClick = (task) => {
    if (task.completed) {
      // Toggle back is simple, no confirmation needed
      toggleDailyTask(task.id);
    } else {
      if (task.requiresImage) {
        setSelectedTaskId(task.id);
        setCompletionImage('');
        setShowUploadModal(true);
      } else {
        toggleDailyTask(task.id, user?.name || 'İşçi');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!completionImage) {
      alert("Zəhmət olmasa təsdiq üçün bir şəkil yükləyin!");
      return;
    }
    toggleDailyTask(selectedTaskId, user?.name || 'İşçi', completionImage);
    setShowUploadModal(false);
    setSelectedTaskId(null);
    setCompletionImage('');
  };

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const totalCount = dailyTasks.length;
  const percentCompleted = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  const isOwner = user?.role === 'Admin';

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">Gündəlik Rutin İşlər</h1>
            <p className="page-subheading">Hər gün marketdə təkrarlanan əsas tapşırıqlar, rəhbər nəzarəti və təsdiq tarixçəsi</p>
          </div>
        </div>

        <div className="daily-layout-columns">
          <div className="daily-list-card glass-panel">
            <div className="daily-header-line">
              <h3>Gündəlik Rutin siyahı</h3>
              <span className="count-badge">{completedCount}/{totalCount} Tamamlandı</span>
            </div>

            <div className="progress-summary-bar">
              <div className="bar-labels">
                <span>Günlük tərəqqi</span>
                <span>{percentCompleted.toFixed(0)}%</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${percentCompleted}%`,
                    backgroundColor: 'var(--color-primary)' 
                  }} 
                />
              </div>
            </div>

            <div className="daily-items-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {dailyTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`daily-item-row ${task.completed ? 'completed' : ''}`}
                  onClick={() => handleTaskClick(task)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', cursor: 'pointer', alignItems: 'flex-start' }}
                >
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="row-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`custom-checkbox-pill ${task.completed ? 'checked' : ''}`}>
                        {task.completed && <CheckCircle size={14} />}
                      </div>
                      <span className="task-title-text" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{task.title}</span>
                    </div>
                    
                    <div className="row-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      {task.requiresImage && (
                        <span className="status-pill status-warning" style={{ fontSize: '0.65rem', display: 'inline-flex', gap: '3px', alignItems: 'center', padding: '2px 6px' }}>
                          <Camera size={10} /> Şəkil Tələb Olunur
                        </span>
                      )}
                      
                      {isOwner && (
                        <button
                          onClick={() => toggleTaskImageRequirement(task.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: task.requiresImage ? 'var(--color-accent)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px',
                          }}
                          title={task.requiresImage ? "Şəkil tələbini sil" : "Şəkil tələbi qoy"}
                        >
                          <Camera size={13} />
                        </button>
                      )}
                      
                      <span className="time-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <Clock size={12} /> {task.time}
                      </span>
                    </div>
                  </div>

                  {task.completed && (
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '12px', 
                      fontSize: '0.72rem', 
                      color: 'var(--text-secondary)', 
                      borderTop: '1px dashed var(--border-color)', 
                      paddingTop: '6px', 
                      marginTop: '2px',
                      alignItems: 'center',
                      width: '100%'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <User size={11} /> Təsdiqlədi: <strong>{task.completedBy || 'Sistem'}</strong>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={11} /> Vaxt: {task.completedAt}
                      </span>
                      {task.completionImage && (
                        <button 
                          onClick={() => setViewImage(task.completionImage)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.15)',
                            borderRadius: '4px',
                            color: 'var(--color-accent)',
                            padding: '2px 6px',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginLeft: 'auto'
                          }}
                        >
                          <ImageIcon size={11} /> Şəklə Bax
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="daily-form-card glass-panel" style={{ height: 'fit-content' }}>
            <h3>Yeni Rutin Əlavə Et</h3>
            <p>Hər gün təkrarlanan yeni tapşırıq planı</p>
            
            <form onSubmit={handleSubmit} className="routine-form-item">
              <div className="form-group">
                <label>Rutin tapşırıq adı</label>
                <input 
                  type="text" 
                  placeholder="Məsələn: Soyuducuları təmizlə"
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Planlaşdırılan vaxt</label>
                <input 
                  type="time" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  id="newRequiresImage"
                  checked={newRequiresImage} 
                  onChange={(e) => setNewRequiresImage(e.target.checked)} 
                  style={{ cursor: 'pointer', width: 'auto' }}
                />
                <label htmlFor="newRequiresImage" style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: 0, fontWeight: 600 }}>
                  <Camera size={13} className="text-accent" />
                  Təsdiq üçün şəkil tələbi qoyulsun
                </label>
              </div>

              <button type="submit" className="btn btn-primary routine-submit-btn" style={{ marginTop: '10px' }}>
                <Plus size={16} /> Əlavə et
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* MODAL 1: Completion Image Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => { setShowUploadModal(false); setSelectedTaskId(null); }}>
            <motion.div 
              className="modal-content glass-panel" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: '440px', padding: '24px' }}
            >
              <div className="modal-header">
                <h3>Şəkil Tələbi ilə Təsdiq</h3>
                <button className="close-modal-btn" onClick={() => { setShowUploadModal(false); setSelectedTaskId(null); }}><X size={18} /></button>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                Bu tapşırığı tamamlamaq üçün rəhbərlik tərəfindən **təsdiq şəklinin yüklənməsi** tələb olunur. İşin tamamlandığını əks etdirən fotoşəkil təqdim edin.
              </p>

              <form onSubmit={handleUploadSubmit} className="modal-form" style={{ padding: 0 }}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div className="file-upload-zone" style={{ padding: '20px 10px', border: '2px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}>
                    <UploadCloud size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto', display: 'block' }} />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ cursor: 'pointer' }}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {completionImage ? "Şəkil Seçildi! Yeniləmək üçün klikləyin" : "Təsdiq şəklini seçin (.jpg, .png)"}
                    </span>
                  </div>
                </div>

                {completionImage && (
                  <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                    <img src={completionImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => setCompletionImage('')}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="modal-actions" style={{ marginTop: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowUploadModal(false); setSelectedTaskId(null); }}>Ləğv et</button>
                  <button type="submit" className="btn btn-primary">İşi Təsdiqlə</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: View completion photo preview */}
      <AnimatePresence>
        {viewImage && (
          <div className="modal-overlay" onClick={() => setViewImage(null)}>
            <motion.div 
              className="modal-content glass-panel" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: '500px', padding: '16px' }}
            >
              <div className="modal-header" style={{ marginBottom: '8px' }}>
                <h3>İşin Təsdiq Şəkli</h3>
                <button className="close-modal-btn" onClick={() => setViewImage(null)}><X size={18} /></button>
              </div>

              <div style={{ width: '100%', maxHeight: '70vh', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={viewImage} alt="Completion Proof" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyTasks;
