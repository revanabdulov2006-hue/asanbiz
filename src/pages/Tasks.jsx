import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Play, Check, X } from 'lucide-react';
import './Pages.css';

export const Tasks = () => {
  const { tasks, addTask, updateTaskStatus } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    addTask({
      title,
      description,
      assignedTo,
      dueDate
    });
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setDueDate('');
    setShowAddForm(false);
  };

  const columns = [
    { key: 'Gözləyir', label: 'Gözləyir (Yeni)', colorClass: 'col-todo' },
    { key: 'Davam edir', label: 'Davam Edir', colorClass: 'col-progress' },
    { key: 'Tamamlandı', label: 'Tamamlandı', colorClass: 'col-done' }
  ];

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">İş Tapşırıqları</h1>
            <p className="page-subheading">Komanda daxili vəzifələrin bölgüsü və statusları</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Yeni Tapşırıq
          </button>
        </div>

        <div className="kanban-board-grid">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className={`kanban-column glass-panel ${col.colorClass}`}>
                <div className="kanban-col-header">
                  <h3>{col.label}</h3>
                  <span className="count-badge">{colTasks.length}</span>
                </div>
                <div className="kanban-cards-list">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => (
                      <motion.div 
                        key={task.id} 
                        className="kanban-task-card"
                        whileHover={{ scale: 1.01 }}
                        layoutId={`task-${task.id}`}
                      >
                        <div className="card-top">
                          <h4>{task.title}</h4>
                        </div>
                        <p className="card-desc">{task.description}</p>
                        
                        <div className="card-meta-line">
                          {task.assignedTo && (
                            <span className="assigned-badge">@{task.assignedTo}</span>
                          )}
                          {task.dueDate && (
                            <span className="date-badge">{task.dueDate}</span>
                          )}
                        </div>

                        <div className="card-controls">
                          {task.status === 'Gözləyir' && (
                            <button 
                              className="card-action-btn start" 
                              onClick={() => updateTaskStatus(task.id, 'Davam edir')}
                              title="İşə başla"
                            >
                              <Play size={12} /> Başla
                            </button>
                          )}
                          {task.status === 'Davam edir' && (
                            <button 
                              className="card-action-btn complete" 
                              onClick={() => updateTaskStatus(task.id, 'Tamamlandı')}
                              title="Tamamla"
                            >
                              <Check size={12} /> Bitir
                            </button>
                          )}
                          {task.status === 'Tamamlandı' && (
                            <span className="completed-label">
                              <CheckCircle size={12} /> Hazırdır
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="kanban-empty-state">
                      <p>Tapşırıq yoxdur</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
              <h3>Yeni Tapşırıq Əlavə Et</h3>
              <button className="close-modal-btn" onClick={() => setShowAddForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tapşırıq adı</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Məsələn: Malları yoxla" required />
              </div>
              <div className="form-group">
                <label>Ətraflı açıqlama</label>
                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Görüləcək işin təsviri..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Məsul şəxs</label>
                  <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="İşçi adı" />
                </div>
                <div className="form-group">
                  <label>Son tarix (Deadline)</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Yarat</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};
export default Tasks;
